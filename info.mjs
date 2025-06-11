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
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return {};
  }
}

function markdownToHtml(md, reseaux = [], desc = null) {
  // Titres
  md = md.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
  md = md.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
  md = md.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
  md = md.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  md = md.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  md = md.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  // Gras fort (****texte****) avec espaces tolérés
  md = md.replace(/\*\*\*\*\s*([^\*\n]+?)\s*\*\*\*\*/g, '<b>$1</b>');
  // Gras (**texte**) avec espaces tolérés
  md = md.replace(/\*\*\s*([^\*\n]+?)\s*\*\*/g, '<b>$1</b>');
  // Italique (*texte*)
  md = md.replace(/\*(?!\*)\s*([^\*\n]+?)\s*\*/g, '<i>$1</i>');
  // Mise en forme spéciale pour les réseaux (insensible à la casse)
  if (reseaux && reseaux.length) {
    reseaux.forEach(nom => {
      let lien = null;
      if (desc && Array.isArray(desc.contacts)) {
        const c = desc.contacts.find(c => c.nom.toLowerCase() === nom.toLowerCase());
        if (c && c.lien) lien = c.lien;
      }
      const regex = new RegExp(`(?<![\\w-])(${nom})(?![\\w-])`, 'gi');
      md = md.replace(regex, match => {
        const span = `<span style="color:#2196f3;background:#e3f2fd;font-style:italic;font-weight:bold;padding:0 3px;border-radius:3px;text-decoration:underline;text-decoration-color:#2196f3;">${match}</span>`;
        return lien ? `<a href="${lien}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">${span}</a>` : span;
      });
    });
  }
  // (optionnel) Sauts de ligne
  // md = md.replace(/\n/g, '<br>');
  return md;
}

async function afficherInfo() {
  // On charge les deux fichiers
  const [info, desc] = await Promise.all([
    fetchtest('infos/info.json'),
    fetchtest('infos/desc.json')
  ]);
  // On récupère la liste des réseaux (noms) depuis desc.json si présent
  let reseaux = [];
  if (desc && Array.isArray(desc.contacts)) {
    reseaux = desc.contacts.map(c => c.nom);
  }
  if (info.titre || info.description) {
    let html = '';
    if (info.titre) html += `<h2 style="margin-top:0.5em;">${info.titre}</h2>`;
    if (info.description) html += `<p style="font-size:1.1em;color:#444;">${markdownToHtml(info.description, reseaux, desc)}</p>`;
    newtext.innerHTML = html;
  }
}

newtext = document.getElementById('content');

fetchtest('infos/info.json').then(data => {
  if (data.titre || data.description) {
    let html = '';
    if (data.titre) html += `<h2 style="margin-top:0.5em;">${data.titre}</h2>`;
    if (data.description) html += `<p style="font-size:1.1em;color:#444;">${markdownToHtml(data.description)}</p>`;
    newtext.innerHTML = html;
  }
});

// Ajout du widget Discord flottant réductible à droite
(function() {
  const widgetWidth = 280;
  const widgetHeight = 380;
  const collapsedWidth = 40;
  const content = document.getElementById('content');

  // Création du conteneur
  const discordWidget = document.createElement('div');
  discordWidget.id = 'discord-widget-panel';
  discordWidget.style.position = 'fixed';
  discordWidget.style.top = '350px'; // Descend plus bas sous le header
  discordWidget.style.right = '0';
  discordWidget.style.transform = 'translateY(-50%)';
  discordWidget.style.width = widgetWidth + 'px';
  discordWidget.style.height = widgetHeight + 'px';
  discordWidget.style.background = 'rgba(36,37,38,0.98)';
  discordWidget.style.boxShadow = '-2px 0 16px #0002';
  discordWidget.style.borderRadius = '16px 0 0 16px';
  discordWidget.style.zIndex = '1000';
  discordWidget.style.display = 'flex';
  discordWidget.style.flexDirection = 'row';
  discordWidget.style.alignItems = 'center';
  discordWidget.style.transition = 'width 0.25s cubic-bezier(.4,2,.6,1), background 0.2s';

  // Bouton de réduction/extension
  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = '⮜';
  toggleBtn.title = 'Réduire Discord';
  toggleBtn.style.width = '36px';
  toggleBtn.style.height = '48px';
  toggleBtn.style.marginLeft = '0';
  toggleBtn.style.marginRight = '2px';
  toggleBtn.style.border = 'none';
  toggleBtn.style.background = '#23272a';
  toggleBtn.style.color = '#fff';
  toggleBtn.style.fontSize = '1.5em';
  toggleBtn.style.borderRadius = '12px 0 0 12px';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.position = 'absolute';
  toggleBtn.style.left = '-36px';
  toggleBtn.style.top = 'calc(50% - 24px)';
  toggleBtn.style.boxShadow = '-2px 0 8px #0002';
  toggleBtn.style.transition = 'background 0.2s';

  // Iframe Discord
  const iframe = document.createElement('iframe');
  iframe.src = 'https://discord.com/widget?id=1162480948403769374&theme=dark';
  iframe.width = (widgetWidth - 16) + '';
  iframe.height = (widgetHeight - 16) + '';
  iframe.allowTransparency = 'true';
  iframe.frameBorder = '0';
  iframe.sandbox = 'allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts';
  iframe.style.borderRadius = '12px';
  iframe.style.margin = '10px 0 10px 10px';
  iframe.style.boxShadow = '0 2px 12px #0002';
  iframe.style.background = 'transparent';

  discordWidget.appendChild(iframe);
  discordWidget.appendChild(toggleBtn);
  document.body.appendChild(discordWidget);

  // Décale le contenu pour ne pas passer sous le widget
  function setContentPadding(open) {
    if (content) content.style.paddingRight = open ? (widgetWidth + 24) + 'px' : '';
  }
  setContentPadding(true);

  // Gestion ouverture/fermeture
  let open = true;
  toggleBtn.onclick = function() {
    open = !open;
    if (!open) {
      discordWidget.style.width = collapsedWidth + 'px';
      discordWidget.style.background = 'transparent';
      iframe.style.display = 'none';
      toggleBtn.innerHTML = '⮞';
      toggleBtn.title = 'Afficher Discord';
      setContentPadding(false);
    } else {
      discordWidget.style.width = widgetWidth + 'px';
      discordWidget.style.background = 'rgba(36,37,38,0.98)';
      iframe.style.display = '';
      toggleBtn.innerHTML = '⮜';
      toggleBtn.title = 'Réduire Discord';
      setContentPadding(true);
    }
  };
})();

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

toggleSidebar(); // Initial call to set sidebar state

afficherInfo();