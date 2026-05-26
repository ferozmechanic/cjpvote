/* =============================================
   CJP VOTE — content.js
   Saara content ek jagah
   
   Yahan se sab kuch edit karo:
   - Party manifesto
   - TTS scripts
   - Fake vote counts
   - Scene order
   - Bhadaas prompts
   
   Koi logic nahi — sirf data
   ============================================= */


/* =============================================
   SCENE ORDER
   App mein scenes is order mein chalenge
   Sirf ID change karo order badalne ke liye
   ============================================= */

const SCENE_ORDER = [
  'scene-permission',   /* audio permission trick */
  'scene-intro',        /* CJP introduction */
  'scene-state',        /* state select — rukta hai */
  'scene-bjp',          /* BYP manifesto */
  'scene-khang',        /* Khangress manifesto */
  'scene-aap',          /* KAP manifesto */
  'scene-lfp',          /* LFP manifesto */
  'scene-cjp',          /* CJP manifesto */
  'scene-evm',          /* voting machine — rukta hai */
  'scene-confirmed',    /* vote confirmed */
  'scene-bhadaas',      /* bhadaas forum — rukta hai */
  'scene-results',      /* state counts */
  'scene-certificate'   /* shareable certificate */
];


/* =============================================
   SCENES THAT PAUSE — user input chahiye
   Baaki sab TTS khatam hone pe auto advance
   ============================================= */

const PAUSE_SCENES = [
  'scene-permission',   /* click chahiye */
  'scene-state',        /* state select chahiye */
  'scene-evm',          /* vote button dabana hai */
  'scene-bhadaas'       /* likhna ya skip karna hai */
];


/* =============================================
   TTS SCRIPTS
   Har scene ka audio text
   Browser TTS yeh bolega
   Hindi mein likhna — zyada natural lagega
   ============================================= */

const TTS_SCRIPTS = {

  /* Permission screen — yahan TTS nahi
     User ka button click audio unlock karta hai */
  'scene-permission': null,

  /* Intro screen */
  'scene-intro':
    'Cockroach Janta Party. ' +
    'Surviving Since Democracy. ' +
    'Nuclear bomb se nahi marta. EVM se nahi daba. ' +
    'Aaj aap ka vote — history mein darj hoga.',

  /* State select */
  'scene-state':
    'Apna state chuniye. ' +
    'Pehle state batao — phir vote do. ' +
    'Waise neta aapka future chun chuke hain.',

  /* BYP manifesto */
  'scene-bjp':
    'Bharwa Janta Party. ' +
    'Achhe Din aa rahe hain — GPS battery khatam ho gayi. ' +
    'Jumla guaranteed. Delivery optional. ' +
    'Petrol price Chandrayaan ke saath moon pe pahunchne ki koshish mein hai.',

  /* Khangress manifesto */
  'scene-khang':
    'Khangress. ' +
    'Hum the, hain, rahenge — unfortunately. ' +
    'Saath saal mein jo nahi hua — agli term mein zaroor hoga. ' +
    'Hum optimistic hain — experience hai humhein disappointment ka.',

  /* KAP manifesto */
  'scene-aap':
    'Khaas Admi Party. ' +
    'Aam aadmi ki party — Khaas log chalate hain. ' +
    'Sheesh Mahal mein saadgi. ' +
    'Jhadu chalaenge, kursi bachayenge.',

  /* LFP manifesto */
  'scene-lfp':
    'Lokal Faaltu Party. ' +
    'Hamara neta best hai — cousin neta se compare karo toh. ' +
    'Delhi jaayenge — wapas nahi aayenge. ' +
    'Election mein biryani — guaranteed delivery.',

  /* CJP manifesto */
  'scene-cjp':
    'Cockroach Janta Party. ' +
    'Hum woh log hain jinhe Chief Justice ne cockroach bola. ' +
    'Humne accept kar liya. Ab hum everywhere hain. ' +
    'WiFi fundamental right hai. Unemployment hamaari strength hai. ' +
    'No neta — no problem.',

  /* EVM screen */
  'scene-evm':
    'Ab aapki baari hai. ' +
    'Apni party chuniye. ' +
    'Yaad rahe — aaj sirf ek vote. ' +
    'Kal phir aana.',

  /* Vote confirmed */
  'scene-confirmed':
    'Badhaai ho! ' +
    'Aapka vote void mein safely deliver ho gaya. ' +
    'Aap un khaas logon mein se hain ' +
    'jo actually kuch karte hain.',

  /* Bhadaas screen */
  'scene-bhadaas':
    'Dil ka bhadaas nikaalo. ' +
    'Yahan koi nahi sunta — isliye sab suntey hain. ' +
    'Apna frustration likho.',

  /* Results */
  'scene-results':
    'Ab tak ki ginti. ' +
    'Party breakdown 15 August ko milega. ' +
    'Azaadi ke din hoga asli faisla.',

  /* Certificate */
  'scene-certificate':
    'Aapko yeh praman patra diya jaata hai. ' +
    'Ki aapne apna democratic haq istemaal kiya. ' +
    'Share karo — inspire karo.'
};


/* =============================================
   PARTY DATA
   Saari parties ka content
   Manifesto points, slogans, etc.
   ============================================= */

const PARTIES = {

  bjp: {
    id: 'bjp',
    emoji: '🐂',
    name: 'Bharwa Janta Party',
    slogan: '"Achhe Din aa rahe hain..."',
    tagline: 'GPS battery khatam ho gayi',
    color: '#FF6B00',

    /* Manifesto points — teen se zyada mat karo
       User padhna nahi chahta 😂 */
    points: [
      {
        title: 'Jumla in Every Home 🏠',
        text: 'Har ghar mein ek guaranteed jumla deliver karenge. Delivery optional. Jumla guaranteed.',
        footnote: '*Terms apply. Not valid after election.'
      },
      {
        title: 'Petrol to the Moon 🚀',
        text: 'Chandrayaan moon pe pahuncha — petrol price bhi wahan pahunchne ki koshish mein hai.',
        footnote: '*Consistently ambitious since 2014.'
      },
      {
        title: '2 Crore Jobs Per Year 💼',
        text: 'Wahi waada, nayi packaging. Ab rozgar ko self-employment kehte hain.',
        footnote: '*Same promise since 2014. Still fresh. Like Maggi.'
      }
    ]
  },

  khang: {
    id: 'khang',
    emoji: '👴',
    name: 'Khangress',
    slogan: '"Hum the, hain, rahenge..."',
    tagline: 'Unfortunately — ek parivaar ki unlimited warranty',
    color: '#1a6abf',

    points: [
      {
        title: 'Garibi Hatao 2.0 🫙',
        text: 'Pehli baar 1971 mein bola tha. Garibi abhi bhi hai — slogan bhi abhi bhi hai.',
        footnote: '*Garibi ne bhi Khangress ki tarah wapsi ki hai.'
      },
      {
        title: 'Parivaar First 👨‍👩‍👧‍👦',
        text: 'Desh ko family business ki tarah chalayenge. Tradition hai, policy nahi.',
        footnote: '*Dynasty is not nepotism. It is legacy. Fark samjho.'
      },
      {
        title: 'Bharat Jodo Yatra 🚶',
        text: 'Poora desh paidal ghuma. Desh jooda nahi — par fitness improve hui.',
        footnote: '*Step count: 2 crore+. Seats won: math weak hai humari.'
      }
    ]
  },

  aap: {
    id: 'aap',
    emoji: '🧹',
    name: 'Khaas Admi Party',
    slogan: '"Aam aadmi ki party..."',
    tagline: 'Khaas log chalate hain — Sheesh Mahal se',
    color: '#0066CC',

    points: [
      {
        title: 'Free Bijli — Meter Pehle Lagao ⚡',
        text: '200 unit free — baaki pe loan lo. Subsidy denge — taxpayer ka paisa hai.',
        footnote: '*Free ka matlab free nahi hota.'
      },
      {
        title: 'Sheesh Mahal Mein Saadgi 🏛️',
        text: 'CM house pe 45 crore kharch kiya. Lekin andar sab common man jaisa hai.',
        footnote: '*Aam aadmi ka mahal. Same thing.'
      },
      {
        title: 'Jail Se Bhi Chalayenge 🔒',
        text: 'Arrest hua — party nahi ruki. Work from jail. Innovation hai.',
        footnote: '*New concept. Revolutionary. Accidental.'
      }
    ]
  },

  lfp: {
    id: 'lfp',
    emoji: '🎪',
    name: 'Lokal Faaltu Party',
    slogan: '"Hamara neta best hai..."',
    tagline: 'Compared to cousin neta — jo jail mein hai',
    color: '#8B4513',

    points: [
      {
        title: 'Caste + Caste = Vote 🧮',
        text: 'Simple math — jaati add karo, majority banao, jeeto. Development? Kadhi kabhi.',
        footnote: '*Formula 1967 mein discover hua. Abhi bhi kaam karta hai.'
      },
      {
        title: 'Election Mein Biryani 🍚',
        text: 'Vote do — biryani lo. 5 saal baad phir vote do — phir biryani. 100% delivery rate.',
        footnote: '*Only scheme with guaranteed delivery since independence.'
      },
      {
        title: 'Delhi Jaake Bhool Jaayenge 🏙️',
        text: 'Constituency mein bole Delhi pe focus karenge. Delhi mein bole constituency yaad hai.',
        footnote: '*5 saal mein 2 baar constituency visit. Duty thi, tourism nahi.'
      }
    ]
  },

  cjp: {
    id: 'cjp',
    emoji: '🪳',
    name: 'Cockroach Janta Party',
    slogan: '"Surviving Since Democracy"',
    tagline: 'Nuclear bomb se nahi marta — EVM se nahi daba',
    color: '#5C4033',

    points: [
      {
        title: 'WiFi is a Fundamental Right 📶',
        text: 'Article 21 mein add karenge — life, liberty, WiFi. Bina WiFi ke bhadaas kaise nikaale?',
        footnote: '*5G bhi fundamental right hoga.'
      },
      {
        title: 'No Neta — No Problem 🙅',
        text: 'Koi neta nahi — koi dhoka nahi. Koi promise nahi — koi disappointment nahi.',
        footnote: '*Leaderless party. Democratic by default. Revolutionary by accident.'
      },
      {
        title: 'Chief Justice Ko Shukriya 🙏',
        text: 'Unhone cockroach bola — humne movement banaya. Best PR campaign — zero budget.',
        footnote: '*Unintentional founding member. Honorary Cockroach. 🪳'
      }
    ]
  }

};


/* =============================================
   FAKE VOTE COUNTS
   Starting numbers — realistic lagein
   Total ~2.5 lakh — viral feel ke liye
   Real votes Firebase mein add honge upar se
   ============================================= */

const FAKE_VOTE_BASE = {
  'MH': 28492,  /* Maharashtra */
  'UP': 24103,  /* Uttar Pradesh */
  'BR': 19847,  /* Bihar — CJP stronghold 🪳 */
  'WB': 17293,  /* West Bengal */
  'DL': 15672,  /* Delhi */
  'TN': 14891,  /* Tamil Nadu */
  'GJ': 13247,  /* Gujarat */
  'RJ': 11983,  /* Rajasthan */
  'MP': 10472,  /* Madhya Pradesh */
  'KA':  9847,  /* Karnataka */
  'KL':  8234,  /* Kerala */
  'AP':  7891,  /* Andhra Pradesh */
  'TG':  7234,  /* Telangana */
  'PB':  6891,  /* Punjab */
  'HR':  5234,  /* Haryana */
  'OD':  4891,  /* Odisha */
  'AS':  3234,  /* Assam */
  'JH':  2891,  /* Jharkhand */
  'CG':  2234,  /* Chhattisgarh */
  'UK':  1891,  /* Uttarakhand */
  'HP':  1234,  /* Himachal Pradesh */
  'JK':   891,  /* Jammu & Kashmir */
  'GA':   634,  /* Goa */
  'TR':   523,  /* Tripura */
  'MN':   412,  /* Manipur */
  'ML':   334,  /* Meghalaya */
  'NL':   289,  /* Nagaland */
  'SK':   234,  /* Sikkim */
  'AR':   189,  /* Arunachal Pradesh */
  'MZ':   167,  /* Mizoram */
  'CH':   523,  /* Chandigarh */
  'PY':   412,  /* Puducherry */
  'AN':   289,  /* Andaman & Nicobar */
  'LA':   134,  /* Ladakh */
  'DN':   123,  /* Dadra & Nagar Haveli */
  'DD':    98,  /* Daman & Diu */
  'LD':    67   /* Lakshadweep */
};


/* =============================================
   FAKE PARTY DISTRIBUTION
   Percentage split — CJP leading from day 1
   Baaki parties mein distribute
   ============================================= */

const PARTY_DISTRIBUTION = {
  cjp:   0.35,  /* 35% — CJP leading! */
  bjp:   0.28,  /* 28% — strong second */
  khang: 0.18,  /* 18% — dying but alive */
  aap:   0.12,  /* 12% — Delhi strong */
  lfp:   0.07   /* 7% — scattered */
};


/* =============================================
   PRE-LOADED BHADAAS
   Fake starting bhadaas — page khali nahi lagega
   Real bhadaas Firebase se load honge
   ============================================= */

const FAKE_BHADAAS = [
  {
    text: 'Bharwa ne road banaya, barish mein beh gaya, contractor Dubai mein hai aur hum yahan bhadaas nikal rahe hain.',
    state: 'Bihar',
    likes: 2847,
    id: 'fake-1'
  },
  {
    text: 'Khangress 60 saal soyi thi ab BJP 60 saal sone ki taiyari kar rahi hai. Hum log beech mein jaag rahe hain.',
    state: 'UP',
    likes: 1923,
    id: 'fake-2'
  },
  {
    text: 'Khaas Admi Party ka jhadu sirf election sweep karta hai sadkein nahi.',
    state: 'Delhi',
    likes: 1456,
    id: 'fake-3'
  },
  {
    text: 'Petrol 200 rupay litre hua toh cycle khareedenge — oh cycle bhi 15000 ki hai ab.',
    state: 'Maharashtra',
    likes: 892,
    id: 'fake-4'
  },
  {
    text: 'Hum cockroach hain toh theek hai — cockroach nuclear bomb se nahi marta. Neta se bhi nahi marega.',
    state: 'Bihar',
    likes: 743,
    id: 'fake-5'
  },
  {
    text: '?',
    state: 'Lakshadweep',
    likes: 634,
    id: 'fake-6'
  },
  {
    text: 'Delhi wale sochte hain India sirf Hindi mein sochta hai. Hum dravida hain. Hum alag sochte hain.',
    state: 'Tamil Nadu',
    likes: 521,
    id: 'fake-7'
  },
  {
    text: 'Lokal Faaltu Party ka neta 5 saal mein 2 baar aaya constituency mein. Dono baar election tha.',
    state: 'Rajasthan',
    likes: 445,
    id: 'fake-8'
  }
];


/* =============================================
   APP CONFIG
   General settings
   ============================================= */

const CONFIG = {
  /* August 15 results unlock date */
  resultsDate: new Date('2026-08-15'),

  /* Fake live count — starting number */
  fakeLiveCount: 248293,

  /* Fake count increment — har 4 second mein */
  liveCountIncrement: 3,

  /* TTS settings */
  tts: {
    lang: 'hi-IN',   /* Hindi */
    rate: 0.9,        /* Thoda slow — clear sunai de */
    pitch: 1.0        /* Normal pitch */
  },

  /* Ad show karo har kitne scenes ke baad */
  adAfterScenes: 3,

  /* One vote per day — localStorage key */
  voteKey: 'cjp_last_vote_date',

  /* Selected state key */
  stateKey: 'cjp_selected_state',

  /* Mute preference key */
  muteKey: 'cjp_muted'
};