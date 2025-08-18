const pokemonListEl = document.getElementById("pokemonList");
const searchInput = document.getElementById("searchInput");
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
const catchersListEl = document.getElementById("catchersList");
const targetsListEl = document.getElementById("targetsList");

const trainerNameDisplay = document.getElementById("trainerNameDisplay");
const settingsIcon = document.getElementById("settingsIcon");
const settingsMenu = document.getElementById("settingsMenu");
const trainerNameInput = document.getElementById("trainerNameInput");
const themeColorInput = document.getElementById("themeColor");
const closeSettings = document.getElementById("closeSettings");

let catchers = JSON.parse(localStorage.getItem("catchers") || "[]");
let targets = JSON.parse(localStorage.getItem("targets") || "[]");
let trainerName = localStorage.getItem("trainerName") || "Trainer";
let themeColor = localStorage.getItem("themeColor") || "#ffcb05";

trainerNameDisplay.textContent = trainerName;
document.documentElement.style.setProperty("--primary-color", themeColor);
themeColorInput.value = themeColor;
trainerNameInput.value = trainerName;

settingsIcon.addEventListener("click", () => {
  settingsMenu.style.display = settingsMenu.style.display === "block" ? "none" : "block";
});
closeSettings.addEventListener("click", () => settingsMenu.style.display = "none");

trainerNameInput.addEventListener("input", e => {
  trainerName = e.target.value || "Trainer";
  trainerNameDisplay.textContent = trainerName;
  localStorage.setItem("trainerName", trainerName);
});

themeColorInput.addEventListener("input", e => {
  themeColor = e.target.value;
  document.documentElement.style.setProperty("--primary-color", themeColor);
  localStorage.setItem("themeColor", themeColor);
});

hamburger.addEventListener("click", () => {
  sidebar.style.left = sidebar.style.left === "0px" ? "-300px" : "0px";
});

function saveCatchersTargets() {
  localStorage.setItem("catchers", JSON.stringify(catchers));
  localStorage.setItem("targets", JSON.stringify(targets));
  renderSidebar();
}

function renderSidebar() {
  catchersListEl.innerHTML = "";
  targetsListEl.innerHTML = "";
  catchers.forEach(p => {
    const div = document.createElement("div");
    div.textContent = `${p.name} (${p.form || "Normal"})`;
    catchersListEl.appendChild(div);
  });
  targets.forEach(p => {
    const div = document.createElement("div");
    div.textContent = `${p.name} (${p.form || "Normal"})`;
    targetsListEl.appendChild(div);
  });
}

renderSidebar();

// Fetch Pokémon
async function fetchPokemon() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data = await res.json();
  const pokemons = await Promise.all(data.results.map(async p => {
    const details = await fetch(p.url).then(r => r.json());
    let sprite = details.sprites.other["official-artwork"].front_default || details.sprites.front_default;
    let forms = details.forms.map(f => f.name);
    return {
      name: p.name,
      id: details.id,
      sprite,
      forms
    };
  }));
  renderPokemonList(pokemons);
  setupSearch(pokemons);
}

// Render Pokémon Grid
function renderPokemonList(pokemons) {
  pokemonListEl.innerHTML = "";
  pokemons.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("pokemonCard");
    card.innerHTML = `
      <img src="${p.sprite}" alt="${p.name}">
      <span>${capitalize(p.name)}</span>
    `;
    card.addEventListener("click", () => openPokemonBuilder(p));
    pokemonListEl.appendChild(card);
  });
}

// Search Filter
function setupSearch(pokemons) {
  searchInput.addEventListener("input", e => {
    const term = e.target.value.toLowerCase();
    const filtered = pokemons.filter(p => p.name.toLowerCase().includes(term));
    renderPokemonList(filtered);
  });
}

// Capitalize helper
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Pokémon Builder Modal
async function openPokemonBuilder(pokemon) {
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.7)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = 200;

  const builder = document.createElement("div");
  builder.style.background = "#fff";
  builder.style.padding = "20px";
  builder.style.borderRadius = "10px";
  builder.style.width = "90%";
  builder.style.maxWidth = "500px";
  builder.style.maxHeight = "90%";
  builder.style.overflowY = "auto";

  builder.innerHTML = `
    <h2>${capitalize(pokemon.name)}</h2>
    <img src="${pokemon.sprite}" style="width:120px;height:120px;">
    <label>Form:</label>
    <select id="formSelect"></select>
    <label>Gender:</label>
    <select id="genderSelect">
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="genderless">Genderless</option>
    </select>
    <label>Shiny:</label>
    <input type="checkbox" id="shinyCheck">
    <label>IVs (0-31):</label>
    <input type="text" id="ivsInput" placeholder="Ex: 31,31,31,31,31,31">
    <label>EVs (0-252, total ≤ 510, + or - for auto nature):</label>
    <input type="text" id="evsInput" placeholder="Ex: +252,0,-252,0,0,6">
    <label>Nature:</label>
    <select id="natureSelect"></select>
    <label>Held Item:</label>
    <select id="itemSelect"></select>
    <div style="margin-top:10px;">
      <button id="saveCatcher">Save as Catcher</button>
      <button id="saveTarget">Save as Target</button>
      <button id="closeModal">Cancel</button>
    </div>
  `;
  modal.appendChild(builder);
  document.body.appendChild(modal);

  // Populate Forms
  const formSelect = builder.querySelector("#formSelect");
  pokemon.forms.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    formSelect.appendChild(opt);
  });

  // Fetch Natures
  const naturesRes = await fetch("https://pokeapi.co/api/v2/nature?limit=100");
  const naturesData = await naturesRes.json();
  const natureSelect = builder.querySelector("#natureSelect");
  for (const n of naturesData.results) {
    const details = await fetch(n.url).then(r => r.json());
    const boost = details.increased_stat ? capitalize(details.increased_stat.name) : "None";
    const drop = details.decreased_stat ? capitalize(details.decreased_stat.name) : "None";
    const option = document.createElement("option");
    option.value = n.name;
    option.textContent = `${capitalize(n.name)} (+${boost}, -${drop})`;
    natureSelect.appendChild(option);
  }

  // Fetch Items
  const itemsRes = await fetch("https://pokeapi.co/api/v2/item?limit=10000");
  const itemsData = await itemsRes.json();
  const itemSelect = builder.querySelector("#itemSelect");
  const validItems = [];
  for (const i of itemsData.results) {
    const details = await fetch(i.url).then(r => r.json());
    if (!details.sprites.default) continue;
    if (["pokeballs", "machines", "key-items"].includes(details.category.name)) continue;
    validItems.push({name: details.name, sprite: details.sprites.default});
  }
  validItems.sort((a,b)=>a.name.localeCompare(b.name));
  validItems.forEach(i => {
    const opt = document.createElement("option");
    opt.value = i.name;
    opt.innerHTML = `<img src="${i.sprite}" style="width:20px;height:20px;"> ${capitalize(i.name)}`;
    opt.textContent = capitalize(i.name);
    itemSelect.appendChild(opt);
  });

  builder.querySelector("#closeModal").addEventListener("click", ()=> modal.remove());

  function parseEVs(str){
    const arr = str.split(",").map(s=>s.trim());
    if(arr.length!==6) return [0,0,0,0,0,0];
    return arr.map(v=>{
      if(v.includes("+") || v.includes("-")) return 0;
      const n = parseInt(v);
      return isNaN(n)?0:n;
    });
  }

  function savePokemon(target){
    const obj = {
      name: pokemon.name,
      form: formSelect.value,
      gender: builder.querySelector("#genderSelect").value,
      shiny: builder.querySelector("#shinyCheck").checked,
      ivs: builder.querySelector("#ivsInput").value.split(",").map(v=>parseInt(v)||0),
      evs: parseEVs(builder.querySelector("#evsInput").value),
      nature: natureSelect.value,
      item: itemSelect.value
    };
    if(target) targets.push(obj); else catchers.push(obj);
    saveCatchersTargets();
    modal.remove();
  }

  builder.querySelector("#saveCatcher").addEventListener("click", ()=> savePokemon(false));
  builder.querySelector("#saveTarget").addEventListener("click", ()=> savePokemon(true));
}

fetchPokemon();
