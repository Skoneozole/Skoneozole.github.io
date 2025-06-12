// Correction : ajoute la fonction fixEncoding si elle n'est pas déjà définie (copie de script.mjs)
function fixEncoding(text) {
  try {
    return decodeURIComponent(escape(text));
  } catch (e) {
    return text;
  }
}

// Correction : importe la fonction markdownToHtml depuis script.mjs si elle existe, sinon version locale minimale
const mdToHtml = (window.markdownToHtml || (typeof markdownToHtml === 'function' ? markdownToHtml : function(md) {
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
  return md;
}));

// Affichage centré de l'événement sélectionné
async function afficherEventCentre() {
    // Récupère le paramètre "nom" dans l'URL
    const params = new URLSearchParams(window.location.search);
    const nomParam = params.get('nom');
    if (!nomParam) return;
    // Charge les events
    const res = await fetch('infos/event.json');
    const data = await res.json();
    const events = Array.isArray(data.event) ? data.event : [];
    // Cherche l'event
    const event = events.find(e => (e.nom || '').toLowerCase() === nomParam.toLowerCase());
    if (!event) return;
    // Affiche au centre
    const content = document.getElementById('content');
    // Met à jour le titre de la page avec le nom de l'événement
    document.title = event.nom || 'Événement';
    // Gestion image locale/distante
    let imgSrc = '';
    if (event.img_local) {
        imgSrc = 'infos/image/' + (event.image||'').replace(/^.*[\\\/]/, '');
    } else {
        imgSrc = event.image;
    }
    content.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;">
        <h1 style="font-size:2.2em;text-align:center;margin-bottom:18px;">${event.nom}</h1>
        <img src="${imgSrc}" alt="${event.nom}" style="max-width:340px;width:100%;border-radius:24px;box-shadow:0 4px 24px #0002;margin-bottom:12px;object-fit:cover;">
        <div style='font-size:1.1em;color:#444;margin-bottom:8px;'>${new Date(event.date).toLocaleDateString('fr-FR')}</div>
        <div style='font-size:1em;max-width:600px;text-align:center;'>${mdToHtml(fixEncoding(event.fulldesc || ''))}</div>
      </div>
    `;
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

document.addEventListener('DOMContentLoaded', () => {
    // Sidebar toggle button (module-safe)
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const toggleBtn = document.querySelector('.toggle-btn');
    if (toggleBtn && sidebar && content) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            content.classList.toggle('shifted');
            toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✖';
        });
        // État initial : barre latérale repliée
        sidebar.classList.add('collapsed');
        content.classList.add('shifted');
        toggleBtn.textContent = '☰';
    }
    afficherEventCentre();
});

