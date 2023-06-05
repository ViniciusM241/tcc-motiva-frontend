document.addEventListener('DOMContentLoaded', () => {
  const phrasesCount = document.getElementById('phrasesCount');
  const phrasesBase = document.getElementById('phrasesBase');
  const btnMore = document.getElementById('btnMore');
  const term = document.getElementById('term');
  const form = document.createElement('form');
  form.innerHTML = `
    <div class="input-wrapper">
      <label for="text">
        Frase
        <textarea name="text" id="text" placeholder="Digite a frase"></textarea>
      </label>
    </div>
    <div class="input-wrapper mt-25 mb-5">
      <label for="author">
        Autor
        <input type="text" name="author" id="author" placeholder="Digite o autor">
      </label>
    </div>
    <div id="errorsPanel" class="w-100 mb-25 error"></div>
  `;
  const filters = {
    term: 'positividade',
    pageIndex: 1,
  };

  const fetchPhrases = (append=false) => {
    if (!append) {
      phrasesBase.innerHTML = '';
      btnMore.classList.add('d-none');
    }

    lockScreen();
    request({
      config: {
        url: '/pensador-quotes',
        method: 'GET',
        params: filters,
      },
      onSuccess: (res) => {
        releaseScreen();
        const data = res.data.data;

        phrasesCount.innerText = data.total;

        const cards = createPhrasesCards(data.phrases);

        cards.forEach(card => phrasesBase.appendChild(card));

        if (data.hasMore) {
          btnMore.classList.remove('d-none');
        } else {
          btnMore.classList.add('d-none');
        }
      },
    });
  };

  function createPhrasesCards(phrases) {
    return phrases.map(phrase => {
      const div = document.createElement('div');
      const card = document.createElement('div');
      const divHead = document.createElement('div');
      const divContent = document.createElement('div');
      const btnAdd = document.createElement('button');

      div.classList = 'col-4 col-md-8 col-sm-4';
      card.classList = 'card card-min';
      divHead.classList = 'w-100 d-flex justify-end';
      divContent.classList = 'card-phrase';
      btnAdd.classList = 'btn btn-min btn-primary';
      btnAdd.innerText = 'Adicionar';

      divContent.innerHTML = `
        <p class="card-phrase-phrase">
          "${phrase.text}"
        </p>
        <p class="card-phrase-author">- <span>${phrase.author}</span> -</p>
      `;

      divHead.appendChild(btnAdd);
      card.appendChild(divHead);
      card.appendChild(divContent);
      div.appendChild(card);

      btnAdd.addEventListener('click', () => {
        form.text.value = phrase.text;
        form.author.value = phrase.author;

        modalForm('Editar frase', form, (formE, modal) => {
          const errorsPanel = document.getElementById('errorsPanel');
          errorsPanel.innerText = '';

          if (!validatePhrase(formE)) {
            return;
          }

          lockScreen();
          request({
            config: {
              url: `/phrases`,
              method: 'POST',
              data: {
                text: formE.text.value,
                author: formE.author.value,
              },
            },
            onSuccess: (res) => {
              releaseScreen();

              if (res.status === 400) {
                errorsPanel.innerText = 'A frase já existe';
                return;
              }

              if (res.status !== 200) {
                errorsPanel.innerText = 'Erro inesperado, tente novamente mais tarde';
                return;
              }

              modalInfo('Adicionar frase', "Frase adicionada com sucesso", () => {
                modal.close();
                fetchPhrases();
              });
            },
          });
        });
      });

      return div;
    });
  }

  term.addEventListener('blur', (e) => {
    const value = e.target.value;

    if (value === filters.term || !value) {
      return
    }

    filters.term = value;
    fetchPhrases();
  });

  btnMore.addEventListener('click', () => {
    filters.pageIndex = filters.pageIndex + 1;
    fetchPhrases(true);
  });

  fetchPhrases();
});

function validatePhrase({ text, author }) {
  let isValid = true;

  if (!text.value) {
    generateError(text, 'Digite a frase');
    isValid = false;
  } else {
    clearError(text);
  }

  if (!author.value) {
    generateError(author, 'Digite o autor');
    isValid = false;
  } else {
    clearError(author);
  }

  return isValid;
}
