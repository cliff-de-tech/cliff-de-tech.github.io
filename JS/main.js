/* ====== UTIL: helpers ====== */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// filepath: c:\Users\cliff\Desktop\My Website\JS\main.js
document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.querySelector('.menu-btn');
  const navUl = document.querySelector('.nav ul');

  if(menuBtn && navUl) {
    menuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      navUl.classList.toggle('open');
    });

    // Hide menu when clicking outside
    document.addEventListener('click', function(e) {
      if (navUl.classList.contains('open') && !navUl.contains(e.target) && e.target !== menuBtn) {
        navUl.classList.remove('open');
      }
    });

    // Hide menu when clicking a link
    navUl.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        navUl.classList.remove('open');
      });
    });
  }
});

/* ====== NAV: smooth active link ====== */
(function navEnhance(){
  const links = $$('.nav-link');
  // Correctly create sections array from links, filtering out nulls for links that don't match an ID
  const sections = links.map(a => {
    const href = a.getAttribute('href');
    try {
      return href.startsWith('#') ? $(href) : null;
    } catch (e) {
      // Catch invalid selectors which can happen with full URLs
      return null;
    }
  }).filter(Boolean); // remove nulls

  // active link on scroll
  if (sections.length > 0) {
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          links.forEach(a=>a.classList.remove('active'));
          const id = '#' + e.target.id;
          const current = links.find(a => a.getAttribute('href').endsWith(id));
          if(current) {
            current.classList.add('active');
            // also reflect in mobile menu if open
            $$('#mobileMenu a').forEach(a=>a.classList.toggle('active', a.getAttribute('href').endsWith(id)));
          }
        }
      });
    }, {threshold:.6});

    sections.forEach(s=> s && obs.observe(s));
  }
})();

/* ====== REVEAL ON SCROLL ====== */
(function reveal(){
  const els = $$('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.classList.add('visible');
      } else {
        en.target.classList.remove('visible');
      }
    })
  }, {threshold:.16});
  els.forEach(el=> io.observe(el));
})();

/* ====== HERO VIDEO ====== */
(function videoCard(){
  const play = $('#playVideo');
  const v = $('#introVideo');
  if(!play || !v) return;

  // Show play/pause text based on state
  function updateBtn() {
    if (v.paused) {
      play.style.display = 'inline-flex';
      play.innerHTML = '▶︎ <span>Watch Now 🗣</span>';
    } else {
      play.style.display = 'inline-flex';
      play.innerHTML = '⏸ <span>Pause Video</span>';
    }
  }

  play.addEventListener('click', ()=>{
    if(v.paused){
      v.muted = false;
      v.play().catch(()=>{});
    } else {
      v.pause();
    }
    updateBtn();
  });

  v.addEventListener('play', updateBtn);
  v.addEventListener('pause', updateBtn);
  v.addEventListener('ended', updateBtn);

  // Initialize button state
  updateBtn();
})();

// ====== SERVICES TABS FILTER ======
(function serviceTabs(){
  const tabBtns = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.service-card');
  if (tabBtns.length === 0) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      cards.forEach(card => {
        if (tab === 'all' || card.dataset.category === tab) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

/* ====== SERVICES: tiny tilt effect ====== */
(function tiltCards(){
  const cards = $$('[data-tilt]');
  const damp = 16;
  cards.forEach(card=>{
    let rect;
    const onMove = (e)=>{
      rect = rect || card.getBoundingClientRect();
      const x = (e.clientX - rect.left)/rect.width - .5;
      const y = (e.clientY - rect.top)/rect.height - .5;
      card.style.transform = `rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-4px)`;
    };
    const onLeave = ()=> card.style.transform = '';
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', ()=> rect = null, {passive:true});
    window.addEventListener('resize', ()=> rect = null);
  });
})();

/* ====== FOOTER YEAR ====== */
const yearEl = $('#year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

/* ====== ANIMATED BACKGROUND CANVAS ======
   Flowing particle field + dynamic connections.
   GPU-friendly, throttled for hidden tabs and honors prefers-reduced-motion. */
(function animatedBg(){
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', {alpha: true});
  let w, h, dpr, particles=[], mouse={x:null,y:null,active:false}, t=0, stopped=false;
  const maxParticles = 140; // auto scales with size below
  const connectDist = 120;
  
  // Define color variables that can be updated
  let colorA, colorB, colorC, lineColor;

  const pr = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(pr.matches){ stopped = true; return; }

  // Function to set colors based on the current theme
  function updateColors() {
    const isLight = document.body.classList.contains('light-theme');
    if (isLight) {
      colorA = [0,0,0]; // Black
      colorB = [50,50,50]; // Dark Grey
      colorC = [80,80,80]; // Lighter Grey
      lineColor = `rgba(0,0,0,`;
    } else {
      colorA = [123,220,255]; // Original Blue
      colorB = [155,123,255]; // Original Purple
      colorC = [55,255,177];  // Original Green
      lineColor = `rgba(180,210,255,`;
    }
  }

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    // initialize particles relative to viewport size
    const target = Math.min(maxParticles, Math.round((innerWidth*innerHeight)/18000));
    if(particles.length === 0){
      for(let i=0;i<target;i++) particles.push(new Particle());
    }else if(particles.length < target){
      const diff = target - particles.length;
      for(let i=0;i<diff;i++) particles.push(new Particle());
    }else if(particles.length > target){ particles.length = target; }
  }

  class Particle{
    constructor(){
      this.reset(true);
    }
    reset(seed=false){
      this.x = Math.random()*w;
      this.y = Math.random()*h;
      this.vx = (Math.random()-.5)*.2;
      this.vy = (Math.random()-.5)*.2;
      this.sz = (Math.random()*1.5 + .6)*dpr;
      this.hue = Math.random();
      if(seed){
        this.x = Math.random()*w; this.y = Math.random()*h;
      }
    }
    update(){
      // Simplex-like drift using sin/cos fields
      const ang = noise(this.x*.0008, this.y*.0008, t*.0003) * Math.PI*2;
      this.vx += Math.cos(ang)*.02;
      this.vy += Math.sin(ang)*.02;
      // mouse influence
      if(mouse.active){
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const dist2 = dx*dx + dy*dy;
        if(dist2 < (180*dpr)*(180*dpr)){
          const f = -30 / Math.max(60, dist2**.5);
          this.vx += (dx) * f * .02;
          this.vy += (dy) * f * .02;
        }
      }
      // damping + move
      this.vx *= .985; this.vy *= .985;
      this.x += this.vx; this.y += this.vy;
      // wrap
      if(this.x < 0) this.x += w; if(this.x > w) this.x -= w;
      if(this.y < 0) this.y += h; if(this.y > h) this.y -= h;
    }
    draw(){
      const grd = this.hue < .33 ? colorA : (this.hue < .66 ? colorB : colorC);
      ctx.fillStyle = `rgba(${grd[0]},${grd[1]},${grd[2]},0.75)`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.sz, 0, Math.PI*2); ctx.fill();
    }
  }

  // Lightweight value noise
  function noise(x,y,z){
    // hash-based pseudo noise
    const s = Math.sin(x*127.1 + y*311.7 + z*74.7) * 43758.5453;
    return s - Math.floor(s);
  }

  function drawConnections(){
    const cd2 = (connectDist*dpr)*(connectDist*dpr);
    for(let i=0;i<particles.length;i++){
      const p = particles[i];
      for(let j=i+1;j<particles.length;j++){
        const q = particles[j];
        const dx = p.x-q.x, dy=p.y-q.y;
        const d2 = dx*dx + dy*dy;
        if(d2 < cd2){
          const a = 1 - (d2/cd2);
          ctx.strokeStyle = lineColor + (a*.25) + ')';
          ctx.lineWidth = .8*dpr*a;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
  }

  function frame(){
    if(stopped) return;
    t += 16;
    ctx.clearRect(0,0,w,h);
    // faint vignette - only in dark mode
    if (!document.body.classList.contains('light-theme')) {
        const g = ctx.createRadialGradient(w*.8, h*.2, 0, w*.8, h*.2, Math.max(w,h)*.9);
        g.addColorStop(0, 'rgba(30,50,90,0.08)');
        g.addColorStop(1, 'rgba(5,8,12,0.02)');
        ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
    }

    for(const p of particles){ p.update(); p.draw(); }
    drawConnections();
    requestAnimationFrame(frame);
  }

  // Interaction
  window.addEventListener('mousemove', (e)=>{
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * dpr;
    mouse.y = (e.clientY - rect.top) * dpr;
    mouse.active = true;
    clearTimeout(mouse._t);
    mouse._t = setTimeout(()=> mouse.active=false, 2000);
  }, {passive:true});

  document.addEventListener('visibilitychange', ()=>{
    stopped = document.hidden || pr.matches;
    if(!stopped) frame();
  });

  // Observe theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        updateColors();
      }
    });
  });
  observer.observe(document.body, { attributes: true });

  window.addEventListener('resize', resize);
  
  // Initial setup
  updateColors();
  resize();
  frame();
})();

/* ====== ABOUT PAGE: READ MORE ====== */
(function readMore() {
    // Check if we are on the about page by looking for the specific cards
    if (!document.querySelector('.about-cards')) {
        return;
    }

    const readMoreBtns = document.querySelectorAll('.read-more-btn');

    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.about-card');
            if (card) {
                const content = card.querySelector('.about-card-right');
                content.classList.toggle('expanded');

                if (content.classList.contains('expanded')) {
                    btn.textContent = 'Read Less';
                } else {
                    btn.textContent = 'Read More';
                }
            }
        });
    });
})();


/* ====== ACCESSIBILITY TOUCHES ====== */
// Focus ring on keyboard users
(function focusVisible(){
  function handle(e){
    if(e.key === 'Tab'){ document.body.classList.add('show-focus'); window.removeEventListener('keydown', handle); }
  }
  window.addEventListener('keydown', handle);
})();

// Always start from home section on refresh
window.addEventListener('DOMContentLoaded', function() {
  if (window.location.hash) {
    window.history.replaceState(null, null, window.location.pathname + window.location.search);
    window.scrollTo(0, 0);
  }
});

// Scroll-to-top button logic - REMOVED
// WhatsApp button logic - REMOVED

/* ====== THEME TOGGLE ====== */
(function themeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;
  
  const body = document.body;
  const icon = toggleBtn.querySelector('i');

  // Function to apply the theme
  const applyTheme = (theme) => {
    if (theme === 'light') {
      body.classList.add('light-theme');
      if (icon) {
        icon.classList.remove('bxs-moon');
        icon.classList.add('bxs-sun');
      }
    } else {
      body.classList.remove('light-theme');
      if (icon) {
        icon.classList.remove('bxs-sun');
        icon.classList.add('bxs-moon');
      }
    }
  };

  // Check for saved theme in localStorage on page load
  const savedTheme = localStorage.getItem('theme') || 'dark'; // default to dark
  applyTheme(savedTheme);

  // Event listener for the button
  toggleBtn.addEventListener('click', () => {
    const isLight = body.classList.contains('light-theme');
    const newTheme = isLight ? 'dark' : 'light';
    
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });
})();
/* ====== PORTFOLIO CATEGORY FILTER ====== */
(function portfolioFilter() {
  const categoryCards = document.querySelectorAll('.portfolio-category-card');
  const projectGridWrapper = document.getElementById('projectGridWrapper');
  const portfolioSection = document.getElementById('portfolio');
  const categoriesContainer = document.querySelector('.portfolio-categories');
  const backBtn = document.getElementById('backToCategoriesBtn');
  const allItems = document.querySelectorAll('#portfolioGrid .portfolio-item');

  if (!categoriesContainer || !projectGridWrapper || categoryCards.length === 0) {
    return;
  }

  // Function to show projects of a specific category
  const showProjects = (category) => {
    // Hide category cards and show project grid
    categoriesContainer.style.display = 'none';
    projectGridWrapper.style.display = 'block';

    // Filter items
    allItems.forEach(item => {
      if (item.dataset.category === category) {
        item.style.display = 'inline-block'; // Or 'block' depending on your grid styling
      } else {
        item.style.display = 'none';
      }
    });

    // Scroll to the top of the portfolio section for a smooth transition
    portfolioSection.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to show the category selection view
  const showCategories = () => {
    projectGridWrapper.style.display = 'none';
    categoriesContainer.style.display = 'flex';
  };

  // Add click listeners to category cards
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const selectedCategory = card.dataset.category;
      showProjects(selectedCategory);
    });
  });

  // Add click listener to the "Back" button
  if (backBtn) {
    backBtn.addEventListener('click', showCategories);
  }
})();
/* ====== PORTFOLIO LIGHTBOX ====== */
(function lightbox(){
  const items = $$('.tile');
  if (items.length === 0) return;
  
  const lb = $('#lightbox');
  const media = $('#lightboxMedia');
  const title = $('#lightboxTitle');
  const description = $('#lightboxDescription');
  const close = $('#closeLb');
  const prev = $('#prevBtn');
  const next = $('#nextBtn');
  let currentItemIndex = 0;
  let currentImageIndex = 0;
  let currentImages = [];

  const open = (itemIndex) => {
    currentItemIndex = itemIndex;
    const it = items[currentItemIndex];
    const imagesAttr = it.dataset.images;
    const srcAttr = it.dataset.src;
    const ttl = it.dataset.title || '';
    const desc = it.dataset.description || '';

    if (imagesAttr) {
      currentImages = imagesAttr.split(',');
      currentImageIndex = 0;
    } else {
      currentImages = srcAttr ? [srcAttr] : [];
      currentImageIndex = 0;
    }

    title.textContent = ttl;
    description.innerHTML = desc;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    showImage();
  };

  const showImage = () => {
    if (currentImages.length === 0) return;
    media.innerHTML = '';
    const img = new Image();
    img.src = currentImages[currentImageIndex];
    img.alt = title.textContent;
    media.appendChild(img);

    if (currentImages.length > 1) {
      prev.style.display = 'block';
      next.style.display = 'block';
      prev.style.visibility = currentImageIndex === 0 ? 'hidden' : 'visible';
      next.style.visibility = currentImageIndex === currentImages.length - 1 ? 'hidden' : 'visible';
    } else {
      prev.style.display = 'block';
      next.style.display = 'block';
      prev.style.visibility = 'visible';
      next.style.visibility = 'visible';
    }
  };

  const closeLb = () => {
    lb.classList.remove('open');
    media.innerHTML = '';
    document.body.style.overflow = '';
  };

  const go = (dir) => {
    if (currentImages.length > 1) {
      const newImageIndex = currentImageIndex + dir;
      if (newImageIndex >= 0 && newImageIndex < currentImages.length) {
        currentImageIndex = newImageIndex;
        showImage();
      } else {
        // at the end of the images, go to the next item
        currentItemIndex = (currentItemIndex + dir + items.length) % items.length;
        open(currentItemIndex);
      }
    } else {
      // only one image, so go to the next item
      currentItemIndex = (currentItemIndex + dir + items.length) % items.length;
      open(currentItemIndex);
    }
  };

  items.forEach((it, i) => it.addEventListener('click', () => open(i)));
  close.addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });
  next.addEventListener('click', () => go(1));
  prev.addEventListener('click', () => go(-1));
})();