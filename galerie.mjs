function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  sidebar.classList.toggle('collapsed');
  content.classList.toggle('shifted');
  const toggleBtn = document.querySelector('.toggle-btn');
  toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✖';
}

toggleSidebar();

// Ajout de deux boutons principaux sur la galerie

document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  if (!content) return;

  // Conteneur centré
  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.justifyContent = 'center';
  btnContainer.style.alignItems = 'center';
  btnContainer.style.gap = '60px';
  btnContainer.style.margin = '60px 0 0 0';
  btnContainer.style.flexWrap = 'wrap';

  // Bouton Événement 🎉
  const eventBtn = document.createElement('a');
  eventBtn.href = 'galerie/evenement.html';
  eventBtn.style.display = 'flex';
  eventBtn.style.flexDirection = 'column';
  eventBtn.style.alignItems = 'center';
  eventBtn.style.justifyContent = 'center';
  eventBtn.style.background = '#304ffe';
  eventBtn.style.color = '#fff';
  eventBtn.style.borderRadius = '24px';
  eventBtn.style.padding = '40px 60px';
  eventBtn.style.fontSize = '3.5em';
  eventBtn.style.fontWeight = 'bold';
  eventBtn.style.textDecoration = 'none';
  eventBtn.style.boxShadow = '0 4px 24px #0002';
  eventBtn.style.transition = 'transform 0.15s';
  eventBtn.style.cursor = 'pointer';
  eventBtn.onmouseover = () => eventBtn.style.transform = 'scale(1.07)';
  eventBtn.onmouseout  = () => eventBtn.style.transform = '';
  eventBtn.innerHTML = '🎉<span style="font-size:0.4em;display:block;margin-top:12px;letter-spacing:2px;">Événements</span>';

  // Bouton Association (logo)
  const assoBtn = document.createElement('a');
  assoBtn.href = 'galerie/association.html';
  assoBtn.style.display = 'flex';
  assoBtn.style.flexDirection = 'column';
  assoBtn.style.alignItems = 'center';
  assoBtn.style.justifyContent = 'center';
  assoBtn.style.background = '#fff';
  assoBtn.style.color = '#222';
  assoBtn.style.borderRadius = '24px';
  assoBtn.style.padding = '40px 60px';
  assoBtn.style.fontSize = '2.5em';
  assoBtn.style.fontWeight = 'bold';
  assoBtn.style.textDecoration = 'none';
  assoBtn.style.boxShadow = '0 4px 24px #0002';
  assoBtn.style.transition = 'transform 0.15s';
  assoBtn.style.cursor = 'pointer';
  assoBtn.onmouseover = () => assoBtn.style.transform = 'scale(1.07)';
  assoBtn.onmouseout  = () => assoBtn.style.transform = '';
  assoBtn.innerHTML = '<img src="logo.png" alt="Association" style="width:90px;height:90px;object-fit:contain;margin-bottom:12px;">' +
    '<span style="font-size:0.4em;display:block;letter-spacing:2px;">Association</span>';

  btnContainer.appendChild(eventBtn);
  btnContainer.appendChild(assoBtn);
  content.innerHTML = '';
  content.appendChild(btnContainer);
});

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

