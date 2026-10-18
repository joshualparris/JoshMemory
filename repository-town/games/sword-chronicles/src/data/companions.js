/** Max allies traveling with the hero (not counting the player). */
export const MAX_PARTY_COMPANIONS = 2;

export const COMPANIONS = [
  {
    id: "mira",
    name: "Mira Stoneheel",
    role: "Mercenary fighter",
    portrait: "./assets/portraits/mira.svg",
    recruitLocationId: "market_square",
    recruitLabel: "Recruit Mira Stoneheel (mercenary, 25 gp)",
    recruitCostGold: 25,
    needsFlags: { acceptedMainQuest: true },
    needsDiscovered: [],
    introDm: [
      "Mira claps your shoulder, shield already slung. \"Contract's simple: I hit what you point at, and we split the interesting loot.\""
    ],
    maxHp: 24,
    ac: 15,
    attackBonus: 5,
    damage: "1d8+2",
    attackPhrases: ["Mira slams her longsword in a brutal arc.", "The mercenary drives the blade low and true.", "Mira shields you for a heartbeat, then strikes."],
    hitPhrases: ["Steel finds flesh with a grunt of satisfaction.", "Her strike connects—sparks fly from armor."],
    missPhrases: ["Mira curses as her blade skids wide.", "The enemy slips the mercenary's swing."],
    travelPhrases: [
      "Mira scans rooftops and alleys, hand never far from her hilt.",
      "\"Markets like this remind me why I charge by the fight, not the hour,\" Mira mutters.",
      "Your mercenary falls into step slightly behind your shield side, professional and quiet."
    ],
    downedPhrase: "Mira drops to one knee, bloodied but breathing—she cannot fight until you rest.",
    struckPhrase: "A blow hammers into Mira; she staggers but holds the line."
  },
  {
    id: "orin",
    name: "Brother Orin",
    role: "Acolyte of Torm",
    portrait: "./assets/portraits/orin.svg",
    recruitLocationId: "hall_of_justice",
    recruitLabel: "Ask Brother Orin to travel with you",
    recruitCostGold: 0,
    needsFlags: {},
    needsDiscovered: ["graveyard_road"],
    introDm: [
      "Orin adjusts his sun-disk amulet. \"Torm smiles on courage. I will walk with you—someone must keep the tally of mercy and judgment.\""
    ],
    maxHp: 20,
    ac: 14,
    attackBonus: 4,
    damage: "1d6+2",
    attackPhrases: ["Orin invokes Torm and swings his mace in a measured blow.", "Sacred words ride the head of his mace toward the foe.", "The acolyte steps into harm's way, weapon raised."],
    hitPhrases: ["The mace lands with a dull, righteous thud.", "Steel and faith bite together."],
    missPhrases: ["Orin's strike whistles past as the enemy recoils.", "Prayer steadies him, but the blow does not land."],
    travelPhrases: [
      "Orin murmurs a quiet prayer whenever you pass a beggar or a guard.",
      "\"The Hall feels distant already,\" he says. \"Good. Comfort makes feet slow.\"",
      "Incense clings to his robes; he points out sigils scratched above doorways you would have missed."
    ],
    downedPhrase: "Brother Orin collapses, shielding his symbols—he will not rise in this fight until tended.",
    struckPhrase: "Orin gasps; red soaks his sleeve, but his jaw stays set."
  },
  {
    id: "tassa",
    name: "Tassa Saltjaw",
    role: "Dockwise guide",
    portrait: "./assets/portraits/tassa.svg",
    recruitLocationId: "dockward",
    recruitLabel: "Hire Tassa Saltjaw as your guide",
    recruitCostGold: 15,
    needsFlags: {},
    needsDiscovered: [],
    introDm: [
      "Tassa grins, fileting an apple with a knife too sharp for fruit. \"Docks, graves, ash-holes—I know the shortcuts and the people who pretend they don't exist. Lead on.\""
    ],
    maxHp: 18,
    ac: 14,
    attackBonus: 5,
    damage: "1d6+3",
    attackPhrases: ["Tassa darts in, knife a silver blur.", "The guide slips behind cover and strikes from the shadows.", "Salt-crusted boots kick grit into the enemy's eyes—then the blade."],
    hitPhrases: ["A precise cut opens a new line of pain.", "Tassa's knife finds a gap you didn't see."],
    missPhrases: ["Tassa rolls clear, cursing the tide's bad luck.", "The blade sparks off buckle and bone—no blood this time."],
    travelPhrases: [
      "Tassa trades nods with dockhands; whispers follow in your wake like gulls.",
      "\"Smell that? Low tide and lies,\" she says cheerfully.",
      "She marks chalk symbols on posts—warnings, or advertisements, you can't tell."
    ],
    downedPhrase: "Tassa crumples, clutching her side—down until you make camp or rest.",
    struckPhrase: "Tassa hisses through her teeth, dance of the knife faltering for a moment."
  }
];
