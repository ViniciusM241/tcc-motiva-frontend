document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('formLogin');

  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    login(formLogin);

    formLogin.email.addEventListener('blur', () => validate(formLogin));
    formLogin.password.addEventListener('blur', () => validate(formLogin));
  });
});

function login(form) {
  const errorsPanel = document.getElementById('errorsPanel');
  errorsPanel.innerText = '';

  if (!validate(form)) {
    return;
  }

  lockScreen();

  request({
    config: {
      url: '/auth',
      method: 'POST',
      data: {
        email: form.email.value,
        password: form.password.value,
      },
    },
    onSuccess: (res) => {
      releaseScreen();

      if (res.status !== 200) {
        form.email.value = '';
        form.password.value = '';
        errorsPanel.innerText = 'Usuário ou senha incorretos';
        return;
      }

      setToken(res.data.data.token);
      window.location.href = '/home';
    }
  });
}

function validate({ email, password }) {
  let isValid = true;

  if (!email.value) {
    generateError(email, 'Digite o e-mail');
    isValid = false;
  } else {
    clearError(email);
  }

  if (!password.value) {
    generateError(password, 'Digite sua senha');
    isValid = false;
  } else {
    clearError(password);
  }

  return isValid;
}
