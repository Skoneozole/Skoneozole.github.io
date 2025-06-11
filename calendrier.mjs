const calendarContainer = document.getElementById('calendar-container');
const now       = new Date();
let   year      = now.getFullYear();
let   month     = now.getMonth();
const RICKROLL  = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

let allEvents = [];

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril',
  'Mai', 'Juin', 'Juillet', 'Août',
  'Septembre', 'Octobre', 'Novembre', 'Décembre'
];


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

async function fetchEvents() {
  try {
    const data = await fetchtest('infos/event.json');
    allEvents = Array.isArray(data.event) ? data.event : [];
    renderEverything();
  } catch (err) {
    console.error('Erreur chargement events', err);
    calendarContainer.innerHTML = '<p class="error">Erreur de chargement des événements</p>';
  }
}

function renderCalendar() {
  calendarContainer.style.display = 'block';
  calendarContainer.innerHTML = '';

  const calendarMain = document.createElement('div');
  calendarMain.className = 'calendar-main';

  const title = document.createElement('h2');
  title.className = 'calendar-title';
  title.textContent = `${monthNames[month]} ${year}`;
  calendarMain.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'calendar-grid';
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
  grid.style.gap = '4px';
  grid.style.marginTop = '10px';
  calendarMain.appendChild(grid);

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset      = (firstDay + 6) % 7;

  const prevMonthDays = new Date(year, month, 0).getDate();
  const totalBoxes = offset + daysInMonth;
  const boxesToAdd = totalBoxes % 7 === 0 ? 0 : 7 - (totalBoxes % 7);

  document.querySelectorAll('.event-popup').forEach(el => el.remove());

  for (let i = offset - 1; i >= 0; i--) {
    const day = document.createElement('div');
    day.className = 'calendar-day calendar-dimmed';
    day.textContent = prevMonthDays - i;
    day.style.color = '#aaa';
    grid.appendChild(day);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const matched = allEvents.filter(e => e.date === dateStr);

    const wrapper = document.createElement(matched.length ? 'a' : 'div');
    wrapper.className = 'calendar-day';
    wrapper.textContent = d;

    if (matched.length) {
      // Lien vers la page FullEvent
      const eventName = encodeURIComponent(matched[0].nom);
      wrapper.href = `FullEvent.html?nom=${eventName}`;
      wrapper.target = '';
      wrapper.classList.add('event');

      const popup = document.createElement('div');
      popup.className = 'event-popup';
      popup.style.display = 'none';
      popup.style.position = 'absolute';
      popup.style.background = '#fff';
      popup.style.border = '1px solid #ccc';
      popup.style.borderRadius = '8px';
      popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      popup.style.padding = '10px';
      popup.style.zIndex = '9999';

      const title = document.createElement('h4');
      title.textContent = matched[0].nom; // ← ← ← TITRE AJOUTÉ ICI
      popup.appendChild(title);

      // Gestion image locale/distante pour le popup
      let imgSrc = '';
      if (matched[0].img_local) {
        imgSrc = 'infos/image/' + matched[0].image.replace(/^.*[\\\/]/, '');
      } else {
        imgSrc = matched[0].image;
      }
      const image = document.createElement('img');
      image.src = imgSrc;
      image.style.width = '100px';
      image.style.height = 'auto';
      image.style.borderRadius = '4px';
      popup.appendChild(image);

      const desc = document.createElement('p');
      desc.textContent = matched[0].desc || '';
      desc.style.marginTop = '8px';
      popup.appendChild(desc);

      document.body.appendChild(popup);

      wrapper.addEventListener('mouseenter', e => {
        popup.style.display = 'block';
        positionPopup(e, popup);
      });
      wrapper.addEventListener('mousemove', e => {
        positionPopup(e, popup);
      });
      wrapper.addEventListener('mouseleave', () => {
        popup.style.display = 'none';
      });
    }

    grid.appendChild(wrapper);
  }

  for (let i = 1; i <= boxesToAdd; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day calendar-dimmed';
    day.textContent = i;
    day.style.color = '#aaa';
    grid.appendChild(day);
  }

  calendarContainer.appendChild(calendarMain);
}

function Events() {
  const futureDiv = document.getElementById('eventfuture');
  futureDiv.innerHTML = '';

  const monthGroups = [{
    month: month,
    year: year,
    events: []
  }];

  allEvents.forEach(event => {
    const d = new Date(event.date);
    monthGroups.forEach(group => {
      if (d.getMonth() === group.month && d.getFullYear() === group.year) {
        group.events.push(event);
      }
    });
  });

  monthGroups.forEach(group => {
    const section = document.createElement('section');
    section.className = 'month-group';

    const title = document.createElement('h2');
    title.textContent = `${monthNames[group.month]} ${group.year}`;
    section.appendChild(title);

    group.events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '5px';
      card.style.marginBottom = '20px';

      const header = document.createElement('h1');
      header.textContent = event.nom;
      card.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'event-grid';
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = '1fr 1fr';
      grid.style.alignItems = 'center';
      grid.style.gap = '10px';

      const desc = document.createElement('p');
      desc.className = 'event-desc';
      desc.textContent = fixEncoding(event.desc || '');
      desc.style.margin = '0';

      // Dans Events() aussi :
      let imgSrc2 = '';
      if (event.img_local) {
        imgSrc2 = 'infos/image/' + event.image.replace(/^.*[\\\/]/, '');
      } else {
        imgSrc2 = event.image;
      }
      const image = document.createElement('img');
      image.src = imgSrc2;
      image.alt = event.nom;
      image.style.maxWidth = '100%';
      image.style.borderRadius = '6px';

      grid.appendChild(desc);
      grid.appendChild(image);
      card.appendChild(grid);

      const date = document.createElement('p');
      date.className = 'event-date';
      date.textContent = new Date(event.date).toLocaleDateString('fr-FR');
      date.style.fontStyle = 'italic';

      card.appendChild(date);

      card.addEventListener('click', () => {
        window.location.href = `FullEvent.html?nom=${encodeURIComponent(event.nom)}`;
      });

      section.appendChild(card);
    });

    futureDiv.appendChild(section);
  });
}

function positionPopup(e, popup) {
  const offsetX = 15;
  const offsetY = 15;
  let left = e.pageX + offsetX;
  let top = e.pageY + offsetY;

  const popupRect = popup.getBoundingClientRect();
  if (left + popupRect.width > window.innerWidth) {
    left = e.pageX - popupRect.width - offsetX;
  }
  if (top + popupRect.height > window.innerHeight) {
    top = e.pageY - popupRect.height - offsetY;
  }

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

window.mois = function (delta) {
  month += delta;
  if (month < 0) {
    month = 11;
    year--;
  } else if (month > 11) {
    month = 0;
    year++;
  }
  renderEverything();
};

window.toggleSidebar = function () {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  sidebar.classList.toggle('collapsed');
  content.classList.toggle('shifted');

  const toggleBtn = document.querySelector('.toggle-btn');
  toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✖';
};

window.addEventListener('resize', () => {
  renderEverything();
});

function fixEncoding(text) {
  return decodeURIComponent(escape(text));
}

function checkMobileAndToggleCalendar() {
  const calendarMain = document.querySelector('.calendar-main');
  if (!calendarMain) return;

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    calendarMain.style.display = 'none';
  } else {
    calendarMain.style.display = 'block';
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

function renderEverything() {
  renderCalendar();
  Events();
  checkMobileAndToggleCalendar();
}

fetchEvents();
toggleSidebar();
