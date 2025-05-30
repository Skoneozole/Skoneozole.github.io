// Fonction pour basculer la visibilité de la barre latérale
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

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
});

toggleSidebar(); // Appel initial pour s'assurer que la barre latérale est cachée au chargement

// Affichage centré du nom et de la photo de l'artiste
async function afficherArtisteCentre() {
    // Récupère le paramètre "nom" dans l'URL
    const params = new URLSearchParams(window.location.search);
    const nomParam = params.get('nom');
    if (!nomParam) return;
    // Charge les artistes
    const res = await fetch('infos/artiste.json');
    const data = await res.json();
    const artistes = Array.isArray(data.Artiste) ? data.Artiste : [];
    // Cherche l'artiste
    const artiste = artistes.find(a => (a['Nom de scene'] || a.nom || '').toLowerCase() === nomParam.toLowerCase());
    if (!artiste) return;
    // Génère la liste des contacts non vides, en ligne
    let contactsHtml = '';
    const contacts = [];
    for (let i = 1; i <= 6; i++) {
        const label = artiste[`conta${i}`];
        const lien = artiste[`lien${i}`];
        if (label && label.trim() !== '') {
            let favicon = '';
            if (lien && lien.trim() !== '') {
                try {
                    const url = new URL(lien);
                    const domain = url.origin;
                    favicon = `<img src='${domain}/favicon.ico' alt='' style='width:18px;height:18px;vertical-align:middle;margin-right:6px;border-radius:3px;box-shadow:0 1px 4px #0002;'>`;
                } catch (e) { favicon = ''; }
                contacts.push(`<span style='display:inline-flex;align-items:center;gap:4px;margin:0 12px 0 0;'>${favicon}<a href="${lien}" target="_blank" rel="noopener" style="color:#304ffe;text-decoration:underline;vertical-align:middle;">${label}</a></span>`);
            } else {
                contacts.push(`<span style='display:inline-flex;align-items:center;gap:4px;margin:0 12px 0 0;'>${label}</span>`);
            }
        }
    }
    if (contacts.length) {
        contactsHtml = `<div style='display:flex;flex-wrap:wrap;justify-content:center;align-items:center;margin-top:10px;gap:10px;'>${contacts.join('')}</div>`;
    }
    // Utilise la fonction markdownToHtml globale (script.mjs) si elle existe, sinon fallback
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
    // Affiche au centre
    const content = document.getElementById('content');
    content.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;">
        <h1 style="font-size:2.5em;text-align:center;margin-bottom:8px;">${artiste['Nom de scene'] || artiste.nom}</h1>
        <h1 style="font-size:1.5em;text-align:center;margin-bottom:14px;color:#219a52;">Tarif : ${artiste.tarif ? artiste.tarif + '€' : 'N.C.'}</h1>
        <img src="infos/image/${(artiste.image||'').replace(/^.*[\\\/]/, '')}" alt="${artiste['Nom de scene'] || artiste.nom}" style="max-width:500px;width:100%;border-radius:24px;box-shadow:0 4px 24px #0002;margin-bottom:12px;object-fit:cover;">
        ${contactsHtml}
        ${artiste.fulldesc ? `<div style='margin-top:28px;max-width:800px;text-align:center;font-size:1.35em;'>${mdToHtml(fixEncoding(artiste.fulldesc))}</div>` : ''}
      </div>
    `;
}

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

document.addEventListener('DOMContentLoaded', () => {
    afficherArtisteCentre();
});