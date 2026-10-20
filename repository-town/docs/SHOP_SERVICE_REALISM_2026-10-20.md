# Staff-dependent retail and lunch coverage

Retail service now requires a worker who has arrived and is working at that site. Applies to player purchases, prepared dishes, cafe orders, buybacks and autonomous customers. Actions recheck at execution, so a panel opened before a departure cannot complete a ghost sale. Failed service leaves money and stock intact. Relief workers count at their actual site. Closed shops cannot buy goods back.

Food-counter staff cover noon and take staggered lunches after 13:00. A failed meal visit can queue a home-cooked meal using the resident's existing pantry; no free food is created. This fixes the synchronised-break meal shortfall exposed by the first test run. Advertised hours remain separate from actual staffing.

Validation: focused arrival/dispatch/relief/stale-action tests; panel tests; cafe transaction tests; local-trade conservation; seven-day economy; 14-day town run (minimum 97 meals/day); 28-day soak, 38 passing checks (minimum 96 meals/day). Full required CI gates must pass before merging. Visual street behaviour remains unverified because the available cloud browser cannot create a WebGL context.

Further realism backlog: staffing-aware opening hours and holiday cover; real queues and preparation time; perishable stock and cold-chain interruptions; pedestrian-controlled crossings; maintenance and cleaning shifts. These are future work, not claims about implemented functionality.
