(function () {
  const csrfInput = document.querySelector('#csrfForm [name=csrfmiddlewaretoken]');

  document.querySelectorAll('.remove-button').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const response = await fetch('/cart/remove/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfInput ? csrfInput.value : ''
          },
          body: JSON.stringify({ product_id: Number(button.dataset.productId) })
        });
        const result = await response.json();
        if (!response.ok || !result.ok) return;
        document.querySelectorAll('.cart-count').forEach((element) => {
          element.textContent = String(result.count);
        });
        const item = button.closest('.cart-item');
        if (item) item.remove();
      } catch (error) {
        button.textContent = 'Ошибка';
      }
    });
  });
})();
