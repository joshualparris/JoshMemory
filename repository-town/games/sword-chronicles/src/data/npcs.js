/**
 * @typedef {object} NpcDialogueTopic
 * @property {string} id
 * @property {string} label
 * @property {string[]} lines — shown as dialogue when chosen
 * @property {Record<string, boolean>} [needFlags] — topic hidden unless each flag matches (true/false)
 * @property {string} [needActiveQuest]
 * @property {string} [needInactiveQuest]
 * @property {"open_shop"|"elira_heal"|"harper_payout"} [effect] — handled in main.js
 */

export const NPCS = [
  {
    id: "serra",
    name: "Captain Serra",
    locationId: "protector_enclave",
    faction: "lords",
    greeting: "Neverwinter needs operatives who can move quietly and strike hard.",
    questHook: "main_quest",
    topics: [
      {
        id: "briefing",
        label: "Ask for a proper briefing",
        lines: [
          "Serra unrolls a charcoal map streaked with ash drift.",
          "\"Vexira anchors a ritual on Mount Hotenow. She needs three ward sigils—tide, shadow, and flame—unbound from our defenses.\"",
          "\"Recover them, have a smith weave the Warded Key, then end her before the rift eats the city.\""
        ]
      },
      {
        id: "neverwinter",
        label: "How is the city holding?",
        lines: [
          "\"We've survived worse than ash storms,\" she says quietly.",
          "\"But fear spreads faster than fire. People need to see someone willing to walk into the smoke and come back.\""
        ]
      },
      {
        id: "lords_alliance",
        label: "What does the Lords' Alliance want from me?",
        lines: [
          "\"Discretion, speed, and no grandstanding,\" Serra answers.",
          "\"Report to me or Lord Neverember. Don't sell what you learn to the first gossip with coin.\""
        ]
      },
      {
        id: "sigils",
        label: "Where might the sigils be?",
        lines: [
          "\"Intelligence points to Sunken Pier, Neverdeath Approach, and the rift approaches below Hotenow.\"",
          "\"Expect cult escorts at each site. They won't let the sigils go quietly.\""
        ],
        needInactiveQuest: "main_quest"
      },
      {
        id: "after_victory",
        label: "Neverwinter is safe—what now?",
        lines: [
          "Serra's salute is crisp, almost tender.",
          "\"Rest. Let the healers fuss. Then decide if you're a visitor or one of us. The gate stays open either way.\""
        ],
        needFlags: { defeatedVexira: true }
      }
    ]
  },
  {
    id: "brom",
    name: "Brom Ironmantle",
    locationId: "market_square",
    faction: "enclave",
    greeting: "Steel, grit, and a little patience solve most things.",
    shop: true,
    topics: [
      {
        id: "trade",
        label: "I'd like to see your wares",
        lines: ["Brom sweeps an arm toward crates of bundled steel and corked vials.", "\"Honest prices. No questions about why you need a third dagger.\""],
        effect: "open_shop"
      },
      {
        id: "neverwinter_trade",
        label: "How's business with the city on edge?",
        lines: [
          "\"Fear buys armor as fast as courage does,\" Brom grunts.",
          "\"I'd rather sell to happy folk, but I'll settle for alive ones.\""
        ]
      },
      {
        id: "cult",
        label: "Seen any cult buyers?",
        lines: [
          "\"Shadowy types asking for silvered wire and rare inks—paid well, smelled wrong.\"",
          "\"I sell metal, not sermons. If you follow them, watch your back.\""
        ]
      },
      {
        id: "advice",
        label: "Any advice for a new blade in town?",
        lines: [
          "\"Keep your shield arm loose, your purse tighter, and don't drink Dockward wine unless you trust the server.\"",
          "\"Oh—and buy a potion before you need one.\""
        ]
      }
    ]
  },
  {
    id: "elira",
    name: "Elira Dawn",
    locationId: "hall_of_justice",
    faction: "gauntlet",
    greeting: "Duty without compassion is only another kind of tyranny.",
    heal: true,
    topics: [
      {
        id: "blessing",
        label: "Request a blessing and healing",
        lines: ["Elira presses warm hands to your shoulders.", "\"Torm's strength is in the standing, not the falling. Let me ease what the road has taken.\""],
        effect: "elira_heal"
      },
      {
        id: "torm",
        label: "Tell me about Torm's justice",
        lines: [
          "\"Justice without mercy is a blade with no hilt,\" she says.",
          "\"We judge deeds, not whispers. If you act with honor here, you'll find friends in this hall.\""
        ]
      },
      {
        id: "neverember",
        label: "What do you think of Lord Neverember?",
        lines: [
          "\"A pragmatist with a king's appetite,\" Elira replies carefully.",
          "\"He keeps Neverwinter standing. My order watches that ambition doesn't trample the vulnerable.\""
        ]
      },
      {
        id: "cult_threat",
        label: "How should we handle the ash cult?",
        lines: [
          "\"With clarity,\" she says. \"They prey on despair. Show people the city still protects them—that cuts deeper than any spell.\""
        ]
      }
    ]
  },
  {
    id: "kael",
    name: "Kael Quickstep",
    locationId: "dockward",
    faction: "harpers",
    greeting: "I hear things before they happen. Usually.",
    rumor: true,
    topics: [
      {
        id: "docks",
        label: "What's the word on the docks?",
        lines: [
          "\"Boats running shy of tariffs, couriers using tide caves, the usual Dockward ballet.\"",
          "\"Lately, though, the wrong crates are moving too fast—sigil-marked, ash-scented.\""
        ]
      },
      {
        id: "harpers",
        label: "Why help a stranger?",
        lines: [
          "\"Because silence is a choice,\" Kael says with a half-smile.",
          "\"Harpers listen. Sometimes we nudge. Sometimes we hand someone a lantern and hope they walk toward the fire.\""
        ]
      },
      {
        id: "smuggler_tip",
        label: "Any leads on the smuggler chain?",
        lines: [
          "\"Talk to Tormund in Blacklake if you want work with receipts,\" they murmur.",
          "\"If you clear the pier cache, come back—I know people who pay for clean harbors.\""
        ],
        needInactiveQuest: "smuggler_chain"
      },
      {
        id: "collect_pay",
        label: "The pier cache is dealt with. About that payment…",
        lines: [
          "Kael slides a wrapped bundle across the table.",
          "\"Harper coin, Harper thanks. Try not to spend it all on Dockward trouble.\""
        ],
        needActiveQuest: "smuggler_chain",
        needFlags: { smugglerCleared: true },
        effect: "harper_payout"
      }
    ]
  },
  {
    id: "whisper",
    name: "Whisper",
    locationId: "blacklake",
    faction: "zhentarim",
    greeting: "Secrets have weight. Pay enough, and I might share one.",
    rumor: true,
    topics: [
      {
        id: "blacklake",
        label: "What hides in Blacklake?",
        lines: [
          "\"Old money, old grudges, and tunnels that remember every footstep,\" Whisper breathes.",
          "\"The Zhentarim aren't the only ones listening—but we're the ones who sell answers.\""
        ]
      },
      {
        id: "vexira_price",
        label: "What would Vexira pay for me to walk away?",
        lines: [
          "\"Your life, cheaply,\" they say. \"Power, dearly.\"",
          "\"If you're asking, you're not for sale. Good. Dead heroes don't tip.\""
        ]
      },
      {
        id: "tormund",
        label: "Who's reliable in this district?",
        lines: [
          "\"Tormund Vale asks too many noble questions for a Harper, but he pays on time.\"",
          "\"If you're hunting cult cargo, he's your next conversation.\""
        ]
      },
      {
        id: "collect_pay",
        label: "Smuggler problem solved. I believe I'm owed.",
        lines: [
          "Whisper counts coins without looking.",
          "\"Pleasure doing honest business in dishonest places. Don't make me regret the introduction.\""
        ],
        needActiveQuest: "smuggler_chain",
        needFlags: { smugglerCleared: true },
        effect: "harper_payout"
      }
    ]
  },
  {
    id: "neverember",
    name: "Lord Neverember",
    locationId: "hall_of_justice",
    faction: "lords",
    greeting: "If Neverwinter stands, it stands because people choose to act.",
    topics: [
      {
        id: "city",
        label: "How do you keep Neverwinter united?",
        lines: [
          "\"Bread, walls, and the illusion that someone is in charge,\" Neverember says dryly.",
          "\"Then I pray brave fools like you give the people something real to believe in.\""
        ]
      },
      {
        id: "serra",
        label: "Should I trust Captain Serra?",
        lines: [
          "\"With your life? Perhaps. With polite dinner conversation? Questionable,\" he allows a thin smile.",
          "\"She's loyal to the city first. That makes her predictable—in the best way.\""
        ]
      },
      {
        id: "vexira",
        label: "What do you know of Vexira?",
        lines: [
          "\"A zealot who found a volcano and called it destiny,\" he says, voice hardening.",
          "\"She would burn the Coast to remake it. Stop her, and debts between us can be discussed.\""
        ]
      },
      {
        id: "before_quest",
        label: "Where should I begin?",
        lines: [
          "\"Serra holds the writ and the map,\" Neverember says.",
          "\"Don't make me repeat myself—the ash won't wait for pleasantries.\""
        ],
        needFlags: { acceptedMainQuest: false }
      }
    ]
  },
  {
    id: "tormund",
    name: "Tormund Vale",
    locationId: "blacklake",
    faction: "harpers",
    greeting: "Shadow cultists are moving components through the old estate routes.",
    sideQuest: "smuggler_chain",
    topics: [
      {
        id: "smugglers",
        label: "Tell me about the smuggler cache",
        lines: [
          "\"Cult runners are staging at Sunken Pier—tide makes their boats brave,\" Tormund says.",
          "\"Clear them, and the Harpers will make sure your purse remembers the favor.\""
        ]
      },
      {
        id: "estates",
        label: "What happened to the old estates?",
        lines: [
          "\"Pride, debt, and a few very bad decisions,\" he sighs.",
          "\"Now the cellars echo with footsteps that don't belong to heirs anymore.\""
        ]
      },
      {
        id: "harpers_goal",
        label: "What do the Harpers want here?",
        lines: [
          "\"Balance,\" Tormund answers. \"No throne too heavy, no shadow too deep to map.\"",
          "\"Right now, that means keeping sigils out of the wrong hands—and yours in the right ones.\""
        ]
      },
      {
        id: "after_brief",
        label: "Any update on the pier?",
        lines: [
          "\"If you haven't cleared it, stop chatting and start stabbing,\" he says gently.",
          "\"If you have, Kael or Whisper owes you a drink and a purse.\""
        ],
        needFlags: { smugglerBriefed: true }
      }
    ]
  },
  {
    id: "miri",
    name: "Miri Ashwood",
    locationId: "market_square",
    faction: "enclave",
    greeting: "Give me ore and herbs, and I can turn them into miracles.",
    craftingGuide: true,
    topics: [
      {
        id: "warded_key",
        label: "How do I forge the Warded Key?",
        lines: [
          "\"Three sigils—tide, shadow, flame—plus iron, ember shard, and moonleaf at my cousin's bench in the Crafting Hall,\" Miri recites.",
          "\"Work carefully. The key hums when the weave is true; if it screams, step back.\""
        ]
      },
      {
        id: "materials",
        label: "Where do I find rare materials?",
        lines: [
          "\"Ore whispers to miners; ember shard favors ash vents; moonleaf likes moonlit ruins,\" she says.",
          "\"Or buy from Brom when the road is mean—I'm not judging your supply chain.\""
        ]
      },
      {
        id: "cousin",
        label: "Why the Crafting Hall and not here?",
        lines: [
          "\"Regulations, smoke, and one very nosy tax clerk,\" Miri laughs.",
          "\"The hall has the warded forge circle. My stall would turn into a crater.\""
        ]
      },
      {
        id: "open_craft",
        label: "I'm ready to use the crafting bench",
        lines: [
          "\"The warded circle is in the Crafting Hall—through the market arch,\" Miri says.",
          "\"Once you're there, lay the sigils with care. If the key screams, step back and breathe.\""
        ]
      }
    ]
  },
  {
    id: "vexira",
    name: "Vexira the Ashbound",
    locationId: "mount_hotenow",
    faction: "zhentarim",
    greeting: "You crossed storms and graves for this? Then burn with them.",
    boss: true,
    topics: [
      {
        id: "ritual",
        label: "What is the ritual for?",
        lines: [
          "\"To peel the lie of safety from this coast,\" Vexira says, embers crawling along her fingertips.",
          "\"You cling to crumbling walls. I offer a baptism of ash and truth.\""
        ]
      },
      {
        id: "surrender",
        label: "Stand down—it's not too late",
        lines: [
          "She laughs, low and hungry.",
          "\"It was too late when your ancestors built on a sleeping fire. I merely wake it.\""
        ]
      },
      {
        id: "key",
        label: "The Warded Key will stop you",
        lines: [
          "\"Then bring it,\" she whispers.",
          "\"Let us see whether your craft is stronger than my conviction.\""
        ],
        needFlags: { forgedWardedKey: true }
      },
      {
        id: "taunt",
        label: "You're afraid—otherwise you'd have struck already",
        lines: [
          "\"I savor anticipation,\" Vexira replies.",
          "\"Fear and hunger taste the same on the tongue. You'll learn—briefly.\""
        ]
      }
    ]
  }
];
