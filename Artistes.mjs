// === Variables globales ===
let artistes = [];
let filteredArtistes = [];
let searchValue = '';
let alphaOrder = 1; // 1 = A-Z, -1 = Z-A
let tarifOrder = 0; // 0 = aucun, 1 = croissant, -1 = décroissant

const contentDiv = document.getElementById('content');

// === Fonctions utilitaires ===
async function fetchtest(path) {
  try {
    const username = 'Skoneozole';
    const repo     = 'testUwULamas';
    const apiUrl   = `https://api.github.com/repos/${username}/${repo}/contents/${encodeURIComponent(path)}`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const file    = await response.json();
    const content = atob(file.content);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching data:', error);
    return {};
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  sidebar.classList.toggle('collapsed');
  content.classList.toggle('shifted');
  const toggleBtn = document.querySelector('.toggle-btn');
  toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✖';
}

// === Affichage barre de recherche et filtres ===
function renderSearchAndFilters() {
  // Vérifie si la barre existe déjà
  let searchBar = document.getElementById('artist-search-bar');
  let listDiv = document.getElementById('artist-list');
  if (!searchBar) {
    // Crée la barre de recherche et le bouton menu déroulant
    const wrapper = document.createElement('div');
    wrapper.className = 'artist-search-bar';
    wrapper.id = 'artist-search-bar';
    wrapper.style.display = 'flex';
    wrapper.style.gap = '10px';
    wrapper.style.alignItems = 'center';
    wrapper.style.margin = '30px 0 20px 0'; // espace sous header
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.background = 'transparent';
    wrapper.style.position = 'relative';
    wrapper.style.zIndex = '2';
    wrapper.style.justifyContent = 'center'; // Ajout pour centrer la barre
    wrapper.innerHTML = `
      <input id="artist-search" type="text" placeholder="Rechercher un artiste..." style="flex:1;min-width:180px;max-width:300px;padding:6px;">
      <button id="filter-menu-btn" style="background:#304ffe;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-weight:bold;cursor:pointer;min-width:40px;">☰</button>
      <div id="filter-menu" style="display:none;position:absolute;right:0;top:45px;background:#fff;border:1px solid #ccc;border-radius:8px;box-shadow:0 2px 8px #0002;padding:0;min-width:140px;z-index:10;">
        <button class="filter-option" data-filter="alpha-plus" style="width:100%;padding:10px 16px;border:none;background:none;text-align:left;cursor:pointer;">A → Z</button>
        <button class="filter-option" data-filter="alpha-minus" style="width:100%;padding:10px 16px;border:none;background:none;text-align:left;cursor:pointer;">Z → A</button>
        <button class="filter-option" data-filter="tarif-plus" style="width:100%;padding:10px 16px;border:none;background:none;text-align:left;cursor:pointer;">Tarif +</button>
        <button class="filter-option" data-filter="tarif-minus" style="width:100%;padding:10px 16px;border:none;background:none;text-align:left;cursor:pointer;">Tarif -</button>
      </div>
    `;
    contentDiv.prepend(wrapper);
    // Ajoute la div de liste si absente
    if (!listDiv) {
      listDiv = document.createElement('div');
      listDiv.id = 'artist-list';
      contentDiv.appendChild(listDiv);
    }
    document.getElementById('artist-search').addEventListener('input', e => {
      searchValue = e.target.value;
      filterAndRender();
    });
    // Gestion du menu déroulant
    const menuBtn = document.getElementById('filter-menu-btn');
    const menu    = document.getElementById('filter-menu');
    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
    // Ferme le menu si on clique ailleurs
    document.addEventListener('click', () => { menu.style.display = 'none'; });
    menu.addEventListener('click', e => { e.stopPropagation(); });
    // Actions sur les filtres
    menu.querySelectorAll('.filter-option').forEach(btn => {
      btn.addEventListener('click', e => {
        const filter = btn.getAttribute('data-filter');
        if (filter === 'alpha-plus') { alphaOrder = 1; tarifOrder = 0; }
        if (filter === 'alpha-minus') { alphaOrder = -1; tarifOrder = 0; }
        if (filter === 'tarif-plus') { tarifOrder = 1; alphaOrder = 0; }
        if (filter === 'tarif-minus') { tarifOrder = -1; alphaOrder = 0; }
        filterAndRender();
        menu.style.display = 'none';
      });
    });
  }
}

// === Filtrage et tri ===
function filterAndRender() {
  filteredArtistes = artistes.filter(a => {
    const nom = (a.nom || '').toLowerCase();
    const scene = (a['Nom de scene'] || '').toLowerCase();
    return nom.includes(searchValue.toLowerCase()) || scene.includes(searchValue.toLowerCase());
  });
  if (alphaOrder !== 0) {
    filteredArtistes.sort((a, b) => {
      const n1 = (a['Nom de scene'] || '').toLowerCase();
      const n2 = (b['Nom de scene'] || '').toLowerCase();
      return n1.localeCompare(n2) * alphaOrder;
    });
  } else if (tarifOrder !== 0) {
    filteredArtistes.sort((a, b) => {
      const t1 = parseFloat(a.tarif) || 0;
      const t2 = parseFloat(b.tarif) || 0;
      return (t1 - t2) * tarifOrder;
    });
  }
  renderArtistList();
}

// === Affichage de la liste d'artistes (3 par ligne) ===
function renderArtistList() {
  const listDiv = document.getElementById('artist-list');
  if (!listDiv) return;
  if (!filteredArtistes.length) {
    listDiv.innerHTML = '<p style="color:#888">Aucun artiste trouvé.</p>';
    return;
  }
  let html = '<div style="display:flex;flex-wrap:wrap;gap:20px;">';
  filteredArtistes.forEach((a, i) => {
    html += `
      <div class="artist-card" style="flex:1 1 calc(33% - 20px);max-width:calc(33% - 20px);background:#f8f8f8;border-radius:10px;padding:16px;box-shadow:0 2px 8px #0001;display:flex;flex-direction:column;align-items:center;min-width:220px;">
        <img src="${a.image}" alt="${a['Nom de scene']}" style="width:100px;height:100px;object-fit:cover;border-radius:50%;margin-bottom:10px;">
        <h3 style="margin:0 0 6px 0;">${a['Nom de scene'] || a.nom}</h3>
        <div style="font-size:0.95em;color:#666;margin-bottom:8px;">${a.ville || ''}</div>
        <div style="font-size:0.95em;margin-bottom:8px;">${a.desc || ''}</div>
        <div style="font-weight:bold;margin-bottom:8px;">Tarif: ${a.tarif ? a.tarif + '€' : 'N.C.'}</div>
      </div>
    `;
  });
  html += '</div>';
  listDiv.innerHTML = html;
}

// === Initialisation ===
async function main() {
  toggleSidebar();
  renderSearchAndFilters();
  const data = await fetchtest('artiste.json');
  artistes = Array.isArray(data.Artiste) ? data.Artiste : [];
  // Appelle filterAndRender seulement après que la barre et la div liste existent
  setTimeout(() => filterAndRender(), 0);
}

main();
