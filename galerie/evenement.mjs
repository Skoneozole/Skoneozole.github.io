function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  sidebar.classList.toggle('collapsed');
  content.classList.toggle('shifted');
  const toggleBtn = document.querySelector('.toggle-btn');
  toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✖';
}

toggleSidebar();

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('content');
  if (!content) return;

  // Récupère la liste des events et images depuis archive.json (clé "eventImage")
  let eventImages = [];
  try {
    const response = await fetch('../../infos/archive.json');
    const data = await response.json();
    eventImages = data.eventImage || [];
  } catch (e) {
    console.error("Erreur lors du chargement de archive.json :", e);
    content.innerHTML = "<p>Erreur lors du chargement des événements.</p>";
    return;
  }

  // Récupère la liste des events depuis event.json
  let events = [];
  try {
    const response = await fetch('../../infos/event.json');
    const data = await response.json();
    events = data.event || [];
  } catch (e) {
    console.error("Erreur lors du chargement de event.json :", e);
    content.innerHTML = "<p>Erreur lors du chargement des événements.</p>";
    return;
  }

  // Associe chaque event à ses images (par nom)
  // On ne garde que les events qui ont au moins une image
  const eventsWithImages = events.filter(ev => eventImages.some(img => img.event === ev.nom));

  if (eventsWithImages.length === 0) {
    content.innerHTML = "<p>Aucun événement avec des images à afficher.</p>";
    return;
  }

  // Affiche la liste des événements avec images
  content.innerHTML = '<h2 style="text-align:center;margin:30px 0 10px 0;">Événements avec images</h2>';

  // Ajout du bouton retour à la galerie (au-dessus de la grille)
  const backToGalleryBtn = document.createElement('button');
  backToGalleryBtn.textContent = '← Retour à la galerie';
  backToGalleryBtn.style.margin = '0 0 24px 0';
  backToGalleryBtn.style.padding = '8px 16px';
  backToGalleryBtn.style.fontSize = '1em';
  backToGalleryBtn.style.borderRadius = '8px';
  backToGalleryBtn.style.border = '1px solid #ccc';
  backToGalleryBtn.style.cursor = 'pointer';
  backToGalleryBtn.style.background = '#f7f7f7';
  backToGalleryBtn.addEventListener('mouseenter', () => backToGalleryBtn.style.background = '#e0e0e0');
  backToGalleryBtn.addEventListener('mouseleave', () => backToGalleryBtn.style.background = '#f7f7f7');
  backToGalleryBtn.addEventListener('click', () => {
    window.location.href = '../galerie.html';
  });
  content.appendChild(backToGalleryBtn);

  // Ajout de la barre de recherche
  const searchDiv = document.createElement('div');
  searchDiv.style.display = 'flex';
  searchDiv.style.justifyContent = 'center';
  searchDiv.style.marginBottom = '24px';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Rechercher un événement...';
  searchInput.style.fontSize = '1.1em';
  searchInput.style.padding = '10px 18px';
  searchInput.style.borderRadius = '8px';
  searchInput.style.border = '1px solid #ccc';
  searchInput.style.width = '320px';
  searchDiv.appendChild(searchInput);
  content.appendChild(searchDiv);

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
  grid.style.maxWidth = '900px';
  grid.style.margin = '0 auto 40px auto';
  grid.style.gap = '32px';
  grid.style.justifyContent = 'center';

  function renderGrid(filteredEvents) {
    grid.innerHTML = '';
    filteredEvents.forEach(event => {
      const card = document.createElement('div');
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'center';
      card.style.width = '180px';
      card.style.background = '#fff';
      card.style.borderRadius = '14px';
      card.style.boxShadow = '0 2px 12px #0001';
      card.style.padding = '18px 12px 16px 12px';
      card.style.transition = 'box-shadow 0.18s';
      card.style.cursor = 'pointer';
      card.addEventListener('mouseenter', () => card.style.boxShadow = '0 4px 24px #0002');
      card.addEventListener('mouseleave', () => card.style.boxShadow = '0 2px 12px #0001');

      // Affiche l'image de l'event (pas la galerie)
      let imgSrc = '';
      if (event.img_local) {
        imgSrc = '../../infos/image/' + event.image.replace(/^.*[\\\/]/, '');
      } else {
        imgSrc = event.image;
      }
      if (imgSrc) {
        const preview = document.createElement('img');
        preview.src = imgSrc;
        preview.alt = event.nom;
        preview.style.width = '100%';
        preview.style.height = '120px';
        preview.style.objectFit = 'cover';
        preview.style.borderRadius = '10px';
        preview.style.marginBottom = '14px';
        card.appendChild(preview);
      }
      const btn = document.createElement('button');
      btn.textContent = event.nom;
      btn.style.padding = '10px 18px';
      btn.style.fontSize = '1.1em';
      btn.style.borderRadius = '8px';
      btn.style.border = '1px solid #ccc';
      btn.style.cursor = 'pointer';
      btn.style.background = '#f7f7f7';
      btn.style.transition = 'background 0.15s';
      btn.addEventListener('mouseenter', () => btn.style.background = '#e0e0e0');
      btn.addEventListener('mouseleave', () => btn.style.background = '#f7f7f7');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showEventGallery(event);
      });
      card.appendChild(btn);
      grid.appendChild(card);
    });
  }

  renderGrid(eventsWithImages);
  content.appendChild(grid);

  // Recherche dynamique
  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim().toLowerCase();
    const filtered = eventsWithImages.filter(ev => ev.nom.toLowerCase().includes(val));
    renderGrid(filtered);
  });

  // Fonction d'affichage de la galerie d'un événement
  function showEventGallery(event) {
    content.innerHTML = '';
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'flex-start';
    container.style.gap = '40px';
    container.style.margin = '40px auto';
    container.style.maxWidth = '1100px';

    // Images associées à cet event
    const images = eventImages.filter(img => img.event === event.nom);

    function getImgSrc(img) {
      if (img.local) {
        return 'images/' + img.nom;
      } else {
        return img.lien;
      }
    }

    // Grande image principale
    const mainImg = document.createElement('img');
    mainImg.src = getImgSrc(images[0]);
    mainImg.alt = images[0].nom;
    mainImg.style.width = '520px';
    mainImg.style.maxWidth = '40vw';
    mainImg.style.height = 'auto';
    mainImg.style.borderRadius = '18px';
    mainImg.style.boxShadow = '0 4px 24px #0002';
    mainImg.style.objectFit = 'contain';
    mainImg.style.background = '#fff';
    mainImg.style.transition = '0.2s';

    // Colonne de miniatures
    const thumbs = document.createElement('div');
    thumbs.style.display = 'flex';
    thumbs.style.flexDirection = 'column';
    thumbs.style.gap = '18px';
    thumbs.style.maxHeight = '80vh';
    thumbs.style.overflowY = 'auto';

    images.forEach(img => {
      const thumb = document.createElement('img');
      thumb.src = getImgSrc(img);
      thumb.alt = img.nom;
      thumb.style.width = '110px';
      thumb.style.height = '80px';
      thumb.style.objectFit = 'cover';
      thumb.style.borderRadius = '10px';
      thumb.style.cursor = 'pointer';
      thumb.style.boxShadow = '0 2px 8px #0001';
      thumb.style.background = '#fff';
      thumb.style.transition = '0.15s';
      thumb.addEventListener('click', () => {
        mainImg.src = thumb.src;
        mainImg.alt = thumb.alt;
        mainImg.style.transform = 'scale(1.04)';
        setTimeout(() => mainImg.style.transform = '', 180);
      });
      thumbs.appendChild(thumb);
    });

    container.appendChild(mainImg);
    container.appendChild(thumbs);

    // Bouton retour
    const backBtn = document.createElement('button');
    backBtn.textContent = "← Retour à la liste";
    backBtn.style.margin = '20px 0 0 20px';
    backBtn.style.padding = '8px 16px';
    backBtn.style.fontSize = '1em';
    backBtn.style.borderRadius = '8px';
    backBtn.style.border = '1px solid #ccc';
    backBtn.style.cursor = 'pointer';
    backBtn.style.background = '#f7f7f7';
    backBtn.addEventListener('mouseenter', () => backBtn.style.background = '#e0e0e0');
    backBtn.addEventListener('mouseleave', () => backBtn.style.background = '#f7f7f7');
    backBtn.addEventListener('click', () => {
      content.innerHTML = '';
      // Recharge la barre de recherche et la grille
      content.innerHTML = '<h2 style="text-align:center;margin:30px 0 10px 0;">Événements avec images</h2>';
      content.appendChild(searchDiv);
      renderGrid(eventsWithImages);
      content.appendChild(grid);
    });

    content.innerHTML = `<h2 style="text-align:center;margin:30px 0 10px 0;">${event.nom}</h2>`;
    content.appendChild(backBtn);
    content.appendChild(container);
  }
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