import './styles/main.css';

// Mark JS-enabled for CSS adjustments
document.documentElement.classList.add('js');

// Theme toggle behavior
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') body.classList.add('light-mode');
  if (!themeToggle) return;

  themeToggle.textContent = body.classList.contains('light-mode') ? '☀️' : '🌙';
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    themeToggle.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
});

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.warn(`Could not load ${path}:`, err);
    return null;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderNotFound(container) {
  container.innerHTML = `
    <div class="project-info">
      <h2>Project not found</h2>
      <p>We couldn't find the project you were looking for.</p>
      <p><a href="/index.html#projects">Back to projects</a></p>
    </div>
  `;
}

function renderProject(container, project) {
  const techHtml = (project.tech || []).map(t => `<span class="skill-card">${escapeHtml(t)}</span>`).join(' ');
  container.innerHTML = `
    <div class="project-hero" style="background-image: url('${escapeHtml(project.imageUrl || '')}')"></div>
    <div class="project-info">
      <h1>${escapeHtml(project.title)}</h1>
      <p class="muted">${escapeHtml(project.description || '')}</p>
      <p>${escapeHtml(project.longDescription || '')}</p>
      <div class="project-meta">
        <div class="project-tech">${techHtml}</div>
        <div class="project-links">
          ${project.demoUrl ? `<a class="btn primary" href="${escapeHtml(project.demoUrl)}" target="_blank" rel="noopener">Live Demo</a>` : ''}
          ${project.codeUrl ? `<a class="btn secondary" href="${escapeHtml(project.codeUrl)}" target="_blank" rel="noopener">View Code</a>` : ''}
        </div>
      </div>
      <p><a href="/index.html#projects">← Back to projects</a></p>
    </div>
  `;
}

async function init() {
  const id = getQueryParam('id');
  const container = document.querySelector('#project-detail .container');
  if (!container) return;

  const projects = await loadJSON('/content/projects.json');
  if (!projects) {
    renderNotFound(container);
    return;
  }

  const project = projects.find(p => p.id === id);
  if (!project) {
    renderNotFound(container);
    return;
  }

  renderProject(container, project);
}

init();