const express = require('express');
const model = require('../models/course.model');

const router = express.Router();

function CreatePageNumber(nPages,curPage = 1) {
    let list = [];
    for (var i = 1; i <= nPages; i++) {
        list.push({
            value: i,
            isActive: curPage == i
        });
    }
    return list;
}
router.get('/byField/:field',async (req, res) => {
    res.locals.currentView = '#categories';
    res.locals.listCourseFields = await model.GetAllFieldsAndTheme(req.params.field);
    res.locals.listHighlightCourse = await model.GetTopNewCourses(5);
    const total = await model.CountCourseByField(req.params.field);
    const nPages = Math.ceil(total / process.env.PAGINATE);
    const page = (req.query.page || 1) < 1 ? 1 : (req.query.page || 1);
    res.locals.listCourse = await model.GetCourseByField(req.params.field, process.env.PAGINATE, (page - 1) * process.env.PAGINATE);
    res.locals.pageNumbers = CreatePageNumber(nPages, page);
    
    // console.log(req.params.field);
    res.render('vwCategories/index');
})
router.get('/byTheme/:theme', async (req, res) => {
    res.locals.currentView = '#categories';
    const field = await model.GetFieldByTheme(req.params.theme);
    if (field != null) {
        const total = await model.CountCourseByTheme(req.params.theme);
        const nPages = Math.ceil(total / process.env.PAGINATE);
        const page = (req.query.page || 1) < 1 ? 1 : (req.query.page || 1);
        res.locals.listCourse = await model.GetCourseByTheme(req.params.theme, process.env.PAGINATE, (page - 1) * process.env.PAGINATE);
        res.locals.pageNumbers = CreatePageNumber(nPages, page);
    }
    res.locals.listCourseFields = await model.GetAllFieldsAndTheme(field);
    res.locals.listHighlightCourse = await model.GetTopNewCourses(5);

    // console.log(req.params.theme);
    res.render('vwCategories/index');

})
router.get('/detail/:id', async (req, res) => {
    res.locals.currentView = '#categories';
    const result = await model.GetDetailCourseById(req.params.id);
    res.json(result);
})
module.exports = router;

