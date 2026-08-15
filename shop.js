const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('year').textContent = new Date().getFullYear();

const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 12), {passive:true});

const hamburger = document.getElementById('hamburgerBtn');
const mainNav = document.getElementById('mainNav');
hamburger?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('is-open');
  hamburger.setAttribute('aria-expanded', String(open));
});

const filters = document.getElementById('filters');
const grid = document.getElementById('shopGrid');
const collectionBanner = document.getElementById('collectionsBanner');

TTP_CATEGORIES.forEach((cat, index) => {
  const b = document.createElement('button');
  b.className = 'filter-btn' + (index === 0 ? ' is-active' : '');
  b.type = 'button';
  b.textContent = cat.label;
  b.dataset.filter = cat.key;
  filters.appendChild(b);
});

function productUrl(p){
  if (p.type === 'mini-me') return p.url || 'mini-me.html';
  return `product.html?id=${encodeURIComponent(p.id)}`;
}

function cardMedia(p){
  if (p.image) {
    return `<img src="${p.image}" alt="${p.name}" loading="lazy">`;
  }
  return `<div class="visual-placeholder" data-visual="${p.visual || ''}" role="img" aria-label="Pré-visualização gráfica de ${p.name}"></div>`;
}

Object.values(TTP_PRODUCTS).forEach(p => {
  const card = document.createElement('article');
  card.className = 'shop-card reveal';
  card.dataset.category = p.categoryKey;
  card.innerHTML = `
    <a href="${productUrl(p)}" class="shop-card-media" aria-label="Ver ${p.name}">
      ${p.badge ? `<span class="shop-badge">${p.badge}</span>` : ''}
      ${cardMedia(p)}
    </a>
    <div class="shop-card-body">
      <span class="shop-card-cat">${p.category}</span>
      <h3><a href="${productUrl(p)}">${p.name}</a></h3>
      <p class="shop-card-desc">${p.short}</p>
      <div class="shop-card-foot">
        <span class="shop-price">${p.priceLabel}</span>
        <a class="shop-arrow" href="${productUrl(p)}" aria-label="Ver ${p.name}">↗</a>
      </div>
    </div>`;
  grid.appendChild(card);
});

function setFilter(key){
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('is-active', b.dataset.filter === key));
  const cards = [...document.querySelectorAll('.shop-card')];
  cards.forEach(card => {
    const show = key === 'all' ? true : key === 'collections' ? false : card.dataset.category === key;
    card.classList.toggle('is-hidden', !show);
  });
  collectionBanner.style.display = key === 'collections' || key === 'all' ? 'grid' : 'none';
}

filters.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  setFilter(btn.dataset.filter);
});

const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  }), {threshold:.1});
  revealEls.forEach(el => io.observe(el));
} else revealEls.forEach(el => el.classList.add('is-visible'));


const initialHash = location.hash.replace('#','');
if (TTP_CATEGORIES.some(c => c.key === initialHash)) setFilter(initialHash);
window.addEventListener('hashchange', () => {
  const key = location.hash.replace('#','');
  if (TTP_CATEGORIES.some(c => c.key === key)) setFilter(key);
});
