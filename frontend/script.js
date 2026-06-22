const API_URL = "http://127.0.0.1:8000";
const APP_NAME = "parryforge";
const USER_ID = "parryforge_user";
const SESSION_ID = "main_session";

const resultCards = document.getElementById("resultCards");
let currentOutput = "";

const btn = document.getElementById("generateBtn");
const demoBtn = document.getElementById("demoBtn");
const copyBtn = document.getElementById("copyBtn");
const result = document.getElementById("result");
const loader = document.getElementById("loader");
const thinkingText = document.getElementById("thinkingText");
const modeTag = document.getElementById("modeTag");

const agents = {
  designer: document.getElementById("designer"),
  balance: document.getElementById("balance"),
  godot: document.getElementById("godot"),
  critic: document.getElementById("critic"),
};

const steps = [
  ["designer", "Designer Agent is forging the boss identity..."],
  ["balance", "Balance Agent is tuning difficulty and parry windows..."],
  ["godot", "Godot Code Agent is preparing scene setup and GDScript..."],
  ["critic", "Critic Agent is evaluating the final package..."],
];

function resetAgents() {
  Object.values(agents).forEach(card => {
    card.classList.remove("active", "done");
    card.querySelector(".bar div").style.width = "0%";
    card.querySelector("small").textContent = "Waiting";
  });
}

function activateAgent(name, text) {
  const card = agents[name];
  card.classList.add("active");
  card.querySelector("small").textContent = "Thinking...";
  thinkingText.textContent = text;
}

function finishAgent(name) {
  const card = agents[name];
  card.classList.remove("active");
  card.classList.add("done");
  card.querySelector(".bar div").style.width = "100%";
  card.querySelector("small").textContent = "Complete";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function playPipelineAnimation() {
  for (const [name, text] of steps) {
    activateAgent(name, text);
    await sleep(1100);
    finishAgent(name);
  }
}

async function createSession() {
  await fetch(`${API_URL}/apps/${APP_NAME}/users/${USER_ID}/sessions/${SESSION_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  }).catch(() => {});
}

function buildPrompt() {
  return `
Create a concise boss design for:

Game genre: ${document.getElementById("genre").value}
Core mechanic: ${document.getElementById("mechanic").value}
Difficulty: ${document.getElementById("difficulty").value}
Boss theme: ${document.getElementById("theme").value}

Use the full ParryForge pipeline:
Designer Agent, Balance Agent, Godot Code Agent, and Critic Agent.

Include:
- Boss concept
- Attack phases
- Balance notes
- Godot 4 setup
- Small starter GDScript snippet
- Critic scorecard

Keep the answer clean and presentation-ready.
`;
}

function parseSSE(rawText) {
  const lines = rawText
    .split("\n")
    .filter(line => line.startsWith("data: "))
    .map(line => line.replace("data: ", ""));

  let finalText = "";

  for (const line of lines) {
    try {
      const event = JSON.parse(line);

      if (event.errorMessage || event.error) {
        finalText += `ERROR:\n${event.errorMessage || event.error}\n`;
      }

      const parts = event.content?.parts || [];
      for (const part of parts) {
        if (part.text) finalText += part.text + "\n";
      }
    } catch (e) {
      console.warn("Could not parse SSE line:", line);
    }
  }

  return finalText || rawText;
}

async function runRealAgent() {
  resetAgents();
  result.textContent = "Starting ParryForge ADK pipeline...";
  loader.classList.remove("hidden");
  modeTag.textContent = "Live ADK Mode";

  btn.disabled = true;
  demoBtn.disabled = true;

  const animationPromise = playPipelineAnimation();

  try {
    await createSession();

    const response = await fetch(`${API_URL}/run_sse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appName: APP_NAME,
        userId: USER_ID,
        sessionId: SESSION_ID,
        newMessage: {
          role: "user",
          parts: [{ text: buildPrompt() }]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const rawText = await response.text();
    await animationPromise;

    result.textContent = parseSSE(rawText);
  } catch (err) {
    result.textContent =
      "ERROR:\n" +
      err.message +
      "\n\nIf your quota is exhausted, use Demo Mode for UI testing.";
  }

  loader.classList.add("hidden");
  btn.disabled = false;
  demoBtn.disabled = false;
}

async function runDemoMode() {
  resetAgents();
  loader.classList.remove("hidden");
  modeTag.textContent = "Demo Mode";
  result.textContent = "Running simulated ParryForge pipeline...";

  btn.disabled = true;
  demoBtn.disabled = true;

  await playPipelineAnimation();

  const theme = document.getElementById("theme").value;
  const genre = document.getElementById("genre").value;
  const mechanic = document.getElementById("mechanic").value;
  const difficulty = document.getElementById("difficulty").value;

  result.textContent = `# ParryForge Boss Package

## Designer Agent Output

### Boss Name
Aegon the Bereaved, Iron Bastion

### Lore
A fallen shield knight who blames the player for the death of his son. He no longer fights for victory. He fights to make the player feel the weight of every parry.

### Game Context
Genre: ${genre}
Core Mechanic: ${mechanic}
Difficulty: ${difficulty}
Theme: ${theme}

### Visual Design
A massive armored knight carrying a cracked tower shield. His armor glows faintly blue from grief-fueled energy. Every heavy step shakes dust from the arena floor.

### Phase 1
- Shield Bash: slow frontal slam with clear wind-up
- Spear Throw: parryable projectile aimed directly at the player
- Guard Walk: slowly advances while blocking

### Phase 2
- Mourning Barrage: throws 3 spectral spears with staggered timing
- Shield Wall: creates a temporary obstacle forcing movement
- Counter Cry: punishes careless attacks but leaves parry openings

### Phase 3 / Rage Mode
- Arena becomes smaller
- Spear throws become faster
- Boss gains a grief aura that slightly distorts the screen
- Every third attack has a longer parry reward window


## Balance Agent Output

### Difficulty Rating
8 / 10

### What Works
- Clear emotional theme
- Strong parry-focused gameplay
- Telegraph-heavy attacks make difficulty feel fair
- Phase escalation fits a roguelike boss

### Risks
- Too many projectiles may overwhelm beginner players
- Shield Wall could trap the player if arena is already small
- Rage Mode needs readable attack animations

### Recommended Adjustments
- Keep Phase 1 slow and readable
- Add 0.35s recovery after Shield Bash
- Make spectral spears glow cyan when parryable
- Limit Shield Wall to one active wall at a time


## Godot Code Agent Output

### Recommended Scene Tree
BossKnight
├── AnimatedSprite2D
├── CollisionShape2D
├── ShieldPivot
├── AttackTimer
├── PhaseTimer
├── HealthBar
├── AudioStreamPlayer2D
└── ProjectileSpawnPoint

### Setup Steps
1. Create a new CharacterBody2D scene called BossKnight.
2. Add the nodes listed above.
3. Attach BossKnight.gd to the root node.
4. Add the boss to the "bosses" group.
5. Connect AttackTimer.timeout to _on_attack_timer_timeout.
6. Add a SpearProjectile scene for parryable attacks.
7. Connect boss death signal to your Main scene.

### Starter GDScript

\`\`\`gdscript
extends CharacterBody2D

signal boss_defeated

@export var max_health := 120
@export var phase_two_threshold := 70
@export var rage_threshold := 30
@export var spear_scene: PackedScene

var health := max_health
var phase := 1
var player: Node2D

@onready var attack_timer = $AttackTimer
@onready var spawn_point = $ProjectileSpawnPoint

func _ready():
    player = get_tree().get_first_node_in_group("player")
    attack_timer.start()

func take_damage(amount):
    health -= amount
    update_phase()

    if health <= 0:
        boss_defeated.emit()
        queue_free()

func update_phase():
    if health <= rage_threshold:
        phase = 3
    elif health <= phase_two_threshold:
        phase = 2

func _on_attack_timer_timeout():
    if phase == 1:
        throw_spear()
    elif phase == 2:
        mourning_barrage()
    else:
        rage_combo()

func throw_spear():
    if spear_scene == null or player == null:
        return

    var spear = spear_scene.instantiate()
    get_parent().add_child(spear)
    spear.global_position = spawn_point.global_position
    spear.velocity = (player.global_position - global_position).normalized() * 420

func mourning_barrage():
    for i in range(3):
        throw_spear()
        await get_tree().create_timer(0.25).timeout

func rage_combo():
    throw_spear()
    await get_tree().create_timer(0.2).timeout
    throw_spear()
\`\`\`


## Critic Agent Output

### Scorecard
Originality: 8.5 / 10
Gameplay Variety: 8 / 10
Difficulty Balance: 7.5 / 10
Parry Quality: 9 / 10
Godot Practicality: 8 / 10
Beginner Friendliness: 8 / 10

### Strengths
- Strong emotional identity
- Mechanics match the parry genre
- Easy to implement in Godot
- Clear phase progression

### Weaknesses
- Needs animation polish
- Shield Wall may require careful collision testing
- Rage Mode could become too intense without cooldowns

### Final Verdict
Aegon the Bereaved is a strong boss concept for a parry roguelike. The design is dramatic, readable, and practical enough for an indie developer to prototype quickly.`;

  loader.classList.add("hidden");
  btn.disabled = false;
  demoBtn.disabled = false;
}

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(result.textContent);
  copyBtn.textContent = "Copied!";
  setTimeout(() => copyBtn.textContent = "Copy Result", 1000);
});

btn.addEventListener("click", runRealAgent);
demoBtn.addEventListener("click", runDemoMode);

function sectionBetween(text, startWords, endWords = []) {
  const lower = text.toLowerCase();
  let start = -1;

  for (const word of startWords) {
    const index = lower.indexOf(word.toLowerCase());
    if (index !== -1 && (start === -1 || index < start)) start = index;
  }

  if (start === -1) return "No content found for this section yet.";

  let end = text.length;

  for (const word of endWords) {
    const index = lower.indexOf(word.toLowerCase(), start + 5);
    if (index !== -1 && index < end) end = index;
  }

  return text.slice(start, end).trim();
}

function renderCards(text, tab = "design") {
  currentOutput = text;

  const sections = {
    design: sectionBetween(text, ["Designer Agent Output", "Boss Name"], ["Balance Agent Output", "Godot Code Agent Output", "Critic Agent Output"]),
    balance: sectionBetween(text, ["Balance Agent Output", "Difficulty Rating"], ["Godot Code Agent Output", "Critic Agent Output"]),
    godot: sectionBetween(text, ["Godot Code Agent Output", "Recommended Scene Tree", "Setup Steps"], ["Critic Agent Output"]),
    code: sectionBetween(text, ["```gdscript", "extends CharacterBody2D"], ["Critic Agent Output"]),
    critic: sectionBetween(text, ["Critic Agent Output", "Scorecard"], ["Final ParryForge Summary"]),
    raw: text
  };

  const titles = {
    design: "⚔ Boss Design",
    balance: "🛡 Balance Report",
    godot: "⚙ Godot Implementation",
    code: "📜 GDScript",
    critic: "🎯 Critic Verdict",
    raw: "🧾 Raw ADK Output"
  };

  resultCards.innerHTML = `
    <div class="output-card">
      <h3>${titles[tab]}</h3>
      <pre>${escapeHtml(sections[tab])}</pre>
    </div>
  `;
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderCards(currentOutput || result.textContent, tab.dataset.tab);
  });
});