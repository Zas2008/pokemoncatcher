const API = "https://pokeapi.co/api/v2/pokemon?limit=1025";
const homeImg = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
const artworkImg = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const count = document.getElementById("count");

const makeCard = ({ id, name }) => {
  const card = document.createElement("button");
  card.className = "group relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 transition-shadow shadow-lg shadow-slate-950/40 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const pad = String(id).padStart(4, "0");
  const title = document.createElement("div");
  title.className = "absolute left-0 right-0 top-0 px-3 pt-3 flex justify-between text-xs text-slate-400";
  title.innerHTML = `<span>#${pad}</span><span class="capitalize">${name}</span>`;

  const imgWrap = document.createElement("div");
  imgWrap.className = "aspect-square w-full grid place-items-center p-4";
  const img = document.createElement("img");
  img.src = homeImg(id);
  img.alt = name;
  img.loading = "lazy";
  img.className = "w-11/12 h-11/12 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-[1.03]";
  img.onerror = () => { if (img.src !== artworkImg(id)) img.src = artworkImg(id); };

  const glow = document.createElement("div");
  glow.className = "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity";
  glow.innerHTML = `<div class="absolute -inset-24 blur-3xl bg-indigo-500/10 rounded-full"></div>`;

  imgWrap.appendChild(img);
  card.appendChild(imgWrap);
  card.appendChild(title);
  card.appendChild(glow);
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

const normalize = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

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

grid.appendChild(makeSkeleton(30));
count.textContent = "Loading…";

let all = [];

fetch(API)
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

search.addEventListener(
  "input",
  debounce((e) => {
    const q = normalize(e.target.value.trim());
    if (!q) return render(all);
    const isNum = /^\d+$/.test(q);
    const filtered = all.filter((p) =>
      isNum ? String(p.id).startsWith(q) : normalize(p.name).includes(q)
    );
    render(filtered);
  }, 150)
);
