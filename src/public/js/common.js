const userStatusEnum = {
  'REGISTER': {
    value: 'REGISTER',
    label: 'Cadastro',
  },
  'STAND_BY': {
    value: 'STAND_BY',
    label: 'Em espera',
  },
  'MENU': {
    value: 'MENU',
    label: 'Menu',
  },
  'UPDATE_PROFILE': {
    value: 'UPDATE_PROFILE',
    label: 'Atualizando perfil',
  },
  'EVALUATION': {
    value: 'EVALUATION',
    label: 'Avaliando',
  },
  'EVALUATION_WAITING': {
    value: 'EVALUATION_WAITING',
    label: 'Aguardando avaliação',
  },
};

const masks = {
  phone: (str) => {
    return str.replace(/\D/g, '')
      .replace(/^(\d)/, '($1')
      .replace(/^(\(\d{2})(\d)/, '$1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2')
      .replace(/(-\d{5})\d+?$/, '$1');
  },
};

function createTable(element, config) {
  if (!config.columns) throw new Error('Missing columns');
  if (!config.data) throw new Error('Missing data');
  if (!config.total) throw new Error('Missing total');
  if (!config.filters) throw new Error('Missing filters');

  const wrapper = document.createElement('div');
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const trHead = document.createElement('tr');

  config.columns.forEach((column) => {
    const th = document.createElement('th');
    const p = document.createElement('p');

    p.innerHTML = `${column.label}`;

    if (config.filters.sort === column.accessor) {
      p.innerHTML += ` <i class="icon icon-chevron-${config.filters.order === 'ASC' ? 'bottom' : 'top'} icon-background-1 icon-18"></i>`;
    }

    if (config.onFetch) {
      p.addEventListener('click', (e) => {
        if (config.filters.sort === column.accessor) {
          if (config.filters.order === 'ASC') {
            config.filters.order = 'DESC';
            config.filters.sort = column.accessor;
            p.innerHTML = column.label + ' <i class="icon icon-chevron-top icon-background-1 icon-18"></i>';
          } else {
            p.innerHTML = column.label;
            config.filters.order = null;
            config.filters.sort = null;
          }
        } else {
          p.innerHTML = column.label + ' <i class="icon icon-chevron-bottom icon-background-1 icon-18"></i>';
          config.filters.order = 'ASC';
          config.filters.sort = column.accessor;
        }

        config.onFetch();
      });
    }

    th.appendChild(p);

    trHead.appendChild(th);
  });

  thead.appendChild(trHead);
  table.appendChild(thead);

  config.data.forEach(data => {
    const tr = document.createElement('tr');

    if (config.onClickRow) {
      tr.addEventListener('click', config.onClickRow);
    }

    config.columns.forEach(column => {
      const td = document.createElement('td');
      const value = data[column.accessor];

      if (column.value && typeof column.value === 'function') {
        const result = column.value(value, data);

        if (typeof result === 'object') {
          td.appendChild(result);
        } else {
          td.innerHTML = result;
        }
      } else {
        td.innerHTML = value;
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);

  const pagination = document.createElement('div');
  const paginationControls = document.createElement('div');

  pagination.classList = 'table-pagination';

  if (config.total > config.filters.limit) {
    const goBack = document.createElement('i');
    const goForward = document.createElement('i');
    const label = document.createElement('span');

    label.innerText = config.filters.page + 1;

    goBack.classList = 'icon icon-chevron-left icon-primary icon-28';
    goForward.classList = 'icon icon-chevron-right icon-primary icon-28';

    goBack.addEventListener('click', () => {
      if (config.filters.page - 1 < 0) {
        return;
      }

      config.filters.page = config.filters.page - 1;
      config.onFetch && config.onFetch();
    });

    goForward.addEventListener('click', () => {
      if (config.filters.page + 1 * config.filters.limit >= config.total) {
        return;
      }

      config.filters.page = config.filters.page + 1;
      config.onFetch && config.onFetch();
    });

    if (config.filters.page + 1 * config.filters.limit >= config.total) {
      goForward.classList.add('d-none');
    }

    if (config.filters.page === 0) {
      goBack.classList.add('d-none');
    }

    paginationControls.classList = 'table-pagination-controls';
    paginationControls.appendChild(goBack);
    paginationControls.appendChild(label);
    paginationControls.appendChild(goForward);
  }

  const totalLabelFooter = `<p class="table-paginantion-info">${config.filters.page * config.filters.limit + config.data.length} de ${config.total} resultados</p>`;
  const totalLabel = `<p class="p3 w-100 text-medium mb-5">${config.total} resultados</p>`;
  const wrapperHead = document.createElement('div');

  pagination.innerHTML += totalLabelFooter;
  pagination.appendChild(paginationControls);

  wrapperHead.innerHTML = totalLabel;
  wrapperHead.appendChild(table);
  wrapper.appendChild(wrapperHead);
  wrapper.appendChild(pagination);

  wrapper.classList = 'table-wrapper';

  element.innerHTML = '';
  element.appendChild(wrapper);
}

function modalInfo(title, info, cb) {
  if (!title) throw new Error('Title cannot be null');
  if (!info) throw new Error('Info cannot be null');

  const modalContainer = document.createElement('div');
  const modal = document.createElement('div');
  const modalHead = document.createElement('div');
  const modalTitle = document.createElement('p');
  const modalBody = document.createElement('div');
  const modalFooter = document.createElement('div');
  const close = document.createElement('i');
  const button = document.createElement('button');

  close.classList = 'icon icon-close icon-32';
  close.id = 'btnClose';
  button.classList = 'btn btn-primary';
  button.innerText = 'Fechar';
  modalContainer.classList = 'modal-wrapper';
  modal.classList = 'modal-container';
  modalHead.classList = 'modal-head';
  modalTitle.classList = 'modal-title';
  modalTitle.innerText = title;
  modalBody.classList = 'modal-body';
  modalBody.innerHTML = info;
  modalFooter.classList = 'modal-footer';

  modalHead.appendChild(modalTitle);
  modalHead.appendChild(modalBody);
  modalFooter.appendChild(button);
  modal.appendChild(close);
  modal.appendChild(modalHead);
  modal.appendChild(modalFooter);
  modalContainer.appendChild(modal);
  document.body.appendChild(modalContainer);

  const modalConfig = {
    close: () => document.body.removeChild(modalContainer),
    modal,
  };

  close.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
    cb && cb(modalConfig);
  });

  button.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
    cb && cb(modalConfig);
  });
}

function modalConfirm(title, info, cbConfirm, cbCancel) {
  if (!title) throw new Error('Title cannot be null');
  if (!info) throw new Error('Info cannot be null');

  const modalContainer = document.createElement('div');
  const modal = document.createElement('div');
  const modalHead = document.createElement('div');
  const modalTitle = document.createElement('p');
  const modalBody = document.createElement('div');
  const modalFooter = document.createElement('div');
  const close = document.createElement('i');
  const button = document.createElement('button');
  const buttonCancel = document.createElement('button');

  close.classList = 'icon icon-close icon-32';
  close.id = 'btnClose';
  button.classList = 'btn btn-primary mr-10';
  button.innerText = 'Confirmar';
  buttonCancel.classList = 'btn';
  buttonCancel.innerText = 'Cancelar';
  modalContainer.classList = 'modal-wrapper';
  modal.classList = 'modal-container';
  modalHead.classList = 'modal-head';
  modalTitle.classList = 'modal-title';
  modalTitle.innerText = title;
  modalBody.classList = 'modal-body';
  modalBody.innerHTML = info;
  modalFooter.classList = 'modal-footer';

  modalHead.appendChild(modalTitle);
  modalHead.appendChild(modalBody);
  modalFooter.appendChild(button);
  modalFooter.appendChild(buttonCancel);
  modal.appendChild(close);
  modal.appendChild(modalHead);
  modal.appendChild(modalFooter);
  modalContainer.appendChild(modal);
  document.body.appendChild(modalContainer);

  const modalConfig = {
    close: () => document.body.removeChild(modalContainer),
    modal,
  };

  close.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
    cbCancel && cbCancel(modalConfig);
  });

  button.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
    cbConfirm && cbConfirm(modalConfig);
  });

  buttonCancel.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
    cbCancel && cbCancel(modalConfig);
  });
}

function modalForm(title, form, cb) {
  if (!title) throw new Error('Title cannot be null');
  if (!form) throw new Error('Form cannot be null');

  const modalContainer = document.createElement('div');
  const modal = document.createElement('div');
  const modalHead = document.createElement('div');
  const modalTitle = document.createElement('p');
  const modalBody = document.createElement('div');
  const modalFooter = document.createElement('div');
  const close = document.createElement('i');
  const button = document.createElement('button');

  close.classList = 'icon icon-close icon-32';
  close.id = 'btnClose';
  button.classList = 'btn btn-primary';
  button.innerText = 'Salvar';
  modalContainer.classList = 'modal-wrapper';
  modal.classList = 'modal-container';
  modalHead.classList = 'modal-head';
  modalTitle.classList = 'modal-title';
  modalTitle.innerText = title;
  modalBody.classList = 'modal-body';
  modalFooter.classList = 'modal-footer';

  modalBody.appendChild(form);

  modalHead.appendChild(modalTitle);
  modalHead.appendChild(modalBody);
  modalFooter.appendChild(button);
  modal.appendChild(close);
  modal.appendChild(modalHead);
  modal.appendChild(modalFooter);
  modalContainer.appendChild(modal);
  document.body.appendChild(modalContainer);

  const modalConfig = {
    close: () => document.body.removeChild(modalContainer),
    modal,
  };

  close.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
  });

  button.addEventListener('click', () => {
    cb && cb(form, modalConfig);
  });

  installInputs();
}

function modalChat(chat) {
  if (!chat) throw new Error('Chat cannot be null');

  const modalContainer = document.createElement('div');
  const modal = document.createElement('div');
  const modalChatContainer = document.createElement('div');
  const close = document.createElement('i');

  close.classList = 'icon icon-close icon-32';
  close.id = 'btnClose';
  modalContainer.classList = 'modal-wrapper';
  modal.classList = 'modal-container';
  modalChatContainer.classList = 'modal-chat-container';

  close.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
  });

  const handleMessage = (message) => {
    return message
      .replace(/\n/g, '<br>')
      .replace(/\*(.*){1}\*/g, '<strong>$1</strong>')
      .replace(/\_(.*){1}\_/g, '<em>$1</em>');
  };

  const createChatRoll = (chat) => {
    const markers = Object.keys(chat);

    const message = markers.reduce((acc, marker) => {
      const markerTemplate = `
        <div class="chat-marker">${marker}</div>
      `;

      const messages = chat[marker].reduce((acc, message, index, arr) => {
        let margin = 'mb-10';

        if (index < arr.length - 1) {
          const lastMessage = arr[index + 1];

          if (lastMessage.type === message.type) {
            margin = 'mb-5';
          }
        }

        const messageTemplate = `
          <div class="chat-message ${message.type.toLowerCase()} ${margin}">
            ${handleMessage(message.text)}
            <span class="chat-message-time">${message.time}</span>
          </div>
        `;
        return acc + messageTemplate;
      }, '');

      return acc + markerTemplate + messages;
    }, '');

    return message;
  };

  modalChatContainer.innerHTML = createChatRoll(chat);

  modal.appendChild(close);
  modal.appendChild(modalChatContainer);
  modalContainer.appendChild(modal);
  document.body.appendChild(modalContainer);
}
