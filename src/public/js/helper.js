const TOKEN_KEY = 'motiviva_key';

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function request({
  config,
  onSuccess,
  onFail,
}) {
  const client = axios.create({
    baseURL: apiBaseURL,
  });

  client.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }, (err) => err);

  client.interceptors.response.use((res) => {
    return res;
  }, (err) => {
    if (err.response.status === 401) {
      removeToken();
      modalInfo('Sessão expirada', 'Faça o login novamente', () => {
        window.location.href = '/login';
      });
    }

    if(err.response.status === 500) {
      window.location.href = '/erro';
    }

    return err.response;
  });

  client.request(config)
    .then(res => onSuccess && onSuccess(res));
}

function lockScreen() {
  const div = document.createElement('div');
  div.classList.add('load-content');

  document.body.appendChild(div);
}

function releaseScreen() {
  const div = document.querySelector('.load-content');

  document.body.removeChild(div);
}

function generateError(input, message) {
  const container = input.parentElement.parentElement;
  const span = container.querySelector('span.error');

  if (!span) return;

  span.innerText = message;
  container.classList.add('error');
}

function clearError(input) {
  const container = input.parentElement.parentElement;
  const span = container.querySelector('span.error');

  if (!span) return;

  span.innerText = '';
  container.classList.remove('error');
}

function installInputs() {
  const inputs = [...document.querySelectorAll('input')];

  inputs.forEach(input => {
    const alreadyInstalled = input.parentElement.querySelector('span.error');

    if (alreadyInstalled) return;

    const span = document.createElement('span');

    span.classList.add('error');
    input.parentElement.appendChild(span);
  });
}

installInputs();
