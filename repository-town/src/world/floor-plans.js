// Public-safe authored stories for two tall buildings. V7 intentionally stays generic.
const info = (title, text) => ({ do: 'info', title, text });
const room = (name, props, w = 10, d = 9) => ({ name, w, d, props });
export const UPPER_FLOOR_PLANS = {
  V7: [
    { title: 'Family floor', layout: 'hub', rooms: [
      room('Upstairs landing', [['bench', 'Landing seat'], ['plant', 'Houseplant']]),
      room('Quiet bedrooms', [['bed', 'Cosy bed'], ['wardrobe', 'Clothes cupboard'], ['lamp', 'Bedside light', info('Evening light', 'A warm lamp to wind down.')], ['bookshelf', 'Bedtime stories', info('Storytime', 'Choose a bedtime story.')]]),
      room('Reading study', [['desk', 'Writing desk'], ['laptop', 'Study laptop', info('Study time', 'A quiet place to learn.')], ['bookshelf', 'Reading shelves'], ['chessboard', 'Chess set', info('Chess', 'The board is ready for a friendly game.')]]),
    ]},
    { title: 'Attic and sky lookout', layout: 'hub', rooms: [
      room('Attic landing', [['lantern', 'Attic lantern'], ['crates', 'Old boxes']]),
      room('Creative workshop', [['workbench', 'Craft bench'], ['loom', 'Weaving loom', info('Create something', 'Make something in the hobby room.')], ['easel', 'Painting easel'], ['treasureChest', 'Memory chest', info('Memory chest', 'A collection of old treasures.')]]),
      room('Sky lookout', [['telescope', 'Star telescope', info('Stargazing', 'Look out over the rooftops.')], ['planetModel', 'Solar system model'], ['herbGarden', 'Herb planters'], ['bench', 'Lookout seat']]),
    ]},
  ],
  W7: [
    { title: 'Navigation deck', layout: 'hub', rooms: [
      room('Navigator landing', [['banner', 'Sailing banner'], ['lantern', 'Deck lantern']]),
      room('Chart room', [['mapTable', 'Sword Coast charts', info('Read the charts', 'Trace imagined harbours and ocean routes.')], ['globe', 'World globe', info('Explore the map', 'Plan a voyage across the seas.')], ['pinMap', 'Harbour routes'], ['scrollRack', 'Navigation scrolls']]),
      room('Mariners lounge', [['sofa', 'Captain’s seat'], ['radio', 'Sea radio', info('Sea stories', 'Hear imagined reports from the coast.')], ['bookshelf', 'Voyage journals'], ['chessboard', 'Strategy board']]),
    ]},
    { title: 'Beacon and observatory', layout: 'hub', rooms: [
      room('Keeper landing', [['lantern', 'Beacon lamp'], ['clock', 'Watch clock']]),
      room('Lantern chamber', [['crystal', 'Glowing beacon', info('Light the beacon', 'Guide imagined ships safely home.')], ['consolePanel', 'Beacon controls', info('Beacon controls', 'Inspect the lighthouse mechanism.')], ['battery', 'Backup power'], ['gearWall', 'Lamp machinery']]),
      room('Sea observatory', [['telescope', 'Coastal telescope', info('Scan the horizon', 'Search the imaginary Sword Coast.')], ['mapTable', 'Captain’s map'], ['lectern', 'Keeper’s log', info('Keeper’s log', 'Record weather, vessels and sightings.')], ['flag', 'Signal flag']]),
    ]},
  ],
};
export const hasUpperFloors = coord => Object.prototype.hasOwnProperty.call(UPPER_FLOOR_PLANS, coord);
export function navigationForFloor(index, count = 3) {
  return { up: index < count - 1 ? index + 1 : null, down: index > 0 ? index - 1 : null,
    lift: Array.from({ length: count }, (_, i) => i) };
}
