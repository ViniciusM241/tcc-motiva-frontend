const express = require('express');
const router = express.Router();
const context = require('../utils/getContext');
const homeController = require('../controllers/home');

router.get('/', homeController);
router.get('/login', (_, res) => res.render('login', { layout: false, context: context() }));
router.get('/home', homeController);
router.get('/usuarios', (_, res) => res.render('users', { context: context() }));
router.get('/admins', (_, res) => res.render('admins', { context: context() }));
router.get('/frases', (_, res) => res.render('phrases', { context: context() }));
router.get('/frases/pensador', (_, res) => res.render('phrasesPensador', { context: context() }));
router.get('/erro', (_, res) => res.render('error500', { layout: false, context: context() }));
router.get('*', (_, res) => res.render('notFound', { layout: false, context: context() }));

module.exports = router;
