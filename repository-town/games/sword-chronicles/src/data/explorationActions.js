/**
 * Free-form exploration: skill checks (d20 + ability mod vs DC) and pure flavor beats.
 * Optional `locations[locationId]` overrides or adds lines for that district.
 */

export const EXPLORATION_ACTIONS = [
  {
    id: "look_around",
    label: "Look around carefully",
    kind: "skill",
    skill: "Perception",
    ability: "wis",
    dc: 12,
    pass: [
      "You map the space: who stands where, what paths are open, what looks out of place.",
      "Details jump out—scuff marks, a half-hidden sigil, the way guards avoid one doorway."
    ],
    fail: [
      "The scene washes together; you'll need another pass to read it properly.",
      "Too much noise, too many faces—you file a vague impression and move on."
    ],
    locations: {
      dockward: {
        pass: ["You spot fresh tar on a rope, a chalk mark only smugglers use, and a guard who isn't wearing official boots."],
        fail: ["Spray and gulls steal your focus; the docks keep their secrets."]
      },
      sunken_pier: {
        pass: ["Broken crates form a pattern—someone cleared a path to the water recently."],
        fail: ["Dark pilings and shifting shadows refuse to resolve into a clear picture."]
      },
      graveyard_road: {
        pass: ["You notice disturbed earth that doesn't match old burials—and crow feathers laid in a line."],
        fail: ["Fog swallows distance; every statue seems to turn when you blink."]
      },
      mount_hotenow: {
        pass: ["Ash drifts in spirals as if obeying a second wind; fissures pulse like slow breath."],
        fail: ["Heat shimmer turns the ridge into a smear of orange and black."]
      }
    }
  },
  {
    id: "perception_passive",
    label: "Perception — scan for hidden threats",
    kind: "skill",
    skill: "Perception",
    ability: "wis",
    dc: 14,
    pass: [
      "Your instincts prickle: someone watched you a moment ago, or a trap waits one lazy step ahead.",
      "You catch motion in a reflection—nothing dramatic, but you're not alone in the story."
    ],
    fail: [
      "Either the place is clean or your senses are dull. You hope it's the former.",
      "No tells. That should comfort you—it doesn't."
    ]
  },
  {
    id: "investigation",
    label: "Investigation — study clues & objects",
    kind: "skill",
    skill: "Investigation",
    ability: "int",
    dc: 13,
    pass: [
      "Logic snaps pieces together: wear patterns, inconsistent dust, a lie in the architecture.",
      "You reconstruct what happened here—not certainty, but a workable theory."
    ],
    fail: [
      "The clues don't speak; maybe you're asking the wrong questions.",
      "You end with more questions than answers, and ink-stained fingers."
    ],
    locations: {
      crafting_hall: {
        pass: ["The forge circle's chalk has been redrawn—recently, and in haste."],
        fail: ["Runes and tools blur; smithing was never your puzzle to solve."]
      },
      blacklake: {
        pass: ["Old estate ledgers were torn out; page ghosts remain in the binding."],
        fail: ["Rot and wealth look the same in this light."]
      }
    }
  },
  {
    id: "insight",
    label: "Insight — read a mood or lie",
    kind: "skill",
    skill: "Insight",
    ability: "wis",
    dc: 14,
    pass: [
      "Someone's smile doesn't reach their eyes; another speaker is terrified but staying put.",
      "You feel the shape of a secret—not what it is, but that it's being sold."
    ],
    fail: [
      "Faces are masks, and you're no sculptor today.",
      "Honesty and performance look the same from this angle."
    ]
  },
  {
    id: "arcana",
    label: "Arcana — sense magical residue",
    kind: "skill",
    skill: "Arcana",
    ability: "int",
    dc: 14,
    pass: [
      "The air carries a metallic aftertaste—evocation, or something that burns like it.",
      "Residual threads knot here; a ritual left fingerprints in the weave."
    ],
    fail: [
      "Magic is present, but stubbornly anonymous.",
      "Your mind reaches and grasps smoke."
    ],
    locations: {
      mount_hotenow: {
        pass: ["The rift hums in teeth and thoughts—necrotic fire braided with abjuration wards."],
        fail: ["Power drowns nuance; it's all roar and glare."]
      },
      hall_of_justice: {
        pass: ["Old consecration still rings in the stone—quiet, but deep."]
      }
    }
  },
  {
    id: "religion",
    label: "Religion — recall rites & omens",
    kind: "skill",
    skill: "Religion",
    ability: "int",
    dc: 12,
    pass: [
      "You recognize a gesture, a phrase, a symbol—this faith or a heresy wearing its clothes.",
      "Prayer wheels, sun-disks, ash-offerings: the pieces sort into something familiar."
    ],
    fail: [
      "Doctrine blurs; too many sects, too many schisms.",
      "You remember hymns, not meanings."
    ]
  },
  {
    id: "history",
    label: "History — recall Neverwinter's past",
    kind: "skill",
    skill: "History",
    ability: "int",
    dc: 13,
    pass: [
      "Names and dates surface: Mount Hotenow's old burns, Blacklake's fall, the Enclave's rebirth.",
      "You place this street on a timeline of sieges, plagues, and stubborn rebuilding."
    ],
    fail: [
      "The city's layers smear together—old stone, older shame.",
      "You know there was a war. Which one? Unclear."
    ]
  },
  {
    id: "nature",
    label: "Nature — read weather, plants, beasts",
    kind: "skill",
    skill: "Nature",
    ability: "int",
    dc: 12,
    pass: [
      "Clouds, wind, and the behavior of rats tell you what's coming before the sky admits it.",
      "That herb shouldn't bloom here—unless something in the soil changed."
    ],
    fail: [
      "Nature shrugs; you're a city creature tonight.",
      "The signs contradict each other—like every hedge witch you ever met."
    ],
    locations: {
      mount_hotenow: {
        pass: ["Nothing natural grows willingly here—what lives has made a treaty with heat."]
      }
    }
  },
  {
    id: "survival",
    label: "Survival — track, weather, camp sense",
    kind: "skill",
    skill: "Survival",
    ability: "wis",
    dc: 13,
    pass: [
      "You read bootprints, ash-fall, and wind like a map.",
      "Shelter, water, danger—you could move a squad through this if you had to."
    ],
    fail: [
      "Trail goes cold; the world refuses to be legible.",
      "You'd trust a coin flip as much as your read."
    ]
  },
  {
    id: "medicine",
    label: "Medicine — check your body & wounds",
    kind: "skill",
    skill: "Medicine",
    ability: "wis",
    dc: 11,
    pass: [
      "Bruises, pulse, breath—you're frayed but functional. No hidden bleeding you can find.",
      "Old scars and new scrapes tell a clear story; nothing infected. Yet."
    ],
    fail: [
      "Pain moves when you poke; diagnosis eludes you.",
      "You're fine. Probably. The headache disagrees."
    ]
  },
  {
    id: "animal_handling",
    label: "Animal Handling — calm a stray or mount",
    kind: "skill",
    skill: "Animal Handling",
    ability: "wis",
    dc: 13,
    pass: [
      "A dog stops growling; a horse exhales; something with feathers decides you're boring enough to trust.",
      "You move slow, speak low—instinct translates."
    ],
    fail: [
      "The beast finds you suspicious. Fair.",
      "Teeth, hooves, or beak—something says not today."
    ],
    locations: {
      market_square: {
        pass: ["A cart-mule accepts a scratch behind the ear; its owner relaxes too."]
      }
    }
  },
  {
    id: "deception",
    label: "Deception — practice a harmless bluff",
    kind: "skill",
    skill: "Deception",
    ability: "cha",
    dc: 13,
    pass: [
      "You spin a trivial lie to the air; your face keeps pace. Dangerous skill, useful muscle.",
      "Even shadows seem half-convinced. Good rehearsal."
    ],
    fail: [
      "You stumble over a simple fib—you need coffee or courage.",
      "Your tell shows; thankfully no one was buying anyway."
    ]
  },
  {
    id: "persuasion",
    label: "Persuasion — warm up your voice",
    kind: "skill",
    skill: "Persuasion",
    ability: "cha",
    dc: 12,
    pass: [
      "Words come smooth—promise, humor, weight. You're tuned for the next real conversation.",
      "You could talk a guard into directions, maybe not into treason. Enough."
    ],
    fail: [
      "You sound rehearsed, even to yourself.",
      "Charisma needs an audience; stone and fog don't clap."
    ]
  },
  {
    id: "intimidation",
    label: "Intimidation — hard stare, quiet menace",
    kind: "skill",
    skill: "Intimidation",
    ability: "cha",
    dc: 13,
    pass: [
      "You let silence do the shouting. A passerby finds somewhere else to be.",
      "Your shadow grows an inch; good trick. Use it wisely."
    ],
    fail: [
      "You look constipated, not fearsome.",
      "The city has seen worse than your glower."
    ]
  },
  {
    id: "performance",
    label: "Performance — hum, whistle, or posture",
    kind: "skill",
    skill: "Performance",
    ability: "cha",
    dc: 12,
    pass: [
      "A few notes hang right; a passerby almost claps, then remembers they're in a hurry.",
      "You find the rhythm of the street and borrow it—briefly, you're part of the song."
    ],
    fail: [
      "You break pitch; crows object.",
      "The muse is on break. Permanently."
    ]
  },
  {
    id: "athletics",
    label: "Athletics — stretch, lift, test your strength",
    kind: "skill",
    skill: "Athletics",
    ability: "str",
    dc: 12,
    pass: [
      "You loosen shoulders, set a crate back without groaning—small victories.",
      "Blood moves; you're reminded your body is a weapon maintained, not a temple abandoned."
    ],
    fail: [
      "Something twinges. Pride and spine negotiate a truce.",
      "The crate wins. This time."
    ]
  },
  {
    id: "acrobatics",
    label: "Acrobatics — balance, roll, light footwork",
    kind: "skill",
    skill: "Acrobatics",
    ability: "dex",
    dc: 13,
    pass: [
      "You hop a puddle, land quiet, feel centered—nimble enough for trouble.",
      "A tightrope of cobbles; you cross like you meant to."
    ],
    fail: [
      "Gravity makes its argument. You concede.",
      "You catch yourself—barely—before the street records your failure."
    ]
  },
  {
    id: "sleight_of_hand",
    label: "Sleight of Hand — palm a coin, adjust a buckle",
    kind: "skill",
    skill: "Sleight of Hand",
    ability: "dex",
    dc: 14,
    pass: [
      "Metal vanishes and returns; your hands remember old habits.",
      "Smooth—if you needed to lift something trivial, today you could."
    ],
    fail: [
      "The coin clatters. So does your dignity.",
      "Fingers too honest for thieving."
    ]
  },
  {
    id: "stealth",
    label: "Stealth — melt into shadow & stillness",
    kind: "skill",
    skill: "Stealth",
    ability: "dex",
    dc: 14,
    pass: [
      "You find the angle no one watches—ten heartbeats of invisible.",
      "Breath slows; the city's roar hides you."
    ],
    fail: [
      "A boot scrapes; a head turns. Amateur hour.",
      "You're about as subtle as a drum solo."
    ]
  },
  {
    id: "smell_ocean",
    label: "Smell the ocean / the air",
    kind: "flavor",
    lines: [
      "You breathe in: smoke, stone, cooking oil, and the stubborn pride of a city that refuses to kneel.",
      "The air is urban—layered, tired, alive."
    ],
    locations: {
      dockward: {
        lines: [
          "Salt hits first, then tar, then something sweet-rotten from the hold of a lazy freighter.",
          "Low tide honesty: brine, mud, and old rope. You've smelled worse promises.",
          "Spray mists your face; gulls argue like dockside politicians."
        ]
      },
      sunken_pier: {
        lines: [
          "Cold brine and deeper rot—water that has tasted too many secrets to stay clean.",
          "Each inhale is half ocean, half fear."
        ]
      },
      market_square: {
        lines: [
          "No surf here—only spice, sweat, and iron. The sea is a rumor carried on someone's cloak."
        ]
      },
      mount_hotenow: {
        lines: [
          "No ocean—only ash and hot metal pretending to be weather.",
          "You cough; the mountain breathes cinders back at you."
        ]
      }
    }
  },
  {
    id: "listen",
    label: "Listen closely",
    kind: "skill",
    skill: "Perception (hearing)",
    ability: "wis",
    dc: 13,
    pass: [
      "Distant bells, footsteps on different rhythms, a whispered price, a prayer—layers separate in your ear.",
      "You catch a phrase not meant for you. You'll pretend you didn't."
    ],
    fail: [
      "Noise wins. The city is a single shout wearing many mouths.",
      "Ringing in your ears—yours or the world's?"
    ]
  },
  {
    id: "examine_ground",
    label: "Examine the ground underfoot",
    kind: "skill",
    skill: "Investigation",
    ability: "int",
    dc: 12,
    pass: [
      "Ash, mud, blood old or new—you can tell which. Someone dragged something heavy here.",
      "Cobble wear tells you which way traffic flows when no one's watching."
    ],
    fail: [
      "Dirt is dirt. Ground keeps counsel.",
      "You find a coin! …Copper. Of course."
    ]
  },
  {
    id: "check_clothes",
    label: "Check your clothes & gear",
    kind: "flavor",
    lines: [
      "Buckles fastened, seams holding, cloak weighted correctly—small rituals before violence or diplomacy.",
      "A loose thread, a smear of ash—you fix what you can; the rest is character."
    ],
    locations: {
      mount_hotenow: {
        lines: [
          "Ember flecks dot your hem; leather stiffens from heat. You're dressed for war with a volcano."
        ]
      },
      graveyard_road: {
        lines: [
          "Fog-damp wool clings; you smell like iron and someone else's grief."
        ]
      }
    }
  },
  {
    id: "sit_down",
    label: "Sit down and breathe",
    kind: "flavor",
    lines: [
      "You claim a step, a stump, dignity on stone—exhale until your shoulders drop an inch.",
      "The world keeps hurrying. You don't, for three slow breaths."
    ],
    locations: {
      hall_of_justice: {
        lines: [
          "Marble leeches cold through your cloak; the hall's gravity makes sitting feel like testimony."
        ]
      },
      protector_enclave: {
        lines: [
          "Guards nod once—resting soldiers are still soldiers. You sit like you belong."
        ]
      }
    }
  },
  {
    id: "stretch_rest",
    label: "Stretch legs & roll shoulders",
    kind: "flavor",
    lines: [
      "Joints pop; blood remembers how to reach your fingers.",
      "Travel knots untie themselves—until the next mile."
    ]
  },
  {
    id: "drink_water",
    label: "Sip from your waterskin",
    kind: "flavor",
    lines: [
      "Water tastes flat, safe, precious. Cities run on it and never thank it.",
      "You ration the swallow—habit of the road."
    ],
    locations: {
      mount_hotenow: {
        lines: [
          "The first swallow is heaven; the aftertaste is ash. You drink anyway."
        ]
      }
    }
  },
  {
    id: "eat_rations",
    label: "Nibble travel rations",
    kind: "flavor",
    lines: [
      "Hard bread, salt fish, something pretending to be cheese—fuel, not feast.",
      "You're not hungry, but your hands want occupation."
    ]
  },
  {
    id: "whisper_companion",
    label: "Whisper to a companion",
    kind: "flavor",
    lines: [
      "You're alone in the party sense—still, you mutter a thought to the air. Old habit.",
      "No allies beside you; the street doesn't answer. Silence feels heavier."
    ],
    withPartyLines: [
      "You lean in; a murmured plan, a joke sharp enough to cut tension. Nods answer.",
      "\"Eyes left,\" you breathe—they adjust without breaking stride. That's trust.",
      "Your companion listens, jaw tight, then exhales. \"Copy,\" they say."
    ]
  },
  {
    id: "pray_moment",
    label: "Offer a silent prayer or oath",
    kind: "flavor",
    lines: [
      "Words you don't share with maps—promise, regret, or thanks. The street doesn't care; you do.",
      "Oath tastes like copper. You swallow it and stand straighter."
    ]
  },
  {
    id: "hum_tune",
    label: "Hum an old tune",
    kind: "flavor",
    lines: [
      "Melody half-remembered; it dies under bootheels and wind. Still, it helped.",
      "Music is armor against dread—you wear a bar or two."
    ]
  },
  {
    id: "watch_sky",
    label: "Watch the sky",
    kind: "flavor",
    lines: [
      "Clouds drag like tired banners. No omens—unless impatience counts.",
      "A thin scratch of smoke threads upward from somewhere you haven't saved yet."
    ],
    locations: {
      mount_hotenow: {
        lines: [
          "The sky is wrong-color—ember-stained, storm-fed. Beauty and warning share the same face."
        ]
      }
    }
  },
  {
    id: "feel_pocket_gold",
    label: "Count coin by touch",
    kind: "flavor",
    lines: [
      "Metal clicks; the weight is real. Comfort and target on your hip.",
      "Enough for a night, a bribe, or a mistake—same coins, different stories."
    ]
  },
  {
    id: "study_weapon",
    label: "Study your weapon",
    kind: "flavor",
    lines: [
      "Edge, balance, notches—each tells a fight you've survived. You promise the steel another.",
      "Maintenance is meditation. Wipe, oil, test the grip. Ready."
    ]
  },
  {
    id: "remember_why",
    label: "Remember why you came",
    kind: "flavor",
    lines: [
      "Fear and duty arm-wrestle; duty cheats with better arguments.",
      "Names surface—people who will live or die because you stayed or left.",
      "You chose this road. The road hasn't finished choosing you."
    ]
  },
  {
    id: "luck_touch",
    label: "Touch a lucky charm or superstition",
    kind: "flavor",
    lines: [
      "Ritual doesn't need truth—only rhythm. You tap wood, trace a seam, breathe once.",
      "Luck is a story you tell your hands before the dice fall."
    ]
  },
  {
    id: "map_memory",
    label: "Mentally retrace your route",
    kind: "skill",
    skill: "Survival / Memory",
    ability: "wis",
    dc: 11,
    pass: [
      "Doors, turns, landmarks—your inner map sharpens. Retreat won't be panic if it comes.",
      "You know where north pretends to be in this maze."
    ],
    fail: [
      "Streets shuffle when you're not looking. You'll navigate live.",
      "Memory leaks; you hold what you can."
    ]
  },
  {
    id: "cold_read_crowd",
    label: "Glimpse crowd mood (quick read)",
    kind: "skill",
    skill: "Insight",
    ability: "wis",
    dc: 12,
    pass: [
      "Tension here is financial, not religious—purses tight, eyes on prices.",
      "Celebration? Mourning? Neither—just exhaustion wearing different hats."
    ],
    fail: [
      "Too many stories at once. You get 'busy' and call it a day.",
      "Crowds lie in aggregate."
    ],
    locations: {
      market_square: {
        pass: ["Merchants laugh loud and mean it—sales are good, fear is selling better."]
      }
    }
  },
  {
    id: "test_wind",
    label: "Feel wind on your skin",
    kind: "flavor",
    lines: [
      "Wind finds the gaps in your cloak—honest, rude, useful.",
      "Direction shifts; weather is thinking about changing its mind."
    ],
    locations: {
      dockward: {
        lines: ["Salt wind shoves from the water, insistent as a creditor."]
      },
      mount_hotenow: {
        lines: ["Hot drafts lick upward—breath of something vast and sleepless below."]
      }
    }
  },
  {
    id: "shadow_box",
    label: "Shadow-box / practice forms",
    kind: "flavor",
    lines: [
      "Air yields; muscle remembers angles. A child watches, then pretends not to.",
      "Sweat beads; you're not fighting, but your body doesn't believe you."
    ]
  },
  {
    id: "read_posted_notice",
    label: "Read a posted notice or sigil",
    kind: "skill",
    skill: "Investigation",
    ability: "int",
    dc: 11,
    pass: [
      "Edicts, prices, warnings—bureaucracy's poetry. One line contradicts another; interesting.",
      "A sigil repeats: not guild, not temple—someone's private mark."
    ],
    fail: [
      "Ink ran; meaning didn't survive the rain.",
      "Too many words. You skim and retain nothing."
    ],
    locations: {
      protector_enclave: {
        pass: ["Recruitment tallies, curfew hours, ash advisories—command in fine print."]
      }
    }
  },
  {
    id: "taste_ash",
    label: "Taste the air for ash (cautiously)",
    kind: "flavor",
    lines: [
      "Bitter film on the tongue—distant fires, industry, or ritual. Hard to untangle.",
      "You regret the curiosity. The aftertaste lingers."
    ],
    locations: {
      mount_hotenow: {
        lines: [
          "Ash isn't flavor—it's texture, heat, insult. You spit once, politely."
        ]
      }
    }
  },
  {
    id: "check_time",
    label: "Guess the hour by sun & bells",
    kind: "skill",
    skill: "Survival",
    ability: "wis",
    dc: 10,
    pass: [
      "Between bells and light, you place the hour close enough for planning.",
      "Late afternoon—or early evening. Same hunger, different shadows."
    ],
    fail: [
      "Clouds mock sundials. You shrug.",
      "Time is a rumor in a windowless alley."
    ]
  },
  {
    id: "dodge_gutter",
    label: "Leap a gutter / puddle (flair)",
    kind: "skill",
    skill: "Acrobatics",
    ability: "dex",
    dc: 10,
    pass: [
      "Dry boots, small pride. You'll take it.",
      "A neat hop; a rat salutes. Possibly sarcastic."
    ],
    fail: [
      "Splash. Audience: pigeons. Verdict: unimpressed.",
      "Mud claims a hem. The city always taxes."
    ]
  },
  {
    id: "true_north",
    label: "Orient yourself (true north feeling)",
    kind: "skill",
    skill: "Survival",
    ability: "wis",
    dc: 11,
    pass: [
      "Instinct points—maybe not true north, but a direction you can commit to.",
      "The coast's memory lives in moss, smoke drift, star gaps. You hold a bearing."
    ],
    fail: [
      "Cities spin honest compasses. You're turned around politely.",
      "North is a philosophy today, not a fact."
    ]
  },
  {
    id: "scare_birds",
    label: "Clap — startle roosting birds",
    kind: "flavor",
    lines: [
      "Wings burst; complaints fill the air. Petty power, honest joy.",
      "They resettle. You remember you're not the only restless thing here."
    ]
  },
  {
    id: "borrow_light",
    label: "Borrow light — study reflections",
    kind: "skill",
    skill: "Perception",
    ability: "wis",
    dc: 12,
    pass: [
      "Glass, water, polished bronze—angles show you a doorway you hadn't noticed.",
      "Reflection lags half a heartbeat. Someone moved where you aren't looking."
    ],
    fail: [
      "All you see is yourself, tired and stubborn.",
      "Glare wins. Optics lose."
    ]
  },
  {
    id: "lie_in_grass",
    label: "Lie back (if ground allows)",
    kind: "flavor",
    lines: [
      "Stone isn't grass, but you flatten your spine anyway—sky replaces ceiling for a moment.",
      "Vertigo and peace trade places. You sit up before judgment arrives."
    ],
    locations: {
      graveyard_road: {
        lines: [
          "The ground is cold through your cloak. Stars peer like curious jurors."
        ]
      }
    }
  },
  {
    id: "barter_thought",
    label: "Imagine haggling — price your soul (joke)",
    kind: "flavor",
    lines: [
      "You'd start high; buyers would lowball; you'd meet in the middle at 'not today.'",
      "Some things aren't for sale. You rehearse saying so with a smile."
    ]
  },
  {
    id: "curse_soft",
    label: "Curse the cult under your breath",
    kind: "flavor",
    lines: [
      "Words small enough for privacy, sharp enough for satisfaction.",
      "Vexira's name tastes like hot iron. You spit metaphorically."
    ]
  },
  {
    id: "flex_charisma",
    label: "Smile at a stranger (no stakes)",
    kind: "skill",
    skill: "Performance",
    ability: "cha",
    dc: 10,
    pass: [
      "They smile back—brief, human, free.",
      "A nod exchanged. The city softens by a hair."
    ],
    fail: [
      "They look through you. Ouch.",
      "Wrong smile, wrong moment. You study boots."
    ]
  },
  {
    id: "intimidate_object",
    label: "Threaten a stuck door or latch",
    kind: "flavor",
    lines: [
      "\"Open,\" you whisper. It stays shut—discipline holds.",
      "Violence reserved for wood that deserves it. This wasn't the moment."
    ]
  },
  {
    id: "copy_footprint",
    label: "Compare your boot to a print",
    kind: "skill",
    skill: "Investigation",
    ability: "int",
    dc: 12,
    pass: [
      "Not yours—longer toe, heavier tread. Someone armored or burdened passed recently.",
      "Your sole matches nothing here. You're not the ghost they're tracking."
    ],
    fail: [
      "Mud lies. So do you, to yourself—'it's probably nothing.'",
      "Prints smear into abstraction."
    ]
  },
  {
    id: "sense_divine",
    label: "Sense divine presence (quiet)",
    kind: "skill",
    skill: "Religion",
    ability: "int",
    dc: 13,
    pass: [
      "Something listens—not approval, attention. You offer respect and receive stillness.",
      "Hallowed ground hums below indifference."
    ],
    fail: [
      "Silence feels empty, not holy.",
      "If gods are here, they're whispering to someone else."
    ],
    locations: {
      hall_of_justice: {
        pass: ["Torm's patience presses against impatience—order as warmth, not cold."]
      }
    }
  },
  {
    id: "measure_distance",
    label: "Pace off a distance",
    kind: "skill",
    skill: "Investigation",
    ability: "int",
    dc: 10,
    pass: [
      "Rough yards logged—enough for spell ranges, throws, or paranoia.",
      "Your stride is honest today."
    ],
    fail: [
      "You lose count at eleven. Classic.",
      "Obstacles cheat; measurement abandons you."
    ]
  },
  {
    id: "listen_own_breath",
    label: "Listen to your own breathing",
    kind: "flavor",
    lines: [
      "In, out—proof you're still in the story.",
      "Fear thins when breath deepens. Biology negotiates with drama."
    ]
  },
  {
    id: "name_fear",
    label: "Name what you're afraid of",
    kind: "flavor",
    lines: [
      "Ash. Failure. Becoming the kind of hero who burns villages to save them.",
      "You give fear a name so it sits across from you instead of behind.",
      "The list is long. You prioritize."
    ]
  },
  {
    id: "check_sharpness",
    label: "Thumb your blade's edge (carefully)",
    kind: "skill",
    skill: "Investigation",
    ability: "int",
    dc: 10,
    pass: [
      "Sharp enough. Honest bite without chatter.",
      "One nick to true—smithing can wait, killing can't."
    ],
    fail: [
      "Paper-cut from hubris. Blood joins the lesson.",
      "Duller than you thought. Note to self: maintain."
    ]
  },
  {
    id: "stargaze_snippet",
    label: "Find a patch of stars",
    kind: "flavor",
    lines: [
      "Between smoke-haze, a few stubborn points of light. Navigation, myth, or both.",
      "Constellations you half-know wink. No answers—company."
    ],
    locations: {
      mount_hotenow: {
        lines: [
          "Stars war with ash-cloud; the winners change by the minute."
        ]
      }
    }
  },
  {
    id: "mock_toast",
    label: "Raise an invisible toast",
    kind: "flavor",
    lines: [
      "To the dead you'll avenge, the living you'll disappoint, the tavern you'll miss.",
      "Glasses clink in imagination—cheaper than wine, warmer than water."
    ]
  },
  {
    id: "copy_guards_stance",
    label: "Mirror a guard's stance (practice)",
    kind: "skill",
    skill: "Performance",
    ability: "cha",
    dc: 11,
    pass: [
      "Posture borrows authority; you feel ridiculous and stronger.",
      "Shoulders square; chin drops a fraction. Uniformity without uniform."
    ],
    fail: [
      "A guard clocks you. You look away like you meant to stretch.",
      "You look like a child playing soldier."
    ],
    locations: {
      protector_enclave: {
        pass: ["A sergeant almost nods—almost."]
      }
    }
  },
  {
    id: "feel_magic_skin",
    label: "Feel for static / magic on your skin",
    kind: "skill",
    skill: "Arcana",
    ability: "int",
    dc: 13,
    pass: [
      "Hairs rise—not weather. Something woven nearby remembers power.",
      "Your scars itch where old magic touched you. Echo, not wound."
    ],
    fail: [
      "Nothing. Either calm or you're numb to it.",
      "Imagination supplies tingles; discipline dismisses them."
    ]
  },
  {
    id: "juggle_thought",
    label: "Juggle three worries — drop two",
    kind: "flavor",
    lines: [
      "Sigils, gold, Vexira—you keep one, shelve the rest for later.",
      "Anxiety is inventory management. You sort stacks.",
      "Two fears go back in the pack. One walks with you."
    ]
  }
];
