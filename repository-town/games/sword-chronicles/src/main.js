import { RACES } from "./data/races.js";
import { CLASSES, BACKGROUNDS } from "./data/classes.js";
import { SPELLS } from "./data/spells.js";
import { ITEMS, SHOP_STOCK } from "./data/items.js";
import { RECIPES } from "./data/recipes.js";
import { NPCS } from "./data/npcs.js";
import { LOCATIONS, ENCOUNTERS, FINAL_BOSS } from "./data/locations.js";
import { QUESTS } from "./data/quests.js";
import { COMPANIONS, MAX_PARTY_COMPANIONS } from "./data/companions.js";
import { LOCATION_DM, ENCOUNTER_DM, BOSS_DM_INTRO } from "./data/atmosphere.js";
import { EXPLORATION_ACTIONS } from "./data/explorationActions.js";
import { TUTORIAL_STEPS, NEW_GAME_ONBOARDING_DM, NEW_GAME_ONBOARDING_TIPS } from "./data/tutorial.js";
import { getDifficulty, scaleEnemyForDifficulty } from "./data/difficulty.js";
import { rollDie, rollExpr } from "./core/dice.js";
import { hasSave, saveGame, loadGame } from "./core/storage.js";
import {
  BASE_ABILITIES,
  abilityMod,
  createInitialState,
  addItem,
  removeItem,
  hasItems,
  gainXp,
  findInventoryItem
} from "./core/state.js";
import {
  switchScreen,
  renderCharacterCreation,
  appendNarrative,
  appendDmVoice,
  updateLocationScene,
  clearNarrative,
  renderActions,
  updateHeader,
  setSidebarTab,
  renderSidebar
} from "./ui/render.js";

const CREATION_POINTS = 8;
const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"];

const raceLookup = toLookup(RACES);
const classLookup = toLookup(CLASSES);
const backgroundLookup = toLookup(BACKGROUNDS);
const spellLookup = toLookup(SPELLS);
const questLookup = QUESTS;
const locationLookup = toLookup(LOCATIONS);
const npcLookup = toLookup(NPCS);
const companionLookup = toLookup(COMPANIONS);
const exploreLookup = EXPLORATION_ACTIONS.reduce((acc, row) => {
  acc[row.id] = row;
  return acc;
}, {});

const elements = {
  newGameBtn: document.getElementById("new-game-btn"),
  loadBtn: document.getElementById("load-btn"),
  titleTutorialBtn: document.getElementById("title-tutorial-btn"),
  charCreation: document.getElementById("char-creation"),
  actions: document.getElementById("actions"),
  saveBtn: document.getElementById("save-btn"),
  restBtn: document.getElementById("rest-btn"),
  helpBtn: document.getElementById("help-btn"),
  toggleSidebarBtn: document.getElementById("toggle-sidebar-btn"),
  sidebar: document.getElementById("sidebar"),
  sidebarTabs: document.getElementById("sidebar-tabs")
};

let state = null;
let creationModel = newCreationModel();
let tutorialStepIndex = 0;

bootstrap();

function bootstrap() {
  bindStaticEvents();
  updateLoadButton();
  switchScreen("title");
}

function bindStaticEvents() {
  elements.newGameBtn.addEventListener("click", () => {
    creationModel = newCreationModel();
    renderCreationScreen();
    switchScreen("creation");
  });

  elements.loadBtn.addEventListener("click", loadSavedGame);
  elements.titleTutorialBtn?.addEventListener("click", () => openTutorial(0));

  elements.charCreation.addEventListener("click", (event) => {
    const optionEl = event.target.closest("[data-kind][data-id]");
    if (optionEl) {
      onSelectCreationOption(optionEl.dataset.kind, optionEl.dataset.id);
      return;
    }

    const abilityBtn = event.target.closest("[data-ability][data-delta]");
    if (abilityBtn) {
      adjustAbility(abilityBtn.dataset.ability, Number(abilityBtn.dataset.delta));
      return;
    }

    if (event.target.id === "creation-back-btn") {
      switchScreen("title");
      return;
    }

    if (event.target.id === "creation-tutorial-btn") {
      openTutorial(0);
      return;
    }

    if (event.target.id === "creation-start-btn") {
      startNewAdventure();
    }
  });

  elements.charCreation.addEventListener("change", (event) => {
    if (event.target.id === "pc-name") {
      creationModel.selected.name = event.target.value;
      renderCreationScreen();
    }

    if (event.target.id === "pc-notes") {
      creationModel.selected.notes = event.target.value;
    }
  });

  elements.actions.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action-id]");
    if (!button) {
      return;
    }

    safeExecute(() => handleAction(button.dataset.actionId));
  });

  elements.saveBtn.addEventListener("click", () => {
    safeExecute(() => manualSave());
  });

  elements.restBtn.addEventListener("click", () => {
    safeExecute(() => restParty());
  });

  elements.helpBtn.addEventListener("click", () => {
    if (!state) {
      return;
    }
    state.ui.activeSidebarTab = "help";
    setSidebarTab("help");
  });

  elements.toggleSidebarBtn.addEventListener("click", () => {
    elements.sidebar.classList.toggle("open");
  });

  elements.sidebarTabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-tab]");
    if (!tab || !state) {
      return;
    }
    state.ui.activeSidebarTab = tab.dataset.tab;
    setSidebarTab(tab.dataset.tab);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const tutorialModal = document.getElementById("tutorial-modal");
      if (tutorialModal?.classList.contains("show")) {
        event.preventDefault();
        closeTutorial();
        return;
      }
      const mapModal = document.getElementById("world-map-modal");
      if (mapModal?.classList.contains("show")) {
        event.preventDefault();
        closeWorldMap();
        return;
      }
    }

    if (event.key === "s" && state) {
      event.preventDefault();
      manualSave();
      return;
    }

    if (event.key === "r" && state && !state.combat) {
      event.preventDefault();
      restParty();
      return;
    }

    if (!state && event.key === "l" && hasSave()) {
      event.preventDefault();
      loadSavedGame();
      return;
    }

    if (state && /^[1-9]$/.test(event.key)) {
      const index = Number(event.key) - 1;
      const actionButtons = Array.from(document.querySelectorAll("#actions button[data-action-id]"));
      if (actionButtons[index] && !actionButtons[index].disabled) {
        event.preventDefault();
        handleAction(actionButtons[index].dataset.actionId);
      }
    }
  });

  const worldMapModal = document.getElementById("world-map-modal");
  const worldMapClose = document.getElementById("world-map-close");
  const worldMapNodes = document.getElementById("world-map-nodes");

  worldMapClose?.addEventListener("click", () => {
    closeWorldMap();
  });

  worldMapModal?.addEventListener("click", (event) => {
    if (event.target === worldMapModal) {
      closeWorldMap();
    }
  });

  worldMapNodes?.addEventListener("click", (event) => {
    const node = event.target.closest(".map-node[data-loc-id]");
    if (!node) {
      return;
    }
    const destinationId = node.dataset.locId;
    safeExecute(() => travelFromWorldMap(destinationId));
  });

  const tutorialModal = document.getElementById("tutorial-modal");
  document.getElementById("tutorial-prev")?.addEventListener("click", () => {
    if (tutorialStepIndex > 0) {
      tutorialStepIndex -= 1;
      renderTutorialStep();
    }
  });
  document.getElementById("tutorial-next")?.addEventListener("click", () => {
    if (tutorialStepIndex < TUTORIAL_STEPS.length - 1) {
      tutorialStepIndex += 1;
      renderTutorialStep();
    } else {
      closeTutorial();
    }
  });
  document.getElementById("tutorial-close-footer")?.addEventListener("click", () => {
    closeTutorial();
  });
  tutorialModal?.addEventListener("click", (event) => {
    if (event.target === tutorialModal) {
      closeTutorial();
    }
  });
}

function safeExecute(fn) {
  try {
    fn();
  } catch (error) {
    console.error(error);
    if (state) {
      gameMessage(`System error: ${error.message}`, "failure", true);
      renderGame();
    }
  }
}

function newCreationModel() {
  return {
    selected: {
      name: "",
      notes: "",
      raceId: RACES[0].id,
      classId: CLASSES[0].id,
      backgroundId: BACKGROUNDS[0].id,
      difficultyId: "medium"
    },
    abilities: { ...BASE_ABILITIES }
  };
}

function renderCreationScreen() {
  const selectedRace = raceLookup[creationModel.selected.raceId];
  const selectedClass = classLookup[creationModel.selected.classId];
  const selectedBackground = backgroundLookup[creationModel.selected.backgroundId];
  const pointsRemaining = getCreationPointsRemaining();

  renderCharacterCreation(elements.charCreation, {
    races: RACES,
    classes: CLASSES,
    backgrounds: BACKGROUNDS,
    selected: {
      ...creationModel.selected,
      raceName: selectedRace.name,
      className: selectedClass.name,
      backgroundName: selectedBackground.name,
      difficultyName: getDifficulty(creationModel.selected.difficultyId).name
    },
    abilities: creationModel.abilities,
    pointsRemaining,
    canStart: pointsRemaining >= 0
  });
}

function getCreationPointsRemaining() {
  const spent = ABILITY_KEYS.reduce((sum, key) => sum + (creationModel.abilities[key] - 10), 0);
  return CREATION_POINTS - spent;
}

function onSelectCreationOption(kind, id) {
  if (kind === "race") {
    creationModel.selected.raceId = id;
  }

  if (kind === "class") {
    creationModel.selected.classId = id;
  }

  if (kind === "background") {
    creationModel.selected.backgroundId = id;
  }

  if (kind === "difficulty") {
    creationModel.selected.difficultyId = id;
  }

  renderCreationScreen();
}

function adjustAbility(ability, delta) {
  if (!ABILITY_KEYS.includes(ability) || ![-1, 1].includes(delta)) {
    return;
  }

  const current = creationModel.abilities[ability];
  const candidate = current + delta;
  if (candidate < 8 || candidate > 15) {
    return;
  }

  const currentRemaining = getCreationPointsRemaining();
  if (delta > 0 && currentRemaining <= 0) {
    return;
  }

  creationModel.abilities[ability] = candidate;
  renderCreationScreen();
}

function startNewAdventure() {
  const nameInput = document.getElementById("pc-name");
  const notesInput = document.getElementById("pc-notes");
  if (nameInput) {
    creationModel.selected.name = nameInput.value.trim();
  }
  if (notesInput) {
    creationModel.selected.notes = notesInput.value.trim();
  }

  const classDef = classLookup[creationModel.selected.classId];
  const race = raceLookup[creationModel.selected.raceId];
  const pointsRemaining = getCreationPointsRemaining();
  if (pointsRemaining < 0) {
    return;
  }

  const finalAbilities = applyRaceBonuses(creationModel.abilities, race.bonuses);
  state = createInitialState(
    {
      name: creationModel.selected.name || "Nameless Wanderer",
      notes: creationModel.selected.notes,
      raceId: creationModel.selected.raceId,
      classId: creationModel.selected.classId,
      backgroundId: creationModel.selected.backgroundId,
      abilities: finalAbilities
    },
    classDef,
    creationModel.selected.difficultyId || "medium"
  );

  state.ui.mode = "default";
  state.player.notes = creationModel.selected.notes;
  state.log = [];

  switchScreen("game");
  clearNarrative();
  gameMessage("Chapter I: Ash Over Neverwinter", "chapter", true);
  gameMessage("You arrive in Protector's Enclave as smoke gathers over the city walls.", "prose", true);
  appendDmVoice(NEW_GAME_ONBOARDING_DM);
  NEW_GAME_ONBOARDING_TIPS.forEach((tip) => {
    gameMessage(tip, "system", true);
  });
  gameMessage("Captain Serra requests an audience.", "system", true);
  speakLocationAtmosphere("protector_enclave");
  renderGame();
}

function loadSavedGame() {
  const result = loadGame();
  if (!result) {
    window.alert("No valid save was found.");
    updateLoadButton();
    return;
  }

  if (result.incompatible) {
    window.alert(`Save version ${result.foundVersion} is incompatible with current version.`);
    return;
  }

  state = normalizeState(result.state);
  switchScreen("game");
  clearNarrative();
  gameMessage("Journey resumed from save data.", "system", true);
  renderGame();
}

function normalizeState(loadedState) {
  const nextState = loadedState;

  if (!nextState.ui) {
    nextState.ui = {};
  }

  if (!nextState.ui.activeSidebarTab) {
    nextState.ui.activeSidebarTab = "character";
  }

  if (!nextState.ui.mode) {
    nextState.ui.mode = "default";
  }

  if (nextState.ui.mode === "explore") {
    nextState.ui.mode = "default";
  }

  if (nextState.ui.mode !== "dialogue") {
    nextState.ui.dialogueNpcId = null;
  }

  if (!Array.isArray(nextState.party)) {
    nextState.party = [];
  }

  if (nextState.world && !nextState.world.difficulty) {
    nextState.world.difficulty = "medium";
  }

  if (!Array.isArray(nextState.log)) {
    nextState.log = [];
  }

  if (!nextState.player.status) {
    nextState.player.status = { markDice: null, markTurns: 0, acBoostTurns: 0 };
  }

  if (typeof nextState.player.tempHp !== "number") {
    nextState.player.tempHp = 0;
  }

  return nextState;
}

function manualSave() {
  if (!state) {
    return;
  }
  saveGame(state);
  updateLoadButton();
  gameMessage("Game saved.", "system", true);
  renderGame();
}

function updateLoadButton() {
  elements.loadBtn.style.display = hasSave() ? "inline-block" : "none";
}

function openTutorial(startStep = 0) {
  tutorialStepIndex = Math.max(0, Math.min(startStep, TUTORIAL_STEPS.length - 1));
  renderTutorialStep();
  const modal = document.getElementById("tutorial-modal");
  if (modal) {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  }
}

function closeTutorial() {
  const modal = document.getElementById("tutorial-modal");
  if (modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }
}

function renderTutorialStep() {
  const step = TUTORIAL_STEPS[tutorialStepIndex];
  if (!step) {
    return;
  }

  const titleEl = document.getElementById("tutorial-step-title");
  const bodyEl = document.getElementById("tutorial-step-body");
  const progressEl = document.getElementById("tutorial-progress");
  const prevBtn = document.getElementById("tutorial-prev");
  const nextBtn = document.getElementById("tutorial-next");

  if (titleEl) {
    titleEl.textContent = step.title;
  }
  if (bodyEl) {
    bodyEl.innerHTML = "";
    step.paragraphs.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      bodyEl.appendChild(p);
    });
  }
  if (progressEl) {
    progressEl.textContent = `Step ${tutorialStepIndex + 1} of ${TUTORIAL_STEPS.length}`;
  }
  if (prevBtn) {
    prevBtn.disabled = tutorialStepIndex === 0;
  }
  if (nextBtn) {
    nextBtn.textContent = tutorialStepIndex >= TUTORIAL_STEPS.length - 1 ? "Done" : "Next";
  }
}

function renderGame() {
  if (!state) {
    return;
  }

  const location = locationLookup[state.world.locationId];
  const classDef = classLookup[state.player.classId];
  const diffName = getDifficulty(state.world.difficulty || "medium").name;
  updateHeader(
    location.name,
    `${state.player.name} | ${classDef.name} L${state.player.level} | ${diffName} | HP ${state.player.hp}/${state.player.maxHp}`
  );

  renderSidebar(state, {
    classLookup,
    raceLookup,
    itemLookup: ITEMS,
    questLookup,
    spellLookup,
    questStageText: getQuestStageTextMap(),
    companionLookup,
    maxPartyCompanions: MAX_PARTY_COMPANIONS
  });
  setSidebarTab(state.ui.activeSidebarTab || "character");

  const actions = buildActions();
  renderActions(actions);

  updateLocationScene(location);
}

function buildActions() {
  if (!state) {
    return [];
  }

  if (state.world.ending === "victory") {
    return [
      { id: "ending:return", label: "Return To Title", variant: "" },
      { id: "ending:continue", label: "Continue Exploring", variant: "" }
    ];
  }

  if (state.combat) {
    return buildCombatActions();
  }

  if (state.ui.mode === "dialogue" && state.ui.dialogueNpcId) {
    return buildDialogueActions();
  }

  if (state.ui.mode === "shop") {
    return buildShopActions();
  }

  if (state.ui.mode === "craft") {
    return buildCraftActions();
  }

  if (state.ui.mode === "explore") {
    return buildExploreActions();
  }

  return buildWorldActions();
}
function buildWorldActions() {
  const location = locationLookup[state.world.locationId];
  const actions = [];

  actions.push({ id: "ui:map", label: "World Map", variant: "" });

  const npcsHere = NPCS.filter((npc) => npc.locationId === location.id);
  npcsHere.forEach((npc) => {
    actions.push({ id: `talk:${npc.id}`, label: `Talk: ${npc.name}` });
  });

  COMPANIONS.forEach((def) => {
    if (canRecruitCompanion(def)) {
      actions.push({
        id: `party:recruit:${def.id}`,
        label: def.recruitLabel,
        variant: ""
      });
    }
  });

  const encounter = ENCOUNTERS[location.id];
  if (encounter && !state.world.flags[encounter.flagReward]) {
    actions.push({ id: `encounter:${location.id}`, label: `Face Encounter: ${encounter.title}`, variant: " btn-danger" });
  }

  if (location.id === "mount_hotenow" && canChallengeBoss()) {
    actions.push({ id: "boss:start", label: "Confront Vexira", variant: " btn-primary" });
  }

  if (location.id === "mount_hotenow" && !canChallengeBoss() && !state.world.flags.defeatedVexira) {
    const needed = [];
    if (!state.world.flags.forgedWardedKey) {
      needed.push("Warded Key");
    }
    if (!allSigilsRecovered()) {
      needed.push("all three Sigils");
    }

    if (needed.length) {
      actions.push({
        id: "boss:locked",
        label: `Vexira's barrier requires ${needed.join(" and ")}`,
        disabled: true
      });
    }
  }

  if (location.id === "market_square") {
    actions.push({ id: "mode:shop", label: "Open Market", variant: "" });
  }

  if (location.id === "crafting_hall") {
    actions.push({ id: "mode:craft", label: "Use Crafting Bench", variant: "" });
  }

  actions.push({ id: "quest:status", label: "Quest Status", variant: "" });
  actions.push({ id: "mode:explore", label: "Explore & Roleplay (skills, senses, flavor)", variant: "" });

  location.travel.forEach((destinationId) => {
    const destination = locationLookup[destinationId];
    actions.push({ id: `travel:${destinationId}`, label: `Travel: ${destination.name}` });
  });

  actions.push({ id: "wait:day", label: "Pass Time", variant: "" });
  return actions;
}

function buildDialogueActions() {
  const npcId = state.ui.dialogueNpcId;
  const npc = npcLookup[npcId];
  if (!npc) {
    return [{ id: "dialogue:exit", label: "Farewell" }];
  }

  const topics = npc.topics || [];
  const actions = topics
    .filter((topic) => dialogueTopicVisible(topic))
    .map((topic) => ({
      id: `dialogue:topic:${npcId}:${topic.id}`,
      label: topic.label
    }));

  actions.push({ id: "dialogue:exit", label: "Farewell" });
  return actions;
}

function dialogueTopicVisible(topic) {
  if (topic.needActiveQuest && !state.quests.active.includes(topic.needActiveQuest)) {
    return false;
  }

  if (topic.needInactiveQuest && state.quests.active.includes(topic.needInactiveQuest)) {
    return false;
  }

  if (topic.needFlags) {
    for (const [flagKey, want] of Object.entries(topic.needFlags)) {
      const got = Boolean(state.world.flags[flagKey]);
      if (got !== want) {
        return false;
      }
    }
  }

  return true;
}

function buildShopActions() {
  const stockButtons = SHOP_STOCK.map((entry) => {
    const item = ITEMS[entry.itemId];
    const afford = state.player.gold >= entry.cost;
    return {
      id: `shop:buy:${entry.itemId}`,
      label: `Buy ${item.name} (${entry.cost}g)`,
      disabled: !afford
    };
  });

  return [
    ...stockButtons,
    { id: "shop:exit", label: "Leave Market" }
  ];
}

function buildCraftActions() {
  const craftButtons = RECIPES.map((recipe) => {
    const canCraft = hasItems(state, recipe.requires);
    return {
      id: `craft:make:${recipe.id}`,
      label: `${canCraft ? "Craft" : "Need Materials"}: ${recipe.name}`,
      disabled: !canCraft,
      variant: canCraft ? " btn-primary" : ""
    };
  });

  return [
    ...craftButtons,
    { id: "craft:exit", label: "Leave Crafting Bench" }
  ];
}

function buildExploreActions() {
  const buttons = EXPLORATION_ACTIONS.map((a) => ({
    id: `explore:${a.id}`,
    label: a.label,
    variant: " btn-sm"
  }));
  buttons.push({ id: "explore:exit", label: "← Back to district actions", variant: " btn-primary" });
  return buttons;
}

function pickRandomExploreLine(lines) {
  if (!lines || !lines.length) {
    return "";
  }
  return lines[Math.floor(Math.random() * lines.length)];
}

function runExploreAction(actionId) {
  if (actionId === "exit") {
    return;
  }

  const def = exploreLookup[actionId];
  if (!def) {
    gameMessage("That action isn't available.", "system", true);
    return;
  }

  const locId = state.world.locationId;
  const locBlock = def.locations ? def.locations[locId] : null;

  if (def.kind === "flavor") {
    if (def.withPartyLines && state.party.some((m) => m.hp > 0)) {
      gameMessage(pickRandomExploreLine(def.withPartyLines), "prose", true);
      return;
    }
    let pool = [...(def.lines || [])];
    if (locBlock && locBlock.lines) {
      pool = [...locBlock.lines, ...pool];
    }
    const line = pickRandomExploreLine(pool);
    gameMessage(line || "A quiet moment passes.", "prose", true);
    return;
  }

  if (def.kind === "skill") {
    const mod = abilityMod(state.player.abilities[def.ability]);
    const roll = rollDie(20);
    const total = roll + mod;
    const naturalOne = roll === 1;
    const naturalTwenty = roll === 20;
    const success = naturalTwenty || (!naturalOne && total >= def.dc);

    gameMessage(
      `${def.skill} — d20(${roll}) + ${mod} (${String(def.ability).toUpperCase()}) = ${total} vs DC ${def.dc}.`,
      "roll-result",
      true
    );

    if (naturalTwenty) {
      gameMessage("Natural 20 — inspiration strikes; the scene yields more than it should.", "success", true);
    } else if (naturalOne) {
      gameMessage("Natural 1 — something goes sideways: a slip, a misread, bad luck.", "failure", true);
    }

    let passPool = [...def.pass];
    let failPool = [...def.fail];
    if (locBlock) {
      if (locBlock.pass) {
        passPool = [...locBlock.pass, ...passPool];
      }
      if (locBlock.fail) {
        failPool = [...locBlock.fail, ...failPool];
      }
    }

    const line = success ? pickRandomExploreLine(passPool) : pickRandomExploreLine(failPool);
    if (line) {
      gameMessage(line, success ? "success" : "failure", true);
    }
  }
}

function buildCombatActions() {
  const actions = [
    { id: "combat:attack", label: "Weapon Attack", variant: " btn-primary" }
  ];

  state.player.knownSpells.forEach((spellId) => {
    const spell = spellLookup[spellId];
    if (!spell) {
      return;
    }

    const needsSlot = spell.type === "slot";
    const disabled = needsSlot && state.player.spellSlots.current <= 0;
    actions.push({
      id: `combat:spell:${spellId}`,
      label: `Cast ${spell.name}`,
      disabled
    });
  });

  const hasPotion = Boolean(findInventoryItem(state, "healing_potion"));
  actions.push({ id: "combat:potion", label: "Drink Healing Potion", disabled: !hasPotion });
  actions.push({ id: "combat:flee", label: "Attempt Flee", variant: " btn-danger" });

  return actions;
}

function handleAction(actionId) {
  if (!state) {
    return;
  }

  if (state.world.ending === "victory") {
    if (actionId === "ending:return") {
      switchScreen("title");
      state = null;
      return;
    }

    if (actionId === "ending:continue") {
      state.world.ending = null;
      gameMessage("You continue patrolling the Sword Coast.", "system", true);
      renderGame();
      return;
    }
  }

  if (state.combat) {
    handleCombatAction(actionId);
    renderGame();
    return;
  }

  if (state.ui.mode === "explore") {
    if (actionId === "explore:exit") {
      state.ui.mode = "default";
      renderGame();
      return;
    }
    if (actionId.startsWith("explore:")) {
      const sub = actionId.replace("explore:", "");
      if (sub && sub !== "exit") {
        runExploreAction(sub);
      }
      renderGame();
      return;
    }
  }

  if (actionId === "mode:shop") {
    state.ui.mode = "shop";
    gameMessage("Brom grins and opens his ledger.", "dialogue", true);
    renderGame();
    return;
  }

  if (actionId === "mode:craft") {
    state.ui.mode = "craft";
    gameMessage("Miri points to the forge and herb bench.", "dialogue", true);
    renderGame();
    return;
  }

  if (actionId === "mode:explore") {
    state.ui.mode = "explore";
    gameMessage("You take the scene seriously—senses, skills, small rituals of being alive.", "system", true);
    renderGame();
    return;
  }

  if (actionId.startsWith("shop:")) {
    handleShopAction(actionId);
    renderGame();
    return;
  }

  if (actionId.startsWith("craft:")) {
    handleCraftAction(actionId);
    renderGame();
    return;
  }

  if (actionId === "ui:map") {
    openWorldMap();
    return;
  }

  if (actionId === "dialogue:exit") {
    closeNpcDialogue();
    renderGame();
    return;
  }

  if (actionId.startsWith("dialogue:topic:")) {
    const rest = actionId.slice("dialogue:topic:".length);
    const colon = rest.indexOf(":");
    if (colon === -1) {
      return;
    }
    const npcId = rest.slice(0, colon);
    const topicId = rest.slice(colon + 1);
    handleDialogueTopic(npcId, topicId);
    renderGame();
    return;
  }

  if (actionId.startsWith("party:recruit:")) {
    const cid = actionId.replace("party:recruit:", "");
    recruitCompanion(cid);
    renderGame();
    return;
  }

  if (actionId.startsWith("travel:")) {
    travelTo(actionId.replace("travel:", ""));
    renderGame();
    return;
  }

  if (actionId.startsWith("talk:")) {
    openNpcDialogue(actionId.replace("talk:", ""));
    renderGame();
    return;
  }

  if (actionId.startsWith("encounter:")) {
    beginEncounter(actionId.replace("encounter:", ""));
    renderGame();
    return;
  }

  if (actionId === "boss:start") {
    beginBossFight();
    renderGame();
    return;
  }

  if (actionId === "quest:status") {
    gameMessage(getMainQuestStageText(), "system", true);
    if (state.quests.active.includes("smuggler_chain")) {
      gameMessage(getSmugglerQuestText(), "system", true);
    }
    renderGame();
    return;
  }

  if (actionId === "wait:day") {
    state.world.day += 1;
    gameMessage("You spend several cautious hours scouting the district.", "system", true);
    renderGame();
  }
}

function handleShopAction(actionId) {
  if (actionId === "shop:exit") {
    state.ui.mode = "default";
    gameMessage("You leave the market stalls.", "system", true);
    return;
  }

  const itemId = actionId.replace("shop:buy:", "");
  const stock = SHOP_STOCK.find((entry) => entry.itemId === itemId);
  if (!stock) {
    return;
  }

  if (state.player.gold < stock.cost) {
    gameMessage("Not enough gold.", "failure", true);
    return;
  }

  state.player.gold -= stock.cost;
  addItem(state, itemId, 1);
  gameMessage(`Purchased ${ITEMS[itemId].name}.`, "loot", true);
}

function handleCraftAction(actionId) {
  if (actionId === "craft:exit") {
    state.ui.mode = "default";
    gameMessage("You step away from the crafting bench.", "system", true);
    return;
  }

  const recipeId = actionId.replace("craft:make:", "");
  const recipe = RECIPES.find((entry) => entry.id === recipeId);
  if (!recipe) {
    return;
  }

  if (!hasItems(state, recipe.requires)) {
    gameMessage("Missing ingredients.", "failure", true);
    return;
  }

  recipe.requires.forEach((req) => {
    removeItem(state, req.itemId, req.qty);
  });

  addItem(state, recipe.resultItemId, recipe.resultQty);
  if (recipe.resultItemId === "warded_key") {
    state.world.flags.forgedWardedKey = true;
    gameMessage("The Warded Key hums with layered sigil magic.", "success", true);
  } else {
    gameMessage(`Crafted ${ITEMS[recipe.resultItemId].name}.`, "success", true);
  }
}

function travelTo(destinationId) {
  const location = locationLookup[state.world.locationId];
  if (!location.travel.includes(destinationId)) {
    gameMessage("That route is unavailable from here.", "failure", true);
    return;
  }

  state.world.locationId = destinationId;
  state.ui.mode = "default";
  state.ui.dialogueNpcId = null;

  if (!state.world.discovered.includes(destinationId)) {
    state.world.discovered.push(destinationId);
  }

  const destination = locationLookup[destinationId];
  gameMessage(`You travel to ${destination.name}.`, "prose", true);
  gameMessage(destination.description, "system", true);
  speakLocationAtmosphere(destinationId);
  maybeCompanionTravelBanter();
}

function closeNpcDialogue() {
  state.ui.mode = "default";
  state.ui.dialogueNpcId = null;
}

function openNpcDialogue(npcId) {
  const npc = npcLookup[npcId];
  if (!npc) {
    return;
  }

  gameMessage(`${npc.name}: "${npc.greeting}"`, "dialogue", true);

  switch (npcId) {
    case "serra":
      if (!state.world.flags.acceptedMainQuest) {
        state.world.flags.acceptedMainQuest = true;
        activateQuest("main_quest");
        gameMessage(
          "Serra assigns you to recover three ward sigils before Vexira ignites the rift.",
          "system",
          true
        );
      } else if (!state.world.flags.defeatedVexira) {
        gameMessage(getMainQuestStageText(), "system", true);
      }
      break;

    case "tormund":
      if (!state.world.flags.smugglerBriefed) {
        state.world.flags.smugglerBriefed = true;
        activateQuest("smuggler_chain");
        gameMessage("Tormund marks a smuggler cache at Sunken Pier.", "system", true);
      } else if (state.quests.active.includes("smuggler_chain")) {
        gameMessage(getSmugglerQuestText(), "system", true);
      }
      break;

    case "miri":
      if (!state.world.flags.miriGiftGiven) {
        state.world.flags.miriGiftGiven = true;
        addItem(state, "moonleaf", 1);
        gameMessage("Miri slips you fresh moonleaf for the road.", "loot", true);
      }
      break;

    default:
      break;
  }

  state.ui.mode = "dialogue";
  state.ui.dialogueNpcId = npcId;
}

function handleDialogueTopic(npcId, topicId) {
  const npc = npcLookup[npcId];
  if (!npc || state.ui.dialogueNpcId !== npcId) {
    return;
  }

  const topic = (npc.topics || []).find((entry) => entry.id === topicId);
  if (!topic || !dialogueTopicVisible(topic)) {
    return;
  }

  (topic.lines || []).forEach((line) => {
    gameMessage(`${npc.name}: "${line}"`, "dialogue", true);
  });

  if (topic.effect === "open_shop") {
    closeNpcDialogue();
    state.ui.mode = "shop";
    gameMessage("Brom grins and opens his ledger.", "dialogue", true);
    return;
  }

  if (topic.effect === "elira_heal") {
    const healAmount = 4;
    const before = state.player.hp;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + healAmount);
    const restored = state.player.hp - before;
    if (restored > 0) {
      gameMessage(`Warm light seeps through you. You recover ${restored} HP.`, "success", true);
    } else {
      gameMessage("You are already at full vigor.", "system", true);
    }
    return;
  }

  if (topic.effect === "harper_payout") {
    if (!state.quests.active.includes("smuggler_chain") || !state.world.flags.smugglerCleared) {
      return;
    }
    completeQuest("smuggler_chain");
    state.player.gold += 35;
    addItem(state, "healing_potion", 1);
    gameMessage("Your intel payment arrives: 35 gold and one potion.", "loot", true);
  }
}

function refreshWorldMapContent() {
  const svg = document.getElementById("world-map-svg");
  const nodesEl = document.getElementById("world-map-nodes");
  const hintEl = document.getElementById("world-map-hint");
  if (!svg || !nodesEl || !state) {
    return;
  }

  const here = locationLookup[state.world.locationId];
  if (!here) {
    return;
  }
  const reachable = new Set(here.travel || []);

  svg.innerHTML = "";
  const drawn = new Set();
  LOCATIONS.forEach((loc) => {
    (loc.travel || []).forEach((tid) => {
      const key = [loc.id, tid].sort().join("|");
      if (drawn.has(key)) {
        return;
      }
      drawn.add(key);
      const a = locationLookup[loc.id];
      const b = locationLookup[tid];
      if (!a || !b || a.mapX == null || b.mapX == null) {
        return;
      }
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(a.mapX));
      line.setAttribute("y1", String(a.mapY));
      line.setAttribute("x2", String(b.mapX));
      line.setAttribute("y2", String(b.mapY));
      const canWalk =
        (loc.id === here.id && reachable.has(tid)) || (tid === here.id && reachable.has(loc.id));
      // Use presentation attributes: CSS stroke-width like 0.35px is often sub-pixel and invisible.
      line.setAttribute("stroke", canWalk ? "#5e9eff" : "#8a6d2b");
      line.setAttribute("stroke-width", canWalk ? "2.2" : "1.8");
      line.setAttribute("stroke-linecap", "round");
      line.setAttribute("opacity", canWalk ? "0.95" : "0.7");
      line.setAttribute("fill", "none");
      svg.appendChild(line);
    });
  });

  nodesEl.innerHTML = "";
  LOCATIONS.forEach((loc) => {
    if (loc.mapX == null) {
      return;
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "map-node";
    btn.dataset.locId = loc.id;
    btn.textContent = loc.mapLabel || loc.name;

    if (loc.id === here.id) {
      btn.classList.add("current");
    } else if (reachable.has(loc.id)) {
      btn.classList.add("reachable");
    } else {
      btn.classList.add("locked");
    }

    btn.style.left = `${loc.mapX}%`;
    btn.style.top = `${loc.mapY}%`;
    nodesEl.appendChild(btn);
  });

  if (hintEl) {
    hintEl.textContent = `You are at ${here.name}. Blue routes lead where you can walk next; click a linked district to travel.`;
  }
}

function openWorldMap() {
  const modal = document.getElementById("world-map-modal");
  if (!modal || !state) {
    return;
  }
  refreshWorldMapContent();
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeWorldMap() {
  const modal = document.getElementById("world-map-modal");
  if (!modal) {
    return;
  }
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

function travelFromWorldMap(destinationId) {
  if (!state) {
    return;
  }
  if (destinationId === state.world.locationId) {
    gameMessage("You are already in that district.", "system", true);
    return;
  }
  const location = locationLookup[state.world.locationId];
  if (!location.travel.includes(destinationId)) {
    gameMessage("No direct road leads there from your current district.", "failure", true);
    return;
  }
  travelTo(destinationId);
  closeWorldMap();
  renderGame();
}

function pickRandomLine(lines) {
  if (!lines || !lines.length) {
    return "";
  }
  return lines[Math.floor(Math.random() * lines.length)];
}

function hasCompanion(companionId) {
  return state.party.some((m) => m.companionId === companionId);
}

function canRecruitCompanion(def) {
  if (!def || !state) {
    return false;
  }
  if (hasCompanion(def.id)) {
    return false;
  }
  if (state.party.length >= MAX_PARTY_COMPANIONS) {
    return false;
  }
  if (state.world.locationId !== def.recruitLocationId) {
    return false;
  }
  if (state.player.gold < def.recruitCostGold) {
    return false;
  }
  const flags = def.needsFlags || {};
  for (const [key, want] of Object.entries(flags)) {
    if (Boolean(state.world.flags[key]) !== want) {
      return false;
    }
  }
  for (const locId of def.needsDiscovered || []) {
    if (!state.world.discovered.includes(locId)) {
      return false;
    }
  }
  return true;
}

function recruitCompanion(companionId) {
  const def = companionLookup[companionId];
  if (!def || !canRecruitCompanion(def)) {
    gameMessage("You cannot recruit that ally right now.", "failure", true);
    return;
  }
  state.player.gold -= def.recruitCostGold;
  state.party.push({ companionId: def.id, hp: def.maxHp, maxHp: def.maxHp });
  appendDmVoice(def.introDm);
  gameMessage(`${def.name} swears travel oaths and falls in beside you.`, "success", true);
}

function maybeCompanionTravelBanter() {
  state.party.forEach((m) => {
    if (m.hp <= 0) {
      return;
    }
    const def = companionLookup[m.companionId];
    if (!def || !def.travelPhrases.length || Math.random() >= 0.42) {
      return;
    }
    gameMessage(`${def.name}: "${pickRandomLine(def.travelPhrases)}"`, "dialogue", true);
  });
}

function speakLocationAtmosphere(locationId) {
  const lines = LOCATION_DM[locationId];
  if (lines && lines.length) {
    appendDmVoice(lines);
  }
}

function companionVolley() {
  if (!state.combat) {
    return;
  }
  const enemy = state.combat.enemy;
  for (const member of state.party) {
    if (member.hp <= 0) {
      continue;
    }
    const def = companionLookup[member.companionId];
    if (!def) {
      continue;
    }

    gameMessage(pickRandomLine(def.attackPhrases), "prose", true);
    const roll = rollDie(20);
    const total = roll + def.attackBonus;
    if (roll === 1 || total < enemy.ac) {
      gameMessage(pickRandomLine(def.missPhrases), "system", true);
    } else {
      let dmg = rollExpr(def.damage).total;
      if (roll === 20) {
        dmg += rollExpr(def.damage).total;
      }
      enemy.hp = Math.max(0, enemy.hp - dmg);
      gameMessage(`${pickRandomLine(def.hitPhrases)} (${dmg} damage).`, "success", true);
    }

    if (enemy.hp <= 0) {
      return;
    }
  }
}

function applyDamageToCompanion(partyIndex, damage) {
  const member = state.party[partyIndex];
  if (!member) {
    return;
  }
  const def = companionLookup[member.companionId];
  member.hp = Math.max(0, member.hp - damage);
  if (def) {
    gameMessage(`${def.name} takes ${damage} damage. ${def.struckPhrase}`, "combat-msg", true);
  }
  if (member.hp <= 0 && def) {
    gameMessage(def.downedPhrase, "failure", true);
  }
}

function beginEncounter(locationId) {
  const encounter = ENCOUNTERS[locationId];
  if (!encounter) {
    gameMessage("No encounter is available here.", "system", true);
    return;
  }

  if (state.world.flags[encounter.flagReward]) {
    gameMessage("This district has already been secured.", "system", true);
    return;
  }

  startCombat(encounter.enemy, {
    title: encounter.title,
    description: encounter.description,
    flagReward: encounter.flagReward,
    encounterId: encounter.id,
    isBoss: false,
    dmIntro: ENCOUNTER_DM[locationId] || null
  });
}

function beginBossFight() {
  if (!canChallengeBoss()) {
    gameMessage("You are not ready to breach Vexira's barrier.", "failure", true);
    return;
  }

  startCombat(FINAL_BOSS, {
    title: "Final Battle",
    description: "Vexira tears open the ash storm and advances.",
    flagReward: null,
    encounterId: "vexira_boss",
    isBoss: true,
    dmIntro: BOSS_DM_INTRO
  });
}

function canChallengeBoss() {
  return allSigilsRecovered() && state.world.flags.forgedWardedKey && !state.world.flags.defeatedVexira;
}

function allSigilsRecovered() {
  return state.world.flags.tide_sigil_won && state.world.flags.shadow_sigil_won && state.world.flags.flame_sigil_won;
}

function startCombat(enemyTemplate, meta) {
  state.ui.mode = "default";
  state.ui.dialogueNpcId = null;
  const scaled = scaleEnemyForDifficulty(enemyTemplate, state.world.difficulty || "medium");
  state.combat = {
    enemy: {
      ...enemyTemplate,
      ac: scaled.ac,
      attackBonus: scaled.attackBonus,
      enemyDamageMult: scaled.enemyDamageMult,
      maxHp: scaled.maxHp,
      hp: scaled.hp
    },
    meta
  };

  if (meta.dmIntro && meta.dmIntro.length) {
    appendDmVoice(meta.dmIntro);
  }

  gameMessage(`${meta.title}: ${meta.description}`, "combat-msg", true);
}

function handleCombatAction(actionId) {
  if (!state.combat) {
    return;
  }

  if (actionId === "combat:attack") {
    playerWeaponAttack();
    return;
  }

  if (actionId === "combat:potion") {
    useHealingPotion();
    return;
  }

  if (actionId === "combat:flee") {
    attemptFlee();
    return;
  }

  if (actionId.startsWith("combat:spell:")) {
    castSpell(actionId.replace("combat:spell:", ""));
  }
}

function playerWeaponAttack() {
  const classDef = classLookup[state.player.classId];
  const enemy = state.combat.enemy;

  const attackRoll = rollDie(20);
  const attackBonus = abilityMod(state.player.abilities[classDef.primaryAbility]) + 2;
  const totalAttack = attackRoll + attackBonus;

  if (attackRoll === 1 || totalAttack < enemy.ac) {
    gameMessage(`Attack roll ${attackRoll} + ${attackBonus} = ${totalAttack}. Miss.`, "roll-result", true);
    companionVolley();
    if (state.combat && state.combat.enemy.hp <= 0) {
      resolveCombatVictory();
      return;
    }
    if (state.combat && state.combat.enemy.hp > 0) {
      enemyTurn();
    }
    return;
  }

  let damage = rollExpr(classDef.weaponDamage).total;
  if (attackRoll === 20) {
    damage += rollExpr(classDef.weaponDamage).total;
  }

  damage += consumeMarkDamage();

  enemy.hp = Math.max(0, enemy.hp - damage);
  gameMessage(`Attack roll ${attackRoll} + ${attackBonus} = ${totalAttack}. Hit for ${damage}.`, "roll-result", true);

  if (enemy.hp <= 0) {
    resolveCombatVictory();
    return;
  }

  companionVolley();
  if (state.combat && state.combat.enemy.hp <= 0) {
    resolveCombatVictory();
    return;
  }
  if (state.combat && state.combat.enemy.hp > 0) {
    enemyTurn();
  }
}

function castSpell(spellId) {
  const spell = spellLookup[spellId];
  if (!spell) {
    return;
  }

  if (spell.type === "slot") {
    if (state.player.spellSlots.current <= 0) {
      gameMessage("No spell slots available.", "failure", true);
      return;
    }
    state.player.spellSlots.current -= 1;
  }

  const enemy = state.combat.enemy;

  if (spell.damage) {
    let damage = 0;
    if (spell.id === "sacred_flame") {
      const saveRoll = rollDie(20) + 2;
      if (saveRoll < 13) {
        damage = rollExpr(spell.damage).total;
      }
      gameMessage(`Sacred Flame save check: ${saveRoll}.`, "roll-result", true);
    } else {
      damage = rollExpr(spell.damage).total;
    }

    damage += consumeMarkDamage();

    if (damage > 0) {
      enemy.hp = Math.max(0, enemy.hp - damage);
      gameMessage(`${spell.name} deals ${damage} damage.`, "success", true);
    } else {
      gameMessage(`${spell.name} fails to connect.`, "failure", true);
    }
  }

  if (spell.effect === "heal") {
    const heal = rollExpr(spell.amount).total;
    const before = state.player.hp;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
    gameMessage(`${spell.name} restores ${state.player.hp - before} HP.`, "success", true);
  }

  if (spell.effect === "ac_boost") {
    state.player.status.acBoostTurns = 1;
    gameMessage("Arcane shield surrounds you until the next enemy turn.", "success", true);
  }

  if (spell.effect === "temp_hp") {
    state.player.tempHp = Math.max(state.player.tempHp, spell.amount);
    gameMessage(`You gain ${spell.amount} temporary HP.`, "success", true);
  }

  if (spell.effect === "mark") {
    state.player.status.markDice = spell.amount;
    state.player.status.markTurns = 3;
    gameMessage("Target is marked for extra damage on your next hits.", "success", true);
  }

  if (enemy.hp <= 0) {
    resolveCombatVictory();
    return;
  }

  companionVolley();
  if (state.combat && state.combat.enemy.hp <= 0) {
    resolveCombatVictory();
    return;
  }
  if (state.combat && state.combat.enemy.hp > 0) {
    enemyTurn();
  }
}
function consumeMarkDamage() {
  if (!state.player.status.markDice || state.player.status.markTurns <= 0) {
    return 0;
  }

  state.player.status.markTurns -= 1;
  const bonus = rollExpr(state.player.status.markDice).total;
  if (state.player.status.markTurns <= 0) {
    state.player.status.markDice = null;
  }

  gameMessage(`Mark effect adds ${bonus} damage.`, "roll-result", true);
  return bonus;
}

function useHealingPotion() {
  const item = findInventoryItem(state, "healing_potion");
  if (!item || item.qty <= 0) {
    gameMessage("No healing potion available.", "failure", true);
    return;
  }

  removeItem(state, "healing_potion", 1);
  const heal = rollExpr(ITEMS.healing_potion.heal).total;
  const before = state.player.hp;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
  gameMessage(`You drink a potion and recover ${state.player.hp - before} HP.`, "success", true);

  enemyTurn();
}

function attemptFlee() {
  const fleeDc = getDifficulty(state.world.difficulty || "medium").fleeDc;
  const check = rollDie(20) + abilityMod(state.player.abilities.dex);
  if (check >= fleeDc) {
    state.combat = null;
    gameMessage(`Escape check ${check}: success. You break away from combat.`, "system", true);
    return;
  }

  gameMessage(`Escape check ${check}: failed.`, "failure", true);
  enemyTurn();
}

function enemyTurn() {
  if (!state.combat) {
    return;
  }

  const enemy = state.combat.enemy;
  const defensiveBoost = state.player.status.acBoostTurns > 0 ? 3 : 0;

  const aliveCompanions = state.party
    .map((m, idx) => ({ m, idx }))
    .filter((x) => x.m.hp > 0);
  let targetIsPlayer = true;
  let companionIndex = -1;
  if (aliveCompanions.length > 0) {
    if (Math.random() >= 0.5) {
      targetIsPlayer = false;
      const pick = aliveCompanions[Math.floor(Math.random() * aliveCompanions.length)];
      companionIndex = pick.idx;
    }
  }

  const targetAc = targetIsPlayer
    ? state.player.ac + defensiveBoost
    : companionLookup[state.party[companionIndex].companionId].ac;

  const roll = rollDie(20);
  const total = roll + enemy.attackBonus;
  if (roll === 1 || total < targetAc) {
    gameMessage(
      `${enemy.name} attack ${roll} + ${enemy.attackBonus} = ${total} vs AC ${targetAc}. Miss.`,
      "roll-result",
      true
    );
  } else {
    const raw = rollExpr(enemy.damage).total;
    const mult = enemy.enemyDamageMult != null ? enemy.enemyDamageMult : 1;
    const damage = Math.max(1, Math.round(raw * mult));
    if (targetIsPlayer) {
      applyDamageToPlayer(damage);
      gameMessage(`${enemy.name} hits you for ${damage} damage.`, "combat-msg", true);
    } else {
      applyDamageToCompanion(companionIndex, damage);
    }
  }

  if (state.player.status.acBoostTurns > 0) {
    state.player.status.acBoostTurns -= 1;
  }

  if (state.player.hp <= 0) {
    handlePlayerDefeat();
  }
}

function applyDamageToPlayer(damage) {
  let remaining = damage;

  if (state.player.tempHp > 0) {
    const absorbed = Math.min(state.player.tempHp, remaining);
    state.player.tempHp -= absorbed;
    remaining -= absorbed;
  }

  if (remaining > 0) {
    state.player.hp = Math.max(0, state.player.hp - remaining);
  }
}

function handlePlayerDefeat() {
  if (removeItem(state, "revival_salt", 1)) {
    state.player.hp = Math.max(1, Math.floor(state.player.maxHp / 3));
    state.combat = null;
    gameMessage("Revival Salt drags you back from death's edge.", "success", true);
    return;
  }

  state.combat = null;
  const diff = getDifficulty(state.world.difficulty || "medium");
  const lostGold = Math.min(diff.defeatGoldMax, state.player.gold);
  state.player.gold -= lostGold;
  state.player.hp = Math.max(1, Math.floor(state.player.maxHp * diff.defeatHpFraction));
  state.player.spellSlots.current = Math.min(1, state.player.spellSlots.max);
  state.world.locationId = "hall_of_justice";
  state.world.day += 1;

  const standing = state.party.filter((m) => m.hp > 0);
  if (standing.length) {
    const names = standing
      .map((m) => companionLookup[m.companionId]?.name)
      .filter(Boolean)
      .join(" and ");
    appendDmVoice([
      `${names} drags you from the killing ground while clerics sprint toward the smoke. The Dungeon Master lets the street noise swallow the battle's echo—this time, you live.`
    ]);
  }

  gameMessage(
    `You collapse and awaken in the Hall of Justice infirmary. Penalty: -${lostGold} gold and one lost day.`,
    "failure",
    true
  );

  state.party.forEach((member) => {
    const def = companionLookup[member.companionId];
    if (def && member.hp <= 0) {
      member.hp = Math.max(1, Math.floor(def.maxHp / 2));
    }
  });
}

function resolveCombatVictory() {
  if (!state.combat) {
    return;
  }

  const enemy = state.combat.enemy;
  const meta = state.combat.meta;

  state.player.gold += enemy.gold;
  gameMessage(`Victory over ${enemy.name}.`, "success", true);
  gameMessage(`Looted ${enemy.gold} gold.`, "loot", true);

  enemy.loot.forEach((itemId) => {
    addItem(state, itemId, 1);
    const item = ITEMS[itemId];
    if (item) {
      gameMessage(`Loot: ${item.name}.`, "loot", true);
    }
  });

  const leveledUp = gainXp(state, enemy.xp);
  gameMessage(`XP gained: ${enemy.xp}.`, "xp-gain", true);
  if (leveledUp) {
    gameMessage(`Level up! You are now level ${state.player.level}.`, "success", true);
    state.player.spellSlots.current = state.player.spellSlots.max;
  }

  if (meta.flagReward) {
    state.world.flags[meta.flagReward] = true;
  }

  if (meta.encounterId === "sunken_pier_skirmish" && state.world.flags.smugglerBriefed) {
    state.world.flags.smugglerCleared = true;
  }

  if (meta.isBoss) {
    state.world.flags.defeatedVexira = true;
    state.world.ending = "victory";
    completeQuest("main_quest");
    gameMessage("Chapter Complete: Vexira falls and the rift stabilizes.", "chapter", true);
    gameMessage("You have secured a full victory path from start to ending.", "success", true);
  }

  state.combat = null;
  checkQuestMilestones();
}

function checkQuestMilestones() {
  if (allSigilsRecovered() && !state.world.flags.sigilsAnnounced) {
    state.world.flags.sigilsAnnounced = true;
    gameMessage("All three sigils are recovered. Forge the Warded Key in the Crafting Hall.", "system", true);
  }

  if (state.world.flags.forgedWardedKey && !state.world.flags.keyAnnounced) {
    state.world.flags.keyAnnounced = true;
    gameMessage("Warded Key forged. Travel to Mount Hotenow and challenge Vexira.", "system", true);
  }
}

function restParty() {
  if (!state || state.combat) {
    return;
  }

  const restCost = getDifficulty(state.world.difficulty || "medium").restCost;
  if (state.player.gold < restCost) {
    gameMessage(`Rest costs ${restCost} gold. You do not have enough.`, "failure", true);
    renderGame();
    return;
  }

  state.player.gold -= restCost;
  state.player.hp = state.player.maxHp;
  state.player.tempHp = 0;
  state.player.spellSlots.current = state.player.spellSlots.max;
  state.world.day += 1;

  state.party.forEach((member) => {
    const def = companionLookup[member.companionId];
    if (def) {
      member.maxHp = def.maxHp;
      member.hp = def.maxHp;
    }
  });

  gameMessage(`You complete a long rest. -${restCost} gold.`, "success", true);
  if (state.party.length) {
    gameMessage("Your companions mend gear, share rations, and ready themselves for the road.", "system", true);
  }
  renderGame();
}

function activateQuest(questId) {
  if (state.quests.completed.includes(questId)) {
    return;
  }

  if (!state.quests.active.includes(questId)) {
    state.quests.active.push(questId);
  }
}

function completeQuest(questId) {
  state.quests.active = state.quests.active.filter((id) => id !== questId);
  if (!state.quests.completed.includes(questId)) {
    state.quests.completed.push(questId);
  }
}

function getQuestStageTextMap() {
  const map = {};
  if (state.quests.active.includes("main_quest")) {
    map.main_quest = getMainQuestStageText();
  }

  if (state.quests.active.includes("smuggler_chain")) {
    map.smuggler_chain = getSmugglerQuestText();
  }

  return map;
}

function getMainQuestStageText() {
  if (!state.world.flags.acceptedMainQuest) {
    return "Speak with Captain Serra in Protector's Enclave.";
  }

  if (!allSigilsRecovered()) {
    const missing = [];
    if (!state.world.flags.tide_sigil_won) {
      missing.push("Tidal Sigil");
    }
    if (!state.world.flags.shadow_sigil_won) {
      missing.push("Shadow Sigil");
    }
    if (!state.world.flags.flame_sigil_won) {
      missing.push("Flame Sigil");
    }
    return `Recover remaining sigils: ${missing.join(", ")}.`;
  }

  if (!state.world.flags.forgedWardedKey) {
    return "Craft the Warded Key in the Crafting Hall.";
  }

  if (!state.world.flags.defeatedVexira) {
    return "Travel to Mount Hotenow and defeat Vexira.";
  }

  return "Return to Protector's Enclave and report success.";
}

function getSmugglerQuestText() {
  if (!state.world.flags.smugglerBriefed) {
    return "Speak with Tormund in Blacklake.";
  }

  if (!state.world.flags.smugglerCleared) {
    return "Defeat the smuggler cell at Sunken Pier.";
  }

  return "Collect your reward from Whisper or Kael.";
}

function gameMessage(text, type, includeInLog) {
  appendNarrative(text, type);
  if (includeInLog && state) {
    state.log.push(`[Day ${state.world.day}] ${text}`);
    if (state.log.length > 300) {
      state.log = state.log.slice(-300);
    }
  }
}

function applyRaceBonuses(baseAbilities, bonuses) {
  const result = { ...baseAbilities };
  Object.keys(bonuses).forEach((key) => {
    result[key] += bonuses[key];
  });
  return result;
}

function toLookup(list) {
  return list.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}
