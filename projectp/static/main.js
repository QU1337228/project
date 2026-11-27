(function () {
  const csrfInput = document.querySelector('#csrfForm [name=csrfmiddlewaretoken]');
  const cards = [...document.querySelectorAll('.product-card')];
  const checkboxes = [...document.querySelectorAll('.filter-checkbox')];
  const searchInput = document.getElementById('productSearch');
  const searchButton = document.getElementById('searchBtn');
  const emptyFiltered = document.getElementById('emptyFiltered');
  const emptyBase = document.getElementById('emptyMessage');

  const productModal = document.getElementById('productModal');
  const modalImage = document.getElementById('productModalImage');
  const modalName = document.getElementById('productModalName');
  const modalDescription = document.getElementById('productModalDescription');
  const modalBadges = document.getElementById('productModalBadges');
  const modalBuy = document.getElementById('productModalBuy');
  const modalFavorite = document.getElementById('productModalFavorite');
  const closeProduct = document.getElementById('closeProduct');

  function selectedValues(filter) {
    return checkboxes
      .filter((box) => box.dataset.filter === filter && box.checked)
      .map((box) => box.dataset.value);
  }

  function applyFilters() {
    const rarities = selectedValues('rarity');
    const heroes = selectedValues('hero');
    const types = selectedValues('type');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let visible = 0;

    cards.forEach((card) => {
      const rarity = (card.dataset.rarity || '').toLowerCase();
      const hero = (card.dataset.hero || '').toLowerCase();
      const type = (card.dataset.type || '').toLowerCase();
      const text = ((card.dataset.name || '') + ' ' + (card.dataset.description || '')).toLowerCase();

      const show =
        (!rarities.length || rarities.includes(rarity)) &&
        (!heroes.length || heroes.includes(hero)) &&
        (!types.length || types.includes(type)) &&
        (!query || text.includes(query));

      card.hidden = !show;
      if (show) visible += 1;
    });

    if (emptyFiltered) emptyFiltered.hidden = visible !== 0 || cards.length === 0;
    if (emptyBase) emptyBase.hidden = cards.length > 0 || visible !== 0;
  }

  checkboxes.forEach((box) => box.addEventListener('change', applyFilters));
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (searchButton) searchButton.addEventListener('click', applyFilters);

  checkboxes.forEach((box) => {
    box.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') applyFilters();
    });
  });

  function updateCartCount(count) {
    document.querySelectorAll('.cart-count').forEach((element) => {
      element.textContent = String(count);
    });
  }

  function markInCart(productId) {
    document.querySelectorAll('.buy-button[data-product-id="' + productId + '"]').forEach((button) => {
      button.disabled = true;
      button.textContent = 'В корзине';
    });
  }

  async function addToCart(button) {
    const productId = Number(button.dataset.productId);
    if (!productId) return;

    button.disabled = true;
    try {
      const response = await fetch('/cart/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfInput ? csrfInput.value : ''
        },
        body: JSON.stringify({ product_id: productId })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        button.textContent = 'Ошибка';
        button.disabled = false;
        return;
      }
      updateCartCount(result.count);
      markInCart(productId);
    } catch (error) {
      button.textContent = 'Ошибка';
      button.disabled = false;
    }
  }

  document.querySelectorAll('.buy-button').forEach((button) => {
    if (button.dataset.inCart === 'true') {
      button.disabled = true;
      button.textContent = 'В корзине';
    }
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      addToCart(button);
    });
  });

  function openProductModal(card) {
    if (!productModal) return;

    const id = card.querySelector('.buy-button')?.dataset.productId || '';
    const inCart = card.querySelector('.buy-button')?.dataset.inCart === 'true';
    const labels = [
      card.dataset.rarityLabel,
      card.dataset.heroLabel || card.dataset.typeLabel
    ].filter(Boolean);

    modalImage.src = card.dataset.image || card.querySelector('.product-image')?.src || '';
    modalImage.alt = card.dataset.nameLabel || '';
    modalName.textContent = card.dataset.nameLabel || '';
    modalDescription.textContent = card.dataset.descriptionLabel || card.dataset.description || '';

    modalBadges.innerHTML = '';
    labels.forEach((label) => {
      const badge = document.createElement('span');
      badge.className = 'product-badge';
      badge.textContent = label;
      modalBadges.appendChild(badge);
    });

    if (modalBuy) {
      modalBuy.dataset.productId = id;
      modalBuy.dataset.inCart = String(inCart);
      modalBuy.disabled = inCart;
      modalBuy.textContent = inCart ? 'В корзине' : 'КУПИТЬ';
    }

    if (modalFavorite) {
      modalFavorite.checked = id ? localStorage.getItem('favorite:' + id) === '1' : false;
    }

    productModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    if (!productModal || productModal.hidden) return;
    productModal.hidden = true;
    document.body.style.overflow = '';
  }

  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.buy-button')) return;
      openProductModal(card);
    });
    card.addEventListener('keydown', (event) => {
      if (event.target.closest('.buy-button')) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProductModal(card);
      }
    });
  });

  if (closeProduct) closeProduct.addEventListener('click', closeProductModal);
  if (productModal) {
    productModal.addEventListener('click', (event) => {
      if (event.target === productModal) closeProductModal();
    });
  }

  if (modalFavorite) {
    modalFavorite.addEventListener('change', () => {
      const id = modalBuy ? modalBuy.dataset.productId : '';
      if (id) localStorage.setItem('favorite:' + id, modalFavorite.checked ? '1' : '0');
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeProductModal();
  });

  applyFilters();
})();
