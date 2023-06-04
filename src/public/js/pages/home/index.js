document.addEventListener('DOMContentLoaded', () => {
  const totalActiveUsersLabel = document.getElementById('totalActiveUsers');
  const newUsersLabel = document.getElementById('newUsers');
  const newEvaluationsLabel = document.getElementById('newEvaluations');
  const evaluationsAvarageLabel = document.getElementById('evaluationsAvarage');
  const cardContents = [...document.querySelectorAll('.card-content')];
  const monthSelect = document.getElementById('month');
  const yearSelect = document.getElementById('year');

  const updatePhrasesRanking = (phrases) => {
    if (!phrases.length) {
      return cardContents.forEach(cardContent => {
        cardContent.innerHTML = '<em class="mt-15">Nenhuma avaliação</em>';
      });
    }

    const template = phrases.reduce((acc, phrase) => {
      return acc + `
        <div class="card-phrase">
          <p class="card-phrase-phrase">
            "${phrase.phrase.text}"
          </p>
          <p class="card-phrase-author">- <span>${phrase.phrase.author}</span> -</p>
          <div class="card-phrase-grade">${phrase.grade}</div>
        </div>
      `;
    }, '');

    cardContents.forEach(cardContent => {
      cardContent.innerHTML = template;
    });
  };

  const updateReports = () => {
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;

    lockScreen();

    request({
      config: {
        url: '/reports',
        method: 'GET',
        params: {
          month,
          year,
        },
      },
      onSuccess: (res) => {
        releaseScreen();

        const data = res.data.data;

        initCounter(totalActiveUsersLabel, data.totalActiveUsers);
        initCounter(newUsersLabel, data.newUsers);
        initCounter(newEvaluationsLabel, data.newEvaluations);

        evaluationsAvarageLabel.innerText = data.evaluationsAvarage;

        updatePhrasesRanking(data.phrasesRanking);
      },
    });
  };

  monthSelect.addEventListener('change', updateReports);
  yearSelect.addEventListener('change', updateReports);

  updateReports();
});

function initCounter(element, max) {
  const counts = setInterval(updated, 100);
  let upto = 0;

  function updated() {
    element.innerHTML = String(upto++).padStart(3, '0');
    if (upto === max + 1) {
        clearInterval(counts);
    }
  }
}
