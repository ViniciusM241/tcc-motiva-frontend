let profile = {};

document.addEventListener('DOMContentLoaded', () => {
  const userNameLabel = document.getElementById('userNameLabel');
  const notificationsCount = document.getElementById('notificationsCount');
  const notifications = document.getElementById('notifications');
  const notificationsList = document.getElementById('notificationsList');
  const notificationListCount = document.getElementById('notificationListCount');
  const notificationListContent = document.getElementById('notificationListContent');
  const notificationsListMobile = document.getElementById('notificationsListMobile');
  const notificationListCountMobile = document.getElementById('notificationListCountMobile');
  const notificationListContentMobile = document.getElementById('notificationListContentMobile');
  const closeNotificationsMobile = document.getElementById('closeNotificationsMobile');
  const viewAll = document.getElementById('viewAll');
  const viewAllMobile = document.getElementById('viewAllMobile');
  const userMenu = document.getElementById('userMenu');
  const userMenuWrapper = document.getElementById('userMenuWrapper');
  const btnLogout = document.getElementById('btnLogout');
  const nav = document.getElementById('nav');
  const navLinks = [...nav.querySelectorAll('a')];

  if (!getToken()) {
    window.location.href = 'login';
  }

  navLinks.forEach((link) => {
    if (window.location.href === link.href) {
      link.parentElement.classList.add('active');
    }
  });

  notifications.addEventListener('click', (e) => {
    e.stopPropagation();

    if (!userMenuWrapper.classList.contains('d-none')) {
      userMenuWrapper.classList.add('d-none');
    }

    if (notificationsList.classList.contains('d-none')) {
      notificationsList.classList.remove('d-none');
    } else {
      notificationsList.classList.add('d-none');
    }

    if (notificationsListMobile.classList.contains('d-none')) {
      notificationsListMobile.classList.remove('d-none');
    } else {
      notificationsListMobile.classList.add('d-none');
    }
  });

  userMenu.addEventListener('click', (e) => {
    e.stopPropagation();

    if (!notificationsList.classList.contains('d-none')) {
      notificationsList.classList.add('d-none');
    }

    if (userMenuWrapper.classList.contains('d-none')) {
      userMenuWrapper.classList.remove('d-none');
    } else {
      userMenuWrapper.classList.add('d-none');
    }
  });

  window.addEventListener('click', () => {
    if (!notificationsList.classList.contains('d-none')) {
      notificationsList.classList.add('d-none');
    }

    if (!userMenuWrapper.classList.contains('d-none')) {
      userMenuWrapper.classList.add('d-none');
    }
  });

  closeNotificationsMobile.addEventListener('click', () => {
    notificationsListMobile.classList.add('d-none');
  });

  lockScreen();
  request({
   config: {
    url: '/admins/profile',
    method: 'GET',
   },
   onSuccess: (response) => {
    releaseScreen();

    const data = response.data.data;
    profile = data;

    userNameLabel.innerText = data.name || '';

    handleNotifications(data.notification);
   },
  });

  setInterval(() => {
    if (!profile.id) return;

    request({
      config: {
        url: `/admins/${profile.id}/notifications`,
        method: 'GET',
      },
      onSuccess: (response) => {
        const data = response.data.data;

        handleNotifications(data);
      },
    });
  }, 1000 * 30);

  const handleNotifications = (notifications) => {
    notificationListContent.innerHTML = '';
    notificationListContentMobile.innerHTML = '';

    if (notifications.length) {
      const notViewed = notifications.filter(x => !x.viewed);

      notificationsCount.innerText = notViewed.length;
      notificationListCount.innerText = notifications.length;
      notificationListCountMobile.innerText = notifications.length;

      if (notViewed.length) {
        notificationsCount.classList.remove('d-none');
      } else {
        notificationsCount.classList.add('d-none');
      }

      notifications.forEach(notificationInfo => {
        const notification = createNotification(notificationInfo);
        const notificationsMobile = createNotification(notificationInfo);

        notificationListContent.appendChild(notification);
        notificationListContentMobile.appendChild(notificationsMobile);
      });

      if (notViewed.length) {
        viewAll.classList.remove('d-none');
        viewAllMobile.classList.remove('d-none');

        const viewAllRequest = () => {
          notifications.forEach(notification => {
            if (notification.viewed) return;

            request({
              config: {
                url: `/admins/${notification.adminId}/notifications/${notification.id}`,
                method: 'PUT',
              },
            });
          });
        };

        viewAll.addEventListener('click', (e) => {
          e.preventDefault();
          viewAllRequest();
        });

        viewAllMobile.addEventListener('click', (e) => {
          e.preventDefault();
          viewAllRequest();
        });
      } else {
        viewAll.classList.add('d-none');
        viewAllMobile.classList.add('d-none');
      }

    } else {
      notificationsCount.classList.add('d-none');
    }
  };

  btnLogout.addEventListener('click', () => {
    removeToken();
    window.location.href = '/login';
  });
});

function createNotification(notification) {
  const message = notification.notificationMessage;
  const div = document.createElement('div');
  const template = `
    <p class="p2 text-medium mb-5">${message.title}</p>
    <div class="notification-content"></div>
  `;

  div.classList.add('notification');
  div.innerHTML = template;

  const content = div.querySelector('.notification-content');

  content.innerHTML = message.html;

  if (!notification.viewed) {
    div.classList.add('active');
  }

  div.addEventListener('click', () => {
    if (!notification.viewed) {
      request({
        config: {
          url: `/admins/${notification.adminId}/notifications/${notification.id}`,
          method: 'PUT',
        },
      });

      div.classList.remove('active');
    }

    if (message.link) {
      window.location.href = message.link;
    }
  });

  return div;
}
