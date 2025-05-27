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
    // On charge désormais depuis le dossier 'infos'
    const response = await fetch(`infos/${path}`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
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
    // Correction du chemin image : infos/image/nom_image.jpg
    let imagePath = a.image ? `infos/image/${a.image}` : '';
    html += `
      <div class="artist-card" style="flex:1 1 calc(33% - 20px);max-width:calc(33% - 20px);background:#f8f8f8;border-radius:10px;padding:16px;box-shadow:0 2px 8px #0001;display:flex;flex-direction:column;align-items:center;min-width:220px;">
        <img src="${imagePath}" alt="${a['Nom de scene']}" style="width:100px;height:100px;object-fit:cover;border-radius:50%;margin-bottom:10px;">
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

// === Carte interactive Leaflet.js ===
function addMapButton() {
  if (document.getElementById('artist-map-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'artist-map-btn';
  btn.textContent = 'Afficher la carte des artistes';
  btn.style = 'margin: 10px auto 20px auto; display: block; background: #304ffe; color: #fff; border: none; border-radius: 6px; padding: 10px 24px; font-size: 1.1em; font-weight: bold; cursor: pointer;';
  btn.onclick = showArtistMap;
  contentDiv.prepend(btn);
}

function showArtistMap() {
  // Supprime la carte précédente si elle existe
  let oldMap = document.getElementById('artist-map');
  if (oldMap) oldMap.remove();
  const mapDiv = document.createElement('div');
  mapDiv.id = 'artist-map';
  mapDiv.style = 'width: 100%; height: 600px; margin-bottom: 30px; border-radius: 12px; overflow: hidden;';
  contentDiv.prepend(mapDiv);

  // Ajoute Leaflet si pas déjà présent
  if (!window.L) {
    const leafletCss = document.createElement('link');
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCss);
    const leafletJs = document.createElement('script');
    leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletJs.onload = () => renderArtistMap();
    document.body.appendChild(leafletJs);
  } else {
    renderArtistMap();
  }
}

function renderArtistMap() {
  // Centrage France
  const map = L.map('artist-map').setView([46.6, 2.2], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18,
  }).addTo(map);

  artistes.forEach(a => {
    if (!a.lat || !a.lon || !a.image || !a.distance) return;
    const icon = L.icon({
      iconUrl: `infos/image/${a.image}`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      className: 'artist-map-icon',
    });
    const marker = L.marker([a.lat, a.lon], { icon }).addTo(map);
    marker.bindTooltip(a['Nom de scene'] || a.nom, { direction: 'top', offset: [0, -20] });
    let circle;
    marker.on('mouseover', () => {
      circle = L.circle([a.lat, a.lon], {
        radius: a.distance * 1000, // km -> m
        color: '#304ffe',
        fillColor: '#304ffe33',
        fillOpacity: 0.25,
      }).addTo(map);
    });
    marker.on('mouseout', () => {
      if (circle) map.removeLayer(circle);
    });
    marker.on('click', () => {
      L.popup()
        .setLatLng([a.lat, a.lon])
        .setContent(`
          <div style='text-align:center;'>
            <img src='infos/image/${a.image}' style='width:60px;height:60px;object-fit:cover;border-radius:50%;margin-bottom:8px;'><br>
            <b>${a['Nom de scene'] || a.nom}</b><br>
            <span style='color:#666;'>${a.ville || ''}</span><br>
            <span>Rayon : ${a.distance} km</span>
          </div>
        `)
        .openOn(map);
    });
  });
}

// === Initialisation ===
async function main() {
  toggleSidebar();
  renderSearchAndFilters();
  addMapButton();
  // Charger depuis infos/artiste.json
  const data = await fetchtest('artiste.json');
  artistes = Array.isArray(data.Artiste) ? data.Artiste : [];
  setTimeout(() => filterAndRender(), 0);
}

main();
