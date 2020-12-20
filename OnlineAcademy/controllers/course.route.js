const express = require('express');
const model = require('../models/course.model');

const router = express.Router();

router.get('/', async (req, res) => {
    res.locals.currentView = '#home';
    // await model.GetTopHighlightsCourse(2);
    res.render('vwHome/index');
})
router.get('/about', (req, res) => {
    res.locals.currentView = '#about';
    res.render('vwAbout/index');
})
router.get('/categories', (req, res) => {
    res.locals.currentView = '#categories';
    res.render('vwCategories/index');
})
router.get('/contact', (req, res) => {
    res.locals.currentView = '#contact';
    res.render('vwContact/index');
})
router.get('/course/web-development', (req, res) => {})
router.get('/course/mobile-development', (req, res) => {})
module.exports = router;