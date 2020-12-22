const express = require('express');
const model = require('../models/course.model');

const router = express.Router();


router.get('/byField/:field', async (req, res) => {
    res.locals.currentView = '#categories';
    res.locals.listCourseFields = await model.GetAllFields();
    res.locals.listCourse = await model.GetCourseByField(req.params.field);
    res.render('vwCategories/index');
})
router.get('/about', async (req, res) => {
    res.locals.currentView = '#about';
    res.locals.listCourseFields = await model.GetAllFields();
    res.render('vwAbout/index');
})
router.get('/categories', async (req, res) => {
    res.locals.currentView = '#categories';
    res.locals.listCourseFields = await model.GetAllFields();
    res.render('vwCategories/index');
})
router.get('/contact', async (req, res) => {
    res.locals.currentView = '#contact';
    res.locals.listCourseFields = await model.GetAllFields();
    res.render('vwContact/index');
})
router.get('/course/byField/:field',async (req, res) => {
    res.locals.currentView = '#categories';
    const result = await model.GetCourseByField(req.params.field);
    res.locals.listCourseFields = await model.GetAllFields();
    // console.log(req.params.field);
    res.render('vwCategories/index');
})
router.get('/course/byTheme/:theme', async (req, res) => {
    res.locals.currentView = '#categories';
    const result = await model.GetCourseByTheme(req.params.theme);
    res.locals.listCourseFields = await model.GetAllFields();
    // console.log(req.params.theme);
    res.render('vwCategories/index');

})
module.exports = router;

