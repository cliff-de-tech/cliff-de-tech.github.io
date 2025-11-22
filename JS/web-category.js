document.addEventListener('DOMContentLoaded', function() {
  const webCategoryCard = document.querySelector('.portfolio-category-card[data-category="web"]');
  const backBtn = document.getElementById('backToCategoriesBtn');
  
  // This logic is technically redundant if main.js handles the portfolio filtering
  // But kept here as a fallback or specific handler if separated
  if (webCategoryCard) {
    webCategoryCard.addEventListener('click', function() {
      const webLayout = document.querySelector('.web-vertical-layout');
      if (webLayout) {
        webLayout.classList.add('active');
      }
    });
  }
  
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      const webLayout = document.querySelector('.web-vertical-layout');
      if (webLayout) {
        webLayout.classList.remove('active');
      }
    });
  }
});