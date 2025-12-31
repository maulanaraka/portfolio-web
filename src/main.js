import './styles/main.css';

// Mark JS-enabled for CSS
document.documentElement.classList.add('js');

// Utility
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Load JSON with fallback paths
async function loadJSON(paths) {
  if (!Array.isArray(paths)) paths = [paths];
  for (const p of paths) {
    try {
      const res = await fetch(p, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`Could not load ${p}:`, err);
    }
  }
  return null;
}

const defaultSkills = ["HTML5","CSS3","JavaScript","React","Node.js","Git"];
const defaultProjects = [
  {
    id: 'project-1',
    title: 'Project One',
    description: 'A cool project description goes here.',
    longDescription: 'Detailed description for Project One. Add more context, screenshots, and links here.',
    tech: ['HTML','CSS','JavaScript'],
    demoUrl: '#',
    codeUrl: '#',
    imageUrl: 'src/image/ab8758831428e8012e39fd4f73d93487.jpg'
  }
];

// Render helpers
function renderSkills(skills) {
  const container = document.querySelector('.skills-grid');
  if (!container) return;
  container.innerHTML = skills.map(s => `<div class="skill-card">${escapeHtml(s)}</div>`).join('');
}

function renderProjects(projects) {
  const track = document.querySelector('.carousel-track');
  if (!track || !projects) return;

  track.innerHTML = projects.map(project => `
    <div class="carousel-slide">
      <article class="project-card">
        <div class="project-image" style="background-image: url('${escapeHtml(project.imageUrl || '')}')"></div>
        <div class="project-info">
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml((project.tech || []).join(' • '))}</p>
          <div class="project-actions">
            <a class="btn primary" href="project.html?id=${encodeURIComponent(project.id)}">View Details</a>
          </div>
        </div>
      </article>
    </div>
  `).join('');

  // Re-initialize dots based on the new projects.json length
  const dotsContainer = document.querySelector('.carousel-dots');
  if (dotsContainer) {
    dotsContainer.innerHTML = projects.map((_, i) => 
      `<button class="carousel-dot" ${i === 0 ? 'aria-current="true"' : ''}></button>`
    ).join('');
  }

  // initialize carousel behavior after injecting DOM
  initCarousel();
}

function initCarousel() {
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  const prevBtn = document.querySelector('.carousel-button.prev');
  const nextBtn = document.querySelector('.carousel-button.next');
  const carousel = document.querySelector('.projects-carousel');

  if (!track || slides.length === 0 || dots.length === 0) {
    console.warn('[Carousel] required elements not found; skipping carousel initialization');
    return;
  }

  let index = 0;

  function updateCarousel() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.setAttribute('aria-current', i === index));
  }

  function next() {
    index = (index + 1) % slides.length;
    updateCarousel();
  }

  function prev() {
    index = (index - 1 + slides.length) % slides.length;
    updateCarousel();
  }

  function update() { updateCarousel(); }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { index = i; update(); });
  });

  if (carousel) {
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
    carousel.setAttribute('tabindex', '0');
  }

  // basic swipe support
  let startX = 0, deltaX = 0, dragging = false;
  track.addEventListener('pointerdown', (e) => {
    // Ignore pointerdown on interactive elements so links and buttons still receive click events
    if (e.target.closest('a') || e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) return;

    dragging = true;
    startX = e.clientX;
    track.style.transition = 'none';
    try { track.setPointerCapture(e.pointerId); } catch (err) {}
  });

  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    deltaX = e.clientX - startX;
    track.style.transform = `translateX(calc(-${index * 100}% + ${deltaX}px))`;
  });

  track.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    if (deltaX > 60) prev();
    else if (deltaX < -60) next();
    else update();
    deltaX = 0;
    try { track.releasePointerCapture(e.pointerId); } catch (err) {}
  });

  track.addEventListener('pointercancel', () => { dragging = false; update(); });

  update();
}

async function initContent() {
  const skills = await loadJSON(['content/skills.json', './content/skills.json']) || defaultSkills;
  const projects = await loadJSON(['content/projects.json', './content/projects.json']) || defaultProjects;

  renderSkills(Array.isArray(skills) ? skills : defaultSkills);
  renderProjects(Array.isArray(projects) ? projects : defaultProjects);
}

// Initialization on DOM ready: theme, smooth scroll, content, observers
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') body.classList.add('light-mode');

  if (themeToggle) {
    themeToggle.textContent = body.classList.contains('light-mode') ? '☀️' : '🌙';
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('light-mode');
      const isLight = body.classList.contains('light-mode');
      themeToggle.textContent = isLight ? '☀️' : '🌙';
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  } else {
    console.warn('[Theme] theme-toggle not found');
  }

  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Load content
  initContent();


  // Intersection Observer for sections
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, observerOptions);
  document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-in-section');
    observer.observe(section);
  });
});


