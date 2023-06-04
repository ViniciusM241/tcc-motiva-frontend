const context = require('../utils/getContext');
const moment = require('moment');

function index(req, res) {
  const currentMonth = moment().month() + 1;
  const currentYear = moment().year();

  const values = {
    context: context(),
    months: [
      {
        value: 1,
        label: 'jan',
        get selected() { return this.value === currentMonth },
      },
      {
        value: 2,
        label: 'fev',
        get selected() { return this.value === currentMonth },
      },
      {
        value: 3,
        label: 'mar',
        get selected() { return this.value === currentMonth },
      },
      {
        value: 4,
        label: 'abr',
        get selected() { return this.value === currentMonth },
      },
      {
        value: 5,
        label: 'mai',
        get selected() { return this.value === currentMonth },
      },
      {
        value: 6,
        label: 'jun',
        get selected() { return this.value === currentMonth },
      },
      {
        value: 7,
        label: 'jul',
        get selected() { return this.value === currentMonth },
      },
      {
        value: 8,
        label: 'ago',
        get selected() { return this.value === currentMonth },
      },
      {
        value: 9,
        label: 'set',
        get selected() { return this.value === currentMonth },
      },
      {
        value: 10,
        label: 'out',
        get selected() { return this.value === currentMonth },
      },
      {
        value: 11,
        label: 'nov',
        get selected() { return this.value === currentMonth },
      },
      {
        value: 12,
        label: 'dez',
        get selected() { return this.value === currentMonth },
      },
    ],
    years: [
      {
        value: 2023,
        label: 2023,
        get selected() { return this.value === currentYear },
      },
    ],
  };

  return res.render('home', values);
}

module.exports = index;
