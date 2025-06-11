function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  sidebar.classList.toggle('collapsed');
  content.classList.toggle('shifted');
  const toggleBtn = document.querySelector('.toggle-btn');
  toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✖';
}

toggleSidebar();


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

// === Variables globales ===
let events = [];
let filteredEvents = [];
let searchValue = '';
let alphaOrder = 0; // 1 = A-Z, -1 = Z-A
let dateOrder = 0; // 1 = plus récent, -1 = plus ancien

const contentDiv = document.getElementById('content');

// Mélange un tableau (Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Affichage barre de recherche et filtres
function renderSearchAndFilters() {
  let searchBar = document.getElementById('event-search-bar');
  let listDiv = document.getElementById('event-list');
  if (!searchBar) {
    const wrapper = document.createElement('div');
    wrapper.className = 'event-search-bar';
    wrapper.id = 'event-search-bar';
    wrapper.style.display = 'flex';
    wrapper.style.gap = '10px';
    wrapper.style.alignItems = 'center';
    wrapper.style.margin = '30px 0 20px 0';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.background = 'transparent';
    wrapper.style.position = 'relative';
    wrapper.style.zIndex = '2';
    wrapper.style.justifyContent = 'center';
    wrapper.innerHTML = `
      <input id="event-search" type="text" placeholder="Rechercher un événement..." style="flex:1;min-width:180px;max-width:300px;padding:6px;">
      <button id="filter-menu-btn" style="background:#304ffe;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-weight:bold;cursor:pointer;min-width:40px;">☰</button>
      <div id="filter-menu" style="display:none;position:absolute;right:0;top:45px;background:#fff;border:1px solid #ccc;border-radius:8px;box-shadow:0 2px 8px #0002;padding:0;min-width:140px;z-index:10;">
        <button class="filter-option" data-filter="alpha-plus" style="width:100%;padding:10px 16px;border:none;background:none;text-align:left;cursor:pointer;">A → Z</button>
        <button class="filter-option" data-filter="alpha-minus" style="width:100%;padding:10px 16px;border:none;background:none;text-align:left;cursor:pointer;">Z → A</button>
        <button class="filter-option" data-filter="date-plus" style="width:100%;padding:10px 16px;border:none;background:none;text-align:left;cursor:pointer;">Plus récent</button>
        <button class="filter-option" data-filter="date-minus" style="width:100%;padding:10px 16px;border:none;background:none;text-align:left;cursor:pointer;">Plus ancien</button>
        <button class="filter-option" data-filter="random" style="width:100%;padding:10px 16px;border:none;background:none;text-align:left;cursor:pointer;">Aléatoire</button>
      </div>
    `;
    contentDiv.prepend(wrapper);
    if (!listDiv) {
      listDiv = document.createElement('div');
      listDiv.id = 'event-list';
      contentDiv.appendChild(listDiv);
    }
    document.getElementById('event-search').addEventListener('input', e => {
      searchValue = e.target.value;
      filterAndRender();
    });
    const menuBtn = document.getElementById('filter-menu-btn');
    const menu    = document.getElementById('filter-menu');
    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', () => { menu.style.display = 'none'; });
    menu.addEventListener('click', e => { e.stopPropagation(); });
    menu.querySelectorAll('.filter-option').forEach(btn => {
      btn.addEventListener('click', e => {
        const filter = btn.getAttribute('data-filter');
        if (filter === 'alpha-plus') { alphaOrder = 1; dateOrder = 0; }
        if (filter === 'alpha-minus') { alphaOrder = -1; dateOrder = 0; }
        if (filter === 'date-plus') { dateOrder = 1; alphaOrder = 0; }
        if (filter === 'date-minus') { dateOrder = -1; alphaOrder = 0; }
        if (filter === 'random') { alphaOrder = 0; dateOrder = 0; shuffleArray(filteredEvents); renderEventList(); menu.style.display = 'none'; return; }
        filterAndRender();
        menu.style.display = 'none';
      });
    });
  }
}

// Cherche une image locale (infos/image/) correspondant à l'event
function getLocalImagePath(ev) {
  if (ev.img_local && ev.image) {
    // img_local true : image locale, on prend le nom du fichier à partir de l'URL ou du nom de l'event
    let fileName = '';
    if (ev.image.startsWith('http')) {
      // Récupère le nom du fichier à la fin de l'URL
      fileName = ev.image.split('/').pop();
    } else if (ev.image) {
      fileName = ev.image.replace(/^.*[\\\/]/, '');
    } else if (ev.nom) {
      fileName = (ev.nom || '').replace(/[^a-zA-Z0-9]/g, '_') + '.png';
    }
    if (window._allLocalImages && window._allLocalImages.includes(fileName)) {
      return 'infos/image/' + fileName;
    }
  }
  // img_local false ou pas trouvé : pas d'image locale
  return null;
}

// Retourne le chemin de l'image à afficher selon img_local, en vérifiant l'existence réelle du fichier local
async function getEventImageSrc(ev) {
  if (ev.img_local === true || ev.img_local === 'true') {
    let fileName = '';
    if (ev.image) {
      fileName = ev.image.split(/[\\\/]/).pop();
    } else if (ev.nom) {
      fileName = (ev.nom || '').replace(/[^a-zA-Z0-9]/g, '_') + '.png';
    }
    const localPath = 'infos/image/' + fileName;
    try {
      const resp = await fetch(localPath, { method: 'HEAD' });
      if (resp.ok) {
        return localPath;
      }
    } catch {}
    // Si l'image locale n'existe pas, fallback sur l'URL distante si présente
    return ev.image || '';
  } else if (ev.image) {
    return ev.image;
  } else {
    return '';
  }
}

async function renderEventList() {
  const listDiv = document.getElementById('event-list');
  if (!listDiv) return;
  if (!filteredEvents.length) {
    listDiv.innerHTML = '<p style="color:#888">Aucun événement trouvé.</p>';
    return;
  }
  let html = '<div style="display:flex;flex-wrap:wrap;gap:20px;">';
  for (const ev of filteredEvents) {
    let imgSrc = await getEventImageSrc(ev);
    const nomUrl = encodeURIComponent(ev.nom || '');
    html += `
      <a href="FullEvent.html?nom=${nomUrl}" style="text-decoration:none;color:inherit;flex:1 1 calc(33% - 20px);max-width:calc(33% - 20px);min-width:220px;">
        <div class="event-card" style="background:#f8f8f8;border-radius:10px;padding:16px;box-shadow:0 2px 8px #0001;display:flex;flex-direction:column;align-items:center;">
          ${imgSrc ? `<img src="${imgSrc}" alt="${ev.nom}" style="width:100px;height:100px;object-fit:cover;border-radius:50%;margin-bottom:10px;">` : ''}
          <h3 style="margin:0 0 6px 0;text-align:center;">${ev.nom}</h3>
          <div style="font-size:0.95em;color:#666;margin-bottom:8px;">${ev.date}</div>
          <div style="font-size:0.95em;margin-bottom:8px;text-align:center;">${ev.desc || ''}</div>
        </div>
      </a>
    `;
  }
  html += '</div>';
  listDiv.innerHTML = html;
}

// Filtrage et tri
async function filterAndRender() {
  filteredEvents = events.filter(ev => {
    const nom = (ev.nom || '').toLowerCase();
    const desc = (ev.desc || '').toLowerCase();
    return nom.includes(searchValue.toLowerCase()) || desc.includes(searchValue.toLowerCase());
  });
  if (alphaOrder !== 0) {
    filteredEvents.sort((a, b) => {
      const n1 = (a.nom || '').toLowerCase();
      const n2 = (b.nom || '').toLowerCase();
      return n1.localeCompare(n2) * alphaOrder;
    });
  } else if (dateOrder !== 0) {
    filteredEvents.sort((a, b) => {
      const d1 = new Date(a.date);
      const d2 = new Date(b.date);
      return (d1 - d2) * dateOrder * -1;
    });
  }
  await renderEventList();
}

// Initialisation
async function main() {
  // Récupère la liste des images locales une fois pour toutes
  if (!window._allLocalImages) {
    try {
      const resp = await fetch('infos/image/');
      if (resp.ok) {
        const text = await resp.text();
        window._allLocalImages = (text.match(/href="([^"]+\.png)"/g)||[]).map(x=>x.replace(/.*href="/,'').replace('"',''));
      } else {
        window._allLocalImages = [];
      }
    } catch {
      window._allLocalImages = [];
    }
  }
  const data = await fetchtest('infos/event.json');
  // Filtrer les événements passés (date < aujourd'hui)
  const today = new Date().toISOString().slice(0,10);
  events = Array.isArray(data.event) ? data.event.filter(ev => ev.date < today) : [];
  shuffleArray(events);
  renderSearchAndFilters();
  await filterAndRender();
}

main();

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
