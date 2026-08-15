const params = new URLSearchParams(location.search);
const productId = params.get('id') || 'cable-system';
const product = TTP_PRODUCTS[productId];

if (!product || product.type === 'mini-me') {
  if (product?.type === 'mini-me') location.replace(product.url || 'mini-me.html');
  else {
    document.getElementById('productLayout').innerHTML = `<div><h1>Produto não encontrado</h1><p>Volta à <a href="shop.html" class="accent-teal">loja</a> para continuares.</p></div>`;
  }
}

if (product && product.type !== 'mini-me') {
  document.title = `${product.name} — Trust the Print`;
  document.querySelector('meta[name="description"]').setAttribute('content', product.short);

  const state = {
    color: product.colors?.[0] || '',
    size: product.sizes?.[0] || '',
    choice: product.options?.[0] || '',
    text: '',
    qty: 1
  };

  const bc = document.getElementById('breadcrumb');
  bc.innerHTML = `<a href="shop.html">Loja</a> / <span>${product.category}</span> / <strong>${product.name}</strong>`;
  document.getElementById('productCategory').textContent = product.category;
  document.getElementById('productName').textContent = product.name;
  document.getElementById('productDescription').textContent = product.description;
  document.getElementById('productPrice').textContent = product.priceLabel;

  const mainMedia = document.getElementById('mainMedia');
  const thumbs = document.getElementById('thumbs');

  function placeholderHTML(){
    return `<div class="visual-placeholder" data-visual="${product.visual || ''}" role="img" aria-label="Pré-visualização gráfica de ${product.name}"></div>`;
  }

  if (product.image) {
    mainMedia.innerHTML = `<img src="${product.image}" alt="${product.name}">`;
    thumbs.innerHTML = `<button class="product-thumb is-active" type="button" aria-label="Imagem principal"><img src="${product.image}" alt=""></button>`;
  } else {
    mainMedia.innerHTML = placeholderHTML();
  }

  const options = document.getElementById('productOptions');

  if (product.type === 'personalized') {
    const group = document.createElement('div');
    group.className = 'option-group';
    group.innerHTML = `<div class="option-label"><span>Texto personalizado</span></div><input class="personal-input" id="personalText" maxlength="40" placeholder="Que nome ou palavra queres?">`;
    options.appendChild(group);
    group.querySelector('input').addEventListener('input', e => state.text = e.target.value.trim());
  }

  if (product.colors?.length) {
    const group = document.createElement('div');
    group.className = 'option-group';
    group.innerHTML = `<div class="option-label"><span>Cor</span><span class="option-current" id="colorCurrent">${state.color}</span></div><div class="swatches" id="colorSwatches"></div>`;
    options.appendChild(group);
    const holder = group.querySelector('.swatches');
    product.colors.forEach((color, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch' + (i === 0 ? ' is-selected' : '');
      b.style.background = TTP_COLORS[color] || '#ccc';
      b.setAttribute('aria-label', color);
      b.title = color;
      b.addEventListener('click', () => {
        state.color = color;
        holder.querySelectorAll('.swatch').forEach(x => x.classList.remove('is-selected'));
        b.classList.add('is-selected');
        document.getElementById('colorCurrent').textContent = color;
      });
      holder.appendChild(b);
    });
  }

  if (product.sizes?.length) {
    const group = document.createElement('div');
    group.className = 'option-group';
    group.innerHTML = `<div class="option-label"><span>Tamanho / Variante</span><span class="option-current" id="sizeCurrent">${state.size}</span></div><div class="size-buttons"></div>`;
    options.appendChild(group);
    const holder = group.querySelector('.size-buttons');
    product.sizes.forEach((size, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'size-btn' + (i === 0 ? ' is-selected' : '');
      b.textContent = size;
      b.addEventListener('click', () => {
        state.size = size;
        holder.querySelectorAll('.size-btn').forEach(x => x.classList.remove('is-selected'));
        b.classList.add('is-selected');
        document.getElementById('sizeCurrent').textContent = size;
      });
      holder.appendChild(b);
    });
  }

  if (product.options?.length) {
    const group = document.createElement('div');
    group.className = 'option-group';
    const label = product.type === 'configurable' ? 'Módulo / Configuração inicial' : 'Opção';
    group.innerHTML = `<div class="option-label"><span>${label}</span><span class="option-current" id="choiceCurrent">${state.choice}</span></div><div class="choice-buttons"></div>`;
    options.appendChild(group);
    const holder = group.querySelector('.choice-buttons');
    product.options.forEach((choice, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice-btn' + (i === 0 ? ' is-selected' : '');
      b.textContent = choice;
      b.addEventListener('click', () => {
        state.choice = choice;
        holder.querySelectorAll('.choice-btn').forEach(x => x.classList.remove('is-selected'));
        b.classList.add('is-selected');
        document.getElementById('choiceCurrent').textContent = choice;
      });
      holder.appendChild(b);
    });
  }

  const qtyValue = document.getElementById('qtyValue');
  document.getElementById('qtyMinus').addEventListener('click', () => {
    state.qty = Math.max(1, state.qty - 1); qtyValue.textContent = state.qty;
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    state.qty = Math.min(99, state.qty + 1); qtyValue.textContent = state.qty;
  });

  const modal = document.getElementById('orderModal');
  const summary = document.getElementById('orderSummary');

  function orderLines(customer = {}) {
    const lines = [
      `Produto: ${product.name}`,
      state.color ? `Cor: ${state.color}` : '',
      state.size ? `Tamanho/Variante: ${state.size}` : '',
      state.choice ? `Opção: ${state.choice}` : '',
      state.text ? `Texto personalizado: ${state.text}` : '',
      `Quantidade: ${state.qty}`,
      product.priceLabel ? `Preço indicado no site: ${product.priceLabel}` : '',
      customer.name ? `Nome: ${customer.name}` : '',
      customer.email ? `Email: ${customer.email}` : '',
      customer.phone ? `Telefone: ${customer.phone}` : '',
      customer.city ? `Localidade: ${customer.city}` : '',
      customer.notes ? `Observações: ${customer.notes}` : ''
    ].filter(Boolean);
    return lines;
  }

  function refreshSummary(){
    summary.innerHTML = orderLines().map(line => `<div>${line.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</div>`).join('');
  }

  document.getElementById('orderBtn').addEventListener('click', () => {
    if (product.type === 'personalized' && !state.text) {
      document.getElementById('personalText')?.focus();
      alert('Escreve primeiro o nome ou palavra que queres personalizar.');
      return;
    }
    refreshSummary();
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });

  function closeModal(){
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  document.getElementById('modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function customerData(){
    return {
      name: document.getElementById('customerName').value.trim(),
      email: document.getElementById('customerEmail').value.trim(),
      phone: document.getElementById('customerPhone').value.trim(),
      city: document.getElementById('customerCity').value.trim(),
      notes: document.getElementById('customerNotes').value.trim()
    };
  }

  document.getElementById('copyOrderBtn').addEventListener('click', async () => {
    const text = orderLines(customerData()).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      document.getElementById('copyOrderBtn').textContent = 'Copiado ✓';
      setTimeout(() => document.getElementById('copyOrderBtn').textContent = 'Copiar detalhes', 1500);
    } catch {
      alert(text);
    }
  });

  document.getElementById('orderForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    const customer = customerData();
    const subject = `Encomenda — ${product.name}`;
    const body = `Olá Trust the Print,\n\nGostava de fazer a seguinte encomenda:\n\n${orderLines(customer).join('\n')}\n\nObrigado/a!`;
    location.href = `mailto:trusttheprint@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  document.getElementById('year')?.replaceChildren(String(new Date().getFullYear()));
}

const hamburger = document.getElementById('hamburgerBtn');
const mainNav = document.getElementById('mainNav');
hamburger?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('is-open');
  hamburger.setAttribute('aria-expanded', String(open));
});
