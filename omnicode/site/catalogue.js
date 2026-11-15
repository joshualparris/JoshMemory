(() => {
  'use strict';
  // Original OmniCode 50-technology list, including the deliberate duplicate at #43.
  // This educational catalogue is separate from the 50 executable-source targets.
  const technologies = [
  {
    "id": 1,
    "name": "JavaScript",
    "type": "Language",
    "strengths": "Runs in browsers; excellent interactive interfaces; enormous ecosystem.",
    "weaknesses": "Dynamic typing pitfalls; dependency management can become difficult."
  },
  {
    "id": 2,
    "name": "HTML / CSS",
    "type": "Web / API",
    "strengths": "Universal web presentation; accessible interfaces; responsive layouts.",
    "weaknesses": "Not general-purpose programming languages; limited application logic."
  },
  {
    "id": 3,
    "name": "Python",
    "type": "Language",
    "strengths": "Readable; excellent for AI, automation and data science.",
    "weaknesses": "Slower CPU-intensive execution; packaging and environment issues."
  },
  {
    "id": 4,
    "name": "SQL",
    "type": "Language",
    "strengths": "Powerful database queries, joins and transactions.",
    "weaknesses": "Dialect differences; awkward for general application logic."
  },
  {
    "id": 5,
    "name": "TypeScript",
    "type": "Language",
    "strengths": "Static type checking for JavaScript; excellent for large applications.",
    "weaknesses": "Build tooling; compile-time types don't validate runtime data."
  },
  {
    "id": 6,
    "name": "Java",
    "type": "Language",
    "strengths": "Mature, portable and scalable; excellent enterprise tooling.",
    "weaknesses": "Can be verbose; JVM startup and memory overhead."
  },
  {
    "id": 7,
    "name": "Bash / Shell",
    "type": "Language",
    "strengths": "Excellent for system automation and combining command-line tools.",
    "weaknesses": "Fragile quoting; variable portability; difficult large programs."
  },
  {
    "id": 8,
    "name": "C#",
    "type": "Language",
    "strengths": "Excellent tooling; strong typing; games and business software.",
    "weaknesses": "Runtime considerations; dependency and version management."
  },
  {
    "id": 9,
    "name": "C++",
    "type": "Language",
    "strengths": "High performance; hardware control; game engines.",
    "weaknesses": "Complex language; memory safety and undefined behaviour risks."
  },
  {
    "id": 10,
    "name": "Go",
    "type": "Language",
    "strengths": "Simple syntax; fast compilation; networking and concurrency.",
    "weaknesses": "Less expressive in some areas; repetitive error handling."
  },
  {
    "id": 11,
    "name": "C",
    "type": "Language",
    "strengths": "Minimal overhead; embedded systems and operating systems.",
    "weaknesses": "Manual memory management; unsafe operations."
  },
  {
    "id": 12,
    "name": "Rust",
    "type": "Language",
    "strengths": "Memory safety without garbage collection; fast and reliable.",
    "weaknesses": "Steep ownership and borrowing learning curve; compile times."
  },
  {
    "id": 13,
    "name": "Kotlin",
    "type": "Language",
    "strengths": "Concise; null safety; excellent Android support.",
    "weaknesses": "JVM and Android complexity; smaller ecosystem than Java."
  },
  {
    "id": 14,
    "name": "Swift",
    "type": "Language",
    "strengths": "Modern safety features; excellent Apple platform integration.",
    "weaknesses": "Apple-centric ecosystem; less mature cross-platform adoption."
  },
  {
    "id": 15,
    "name": "React",
    "type": "Framework",
    "strengths": "Reusable components; powerful interactive web interfaces.",
    "weaknesses": "Not a programming language; state management and tooling complexity."
  },
  {
    "id": 16,
    "name": "Node.js",
    "type": "Runtime",
    "strengths": "JavaScript on the backend; excellent asynchronous I/O.",
    "weaknesses": "CPU-heavy work can block the event loop; package security."
  },
  {
    "id": 17,
    "name": "Assembly",
    "type": "Language",
    "strengths": "Maximum hardware-level control; tiny optimised routines.",
    "weaknesses": "Very difficult to maintain; processor architecture-specific."
  },
  {
    "id": 18,
    "name": "Angular",
    "type": "Framework",
    "strengths": "Complete, structured framework for large applications.",
    "weaknesses": "Steep learning curve; substantial framework complexity."
  },
  {
    "id": 19,
    "name": "Vue.js",
    "type": "Framework",
    "strengths": "Approachable reactive interfaces; easy gradual integration.",
    "weaknesses": "Smaller ecosystem than React; architectural choices vary."
  },
  {
    "id": 20,
    "name": "Docker",
    "type": "Tooling",
    "strengths": "Reproducible application environments; easier deployment.",
    "weaknesses": "Container networking and security complexity; not a language."
  },
  {
    "id": 21,
    "name": "Kubernetes",
    "type": "Tooling",
    "strengths": "Orchestrates container systems; scaling and recovery.",
    "weaknesses": "Significant operational complexity and overhead."
  },
  {
    "id": 22,
    "name": "Terraform",
    "type": "Tooling",
    "strengths": "Reproducible declarative infrastructure configuration.",
    "weaknesses": "State management, provider limitations and configuration drift."
  },
  {
    "id": 23,
    "name": "PowerShell",
    "type": "Language",
    "strengths": "Object-based pipelines; powerful Windows and Microsoft automation.",
    "weaknesses": "Version and platform differences; security policy constraints."
  },
  {
    "id": 24,
    "name": "Perl",
    "type": "Language",
    "strengths": "Excellent text processing and regular expressions; useful for legacy systems.",
    "weaknesses": "Hard-to-read code; declining mainstream adoption."
  },
  {
    "id": 25,
    "name": "Ruby",
    "type": "Language",
    "strengths": "Expressive syntax; productive web development with Rails.",
    "weaknesses": "Runtime performance; smaller ecosystem outside web development."
  },
  {
    "id": 26,
    "name": "Scala",
    "type": "Language",
    "strengths": "Functional and object-oriented programming; JVM interoperability.",
    "weaknesses": "Complex type system; challenging learning curve."
  },
  {
    "id": 27,
    "name": "Haskell",
    "type": "Language",
    "strengths": "Strong functional programming; expressive types; fewer side effects.",
    "weaknesses": "Steep learning curve; smaller industrial ecosystem."
  },
  {
    "id": 28,
    "name": "MATLAB",
    "type": "Language",
    "strengths": "Excellent engineering, numerical analysis and visualisation.",
    "weaknesses": "Commercial licensing; limited deployment flexibility."
  },
  {
    "id": 29,
    "name": "R",
    "type": "Language",
    "strengths": "Exceptional statistics, data analysis and visualisation.",
    "weaknesses": "Performance and memory constraints; inconsistent package conventions."
  },
  {
    "id": 30,
    "name": "Dart",
    "type": "Language",
    "strengths": "Productive cross-platform development with Flutter; sound null safety.",
    "weaknesses": "Smaller ecosystem; adoption centred on Flutter."
  },
  {
    "id": 31,
    "name": "Erlang / Elixir",
    "type": "Language",
    "strengths": "Fault-tolerant distributed systems; massive concurrency.",
    "weaknesses": "Smaller talent pool; less suited to CPU-heavy numerical work."
  },
  {
    "id": 32,
    "name": "Lua",
    "type": "Language",
    "strengths": "Lightweight and easy to embed; excellent game scripting.",
    "weaknesses": "Small standard library; limited native tooling."
  },
  {
    "id": 33,
    "name": "VHDL / Verilog",
    "type": "Language",
    "strengths": "Describes digital hardware; enables FPGA and chip design.",
    "weaknesses": "Steep learning curve; complex simulation and verification."
  },
  {
    "id": 34,
    "name": "COBOL",
    "type": "Language",
    "strengths": "Reliable business processing; established financial systems.",
    "weaknesses": "Verbose syntax; limited modern developer ecosystem."
  },
  {
    "id": 35,
    "name": "PostgreSQL",
    "type": "Database",
    "strengths": "Powerful relational database; transactions and extensibility.",
    "weaknesses": "Administration and query tuning can be demanding."
  },
  {
    "id": 36,
    "name": "MySQL",
    "type": "Database",
    "strengths": "Mature and widely supported; straightforward web database.",
    "weaknesses": "Some advanced features differ from PostgreSQL; dialect quirks."
  },
  {
    "id": 37,
    "name": "MongoDB",
    "type": "Database",
    "strengths": "Flexible document structures; natural JSON-like data.",
    "weaknesses": "Data duplication; joins and consistency need thoughtful design."
  },
  {
    "id": 38,
    "name": "Redis",
    "type": "Database",
    "strengths": "Extremely fast caching, queues, counters and data structures.",
    "weaknesses": "RAM costs; persistence and durability trade-offs."
  },
  {
    "id": 39,
    "name": "jQuery",
    "type": "Framework",
    "strengths": "Simple DOM manipulation; useful for older websites.",
    "weaknesses": "Less necessary with modern JavaScript; legacy coding patterns."
  },
  {
    "id": 40,
    "name": "SASS / LESS",
    "type": "Web / API",
    "strengths": "Reusable styles, variables and CSS organisation.",
    "weaknesses": "Extra compilation step; modern CSS covers many advantages."
  },
  {
    "id": 41,
    "name": "Chef / Ansible",
    "type": "Tooling",
    "strengths": "Repeatable server configuration and infrastructure automation.",
    "weaknesses": "Configuration complexity; drift and execution issues."
  },
  {
    "id": 42,
    "name": "Zig",
    "type": "Language",
    "strengths": "Low-level control; C interoperability; explicit memory management.",
    "weaknesses": "Young ecosystem; changing language and tooling."
  },
  {
    "id": 43,
    "name": "COBOL (duplicate)",
    "type": "Duplicate",
    "strengths": "Same as #34: reliable business processing and financial integrations.",
    "weaknesses": "Same as #34; duplicate entry, so not another distinct technology."
  },
  {
    "id": 44,
    "name": "Fortran",
    "type": "Language",
    "strengths": "Exceptional scientific computing; mature numerical libraries.",
    "weaknesses": "Less suitable for modern web apps; older code conventions."
  },
  {
    "id": 45,
    "name": "GraphQL",
    "type": "Web / API",
    "strengths": "Clients request precisely shaped API data; strong schema.",
    "weaknesses": "Caching, query-cost controls and server complexity."
  },
  {
    "id": 46,
    "name": "WebAssembly",
    "type": "Runtime",
    "strengths": "Portable compact executable format; efficient browser execution.",
    "weaknesses": "Limited direct platform access; debugging and integration overhead."
  },
  {
    "id": 47,
    "name": "Babel / Webpack",
    "type": "Tooling",
    "strengths": "JavaScript compatibility and production bundling.",
    "weaknesses": "Complex configuration; build performance and maintenance."
  },
  {
    "id": 48,
    "name": "Templating engines",
    "type": "Web / API",
    "strengths": "Reusable templates; efficient HTML and text generation.",
    "weaknesses": "Limited expressiveness; escaping and security risks."
  },
  {
    "id": 49,
    "name": "REST / SOAP",
    "type": "Web / API",
    "strengths": "Standardised service integration; broad interoperability.",
    "weaknesses": "Not languages; REST can be loosely specified, SOAP verbose."
  },
  {
    "id": 50,
    "name": "Markdown",
    "type": "Web / API",
    "strengths": "Extremely simple, readable and portable document formatting.",
    "weaknesses": "Limited layout control; implementation differences."
  }
];
  if (typeof module !== 'undefined' && module.exports) module.exports = technologies;
  if (typeof document === 'undefined') return;

  const cards = document.getElementById('technology-grid');
  const search = document.getElementById('technology-search');
  const count = document.getElementById('technology-count');
  const filters = [...document.querySelectorAll('[data-type]')];
  let selected = 'All';

  function create(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = String(value);
    return node;
  }

  function itemCard(item) {
    const card = create('article', 'technology-card');
    card.id = 'technology-' + item.id;
    const eyebrow = create('div', 'technology-eyebrow');
    eyebrow.append(create('span', 'technology-number', '#' + String(item.id).padStart(2, '0')), create('span', 'technology-type', item.type));
    card.append(eyebrow, create('h3', '', item.name));
    const strengths = create('div', 'technology-detail');
    strengths.append(create('h4', 'strength-title', 'Strengths'), create('p', '', item.strengths));
    const weaknesses = create('div', 'technology-detail');
    weaknesses.append(create('h4', 'weakness-title', 'Weaknesses'), create('p', '', item.weaknesses));
    card.append(strengths, weaknesses);
    return card;
  }

  function render() {
    const term = search.value.trim().toLocaleLowerCase();
    const visible = technologies.filter((item) => {
      if (selected !== 'All' && item.type !== selected) return false;
      return [item.name, item.type, item.strengths, item.weaknesses].some((part) => part.toLocaleLowerCase().includes(term));
    });
    cards.replaceChildren(...visible.map(itemCard));
    count.textContent = visible.length + ' of ' + technologies.length + ' entries shown';
    if (!visible.length) cards.append(create('p', 'technology-empty', 'No matches. Try a different keyword or choose All.'));
    for (const button of filters) {
      const active = button.dataset.type === selected;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('active', active);
    }
  }

  for (const button of filters) button.addEventListener('click', () => { selected = button.dataset.type; render(); });
  search.addEventListener('input', render);
  render();
})();
