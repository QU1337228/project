(function () {
  const imageInput = document.getElementById('imageInput');
  const imageDrop = document.getElementById('imageDrop');
  const imagePlaceholder = document.getElementById('imagePlaceholder');
  const typeSelect = document.getElementById('typeSelect');
  const heroSelect = document.getElementById('heroSelect');
  const heroHint = document.getElementById('heroHint');

  function updateHeroState() {
    if (!typeSelect || !heroSelect) return;
    const option = typeSelect.options[typeSelect.selectedIndex];
    const allowed = option && option.dataset.heroAllowed === 'true';
    heroSelect.disabled = !allowed;
    heroSelect.required = Boolean(allowed);
    if (!allowed) heroSelect.value = '';
    if (heroHint) heroHint.hidden = allowed;
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', updateHeroState);
    updateHeroState();
  }

  if (imageInput && imageDrop) {
    imageInput.addEventListener('change', () => {
      const file = imageInput.files[0];
      imageDrop.textContent = '';
      imageDrop.appendChild(imageInput);
      if (file) {
        const image = document.createElement('img');
        image.className = 'image-preview';
        image.src = URL.createObjectURL(file);
        image.alt = 'картинка товара';
        imageDrop.appendChild(image);
      } else if (imagePlaceholder) {
        imageDrop.appendChild(imagePlaceholder);
      }
    });
  }
})();
