const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const csp = require('helmet-csp');
const express = require('express');
const { engine } = require('express-handlebars');
const router = require('./routes/index');
const app = express();

dotenv.config();

app.use(cors());
app.use(helmet());
app.use(csp({
  directives: {
    defaultSrc: [
      "'self'",
      "'unsafe-inline'",
    ],
    imgSrc: ["'self'"],
    objectSrc: ["'none'"],
    connectSrc: ["'self'", process.env.API_BASE_URL],
    upgradeInsecureRequests: null,
  },
}));

app.use('/assets/js/axios', express.static(path.join(__dirname, '../node_modules/axios')));
app.use('/assets/js/moment', express.static(path.join(__dirname, '../node_modules/moment')));
app.use('/assets', express.static(path.join(__dirname, 'public')));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(router);

module.exports = app;
