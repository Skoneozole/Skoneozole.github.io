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
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return {};
  }
}

// Retourne le chemin de l'image à afficher selon img_local
function getArtistImageSrc(artiste) {
  if (artiste.img_local === true || artiste.img_local === 'true') {
    // Image locale (dans infos/image/)
    return 'infos/image/' + (artiste.image || '').replace(/^.*[\\\/]/, '');
  } else if (artiste.image) {
    // Image distante (URL)
    return artiste.image;
  } else {
    // Image par défaut
    return 'infos/image/default.png';
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
      <button id="show-map-btn" style="background:#43a047;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-weight:bold;cursor:pointer;min-width:40px;">Voir sur la carte</button>
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
    const nomUrl = encodeURIComponent(a['Nom de scene'] || a.nom || '');
    const imgSrc = getArtistImageSrc(a);
    html += `
      <a href="FullArtiste.html?nom=${nomUrl}" style="text-decoration:none;color:inherit;flex:1 1 calc(33% - 20px);max-width:calc(33% - 20px);min-width:220px;">
        <div class="artist-card" style="background:#f8f8f8;border-radius:10px;padding:16px;box-shadow:0 2px 8px #0001;display:flex;flex-direction:column;align-items:center;">
          <img src="${imgSrc}" alt="${a['Nom de scene']}" style="width:100px;height:100px;object-fit:cover;border-radius:50%;margin-bottom:10px;">
          <h3 style="margin:0 0 6px 0;">${a['Nom de scene'] || a.nom}</h3>
          <div style="font-size:0.95em;color:#666;margin-bottom:8px;">${a.ville || ''}</div>
          <div style="font-size:0.95em;margin-bottom:8px;">${a.desc || ''}</div>
          <div style="font-weight:bold;margin-bottom:8px;">Tarif: ${a.tarif ? a.tarif + '€' : 'N.C.'}</div>
        </div>
      </a>
    `;
  });
  html += '</div>';
  listDiv.innerHTML = html;
}

// === Initialisation ===
async function main() {
  toggleSidebar();
  renderSearchAndFilters();
  const data = await fetchtest('infos/artiste.json');
  artistes = Array.isArray(data.Artiste) ? data.Artiste : [];
  // Appelle filterAndRender seulement après que la barre et la div liste existent
  setTimeout(() => filterAndRender(), 0);
}

main();

// === Géocodage d'une ville (OpenStreetMap Nominatim) ===
async function geocodeCity(city) {
  if (!city) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', France')}`;
  try {
    const resp = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
    const data = await resp.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (e) { console.error('Erreur géocodage', city, e); }
  return null;
}

// === Affichage des artistes sur la carte ===
async function showArtistsOnMap() {
  const map = window._leafletMap;
  if (!map) return;
  if (window._artistMarkers) {
    window._artistMarkers.forEach(m => map.removeLayer(m));
  }
  window._artistMarkers = [];
  for (const artiste of artistes) {
    if (!artiste.ville) continue;
    if (!artiste._coords) {
      artiste._coords = await geocodeCity(artiste.ville);
    }
    if (artiste._coords) {
      const icon = L.icon({
        iconUrl: getArtistImageSrc(artiste),
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        className: 'artist-map-icon'
      });
      const marker = L.marker([artiste._coords.lat, artiste._coords.lon], { icon }).addTo(map);
      let circle = null;
      marker.on('mouseover', () => {
        // Rayon personnalisé par artiste (distance en km dans artiste.json)
        let rayon = 20000;
        if (artiste.distance !== undefined && artiste.distance !== null && artiste.distance !== "") {
          const parsed = parseFloat(artiste.distance);
          if (!isNaN(parsed)) rayon = parsed * 1000;
        }
        circle = L.circle([artiste._coords.lat, artiste._coords.lon], {
          radius: rayon,
          color: '#304ffe',
          fillColor: '#304ffe33',
          fillOpacity: 0.2
        }).addTo(map);
      });
      marker.on('mouseout', () => {
        if (circle) map.removeLayer(circle);
      });
      marker.bindTooltip(`<b>${artiste['Nom de scene'] || artiste.nom}</b><br>${artiste.ville || ''}`);
      window._artistMarkers.push(marker);
    }
  }
}

// === Ajout de la carte ===
    // Ajout de la div pour la carte (cachée par défaut)
    let mapDiv = document.getElementById('artist-map-modal');
    if (!mapDiv) {
      mapDiv = document.createElement('div');
      mapDiv.id = 'artist-map-modal';
      mapDiv.style.display = 'none';
      mapDiv.style.position = 'fixed';
      mapDiv.style.top = '0';
      mapDiv.style.left = '0';
      mapDiv.style.width = '100vw';
      mapDiv.style.height = '100vh';
      mapDiv.style.background = 'rgba(0,0,0,0.6)';
      mapDiv.style.zIndex = '1000';
      mapDiv.innerHTML = `
        <div id="artist-map-container" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80vw;height:80vh;background:#fff;border-radius:12px;box-shadow:0 4px 24px #0004;overflow:hidden;">
          <button id="close-map-btn" style="position:absolute;top:10px;right:10px;z-index:10;background:#e53935;color:#fff;border:none;border-radius:50%;width:36px;height:36px;font-size:1.3em;cursor:pointer;">✖</button>
          <input id="map-city-search" type="text" placeholder="Rechercher une ville..." style="position:absolute;top:10px;left:50px;z-index:10;padding:6px 12px;border-radius:6px;border:1px solid #ccc;min-width:200px;">
          <div id="map" style="width:100%;height:100%;"></div>
        </div>
      `;
      document.body.appendChild(mapDiv);
    }
    // Gestion du bouton "Voir sur la carte"
    document.getElementById('show-map-btn').onclick = async () => {
      const mapModal = document.getElementById('artist-map-modal');
      mapModal.style.display = 'block';
      setTimeout(async () => {
        if (!window._leafletMapInit) {
          window._leafletMapInit = true;
          const map = L.map('map').setView([46.603354, 1.888334], 6);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          window._leafletMap = map;
        } else {
          window._leafletMap.invalidateSize();
        }
        await showArtistsOnMap();
        setupMapDblClick();
      }, 200);
    };
    // Fermeture de la carte
    document.body.addEventListener('click', function(e) {
      if (e.target && (e.target.id === 'artist-map-modal' || e.target.id === 'close-map-btn')) {
        document.getElementById('artist-map-modal').style.display = 'none';
      }
    });
    // Recherche de ville sur la carte
    // (sera activée après l'init de la carte)
    // Double-clic sur la carte : filtrer les artistes dont le cercle couvre le point
    function setupMapDblClick() {
      if (window._leafletMap && !window._leafletMap._dblClickHandlerSet) {
        window._leafletMap.on('dblclick', async function(e) {
          const clickedLatLng = e.latlng;
          // Ajoute un point visuel sur la carte
          if (window._lastDblClickCircle) {
            window._leafletMap.removeLayer(window._lastDblClickCircle);
          }
          const dblClickCircle = L.circleMarker(clickedLatLng, {
            radius: 10,
            color: '#e53935',
            fillColor: '#e53935',
            fillOpacity: 0.8
          }).addTo(window._leafletMap);
          window._lastDblClickCircle = dblClickCircle;
          // Filtrage des artistes par zone
          const artistesDansZone = artistes.filter(a => {
            if (!a._coords) return false;
            // Rayon personnalisé par artiste (distance en km dans artiste.json)
            let rayon = 20000; // fallback 20km si non défini
            if (a.distance !== undefined && a.distance !== null && a.distance !== "") {
              const parsed = parseFloat(a.distance);
              if (!isNaN(parsed)) rayon = parsed * 1000;
            console.log(`Distance de l'artiste ${a.nom || a['Nom de scene'] || ''} :`, rayon, 'mètres');
            }
            const R = 6371000;
            const dLat = (clickedLatLng.lat - a._coords.lat) * Math.PI / 180;
            const dLon = (clickedLatLng.lng - a._coords.lon) * Math.PI / 180;
            const lat1 = a._coords.lat * Math.PI / 180;
            const lat2 = clickedLatLng.lat * Math.PI / 180;
            const aHav = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
            const c = 2 * Math.atan2(Math.sqrt(aHav), Math.sqrt(1-aHav));
            const dist = R * c;
            return dist <= rayon;
          });
          filteredArtistes = artistesDansZone;
          renderArtistList();
          // Ferme la carte après un court délai (ex: 600ms)
          setTimeout(() => {
            document.getElementById('artist-map-modal').style.display = 'none';
          }, 600);
        });
        window._leafletMap._dblClickHandlerSet = true;
      }
    }

function fixSidebarOnMobile() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  if (window.innerWidth <= 768) {
    sidebar.style.position = 'fixed';
    sidebar.style.top = '140px';
    sidebar.style.left = '0';
    sidebar.style.height = 'calc(100vh - 140px)';
    sidebar.style.zIndex = '1000';
  } else {
    sidebar.style.position = '';
    sidebar.style.top = '';
    sidebar.style.left = '';
    sidebar.style.height = '';
    sidebar.style.zIndex = '';
  }
}
window.addEventListener('resize', fixSidebarOnMobile);
window.addEventListener('DOMContentLoaded', fixSidebarOnMobile);
