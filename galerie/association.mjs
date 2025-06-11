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
  // Affichage galerie d'images du dossier /galerie/assos façon "fenêtre 3"
  const content = document.getElementById('content');
  if (!content) return;

  // Récupère la liste des images depuis archive.json (clé "assosImage")
  let images = [];
  try {
    const response = await fetch('../../infos/archive.json');
    const data = await response.json();
    // Correction : la clé est "assosImage" (pas "assosimage")
    images = (data.assosImage || []);
  } catch (e) {
    console.error("Erreur lors du chargement de archive.json :", e);
    images = [];
  }

  if (images.length === 0) {
    content.innerHTML = "<p>Pas d'images à afficher.</p>";
    return;
  }

  // Style "fenêtre 3" : grande image à gauche, colonne de miniatures à droite
  content.innerHTML = '';
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'row';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'flex-start';
  container.style.gap = '40px';
  container.style.margin = '40px auto';
  container.style.maxWidth = '1100px';

  // Grande image principale
  function getImgSrc(img) {
    if (img.local) {
      return './images/' + img.nom;
    } else {
      return img.lien;
    }
  }
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
      // Animation zoom
      mainImg.style.transform = 'scale(1.04)';
      setTimeout(() => mainImg.style.transform = '', 180);
    });
    thumbs.appendChild(thumb);
  });

  container.appendChild(mainImg);
  container.appendChild(thumbs);

  // Bouton retour à la galerie
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

  content.innerHTML = '<h2 style="text-align:center;margin:30px 0 10px 0;">Photos de l’association</h2>';
  content.appendChild(backToGalleryBtn);
  content.appendChild(container);
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