/** Stepped tutorial shown from the title screen (and optionally during creation). */
export const TUTORIAL_STEPS = [
  {
    title: "Welcome, adventurer",
    paragraphs: [
      "Chronicles of the Sword Coast is a browser RPG: you read story and Dungeon Master narration, then choose actions from buttons at the bottom of the screen. There is no 3D world to walk through—your choices are the game.",
      "When you create a hero, pick Easy, Medium, or Hard difficulty—it tunes enemies, supplies, rest cost, fleeing, and defeat penalties for the whole run (you cannot switch later).",
      "This short tour explains the interface and your main goal so you are not guessing after character creation."
    ]
  },
  {
    title: "What you are trying to do",
    paragraphs: [
      "Neverwinter is under threat from Vexira and a ritual tied to Mount Hotenow. Captain Serra in Protector's Enclave will set you on the main quest.",
      "Rough flow: talk to NPCs → travel to districts → win three combat encounters to earn sigils → craft the Warded Key at the Crafting Hall → confront Vexira at Mount Hotenow.",
      "Side content includes market shopping, a smuggler quest, recruitable companions, and dozens of optional “Explore & Roleplay” actions for flavor and skill checks."
    ]
  },
  {
    title: "The game screen",
    paragraphs: [
      "At the top: your current district name and a short character summary. Buttons: Sheet (opens the sidebar on small screens), Rest (long rest, costs gold), Save, Help (jumps to the Help tab).",
      "Below that, a scene illustration shows roughly where you are. Under it, the story log scrolls—new text appears at the bottom. Gold blocks labeled “Dungeon Master” are extra descriptive narration.",
      "The bottom strip is your action bar: every button is something you can do right now. It can scroll if there are many options."
    ]
  },
  {
    title: "Travel & map",
    paragraphs: [
      "Use Travel: … buttons to move only along roads the game allows from your current district. You cannot teleport; the World Map highlights where you may walk next.",
      "Open World Map from the action bar to see districts as a diagram. Click a linked location to move there. Close with the button, clicking outside, or Escape."
    ]
  },
  {
    title: "Talking & quests",
    paragraphs: [
      "Talk: … opens a conversation. Pick topic buttons, then Farewell to return to district actions. NPCs advance quests, shops, healing, and story.",
      "Your first priority in a new game: use Talk: Captain Serra in Protector's Enclave to accept the main quest.",
      "Quest Status in the action bar summarizes objectives. The Quests sidebar tab shows more detail."
    ]
  },
  {
    title: "Sidebar tabs",
    paragraphs: [
      "Character — stats, HP, gold. Party — companions you recruited (portraits and HP). Inventory, Quests, Spells, Log, Help.",
      "Help holds a short reference; you can open it anytime with the header Help button."
    ]
  },
  {
    title: "Explore, market & crafting",
    paragraphs: [
      "Explore & Roleplay opens a long list of D&D-style actions: Perception, Investigation, sitting down, smelling the sea, and many more. These use dice when marked as skill checks.",
      "Open Market appears in Market Square (Brom's shop). Use Crafting Bench appears in the Crafting Hall when you have the right materials for recipes—including the Warded Key."
    ]
  },
  {
    title: "Combat",
    paragraphs: [
      "Some districts offer encounters; the final fight is at Mount Hotenow when you are ready. In combat you choose attacks, spells, potions, or flee.",
      "After you act, any living companions strike, then the enemy acts. Natural 20s and 1s matter on your rolls. If you fall, you may wake in the Hall of Justice with penalties unless you have Revival Salt."
    ]
  },
  {
    title: "Companions",
    paragraphs: [
      "Recruit up to two allies from the action bar when you are in the right district and meet their requirements (gold, quest progress, or having visited a place).",
      "They travel with you, add banter when you move, fight after your turns, and can be knocked out until you Rest."
    ]
  },
  {
    title: "Save, rest & shortcuts",
    paragraphs: [
      "Save anytime from the header; your game is stored in this browser. Rest spends gold and a day but refills HP, spell slots, and companions.",
      "Number keys 1–9 trigger the matching visible action when possible. S saves, R rests (outside combat). Escape closes the World Map.",
      "That is everything you need for a comfortable start. Good luck—and talk to Serra first."
    ]
  }
];

/** Shown in the story log once when you begin a brand-new adventure (after chapter title). */
export const NEW_GAME_ONBOARDING_DM = [
  "Before the first sword is drawn, take a breath and learn the table.",
  "Everything you need is on one screen: the picture above is where you stand; the scrolling text is what happens; the buttons are what you can try next. If you ever feel lost, open Tutorial from the title screen before starting—or read the Help tab on the right.",
  "Your first useful deed is simple: find Captain Serra here in Protector's Enclave and choose Talk. She names the quest that will carry you across Neverwinter."
];

export const NEW_GAME_ONBOARDING_TIPS = [
  "Tip — Use the action buttons at the bottom. Start with Talk: Captain Serra.",
  "Tip — Travel and World Map only connect districts that share a road; the map highlights valid moves.",
  "Tip — Sheet / sidebar tabs hold character sheet, party, inventory, quests, and Help.",
  "Tip — Explore & Roleplay adds optional skill checks and flavor (Perception, Investigation, etc.).",
  "Tip — Press S to save; number keys 1–9 match the first nine action buttons."
];
