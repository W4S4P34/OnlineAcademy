const express = require('express');
const model = require('../models/course.model');

const router = express.Router();

router.get('/', async (req, res) => {
    res.locals.currentView = '#home';
    await model.GetTopHighlightsCourse(2);
    res.render('vwHome/index');
})
router.get('/about', (req, res) => {
    res.locals.currentView = '#about';
    res.render('vwAbout/index');
})
router.get('/contact', (req, res) => {
    res.locals.currentView = '#contact';
    res.render('vwHome/index');
})
router.get('/course', (req, res) => {
    res.locals.currentView = '#course';
    res.render('vwCourses/index');
})
router.get('/course/web-development', (req, res) => {
})
router.get('/course/mobile-development', (req, res) => {
})
module.exports = router;