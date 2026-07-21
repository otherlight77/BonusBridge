export const zodiac = [
  { name: 'Bélier', symbol: '♈', element: 'Feu', start: [3, 21], end: [4, 19] },
  { name: 'Taureau', symbol: '♉', element: 'Terre', start: [4, 20], end: [5, 20] },
  { name: 'Gémeaux', symbol: '♊', element: 'Air', start: [5, 21], end: [6, 20] },
  { name: 'Cancer', symbol: '♋', element: 'Eau', start: [6, 21], end: [7, 22] },
  { name: 'Lion', symbol: '♌', element: 'Feu', start: [7, 23], end: [8, 22] },
  { name: 'Vierge', symbol: '♍', element: 'Terre', start: [8, 23], end: [9, 22] },
  { name: 'Balance', symbol: '♎', element: 'Air', start: [9, 23], end: [10, 22] },
  { name: 'Scorpion', symbol: '♏', element: 'Eau', start: [10, 23], end: [11, 21] },
  { name: 'Sagittaire', symbol: '♐', element: 'Feu', start: [11, 22], end: [12, 21] },
  { name: 'Capricorne', symbol: '♑', element: 'Terre', start: [12, 22], end: [1, 19] },
  { name: 'Verseau', symbol: '♒', element: 'Air', start: [1, 20], end: [2, 18] },
  { name: 'Poissons', symbol: '♓', element: 'Eau', start: [2, 19], end: [3, 20] }
];

export const defaultCountries = [
  { id:'france',name:'France',flag:'🇫🇷',score:96,x:47.8,y:36.5,cities:['Paris','Lyon','Bordeaux','Nice'],tags:['Créativité','Réseau','Équilibre'],copy:'Un territoire d’expression fluide, propice aux connexions et aux nouveaux projets.' },
  { id:'belgique',name:'Belgique',flag:'🇧🇪',score:91,x:48.6,y:33.8,cities:['Bruxelles','Anvers','Liège'],tags:['Diplomatie','Culture','Proximité'],copy:'Une énergie relationnelle et équilibrée, idéale pour construire un réseau durable.' },
  { id:'canada',name:'Canada',flag:'🇨🇦',score:94,x:25.8,y:32.2,cities:['Montréal','Toronto','Vancouver','Québec'],tags:['Ouverture','Mobilité','Innovation'],copy:'Un espace ouvert et cosmopolite qui amplifie la curiosité et les rencontres.' },
  { id:'usa',name:'USA',flag:'🇺🇸',score:86,x:23.8,y:43.5,cities:['New York','Los Angeles','Miami','Austin'],tags:['Ambition','Vitesse','Opportunité'],copy:'Un terrain d’action intense qui récompense l’audace et la capacité d’adaptation.' },
  { id:'australie',name:'Australie',flag:'🇦🇺',score:89,x:85.2,y:78.2,cities:['Sydney','Melbourne','Brisbane','Perth'],tags:['Liberté','Nature','Renouveau'],copy:'Une destination de renouveau qui favorise l’autonomie et la respiration créative.' },
  { id:'espagne',name:'Espagne',flag:'🇪🇸',score:93,x:45.7,y:42.7,cities:['Madrid','Barcelone','Valence','Séville'],tags:['Soleil','Expression','Lien'],copy:'Une vibration chaleureuse où les relations et la créativité s’expriment naturellement.' },
  { id:'portugal',name:'Portugal',flag:'🇵🇹',score:90,x:43.5,y:43.5,cities:['Lisbonne','Porto','Faro'],tags:['Douceur','Inspiration','Océan'],copy:'Un rythme doux et inspirant, propice à l’ancrage comme aux projets indépendants.' },
  { id:'luxembourg',name:'Luxembourg',flag:'🇱🇺',score:88,x:48.2,y:35.6,cities:['Luxembourg','Esch-sur-Alzette'],tags:['Stabilité','International','Finance'],copy:'Un carrefour stable et international pour structurer une trajectoire ambitieuse.' },
  { id:'italie',name:'Italie',flag:'🇮🇹',score:92,x:51.8,y:42.5,cities:['Rome','Milan','Florence','Turin'],tags:['Beauté','Héritage','Passion'],copy:'Une terre de sensibilité et de création qui nourrit l’esthétique et les liens profonds.' }
];

export const presetProfiles = [
  { id:'julia',firstName:'Julia',lastName:'Martin',birthDate:'1995-06-08',birthTime:'09:42',country:'France',city:'Paris',sign:'Gémeaux',ascendant:'Balance',element:'Air',symbol:'♊',icon:'assets/icons/gemini.svg',palette:['#72d6ff','#e1bf70','#ffffff'],preferences:['Mobilité','Créativité'],score:98 },
  { id:'sacha',firstName:'Sacha',lastName:'Leroy',birthDate:'1992-10-02',birthTime:'18:15',country:'Canada',city:'Montréal',sign:'Balance',ascendant:'Verseau',element:'Air',symbol:'♎',icon:'assets/icons/libra.svg',palette:['#d39b9e','#8c62b5','#ffffff'],preferences:['Relations','Créativité'],score:94 }
];

export const searchIndex = [
  { icon:'✦',title:'Configurateur astral',description:'Créer ou modifier une signature',target:'#configurator' },
  { icon:'⌖',title:'Destinations',description:'Explorer la carte mondiale',target:'#world' },
  { icon:'♊',title:'Profil Julia',description:'Gémeaux · Air · Paris',action:'Julia' },
  { icon:'♎',title:'Profil Sacha',description:'Balance · Air · Montréal',action:'Sacha' },
  { icon:'⇄',title:'Comparateur',description:'Comparer plusieurs destinations',panel:'compare' },
  { icon:'◷',title:'Historique',description:'Consulter les calculs récents',panel:'history' },
  { icon:'♡',title:'Favoris',description:'Retrouver vos sélections',panel:'favorites' },
  { icon:'◇',title:'Administration',description:'Analytics, utilisateurs et logs',panel:'admin' },
  { icon:'⚙',title:'Paramètres',description:'Notifications et application',panel:'settings' }
];
