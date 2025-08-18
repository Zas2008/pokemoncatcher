const grid = document.getElementById("grid");
const searchInput = document.getElementById("search");
const countEl = document.getElementById("count");
const modalContainer = document.getElementById("modalContainer");

const trainerNameInput = document.getElementById("trainerName");
const themeColorInput = document.getElementById("themeColor");
const showCatchersBtn = document.getElementById("showCatchers");
const showTargetsBtn = document.getElementById("showTargets");
const savedList = document.getElementById("savedList");

let allPokemon = [];
let catchers = JSON.parse(localStorage.getItem("catchers") || "[]");
let targets = JSON.parse(localStorage.getItem("targets") || "[]");

// Load trainer and theme
trainerNameInput.value = localStorage.getItem("trainerName") || "";
themeColorInput.value = localStorage.getItem("themeColor") || "#ffcb05";
document.documentElement.style.setProperty("--tw-prose-links", themeColorInput.value);

// Save trainer name/theme
trainerNameInput.addEventListener("input", e => {
  localStorage.setItem("trainerName", e.target.value);
});
themeColorInput.addEventListener("input", e => {
  localStorage.setItem("themeColor", e.target.value);
  document.documentElement.style.setProperty("--tw-prose-links", e.target.value);
});

// Show Catchers or Targets
showCatchersBtn.addEventListener("click", () => displaySaved("catchers"));
showTargetsBtn.addEventListener("click", () => displaySaved("targets"));

function displaySaved(type) {
  savedList.innerHTML = "";
  const list = type === "catchers" ? catchers : targets;
  list.forEach(p => {
    const el = document.createElement("div");
    el.className = "flex items-center gap-2 bg-slate-800/70 rounded-lg p-2";
    el.innerHTML = `<img class="w-10 h-10" src="${p.sprite}" /><span>${p.name}</span>`;
    savedList.appendChild(el);
  });
}

// Fetch all Pokémon
async function fetchAllPokemon() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data = await res.json();
  allPokemon = data.results.map((p, i) => ({ name: p.name, id: i + 1 }));
  displayPokemon(allPokemon);
}

function displayPokemon(list) {
  grid.innerHTML = "";
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "pokemonCard bg-slate-800/70 p-4 rounded-xl cursor-pointer hover:scale-105 transition-transform text-center";
    card.innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${p.id}.png" alt="${p.name}" class="mx-auto mb-2" />
      <span class="capitalize">${p.name}</span>
    `;
    card.addEventListener("click", () => openPokemonBuilder(p));
    grid.appendChild(card);
  });
  countEl.textContent = `${list.length} Pokémon`;
}

// Search
searchInput.addEventListener("input", e => {
  const val = e.target.value.toLowerCase();
  const filtered = allPokemon.filter(p => p.name.includes(val) || p.id.toString() === val);
  displayPokemon(filtered);
});

// Modal Pokémon builder
function openPokemonBuilder(pokemon) {
  modalContainer.innerHTML = "";
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/60 flex justify-center items-center z-50";
  modal.innerHTML = `
    <div class="bg-slate-900 p-6 rounded-2xl max-w-xl w-full space-y-4 overflow-y-auto max-h-[90vh]">
      <h2 class="text-xl font-bold capitalize">${pokemon.name}</h2>
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png" class="w-32 h-32 mx-auto" />

      <div class="grid grid-cols-2 gap-2">
        <label>Form:
          <select id="formSelect" class="w-full rounded-lg px-2 py-1"></select>
        </label>
        <label>Gender:
          <select id="genderSelect" class="w-full rounded-lg px-2 py-1">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="genderless">Genderless</option>
          </select>
        </label>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <label>Shiny:
          <input type="checkbox" id="shinyToggle" />
        </label>
        <label>Nature:
          <select id="natureSelect" class="w-full rounded-lg px-2 py-1"></select>
        </label>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <label>Item:
          <select id="itemSelect" class="w-full rounded-lg px-2 py-1"></select>
        </label>
        <label>Randomize IVs/EVs:
          <button id="randomStats" class="w-full bg-indigo-600 hover:bg-indigo-500 px-2 py-1 rounded-lg">Random</button>
        </label>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <label>HP IV: <input type="number" min="0" max="31" value="0" id="ivHP" class="w-full rounded-lg px-2 py-1" /></label>
        <label>Attack IV: <input type="number" min="0" max="31" value="0" id="ivAtk" class="w-full rounded-lg px-2 py-1" /></label>
        <label>Defense IV: <input type="number" min="0" max="31" value="0" id="ivDef" class="w-full rounded-lg px-2 py-1" /></label>
        <label>SpA IV: <input type="number" min="0" max="31" value="0" id="ivSpA" class="w-full rounded-lg px-2 py-1" /></label>
        <label>SpD IV: <input type="number" min="0" max="31" value="0" id="ivSpD" class="w-full rounded-lg px-2 py-1" /></label>
        <label>Speed IV: <input type="number" min="0" max="31" value="0" id="ivSpe" class="w-full rounded-lg px-2 py-1" /></label>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <label>HP EV: <input type="number" min="0" max="252" value="0" id="evHP" class="w-full rounded-lg px-2 py-1" /></label>
        <label>Attack EV: <input type="number" min="0" max="252" value="0" id="evAtk" class="w-full rounded-lg px-2 py-1" /></label>
        <label>Defense EV: <input type="number" min="0" max="252" value="0" id="evDef" class="w-full rounded-lg px-2 py-1" /></label>
        <label>SpA EV: <input type="number" min="0" max="252" value="0" id="evSpA" class="w-full rounded-lg px-2 py-1" /></label>
        <label>SpD EV: <input type="number" min="0" max="252" value="0" id="evSpD" class="w-full rounded-lg px-2 py-1" /></label>
        <label>Speed EV: <input type="number" min="0" max="252" value="0" id="evSpe" class="w-full rounded-lg px-2 py-1" /></label>
      </div>

      <div class="flex gap-2">
        <button id="saveCatcher" class="flex-1 bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-lg">Save as Catcher</button>
        <button id="saveTarget" class="flex-1 bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-lg">Save as Target</button>
        <button id="closeModal" class="flex-1 bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg">Close</button>
      </div>
    </div>
  `;

  modalContainer.appendChild(modal);

  const closeModalBtn = document.getElementById("closeModal");
  closeModalBtn.addEventListener("click", () => modal.remove());

  const randomStatsBtn = document.getElementById("randomStats");
  randomStatsBtn.addEventListener("click", () => {
    ["ivHP","ivAtk","ivDef","ivSpA","ivSpD","ivSpe"].forEach(id => document.getElementById(id).value = Math.floor(Math.random()*32));
    ["evHP","evAtk","evDef","evSpA","evSpD","evSpe"].forEach(id => document.getElementById(id).value = Math.floor(Math.random()*253/4)*4);
  });

  const saveCatcherBtn = document.getElementById("saveCatcher");
  const saveTargetBtn = document.getElementById("saveTarget");

  function savePokemon(type) {
    const obj = {
      name: pokemon.name,
      id: pokemon.id,
      sprite: document.querySelector("#shinyToggle").checked
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${pokemon.id}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`,
      gender: document.getElementById("genderSelect").value,
      nature: document.getElementById("natureSelect").value,
      item: document.getElementById("itemSelect").value,
      IVs: {
        hp: +document.getElementById("ivHP").value,
        atk: +document.getElementById("ivAtk").value,
        def: +document.getElementById("ivDef").value,
        spa: +document.getElementById("ivSpA").value,
        spd: +document.getElementById("ivSpD").value,
        spe: +document.getElementById("ivSpe").value
      },
      EVs: {
        hp: +document.getElementById("evHP").value,
        atk: +document.getElementById("evAtk").value,
        def: +document.getElementById("evDef").value,
        spa: +document.getElementById("evSpA").value,
        spd: +document.getElementById("evSpD").value,
        spe: +document.getElementById("evSpe").value
      }
    };

    if (type==="catchers") {
      catchers.push(obj);
      localStorage.setItem("catchers", JSON.stringify(catchers));
    } else {
      targets.push(obj);
      localStorage.setItem("targets", JSON.stringify(targets));
    }
    modal.remove();
  }

  saveCatcherBtn.addEventListener("click", () => savePokemon("catchers"));
  saveTargetBtn.addEventListener("click", () => savePokemon("targets"));

  // Populate natures and items
  const natures = ["Adamant","Bashful","Bold","Brave","Calm","Careful","Docile","Gentle","Hardy","Hasty","Impish","Jolly","Lax","Lonely","Mild","Modest","Naive","Naughty","Quiet","Quirky","Rash","Relaxed","Sassy","Serious","Timid"];
  const natureSelect = document.getElementById("natureSelect");
  natures.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n.toLowerCase();
    opt.textContent = n;
    natureSelect.appendChild(opt);
  });

  const items = ["None","Potion","Rare Candy","Leftovers","Sitrus Berry","Choice Band","Choice Specs","Focus Sash"];
  const itemSelect = document.getElementById("itemSelect");
  items.forEach(i => {
    const opt = document.createElement("option");
    opt.value = i.toLowerCase().replace(/\s+/g,"_");
    opt.textContent = i;
    itemSelect.appendChild(opt);
  });
}

// Initialize
fetchAllPokemon();
