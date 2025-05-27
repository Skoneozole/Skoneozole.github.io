// script.mjs

const contentDiv = document.querySelector('.content-body');
const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril',
  'Mai', 'Juin', 'Juillet', 'Août',
  'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

let currentMonth = new Date().getMonth();
let currentYear  = new Date().getFullYear();
const RICKROLL   = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('sidebar')?.classList.add('collapsed');
  document.getElementById('content')?.classList.add('shifted');

  fetchAndDisplayDescription();
  fetchEvents();

  window.addEventListener('resize', fetchEvents);
});

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  sidebar.classList.toggle('collapsed');
  content.classList.toggle('shifted');

  const toggleBtn = document.querySelector('.toggle-btn');
  toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✖';
}

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

function fetchEvents() {
  const isMobile = window.innerWidth <= 768;
  const scrollY = window.scrollY;
  contentDiv.innerHTML = '';
  fetchtest('event.json').then(data => {
    let monthGroups = isMobile
      ? [{ month: currentMonth, year: currentYear, events: [] }]
      : Array.from({ length: 3 }, (_, i) => {
          const m = currentMonth + i;
          return {
            month: m % 12,
            year: currentYear + Math.floor(m / 12),
            events: []
          };
        });
    (data.event || []).forEach(event => {
      const d = new Date(event.date);
      monthGroups.forEach(group => {
        if (d.getMonth() === group.month && d.getFullYear() === group.year) {
          group.events.push(event);
        }
      });
    });
    const monthsContainer = document.createElement('div');
    monthsContainer.className = 'months-container';
    monthGroups.forEach(group => {
      const col = document.createElement('div');
      col.className = 'month-column';
      const title = document.createElement('h2');
      title.textContent = `${monthNames[group.month]} ${group.year}`;
      title.className = 'month-title';
      col.appendChild(title);
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'events-container';
      group.events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
          <h3>${event.nom}</h3>
          <img src="infos/image/${event.image}" alt="${event.nom}" loading="lazy">
          <p class="event-date">${new Date(event.date).toLocaleDateString('fr-FR')}</p>
          <p class="event-desc">${fixEncoding(event.desc || '')}</p>
        `;
        card.addEventListener('click', () => {
          window.open(RICKROLL, '_blank');
        });
        eventsContainer.appendChild(card);
      });
      col.appendChild(eventsContainer);
      monthsContainer.appendChild(col);
    });
    contentDiv.appendChild(monthsContainer);
    window.scrollTo({ top: scrollY, behavior: 'instant' });
  }).catch(error => {
    console.error('Error displaying events:', error);
    contentDiv.innerHTML = '<p class="error">Erreur de chargement des événements</p>';
  });
}

function fetchAndDisplayDescription() {
  fetchtest('desc.json')
    .then(data => {
      const descDiv = document.getElementById('desc');
      descDiv.innerHTML = `
        <h2>${data.titre}</h2>
        <div class="description">
          ${fixEncoding(data.description).replace(/\n/g, '<br>')}
        </div>
      `;
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('desc').innerHTML =
        '<p class="error">Description temporairement indisponible</p>';
    });
}

function mois(delta, event) {
  if (event) event.preventDefault();

  currentMonth += delta;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }

  fetchEvents();
}

function fixEncoding(text) {
  return decodeURIComponent(escape(text));
}
