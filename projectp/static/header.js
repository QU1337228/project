(function () {
  const trigger = document.getElementById('userTrigger');
  const dropdown = document.getElementById('userDropdown');
  const csrfInput = document.querySelector('#csrfForm [name=csrfmiddlewaretoken]');

  function closeDropdown() {
    if (!dropdown) return;
    dropdown.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  if (trigger && dropdown) {
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      dropdown.hidden = !dropdown.hidden;
      trigger.setAttribute('aria-expanded', String(!dropdown.hidden));
    });

    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target) && event.target !== trigger) closeDropdown();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDropdown();
  });

  const logoutButton = document.getElementById('logoutBtn');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        const response = await fetch('/logout/', {
          method: 'POST',
          headers: { 'X-CSRFToken': csrfInput ? csrfInput.value : '' }
        });
        if (response.ok) window.location.href = '/';
      } catch (error) {
        window.location.href = '/';
      }
    });
  }
})();
