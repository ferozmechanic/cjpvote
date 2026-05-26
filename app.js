/* =============================================
   CJP VOTE — app.js
   Poora app ka engine
   
   Sections:
   1. State — app ki current condition
   2. Init — app shuru karo
   3. Scene Engine — scenes switch karo
   4. TTS Engine — audio
   5. Progress Bar
   6. Manifesto Builder — content.js se HTML banao
   7. EVM Logic — voting
   8. Bhadaas Logic — forum
   9. Results Logic — counts
   10. Certificate Logic
   11. Share Logic
   12. Live Count Animator
   13. Event Listeners — sab buttons
   14. Utilities
   ============================================= */


/* =============================================
   1. APP STATE
   App ki current condition track karta hai
   ============================================= */

const AppState = {
  currentSceneIndex: 0,   /* abhi kaunsa scene chal raha hai */
  isMuted: false,          /* audio on/off */
  selectedState: null,     /* user ka state */
  selectedStateName: null, /* state ka poora naam */
  selectedParty: null,     /* EVM pe kaunsi party chuni */
  hasVotedToday: false,    /* aaj vote diya? */
  sceneCount: 0,           /* kitne scenes dekhe — ad ke liye */
  ttsUtterance: null       /* current TTS object */
};


/* =============================================
   2. INIT
   App shuru hone pe yeh chalega
   ============================================= */

/* DOM ready hone ka wait karo */
document.addEventListener('DOMContentLoaded', function () {

  /* Saved preferences load karo */
  loadPreferences();

  /* Manifesto content build karo */
  buildAllManifestos();

  /* Results page ke liye state counts banao */
  buildStateCountsList();

  /* Countdown calculate karo */
  updateCountdown();

  /* Live count animation shuru karo */
  startLiveCountAnimation();

  /* Pehla scene dikhao */
  showScene(0);

  /* Sab event listeners attach karo */
  attachEventListeners();
});


/* =============================================
   3. SCENE ENGINE
   Scenes switch karne ka kaam
   ============================================= */

/**
 * showScene — scene index se scene dikhao
 * @param index — SCENE_ORDER mein position
 */
function showScene(index) {

  /* Index bounds check */
  if (index < 0 || index >= SCENE_ORDER.length) return;

  /* State update karo */
  AppState.currentSceneIndex = index;

  /* Pehle current TTS band karo */
  stopTTS();

  /* Sab scenes hide karo */
  document.querySelectorAll('.scene').forEach(function (scene) {
    scene.classList.remove('scene--active');
  });

  /* Naya scene show karo */
  const sceneId = SCENE_ORDER[index];
  const sceneEl = document.getElementById(sceneId);

  if (!sceneEl) {
    console.error('Scene nahi mila: ' + sceneId);
    return;
  }

  sceneEl.classList.add('scene--active');

  /* Progress bar update karo */
  updateProgressBar(index);

  /* Ad check — har 3 scenes ke baad */
  AppState.sceneCount++;
  if (AppState.sceneCount % CONFIG.adAfterScenes === 0) {
    showAd();
  }

  /* Agar yeh pause scene hai toh TTS sirf chalao
     Auto advance nahi hoga */
  if (PAUSE_SCENES.includes(sceneId)) {
    playTTS(sceneId, null); /* null = no callback */
    return;
  }

  /* Auto advance scene — TTS ke baad next scene */
  playTTS(sceneId, function () {
    /* TTS khatam — next scene pe jao */
    nextScene();
  });
}

/**
 * nextScene — agla scene dikhao
 */
function nextScene() {
  const next = AppState.currentSceneIndex + 1;

  /* Agar last scene hai toh loop band karo */
  if (next >= SCENE_ORDER.length) return;

  showScene(next);
}

/**
 * goToScene — kisi bhi scene pe directly jao
 * @param sceneId — scene ka ID string
 */
function goToScene(sceneId) {
  const index = SCENE_ORDER.indexOf(sceneId);
  if (index !== -1) showScene(index);
}


/* =============================================
   4. TTS ENGINE
   Browser Text-to-Speech
   ============================================= */

/**
 * playTTS — text speak karo
 * @param sceneId — content.js se script lo
 * @param onComplete — khatam hone pe yeh chalao
 */
function playTTS(sceneId, onComplete) {

  /* TTS available nahi toh callback seedha chalao */
  if (!('speechSynthesis' in window)) {
    if (onComplete) onComplete();
    return;
  }

  /* Is scene ka script lo */
  const script = TTS_SCRIPTS[sceneId];

  /* Script nahi hai ya muted hai */
  if (!script || AppState.isMuted) {
    if (onComplete) onComplete();
    return;
  }

  /* Naya utterance banao */
  const utterance = new SpeechSynthesisUtterance(script);
  utterance.lang   = CONFIG.tts.lang;
  utterance.rate   = CONFIG.tts.rate;
  utterance.pitch  = CONFIG.tts.pitch;

  /* Khatam hone pe callback */
  utterance.onend = function () {
    if (onComplete) onComplete();
  };

  /* Error hone pe bhi callback — stuck na ho */
  utterance.onerror = function () {
    if (onComplete) onComplete();
  };

  /* State mein save karo — baad mein band kar sake */
  AppState.ttsUtterance = utterance;

  /* Bol! */
  window.speechSynthesis.speak(utterance);
}

/**
 * stopTTS — current audio band karo
 */
function stopTTS() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  AppState.ttsUtterance = null;
}

/**
 * toggleMute — audio on/off karo
 */
function toggleMute() {
  AppState.isMuted = !AppState.isMuted;

  /* Button update karo */
  const btn = document.getElementById('btnMute');
  btn.textContent = AppState.isMuted ? '🔇' : '🔊';

  /* Preference save karo */
  localStorage.setItem(CONFIG.muteKey, AppState.isMuted ? '1' : '0');

  /* Agar mute kiya toh current audio band */
  if (AppState.isMuted) stopTTS();
}


/* =============================================
   5. PROGRESS BAR
   Scene progress dikhao — video jaisa
   ============================================= */

/**
 * updateProgressBar — fill percentage update karo
 * @param index — current scene index
 */
function updateProgressBar(index) {
  const total = SCENE_ORDER.length;
  const percent = ((index + 1) / total) * 100;

  document.getElementById('progressFill').style.width = percent + '%';
}


/* =============================================
   6. MANIFESTO BUILDER
   content.js ke PARTIES data se HTML banao
   ============================================= */

/**
 * buildAllManifestos — sab parties ke points build karo
 */
function buildAllManifestos() {
  Object.keys(PARTIES).forEach(function (partyId) {
    buildManifestoPoints(partyId);
  });
}

/**
 * buildManifestoPoints — ek party ke points banao
 * @param partyId — party key jaise 'bjp', 'cjp'
 */
function buildManifestoPoints(partyId) {
  const container = document.getElementById('points-' + partyId);
  if (!container) return;

  const party = PARTIES[partyId];
  if (!party || !party.points) return;

  /* Har point ke liye HTML banao */
  party.points.forEach(function (point) {
    const item = document.createElement('div');
    item.className = 'manifesto-point-item';

    /* Title */
    const title = document.createElement('p');
    title.className = 'manifesto-point-title';
    title.textContent = point.title;

    /* Text */
    const text = document.createElement('p');
    text.className = 'manifesto-point-text';
    text.textContent = point.text;

    /* Footnote */
    const footnote = document.createElement('p');
    footnote.className = 'manifesto-point-footnote';
    footnote.textContent = point.footnote;

    item.appendChild(title);
    item.appendChild(text);
    item.appendChild(footnote);
    container.appendChild(item);
  });
}


/* =============================================
   7. EVM LOGIC
   Voting machine ka kaam
   ============================================= */

/**
 * handleEVMButtonClick — party button dabaya
 * @param partyId — kaunsi party
 */
function handleEVMButtonClick(partyId) {

  /* Pehle check karo aaj vote diya kya */
  if (hasVotedToday()) {
    showAlreadyVotedMessage();
    return;
  }

  /* Previous selection clear karo */
  document.querySelectorAll('.evm-party-row').forEach(function (row) {
    row.classList.remove('evm-selected-row');
  });

  /* Naya selection highlight karo */
  const btn = document.querySelector('.evm-btn[data-party="' + partyId + '"]');
  if (btn) {
    btn.closest('.evm-party-row').classList.add('evm-selected-row');
  }

  /* State update karo */
  AppState.selectedParty = partyId;

  /* Selected party name dikhao */
  const party = PARTIES[partyId];
  const selectedText = document.getElementById('evmSelectedText');
  if (selectedText && party) {
    selectedText.textContent = party.emoji + ' ' + party.name + ' — selected';
  }

  /* Confirm button enable karo */
  document.getElementById('btnVoteConfirm').disabled = false;
}

/**
 * confirmVote — vote confirm karo
 */
function confirmVote() {
  if (!AppState.selectedParty) return;

  /* Aaj ki date save karo — kal tak vote band */
  const today = new Date().toDateString();
  localStorage.setItem(CONFIG.voteKey, today);
  AppState.hasVotedToday = true;

  /* Confirmed screen ke liye data set karo */
  updateConfirmedScreen();

  /* Certificate ke liye data set karo */
  updateCertificateScreen();

  /* Firebase mein vote save karo */
  if (typeof saveVoteToFirebase === 'function') {
    saveVoteToFirebase(AppState.selectedParty, AppState.selectedState);
  }

  /* Next scene pe jao */
  nextScene();
}

/**
 * hasVotedToday — aaj vote diya kya check karo
 */
function hasVotedToday() {
  const lastVote = localStorage.getItem(CONFIG.voteKey);
  const today = new Date().toDateString();
  return lastVote === today;
}

/**
 * showAlreadyVotedMessage — already voted message
 */
function showAlreadyVotedMessage() {
  const selectedText = document.getElementById('evmSelectedText');
  if (selectedText) {
    selectedText.textContent = 'Aaj vote de chuke ho! Kal aana 😂';
  }
}

/**
 * updateConfirmedScreen — vote confirmed screen data
 */
function updateConfirmedScreen() {
  const party = PARTIES[AppState.selectedParty];
  const today = new Date().toLocaleDateString('hi-IN');

  const confirmedParty = document.getElementById('confirmedParty');
  const confirmedState = document.getElementById('confirmedState');
  const confirmedDate  = document.getElementById('confirmedDate');

  if (confirmedParty && party) {
    confirmedParty.textContent = 'Party: ' + party.emoji + ' ' + party.name;
  }
  if (confirmedState && AppState.selectedStateName) {
    confirmedState.textContent = 'State: ' + AppState.selectedStateName;
  }
  if (confirmedDate) {
    confirmedDate.textContent = 'Date: ' + today;
  }
}


/* =============================================
   8. BHADAAS LOGIC
   Forum ka kaam
   ============================================= */

/**
 * buildBhadaasList — bhadaas list banao
 * Firebase se real + fake mix karke
 */
function buildBhadaasList() {
  const container = document.getElementById('bhadaasTopList');
  if (!container) return;

  /* Pehle fake bhadaas dikhao */
  FAKE_BHADAAS.slice(0, 3).forEach(function (bhadaas) {
    container.appendChild(createBhadaasItem(bhadaas));
  });
}

/**
 * createBhadaasItem — ek bhadaas item ka HTML
 * @param bhadaas — bhadaas object
 */
function createBhadaasItem(bhadaas) {
  const item = document.createElement('div');
  item.className = 'bhadaas-item';

  /* Text */
  const text = document.createElement('p');
  text.className = 'bhadaas-item-text';
  text.textContent = '"' + bhadaas.text + '"';

  /* Meta row */
  const meta = document.createElement('div');
  meta.className = 'bhadaas-item-meta';

  /* State */
  const from = document.createElement('span');
  from.className = 'bhadaas-item-from';
  from.textContent = 'Anonymous, ' + bhadaas.state;

  /* Like button */
  const likeBtn = document.createElement('button');
  likeBtn.className = 'bhadaas-like-btn';
  likeBtn.textContent = '❤️ ' + formatNumber(bhadaas.likes);
  likeBtn.dataset.id = bhadaas.id;

  /* Like button click */
  likeBtn.addEventListener('click', function () {
    handleBhadaasLike(bhadaas.id, likeBtn);
  });

  meta.appendChild(from);
  meta.appendChild(likeBtn);
  item.appendChild(text);
  item.appendChild(meta);

  return item;
}

/**
 * handleBhadaasLike — like button dabaya
 * @param id — bhadaas ID
 * @param btn — button element
 */
function handleBhadaasLike(id, btn) {
  /* Already liked? */
  const likedKey = 'liked_' + id;
  if (localStorage.getItem(likedKey)) return;

  /* Like count badhaao */
  localStorage.setItem(likedKey, '1');
  btn.classList.add('liked');

  /* Count update karo — just visual */
  const currentCount = parseInt(btn.textContent.replace(/[^0-9]/g, '')) || 0;
  btn.textContent = '❤️ ' + formatNumber(currentCount + 1);

  /* Firebase mein save karo */
  if (typeof saveLikeToFirebase === 'function') {
    saveLikeToFirebase(id);
  }
}

/**
 * postBhadaas — naya bhadaas post karo
 */
function postBhadaas() {
  const input = document.getElementById('bhadaasInput');
  const text = input.value.trim();

  /* Empty check */
  if (!text) {
    input.placeholder = 'Kuch toh likho bhai... ya ? likh do';
    return;
  }

  /* Firebase mein save karo */
  if (typeof saveBhadaasToFirebase === 'function') {
    saveBhadaasToFirebase(text, AppState.selectedStateName);
  }

  /* Input clear karo */
  input.value = '';

  /* Next scene pe jao */
  nextScene();
}


/* =============================================
   9. RESULTS LOGIC
   State wise vote counts
   ============================================= */

/**
 * buildStateCountsList — state counts HTML banao
 */
function buildStateCountsList() {
  const container = document.getElementById('stateCountsList');
  if (!container) return;

  /* Top 8 states dikhao */
  const topStates = [
    { code: 'MH', name: '🏙️ Maharashtra' },
    { code: 'UP', name: '🌾 Uttar Pradesh' },
    { code: 'BR', name: '🪳 Bihar' },
    { code: 'WB', name: '🐟 West Bengal' },
    { code: 'DL', name: '🏛️ Delhi' },
    { code: 'TN', name: '☀️ Tamil Nadu' },
    { code: 'GJ', name: '🦁 Gujarat' },
    { code: 'KA', name: '🌿 Karnataka' }
  ];

  topStates.forEach(function (state) {
    const votes = FAKE_VOTE_BASE[state.code] || 0;
    const row = document.createElement('div');
    row.className = 'state-count-row';

    const name = document.createElement('span');
    name.className = 'state-count-name';
    name.textContent = state.name;

    const count = document.createElement('span');
    count.className = 'state-count-votes';
    count.textContent = formatNumber(votes) + ' votes';

    row.appendChild(name);
    row.appendChild(count);
    container.appendChild(row);
  });
}

/**
 * updateCountdown — days baaki hain calculate karo
 */
function updateCountdown() {
  const today = new Date();
  const resultsDate = CONFIG.resultsDate;
  const diff = Math.ceil((resultsDate - today) / (1000 * 60 * 60 * 24));

  const el = document.getElementById('countdownDays');
  if (el) el.textContent = diff > 0 ? diff : 0;
}


/* =============================================
   10. CERTIFICATE LOGIC
   ============================================= */

/**
 * updateCertificateScreen — certificate data set karo
 */
function updateCertificateScreen() {
  const party = PARTIES[AppState.selectedParty];
  const today = new Date().toLocaleDateString('en-IN');

  const certState = document.getElementById('certStateName');
  const certParty = document.getElementById('certPartyName');
  const certDate  = document.getElementById('certDate');

  if (certState && AppState.selectedStateName) {
    certState.textContent = 'Anonymous, ' + AppState.selectedStateName;
  }
  if (certParty && party) {
    certParty.textContent = party.emoji + ' ' + party.name;
  }
  if (certDate) {
    certDate.textContent = today;
  }
}


/* =============================================
   11. SHARE LOGIC
   WhatsApp share
   ============================================= */

/**
 * shareOnWhatsApp — WhatsApp pe share karo
 */
function shareOnWhatsApp() {
  const party = PARTIES[AppState.selectedParty];
  const partyName = party ? party.name : 'CJP';

  const text =
    '🪳 Maine ' + partyName + ' ko vote diya!\n' +
    'Kyunki baaki sab already hamare vote chura chuke hain 😂\n\n' +
    'Aap bhi vote do: https://cjpvote.web.app\n\n' +
    '#CockroachJantaParty #CJPVote #SurvivingSinceDemocracy';

  const url = 'https://wa.me/?text=' + encodeURIComponent(text);
  window.open(url, '_blank');
}


/* =============================================
   12. LIVE COUNT ANIMATOR
   Fake live count slowly badhao
   ============================================= */

/**
 * startLiveCountAnimation — counter animate karo
 */
function startLiveCountAnimation() {
  let count = CONFIG.fakeLiveCount;

  /* Har 4 second mein thoda badhaao */
  setInterval(function () {
    count += Math.floor(Math.random() * CONFIG.liveCountIncrement) + 1;

    /* Bottom bar count */
    const bottomEl = document.getElementById('bottomLikeCount');
    if (bottomEl) bottomEl.textContent = formatNumber(count);

    /* State select screen count */
    const liveEl = document.getElementById('liveCountText');
    if (liveEl) liveEl.textContent = formatNumber(count) + ' log pehle se vote de chuke hain';

  }, 4000);
}


/* =============================================
   13. EVENT LISTENERS
   Sab buttons yahan attach honge
   HTML mein koi onclick nahi
   ============================================= */

/**
 * attachEventListeners — sab listeners ek jagah
 */
function attachEventListeners() {

  /* Permission button — audio unlock */
  document.getElementById('btnPermission')
    .addEventListener('click', handlePermissionClick);

  /* State select dropdown */
  document.getElementById('stateSelect')
    .addEventListener('change', handleStateChange);

  /* State next button */
  document.getElementById('btnStateNext')
    .addEventListener('click', handleStateNext);

  /* EVM party buttons — sab ke liye ek listener */
  document.querySelectorAll('.evm-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      handleEVMButtonClick(btn.dataset.party);
    });
  });

  /* Vote confirm button */
  document.getElementById('btnVoteConfirm')
    .addEventListener('click', confirmVote);

  /* Share button — confirmed screen */
  document.getElementById('btnShare')
    .addEventListener('click', shareOnWhatsApp);

  /* Bhadaas post button */
  document.getElementById('btnBhadaasPost')
    .addEventListener('click', postBhadaas);

  /* Bhadaas skip button */
  document.getElementById('btnBhadaasSkip')
    .addEventListener('click', nextScene);

  /* Go to bhadaas from results */
  document.getElementById('btnGoToBhadaas')
    .addEventListener('click', function () {
      goToScene('scene-bhadaas');
    });

  /* Certificate share button */
  document.getElementById('btnShareCert')
    .addEventListener('click', shareOnWhatsApp);

  /* Bottom share button */
  document.getElementById('btnBottomShare')
    .addEventListener('click', shareOnWhatsApp);

  /* Mute button */
  document.getElementById('btnMute')
    .addEventListener('click', toggleMute);

  /* Bhadaas character counter */
  document.getElementById('bhadaasInput')
    .addEventListener('input', updateBhadaasCount);
}

/**
 * handlePermissionClick — permission button dabaya
 * Audio unlock hota hai — user ko pata nahi chalta
 */
function handlePermissionClick() {
  /* Ek baar koi bhi audio play karo — permission mil jaati hai */
  const unlock = new SpeechSynthesisUtterance(' ');
  unlock.volume = 0; /* silent — user ko sunai nahi deta */
  window.speechSynthesis.speak(unlock);

  /* Next scene */
  nextScene();
}

/**
 * handleStateChange — state select hua
 */
function handleStateChange() {
  const select = document.getElementById('stateSelect');
  const btn = document.getElementById('btnStateNext');

  if (select.value) {
    AppState.selectedState = select.value;
    AppState.selectedStateName = select.options[select.selectedIndex].text
      .replace(' 🪳', ''); /* Bihar ke emoji ko remove karo */
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
}

/**
 * handleStateNext — state confirm karke aage jao
 */
function handleStateNext() {
  if (!AppState.selectedState) return;

  /* State save karo — baki pages ke liye */
  localStorage.setItem(CONFIG.stateKey, AppState.selectedState);
  localStorage.setItem(CONFIG.stateKey + '_name', AppState.selectedStateName);

  nextScene();
}

/**
 * updateBhadaasCount — character counter update karo
 */
function updateBhadaasCount() {
  const input = document.getElementById('bhadaasInput');
  const counter = document.getElementById('bhadaasCount');
  const remaining = 280 - input.value.length;
  if (counter) counter.textContent = remaining;
}


/* =============================================
   14. UTILITIES
   Helper functions
   ============================================= */

/**
 * formatNumber — number ko readable banao
 * 248293 → 2,48,293 (Indian format)
 * @param num — number
 */
function formatNumber(num) {
  return num.toLocaleString('en-IN');
}

/**
 * loadPreferences — saved settings load karo
 */
function loadPreferences() {
  /* Mute preference */
  const savedMute = localStorage.getItem(CONFIG.muteKey);
  if (savedMute === '1') {
    AppState.isMuted = true;
    const btn = document.getElementById('btnMute');
    if (btn) btn.textContent = '🔇';
  }

  /* Saved state */
  const savedState = localStorage.getItem(CONFIG.stateKey);
  const savedStateName = localStorage.getItem(CONFIG.stateKey + '_name');
  if (savedState) {
    AppState.selectedState = savedState;
    AppState.selectedStateName = savedStateName;

    /* Dropdown mein pre-select karo */
    const select = document.getElementById('stateSelect');
    if (select) {
      select.value = savedState;
      document.getElementById('btnStateNext').disabled = false;
    }
  }

  /* Vote status */
  AppState.hasVotedToday = hasVotedToday();

  /* Bhadaas list build karo */
  buildBhadaasList();
}

/**
 * showAd — ad slot dikhao thodi der ke liye
 */
function showAd() {
  const adSlot = document.getElementById('adSlot');
  if (!adSlot) return;

  adSlot.classList.remove('hidden');

  /* 5 second baad hide karo */
  setTimeout(function () {
    adSlot.classList.add('hidden');
  }, 5000);
}