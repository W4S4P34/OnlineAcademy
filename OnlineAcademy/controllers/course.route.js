const express = require('express');
const model = require('../models/course.model');

const router = express.Router();


router.get('/byField/:field', async (req, res) => {
    res.locals.currentView = '#categories';
    res.locals.listCourseFields = await model.GetAllFields();
    res.locals.listCourse = await model.GetCourseByField(req.params.field);
    res.render('vwCategories/index');
})
router.get('/byTheme/:theme', async (req, res) => {
    res.locals.currentView = '#categories';
    res.locals.listCourseFields = await model.GetAllFields();
    res.locals.listCourse = await model.GetCourseByTheme(req.params.theme);
    res.render('vwCategories/index');
})
router.get('/detail/:id', async (req, res) => {
    res.locals.currentView = '#categories';
    res.locals.listCourseFields = await model.GetAllFields();
    res.locals.detailCourse = await model.GetDetailCourseById(req.params.id);
    res.render('vwCategories/index');
})
module.exports = router;

