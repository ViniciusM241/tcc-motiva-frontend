document.addEventListener('DOMContentLoaded', () => {
  const tableSpace = document.getElementById('tableSpace');
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
      label: 'Número',
      accessor: 'phoneNumber',
      value: (row) => {
        return masks.phone(row.substring(2));
      },
    },
    {
      label: 'Status',
      accessor: 'status',
      value: (row) => {
        if (userStatusEnum[row]) {
          return userStatusEnum[row].label;
        }
        return row;
      },
    },
    {
      label: 'Agendamento',
      accessor: 'messageSchedule',
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
        const button = document.createElement('button');
        button.classList = 'btn btn-min btn-primary';
        button.innerText = 'Ver chat';
        button.addEventListener('click', (e) => {
          e.stopPropagation();

          lockScreen();
          request({
            config: {
              url: `/users/${row}/chat`,
              method: 'GET',
            },
            onSuccess: (res) => {
              releaseScreen();
              const data = res.data.data;
              modalChat(data);
            },
          });
        });

        return button;
      },
    },
  ];

  const fetchUsers = () => {
    lockScreen();
    request({
      config: {
        url: '/users/search',
        method: 'GET',
        params: filters,
      },
      onSuccess: (res) => {
        releaseScreen();
        const data = res.data.data.users;
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
