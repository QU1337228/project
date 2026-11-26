(function () {
  const modal = document.getElementById('authModal');
  const loginView = document.getElementById('loginView');
  const registerView = document.getElementById('registerView');
  const openButton = document.getElementById('openAuth');
  const closeButton = document.getElementById('closeAuth');
  const errorBox = document.getElementById('authError');
  const csrfInput = document.querySelector('#csrfForm [name=csrfmiddlewaretoken]');

  function setMessage(text, success) {
    errorBox.textContent = text;
    errorBox.classList.toggle('success', Boolean(success));
  }

  function show(view) {
    loginView.hidden = view !== 'login';
    registerView.hidden = view !== 'register';
    setMessage('', false);
  }

  function open(view) {
    show(view);
    modal.hidden = false;
  }

  function close() {
    modal.hidden = true;
    setMessage('', false);
  }

  if (openButton) openButton.addEventListener('click', () => open('login'));
  if (closeButton) closeButton.addEventListener('click', close);
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) close();
    });
  }

  const toRegister = document.getElementById('toRegister');
  if (toRegister) {
    toRegister.addEventListener('click', (event) => {
      event.preventDefault();
      show('register');
    });
  }

  const toLogin = document.getElementById('toLogin');
  if (toLogin) {
    toLogin.addEventListener('click', (event) => {
      event.preventDefault();
      show('login');
    });
  }

  const forgot = document.getElementById('forgotPassword');
  if (forgot) {
    forgot.addEventListener('click', (event) => {
      event.preventDefault();
      setMessage('Восстановление пароля пока не реализовано', false);
    });
  }

  async function submit(url, payload, onSuccess) {
    setMessage('', false);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfInput ? csrfInput.value : ''
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setMessage(result.error || 'Ошибка', false);
        return;
      }
      if (onSuccess) {
        onSuccess(result);
      } else {
        window.location.reload();
      }
    } catch (error) {
      setMessage('Не удалось связаться с сервером', false);
    }
  }

  const loginSubmit = document.getElementById('loginSubmit');
  if (loginSubmit) {
    loginSubmit.addEventListener('click', () => submit('/login/', {
      identity: document.getElementById('loginIdentity').value,
      password: document.getElementById('loginPassword').value
    }));
  }

  const registerSubmit = document.getElementById('registerSubmit');
  if (registerSubmit) {
    registerSubmit.addEventListener('click', () => submit('/register/', {
      email: document.getElementById('regEmail').value,
      username: document.getElementById('regLogin').value,
      password: document.getElementById('regPassword').value,
      confirm: document.getElementById('regConfirm').value
    }));
  }

  const logoutButton = document.getElementById('logoutBtn');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        const response = await fetch('/logout/', {
          method: 'POST',
          headers: { 'X-CSRFToken': csrfInput ? csrfInput.value : '' }
        });
        if (response.ok) window.location.reload();
      } catch (error) {
        window.location.reload();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && !modal.hidden) close();
  });
})();
