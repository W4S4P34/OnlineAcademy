const express = require('express');
const model = require('../models/course.model');

const router = express.Router();

router.get('/', async (req, res) => {
    res.locals.currentView = '#home';
    res.locals.listCourseFields = await model.GetAllFields();
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
router.get('/course/byField/:field',async (req, res) => {
    const result = await model.GetCourseByField(req.params.field);
    console.log(req.params.field);
    res.json(result);
})
router.get('/course/byTheme/:theme', async (req, res) => {
    const result = await model.GetCourseByTheme(req.params.theme);
    console.log(req.params.theme);
    res.json(result);

})
module.exports = router;