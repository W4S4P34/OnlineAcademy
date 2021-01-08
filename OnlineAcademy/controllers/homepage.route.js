const express = require('express');
const courseModel = require('../models/course.model');

const router = express.Router();

router.get('/', async (req, res) => {
    res.locals.currentView = '#home';
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme();
    res.render('vwHome/index');
})
router.get('/about', async (req, res) => {
    res.locals.currentView = '#about';
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme();
    res.render('vwAbout/index');
})
router.get('/categories', async (req, res) => {
    res.locals.currentView = '#categories';
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme();
    res.render('vwCategories/index');
})
router.get('/contact', async (req, res) => {
    res.locals.currentView = '#contact';
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme();
    res.render('vwContact/index');
})
module.exports = router;