// Web Design Image Auto Scroll Effect
(function() {
  'use strict';
  
  document.addEventListener('mouseenter', function(e) {
    if (!e.target.closest('.web-item')) return;
    
    const item = e.target.closest('.web-item');
    const image = item.querySelector('.scroll-image');
    if (!image) return;
    
    image.onload = function() {
      const containerHeight = item.clientHeight;
      const imageHeight = image.offsetHeight;
      const scrollDistance = imageHeight - containerHeight;
      
      if (scrollDistance > 0) {
        image.style.transition = 'top 20s linear';
        image.style.top = `-${scrollDistance}px`;
      }
    };
    
    if (image.complete) {
      const containerHeight = item.clientHeight;
      const imageHeight = image.offsetHeight;
      const scrollDistance = imageHeight - containerHeight;
      
      if (scrollDistance > 0) {
        image.style.transition = 'top 20s linear';
        image.style.top = `-${scrollDistance}px`;
      }
    }
  }, true);
  
  document.addEventListener('mouseleave', function(e) {
    if (!e.target.closest('.web-item')) return;
    
    const item = e.target.closest('.web-item');
    const image = item.querySelector('.scroll-image');
    if (!image) return;
    
    image.style.transition = 'top 12s ease';
    image.style.top = '0px';
  }, true);
})();
