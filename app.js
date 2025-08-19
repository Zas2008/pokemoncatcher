const API_LIST = "https://pokeapi.co/api/v2/pokemon?limit=1025";
const API_SPECIES = (id) => `https://pokeapi.co/api/v2/pokemon-species/${id}`;
const API_POKEMON = (nameOrId) => `https://pokeapi.co/api/v2/pokemon/${nameOrId}`;
const API_ITEMS = "https://pokeapi.co/api/v2/item?limit=2000";
const API_NATURES = "https://pokeapi.co/api/v2/nature?limit=100";

const homeImg = (id, shiny=false) => shiny
  ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${id}.png`
  : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
const artworkImg = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const count = document.getElementById("count");

const confirmWrap = document.getElementById("confirmWrap");
const confirmImg = document.getElementById("confirmImg");
const confirmName = document.getElementById("confirmName");
const cancelConfirm = document.getElementById("cancelConfirm");
const confirmSelect = document.getElementById("confirmSelect");

const editorWrap = document.getElementById("editorWrap");
const editorImg = document.getElementById("editorImg");
const editorTitle = document.getElementById("editorTitle");
const editorSubtitle = document.getElementById("editorSubtitle");
const previewImg = document.getElementById("previewImg");
const baseStats = document.getElementById("baseStats");

const nickname = document.getElementById("nickname");
const level = document.getElementById("level");
const gender = document.getElementById("gender");
const shiny = document.getElementById("shiny");
const nature = document.getElementById("nature");
const itemInput = document.getElementById("item");
const itemList = document.getElementById("itemList");
const formSelect = document.getElementById("form");
const megaToggle = document.getElementById("megaToggle");

const ivInputs = {
  hp: document.getElementById("iv_hp"),
  atk: document.getElementById("iv_atk"),
  def: document.getElementById("iv_def"),
  spa: document.getElementById("iv_spa"),
  spd: document.getElementById("iv_spd"),
  spe: document.getElementById("iv_spe"),
};
const evInputs = {
  hp: document.getElementById("ev_hp"),
  atk: document.getElementById("ev_atk"),
  def: document.getElementById("ev_def"),
  spa: document.getElementById("ev_spa"),
  spd: document.getElementById("ev_spd"),
  spe: document.getElementById("ev_spe"),
};
const evTotal = document.getElementById("evTotal");
const randomIVsBtn = document.getElementById("randomIVs");
const randomEVsBtn = document.getElementById("randomEVs");
const saveBtn = document.getElementById("saveCatcher");

const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const closeDrawer = document.getElementById("closeDrawer");
const navCatchers = document.getElementById("navCatchers");
const drawerContent = document.getElementById("drawerContent");

const normalize = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const pad4 = (n) => String(n).padStart(4, "0");

let all = [];
let selected = null;
let selectedSpecies = null;
let selectedVarieties = [];
let currentPokemon = null;

const makeCard = ({ id, name }) => {
  const card = document.createElement("button");
  card.className = "group relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 transition-shadow shadow-lg shadow-slate-950/40 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const title = document.createElement("div");
  title.className = "absolute left-0 right-0 top-0 px-3 pt-3 flex justify-between text-xs text-slate-400";
  title.innerHTML = `<span>#${pad4(id)}</span><span class="capitalize">${name}</span>`;
  const imgWrap = document.createElement("div");
  imgWrap.className = "aspect-square w-full grid place-items-center p-4";
  const img = document.createElement("img");
  img.src = homeImg(id);
  img.alt = name;
  img.loading = "lazy";
  img.className = "w-11/12 h-11/12 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-[1.03]";
  img.onerror = () => { if (img.src !== artworkImg(id)) img.src = artworkImg(id); };
  imgWrap.appendChild(img);
  card.appendChild(imgWrap);
  card.appendChild(title);
  card.addEventListener("click", () => openConfirm({ id, name, img: img.src }));
  return card;
};

const makeSkeleton = (n = 20) => {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const sk = document.createElement("div");
    sk.className = "animate-pulse rounded-2xl border border-slate-800 bg-slate-900 aspect-square";
    frag.appendChild(sk);
  }
  return frag;
};

const render = (list) => {
  grid.innerHTML = "";
  const frag = document.createDocumentFragment();
  list.forEach((p) => frag.appendChild(makeCard(p)));
  grid.appendChild(frag);
  count.textContent = `${list.length} shown`;
};

const debounce = (fn, ms = 200) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

const loadList = () => {
  grid.appendChild(makeSkeleton(30));
  count.textContent = "Loading…";
  fetch(API_LIST)
    .then((r) => r.json())
    .then((data) => {
      all = data.results.map((r) => {
        const m = r.url.match(/\/pokemon\/(\d+)\//);
        return { id: Number(m[1]), name: r.name };
      });
      render(all);
    })
    .catch(() => {
      grid.innerHTML = "";
      const e = document.createElement("div");
      e.className = "text-slate-300";
      e.textContent = "Failed to load data.";
      grid.appendChild(e);
      count.textContent = "";
    });
};

const openConfirm = ({ id, name, img }) => {
  selected = { id, name };
  confirmImg.src = img;
  confirmName.textContent = `#${pad4(id)} • ${name}`;
  confirmWrap.classList.remove("hidden");
};

cancelConfirm.addEventListener("click", () => confirmWrap.classList.add("hidden"));
confirmWrap.addEventListener("click", (e) => { if (e.target === confirmWrap) confirmWrap.classList.add("hidden"); });

confirmSelect.addEventListener("click", async () => {
  confirmWrap.classList.add("hidden");
  await openEditor(selected.id, selected.name);
});

const openEditor = async (id, name) => {
  editorWrap.classList.remove("hidden");
  editorTitle.textContent = `#${pad4(id)} • ${name}`;
  editorSubtitle.textContent = "Loading…";
  editorImg.src = homeImg(id);
  previewImg.src = homeImg(id);
  shiny.checked = false;
  megaToggle.checked = false;
  nickname.value = "";
  level.value = 100;

  Object.values(ivInputs).forEach((el) => el.value = 31);
  Object.values(evInputs).forEach((el) => el.value = 0);
  updateEVTotal();

  const [species, poke, natures, items] = await Promise.all([
    fetch(API_SPECIES(id)).then(r=>r.json()),
    fetch(API_POKEMON(id)).then(r=>r.json()),
    fetch(API_NATURES).then(r=>r.json()),
    fetch(API_ITEMS).then(r=>r.json())
  ]);

  selectedSpecies = species;
  currentPokemon = poke;
  selectedVarieties = species.varieties
    .map(v => {
      const idMatch = v.pokemon.url.match(/\/pokemon\/(\d+)\//);
      const pid = idMatch ? Number(idMatch[1]) : null;
      return { name: v.pokemon.name, id: pid, is_default: v.is_default };
    })
    .filter(v => v.id);

  const genderOptions = buildGenderOptions(species.gender_rate);
  gender.innerHTML = genderOptions.map(g => `<option value="${g}">${g}</option>`).join("");

  nature.innerHTML = natures.results.map(n => `<option value="${n.name}">${n.name}</option>`).join("");

const filteredItems = items.results.filter(it => !it.name.includes("tm") && !it.name.includes("ball"));
itemList.innerHTML = "";
for (const it of filteredItems) {
  const data = await fetch(it.url).then(r => r.json());
  const sprite = data.sprites?.default;
  if (!sprite) continue;
  const option = document.createElement("option");
  option.value = it.name;
  option.innerHTML = `<img src="${sprite}" class="inline w-6 h-6 mr-2 align-text-bottom"/> ${it.name}`;
  itemList.appendChild(option);
}

  const nonGenderVarieties = selectedVarieties.filter(v => !v.name.endsWith("-female") && !v.name.endsWith("-male"));
  const formsSorted = nonGenderVarieties
    .slice()
    .sort((a,b)=>{
      const am = a.is_default ? -1 : 0;
      const bm = b.is_default ? -1 : 0;
      return am - bm || a.name.localeCompare(b.name);
    });

  formSelect.innerHTML = formsSorted.map(v => `<option value="${v.id}">${v.name}</option>`).join("");
  const defaultVar = formsSorted.find(v=>v.is_default) || formsSorted[0];
  formSelect.value = String(defaultVar.id);

  const stats = poke.stats.map(s => ({ name: s.stat.name, base: s.base_stat }));
  baseStats.innerHTML = stats.map(s => `
    <div class="flex items-center justify-between">
      <span class="capitalize">${s.name}</span>
      <span class="font-mono">${s.base}</span>
    </div>
  `).join("");

  editorSubtitle.textContent = species.genera?.find(g=>g.language.name==="en")?.genus || "Pokémon";

  updatePreview();
};

const buildGenderOptions = (genderRate) => {
  if (genderRate === -1) return ["Genderless"];
  if (genderRate === 0) return ["Male","Female"];
  if (genderRate === 8) return ["Female","Male"];
  return ["Male","Female"];
};

const updatePreview = async () => {
  const shinyOn = shiny.checked;
  const chosenId = Number(formSelect.value);
  editorImg.src = homeImg(chosenId, shinyOn);
  previewImg.src = homeImg(chosenId, shinyOn);
  editorImg.onerror = () => { editorImg.src = artworkImg(chosenId); };
  previewImg.onerror = () => { previewImg.src = artworkImg(chosenId); };
};

shiny.addEventListener("change", updatePreview);
formSelect.addEventListener("change", () => {
  const chosen = selectedVarieties.find(v => v.id === Number(formSelect.value));
  editorTitle.textContent = `#${pad4(selected.id)} • ${chosen ? chosen.name : selected.name}`;
  updatePreview();
});

megaToggle.addEventListener("change", () => {
  const megas = selectedVarieties.filter(v => v.name.includes("-mega"));
  if (megaToggle.checked && megas.length) {
    formSelect.value = String(megas[0].id);
  } else {
    const def = selectedVarieties.find(v=>v.is_default) || selectedVarieties[0];
    formSelect.value = String(def.id);
  }
  const chosen = selectedVarieties.find(v => v.id === Number(formSelect.value));
  editorTitle.textContent = `#${pad4(selected.id)} • ${chosen ? chosen.name : selected.name}`;
  updatePreview();
});

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

Object.values(ivInputs).forEach(inp=>{
  inp.addEventListener("input", ()=> inp.value = String(clamp(Number(inp.value||0),0,31)));
});
Object.values(evInputs).forEach(inp=>{
  inp.addEventListener("input", ()=>{
    inp.value = String(clamp(Number(inp.value||0),0,252));
    enforceEVBudget(inp);
  });
});

const updateEVTotal = () => {
  const t = Object.values(evInputs).reduce((sum, el)=>sum + Number(el.value||0), 0);
  evTotal.textContent = String(t);
  evTotal.className = t>510 ? "text-xs text-red-400" : "text-xs text-slate-300";
};

const enforceEVBudget = (changed) => {
  let total = Object.values(evInputs).reduce((sum, el)=>sum + Number(el.value||0), 0);
  if (total <= 510) { updateEVTotal(); return; }
  const over = total - 510;
  const v = Math.max(0, Number(changed.value||0) - over);
  changed.value = String(v);
  updateEVTotal();
};

randomIVsBtn.addEventListener("click", ()=>{
  Object.values(ivInputs).forEach(el => el.value = String(Math.floor(Math.random()*32)));
});
randomEVsBtn.addEventListener("click", ()=>{
  const slots = ["hp","atk","def","spa","spd","spe"];
  slots.forEach(k => evInputs[k].value = "0");
  let remaining = 510;
  while (remaining > 0) {
    const k = slots[Math.floor(Math.random()*slots.length)];
    const add = Math.min(remaining, Math.floor(Math.random()*63));
    const cur = Number(evInputs[k].value||0);
    const next = Math.min(252, cur + add);
    const delta = next - cur;
    if (delta > 0) {
      evInputs[k].value = String(next);
      remaining -= delta;
    }
    if (slots.every(s => Number(evInputs[s].value)>=252)) break;
  }
  updateEVTotal();
});

const getIVs = () => ({
  hp: Number(ivInputs.hp.value||0),
  atk: Number(ivInputs.atk.value||0),
  def: Number(ivInputs.def.value||0),
  spa: Number(ivInputs.spa.value||0),
  spd: Number(ivInputs.spd.value||0),
  spe: Number(ivInputs.spe.value||0),
});
const getEVs = () => ({
  hp: Number(evInputs.hp.value||0),
  atk: Number(evInputs.atk.value||0),
  def: Number(evInputs.def.value||0),
  spa: Number(evInputs.spa.value||0),
  spd: Number(evInputs.spd.value||0),
  spe: Number(evInputs.spe.value||0),
});

saveBtn.addEventListener("click", ()=>{
  const chosen = selectedVarieties.find(v => v.id === Number(formSelect.value)) || { id: selected.id, name: selected.name };
  const entry = {
    speciesId: selected.id,
    nationalName: selected.name,
    varietyId: chosen.id,
    varietyName: chosen.name,
    nickname: nickname.value.trim(),
    level: clamp(Number(level.value||100),1,100),
    gender: gender.value,
    shiny: shiny.checked,
    nature: nature.value || null,
    item: itemInput.value.trim() || null,
    ivs: getIVs(),
    evs: getEVs(),
    savedAt: Date.now(),
  };
  const store = JSON.parse(localStorage.getItem("catchers") || "[]");
  store.push(entry);
  localStorage.setItem("catchers", JSON.stringify(store));
  editorWrap.classList.add("hidden");
  openDrawer();
  renderCatchers();
});

document.getElementById("closeEditor").addEventListener("click", ()=> editorWrap.classList.add("hidden"));
editorWrap.addEventListener("click", (e)=>{ if (e.target === editorWrap) editorWrap.classList.add("hidden"); });

menuBtn.addEventListener("click", ()=> openDrawer());
closeDrawer.addEventListener("click", ()=> drawer.classList.add("hidden"));
drawer.addEventListener("click", (e)=>{ if (e.target === drawer) drawer.classList.add("hidden"); });
navCatchers.addEventListener("click", ()=> renderCatchers());

const openDrawer = () => {
  drawer.classList.remove("hidden");
  renderCatchers();
};

const renderCatchers = () => {
  const store = JSON.parse(localStorage.getItem("catchers") || "[]");
  if (!store.length) {
    drawerContent.innerHTML = `<div class="text-slate-300">No saved catchers yet.</div>`;
    return;
  }
  const list = document.createElement("div");
  list.className = "space-y-3";
  store
    .slice()
    .reverse()
    .forEach((c, idx) => {
      const card = document.createElement("div");
      card.className = "rounded-2xl border border-slate-800 p-3 flex items-center gap-3";
      const img = document.createElement("img");
      img.className = "w-16 h-16 object-contain";
      img.src = homeImg(c.varietyId, c.shiny);
      img.onerror = () => { img.src = artworkImg(c.varietyId); };
      const info = document.createElement("div");
      info.className = "flex-1";
      const title = c.nickname ? `${c.nickname} • ${c.varietyName}` : c.varietyName;
      info.innerHTML = `
        <div class="font-semibold capitalize">${title}</div>
        <div class="text-sm text-slate-300">Lv. ${c.level} • ${c.gender} • ${c.nature || "no nature"} • ${c.item || "no item"}</div>
      `;
      const del = document.createElement("button");
      del.className = "px-3 py-1 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10";
      del.textContent = "Delete";
      del.addEventListener("click", ()=>{
        const all = JSON.parse(localStorage.getItem("catchers") || "[]");
        const indexFromEnd = idx;
        const trueIndex = all.length - 1 - indexFromEnd;
        all.splice(trueIndex,1);
        localStorage.setItem("catchers", JSON.stringify(all));
        renderCatchers();
      });
      card.appendChild(img);
      card.appendChild(info);
      card.appendChild(del);
      list.appendChild(card);
    });
  drawerContent.innerHTML = "";
  drawerContent.appendChild(list);
};

search.addEventListener("input", debounce((e)=>{
  const q = normalize(e.target.value.trim());
  if (!q) return render(all);
  const isNum = /^\d+$/.test(q);
  const filtered = all.filter((p) =>
    isNum ? String(p.id).startsWith(q) : normalize(p.name).includes(q)
  );
  render(filtered);
},150));

loadList();
