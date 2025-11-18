document.addEventListener('DOMContentLoaded', function() {
  const webCategoryCard = document.querySelector('.portfolio-category-card[data-category="web"]');
  const backBtn = document.getElementById('backToCategoriesBtn');
  
  if (webCategoryCard) {
    webCategoryCard.addEventListener('click', function() {
      const webLayout = document.querySelector('.web-vertical-layout');
      if (webLayout) {
        webLayout.style.display = 'flex';
      }
    });
  }
  
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      const webLayout = document.querySelector('.web-vertical-layout');
      if (webLayout) {
        webLayout.style.display = 'none';
      }
    });
  }
});
