(function () {
  const csrfInput = document.querySelector('#csrfForm [name=csrfmiddlewaretoken]');

  function setMessage(id, text, success) {
    const box = document.getElementById(id);
    if (!box) return;
    box.textContent = text;
    box.classList.toggle('success', Boolean(success));
  }

  function openEdit(id) {
    const block = document.getElementById(id);
    if (block) block.hidden = false;
  }

  function closeEdit(id) {
    const block = document.getElementById(id);
    if (block) block.hidden = true;
  }

  function clearMessage(id) {
    const box = document.getElementById(id);
    if (!box) return;
    box.textContent = '';
    box.classList.remove('success');
  }

  async function postJSON(url, payload, onSuccess) {
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
        return { error: result.error || 'Ошибка' };
      }
      onSuccess(result);
      return {};
    } catch (error) {
      return { error: 'Не удалось связаться с сервером' };
    }
  }

  document.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => openEdit(button.dataset.edit));
  });

  document.querySelectorAll('[data-cancel]').forEach((button) => {
    button.addEventListener('click', () => {
      closeEdit(button.dataset.cancel);
      const block = document.getElementById(button.dataset.cancel);
      if (block) {
        const message = block.parentElement.querySelector('.profile-message');
        if (message) clearMessage(message.id);
      }
    });
  });

  const emailSave = document.getElementById('emailSave');
  if (emailSave) {
    emailSave.addEventListener('click', async () => {
      const result = await postJSON('/profile/email/', {
        email: document.getElementById('emailInput').value
      }, (data) => {
        document.getElementById('emailCurrent').textContent = data.email;
        document.getElementById('emailInput').value = data.email;
        closeEdit('emailEdit');
        setMessage('emailMessage', 'Email изменён', true);
      });
      if (result.error) setMessage('emailMessage', result.error, false);
    });
  }

  const usernameSave = document.getElementById('usernameSave');
  if (usernameSave) {
    usernameSave.addEventListener('click', async () => {
      const result = await postJSON('/profile/username/', {
        username: document.getElementById('usernameInput').value
      }, (data) => {
        document.getElementById('usernameCurrent').textContent = data.username;
        document.getElementById('usernameInput').value = data.username;
        const headerName = document.querySelector('.user-name');
        if (headerName) headerName.textContent = data.username;
        closeEdit('usernameEdit');
        setMessage('usernameMessage', 'Логин изменён', true);
      });
      if (result.error) setMessage('usernameMessage', result.error, false);
    });
  }

  const passwordSave = document.getElementById('passwordSave');
  if (passwordSave) {
    passwordSave.addEventListener('click', async () => {
      const result = await postJSON('/change-password/', {
        current: document.getElementById('currentPasswordInput').value,
        password: document.getElementById('newPasswordInput').value,
        confirm: document.getElementById('newConfirmInput').value
      }, () => {
        ['currentPasswordInput', 'newPasswordInput', 'newConfirmInput'].forEach((id) => {
          document.getElementById(id).value = '';
        });
        closeEdit('passwordEdit');
        setMessage('passwordMessage', 'Пароль изменён', true);
      });
      if (result.error) setMessage('passwordMessage', result.error, false);
    });
  }

  function renderAvatar(url) {
    const preview = document.getElementById('avatarPreview');
    if (preview) {
      preview.textContent = '';
      const image = document.createElement('img');
      image.className = 'profile-avatar-img';
      image.src = url + '?v=' + Date.now();
      image.alt = 'аватар';
      preview.appendChild(image);
    }
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) {
      headerAvatar.textContent = '';
      const image = document.createElement('img');
      image.className = 'avatar avatar-img';
      image.src = url + '?v=' + Date.now();
      image.alt = 'аватар';
      headerAvatar.appendChild(image);
    }
  }

  const avatarButton = document.getElementById('avatarBtn');
  if (avatarButton) {
    avatarButton.addEventListener('click', () => {
      const input = document.getElementById('avatarInput');
      if (input) input.click();
    });
  }

  const avatarInput = document.getElementById('avatarInput');
  if (avatarInput) {
    avatarInput.addEventListener('change', async () => {
      const file = avatarInput.files[0];
      if (!file) return;
      const data = new FormData();
      data.append('avatar', file);
      try {
        const response = await fetch('/profile/avatar/', {
          method: 'POST',
          headers: { 'X-CSRFToken': csrfInput ? csrfInput.value : '' },
          body: data
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
          setMessage('avatarMessage', result.error || 'Ошибка', false);
          return;
        }
        renderAvatar(result.url);
        avatarInput.value = '';
        setMessage('avatarMessage', 'Аватар изменён', true);
      } catch (error) {
        setMessage('avatarMessage', 'Не удалось загрузить аватар', false);
      }
    });
  }
})();
