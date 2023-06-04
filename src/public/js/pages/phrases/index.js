document.addEventListener('DOMContentLoaded', () => {
  const phrasesCount = document.getElementById('phrasesCount');
  const phrasesBase = document.getElementById('phrasesBase');
  const btnAdd = document.getElementById('btnAdd');
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

  const fetchPhrases = () => {
    phrasesBase.innerHTML = '';

    lockScreen();
    request({
      config: {
        url: '/phrases',
        method: 'GET',
      },
      onSuccess: (res) => {
        releaseScreen();
        const data = res.data.data;

        phrasesCount.innerText = data.length;

        const cards = createPhrasesCards(data);

        cards.forEach(card => phrasesBase.appendChild(card));
      },
    });
  };

  function createPhrasesCards(phrases) {
    return phrases.map(phrase => {
      const div = document.createElement('div');
      const card = document.createElement('div');
      const divHead = document.createElement('div');
      const btnWrapper = document.createElement('div');
      const divContent = document.createElement('div');
      const btnRemove = document.createElement('button');
      const btnEdit = document.createElement('button');

      div.classList = 'col-4 col-md-8 col-sm-4';
      card.classList = 'card card-min';
      divHead.classList = 'w-100 d-flex justify-space-between';
      divContent.classList = 'card-phrase';
      btnRemove.classList = 'btn btn-min btn-error mr-5';
      btnEdit.classList = 'btn btn-min btn-primary';
      btnRemove.innerText = 'Remover';
      btnEdit.innerText = 'Editar';

      divContent.innerHTML = `
        <p class="card-phrase-phrase">
          <strong>#${phrase.id}</strong> - "${phrase.text}"
        </p>
        <p class="card-phrase-author">- <span>${phrase.author}</span> -</p>
      `;

      divHead.innerHTML = `<p class="card-phrase-avg">⭐ ${phrase.avg}</p>`;
      btnWrapper.appendChild(btnRemove);
      btnWrapper.appendChild(btnEdit);
      divHead.appendChild(btnWrapper)
      card.appendChild(divHead);
      card.appendChild(divContent);
      div.appendChild(card);

      btnEdit.addEventListener('click', () => {
        lockScreen();
        request({
          config: {
            url: `/phrases/${phrase.id}`,
            method: 'GET',
          },
          onSuccess: (res) => {
            releaseScreen();
            const data = res.data.data;

            form.text.value = data.text;
            form.author.value = data.author;

            modalForm('Editar frase', form, (formE, modal) => {
              const errorsPanel = document.getElementById('errorsPanel');
              errorsPanel.innerText = '';

              if (!validatePhrase(formE)) {
                return;
              }

              lockScreen();
              request({
                config: {
                  url: `/phrases/${phrase.id}`,
                  method: 'PUT',
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

                  modalInfo('Editar frase', "Frase editada com sucesso", () => {
                    modal.close();
                    fetchPhrases();
                  });
                },
              });
            });
          },
        });
      });

      btnRemove.addEventListener('click', () => {
        modalConfirm("Remover frase", "Você quer realmente excluir a frase?", () => {
          lockScreen();
          request({
            config: {
              url: `/phrases/${phrase.id}`,
              method: 'DELETE',
            },
            onSuccess: (res) => {
              releaseScreen();

              if (res.status !== 204) {
                modalInfo('Remover frase', "Erro inesperado, tente novamente mais tarde", () => {
                  fetchPhrases();
                });
                return;
              }

              modalInfo('Remover frase', "Frase removida com sucesso", () => {
                fetchPhrases();
              });
            },
          });
        }, () => {});
      });

      return div;
    });
  }

  btnAdd.addEventListener('click', () => {
    form.text.value = '';
    form.author.value = '';

    modalForm('Adicionar nova frase', form, (formE, modal) => {
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

          if (res.status !== 201) {
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
