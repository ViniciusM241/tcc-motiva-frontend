document.addEventListener('DOMContentLoaded', () => {
  const tableSpace = document.getElementById('tableSpace');
  const btnAdd = document.getElementById('btnAdd');

  const form = document.createElement('form');
  form.innerHTML = `
    <div class="input-wrapper">
      <label for="name">
        Nome
        <input type="text" name="name" id="name" placeholder="Digite o nome">
      </label>
    </div>
    <div class="input-wrapper mt-25">
      <label for="email">
        E-mail
        <input type="text" name="email" id="email" placeholder="Digite o e-mail">
      </label>
    </div>
    <div class="input-wrapper mt-25">
      <label for="password">
        Senha
        <input type="password" name="password" id="password" placeholder="*****">
      </label>
    </div>
    <div class="input-wrapper mt-25 mb-5">
      <label for="confirmPassword">
        Confirmar senha
        <input type="password" name="confirmPassword" id="confirmPassword" placeholder="*****">
      </label>
    </div>
    <div id="errorsPanel" class="w-100 mb-25 error"></div>
  `;

  const filters = {
    sort: 'id',
    order: 'ASC',
    page: 0,
    limit: 15,
  };
  const columns = [
    {
      label: '#',
      accessor: 'id',
    },
    {
      label: 'Nome',
      accessor: 'name',
    },
    {
      label: 'E-mail',
      accessor: 'email',
    },
    {
      label: 'Último login',
      accessor: 'lastLogin',
      value: (row) => {
        if (!row) return ' - ';

        return moment(row).format('DD/MM/yyyy HH:mm:ss');
      },
    },
    {
      label: 'Data de cadastro',
      accessor: 'createdAt',
      value: (row) => {
        return moment(row).format('DD/MM/yyyy HH:mm:ss');
      },
    },
    {
      label: 'Ações',
      accessor: 'id',
      value: (row, original) => {
        const div = document.createElement('div');
        const button = document.createElement('button');
        const buttonRemove = document.createElement('button');

        buttonRemove.classList = 'btn btn-min btn-error mr-5';
        buttonRemove.innerText = 'Remover';

        button.classList = 'btn btn-min btn-primary';
        button.innerText = 'Editar';
        button.addEventListener('click', (e) => {
          e.stopPropagation();

          lockScreen();
          request({
            config: {
              url: `/admins/${row}`,
              method: 'GET',
            },
            onSuccess: (res) => {
              releaseScreen();
              const data = res.data.data;

              form.email.value = data.email;
              form.name.value = data.name;
              form.password.value = data.authToken;
              form.confirmPassword.value = data.authToken;

              modalForm('Editar usuário Admin', form, (formE, modal) => {
                const errorsPanel = document.getElementById('errorsPanel');
                errorsPanel.innerText = '';

                if (!validateAdmin(formE)) {
                  return;
                }

                lockScreen();
                request({
                  config: {
                    url: `/admins/${row}`,
                    method: 'PUT',
                    data: {
                      name: formE.name.value,
                      email: formE.email.value,
                      password: formE.password.value,
                    },
                  },
                  onSuccess: (res) => {
                    releaseScreen();

                    if (res.status !== 200) {
                      errorsPanel.innerText = 'Erro inesperado, tente novamente mais tarde';
                      return;
                    }

                    modalInfo('Editar admin', "Admin editado com sucesso", () => {
                      modal.close();
                      fetchUsers();
                    });
                  },
                });
              });
            },
          });
        });

        buttonRemove.addEventListener('click', (e) => {
          e.stopPropagation();

          modalConfirm("Remover usuário", "Você quer realmente excluir o usuário ADMIN?", () => {
            lockScreen();
            request({
              config: {
                url: `/admins/${row}`,
                method: 'DELETE',
              },
              onSuccess: (res) => {
                releaseScreen();

                if (res.status !== 200) {
                  modalInfo('Remover admin', "Erro inesperado, tente novamente mais tarde", () => {
                    fetchUsers();
                  });
                  return;
                }

                modalInfo('Remover admin', "Admin removido com sucesso", () => {
                  fetchUsers();
                });
              },
            });
          }, () => {});
        });

        if (String(profile.id) !== String(row)) {
          div.appendChild(buttonRemove);
        }

        div.appendChild(button);

        return div;
      },
    },
  ];

  btnAdd.addEventListener('click', () => {
    form.email.value = '';
    form.name.value = '';
    form.password.value = '';
    form.confirmPassword.value = '';

    modalForm('Adicionar usuário Admin', form, (formE, modal) => {
      const errorsPanel = document.getElementById('errorsPanel');
      errorsPanel.innerText = '';

      if (!validateAdmin(formE)) {
        return;
      }

      lockScreen();
      request({
        config: {
          url: '/admins',
          method: 'POST',
          data: {
            name: formE.name.value,
            email: formE.email.value,
            password: formE.password.value,
          },
        },
        onSuccess: (res) => {
          releaseScreen();

          if (res.status !== 201) {
            errorsPanel.innerText = 'Erro inesperado, tente novamente mais tarde';
            return;
          }
          modalInfo('Adicionar admin', "Admin adicionado com sucesso", () => {
            modal.close();
            fetchUsers();
          });
        },
      });
    });
  });

  const fetchUsers = () => {
    lockScreen();
    request({
      config: {
        url: '/admins/search',
        method: 'GET',
        params: filters,
      },
      onSuccess: (res) => {
        releaseScreen();
        const data = res.data.data.admins;
        const count = res.data.data.count;

        updateTable(data, count);
      },
    });
  }

  const onFetch = () => {
    fetchUsers(filters);
  };

  const updateTable = (data, total) => {
    createTable(tableSpace, {
      columns,
      data,
      onFetch,
      filters,
      total,
    });
  };

  fetchUsers(filters);
});

function validateAdmin({
  name,
  email,
  password,
  confirmPassword,
}) {
  let isValid = true;

  if (!name.value) {
    generateError(name, 'Digite o nome');
    isValid = false;
  } else {
    clearError(name);
  }

  if (!email.value) {
    generateError(email, 'Digite o e-mail');
    isValid = false;
  } else {
    clearError(email);
  }

  if (!password.value) {
    generateError(password, 'Digite uma senha');
    isValid = false;
  } else {
    if (!confirmPassword.value) {
      generateError(confirmPassword, 'Digite a confirmação de senha');
      isValid = false;
    } else {
      if (password.value !== confirmPassword.value) {
        generateError(password, 'As senhas não conferem');
        generateError(confirmPassword, 'As senhas não conferem');
        isValid = false;
      } else {
        clearError(confirmPassword);
        clearError(password);
      }
    }
    clearError(password);
  }

  return isValid;
}
