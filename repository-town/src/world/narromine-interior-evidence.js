// Workplace interiors built from evidence about the real business, one at a time
// (docs/NARROMINE_INTERIOR_EVIDENCE.md is the checklist). Each entry lists its sources and the rooms the
// evidence supports; anything without evidence stays the generic fit-out for its kind.
// Google Maps/Street View imagery is not used (its terms forbid storing or analysing it).
const S = (t, l, text) => [t, l, { do: 'info', title: l, text: text || 'Workstation.', station: true }];
const I = (t, l, text) => [t, l, { do: 'info', title: l, text }];

export const INTERIOR_EVIDENCE = Object.freeze({
  'Narromine Hotel': {
    checked: '2026-11-06',
    sources: [
      'JLL Hotels & Hospitality sale listing, Oct 2022, via thehotelconversation.com.au (public bar, beer garden, 20 pub-style rooms, 10 ensuite motel rooms, 3 gaming machine entitlements, 2,074 m² corner site at Dandaloo Street and Derribong Avenue)',
      'Gday Pubs directory entry, Narromine Hotel Motel (bistro, open fireplace, pool room, upstairs function room with balcony, drive-through bottle shop)',
      'Bottlemart Express directory listings at 116 Dandaloo Street (drive-through bottle shop brand)',
    ],
    unknown: 'No interior photographs were reachable from the build environment, so counter positions, colours and finishes are not evidenced. Room sizes are not published.',
    rooms: [
      { name: 'Public bar', w: 12, d: 9, props: [S('counter', 'Public bar'), I('fireplace', 'Open fireplace', 'An open fireplace is listed among the hotel\'s features (Gday Pubs).'), 'stool', 'stool', 'stool', 'table', 'tv'] },
      { name: 'Bistro', w: 11, d: 9, props: [S('counter', 'Bistro counter'), 'table', 'table', 'table', 'chair', 'chair', 'chair'] },
      { name: 'Kitchen', w: 8, d: 7, props: [S('stove', 'Bistro kitchen'), 'fridge', 'kitchenSink', 'freezer'] },
      { name: 'Gaming room', w: 7, d: 6, props: [I('arcadeCabinet', 'Gaming machine 1', 'The hotel holds 3 gaming machine entitlements (JLL listing, 2022).'), I('arcadeCabinet', 'Gaming machine 2', 'One of 3 gaming machine entitlements.'), I('arcadeCabinet', 'Gaming machine 3', 'One of 3 gaming machine entitlements.')] },
      { name: 'Pool room', w: 9, d: 8, props: [I('table', 'Pool table', 'A pool room is listed among the hotel\'s features (Gday Pubs).'), 'stool', 'stool', 'noticeBoard'] },
      { name: 'Drive-through bottle shop', w: 9, d: 7, props: [S('cashRegister', 'Bottle shop counter'), 'shelf', 'shelf', 'fridge', 'crates'] },
      { name: 'Function room (upstairs, opens to the balcony)', w: 11, d: 9, props: ['table', 'table', 'chair', 'chair', I('lectern', 'Function room', 'An upstairs function room with a balcony is listed (Gday Pubs); the balcony is the iron-lace upper verandah on Dandaloo Street.')] },
      { name: 'Upstairs accommodation hallway', w: 10, d: 6, props: [I('noticeBoard', 'Pub rooms', '20 pub-style rooms upstairs and 10 ensuite motel rooms in a separate wing (JLL listing, 2022).'), 'bench'] },
    ],
  },
});
