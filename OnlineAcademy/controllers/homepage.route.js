const express = require('express');
const courseModel = require('../models/course.model');
const { ROLES } = require('../utils/enum');
const router = express.Router();

function CreatePageNumber(nPages, curPage = 1) {
    let list = [];
    for (var i = 1; i <= nPages; i++) {
        list.push({
            value: i,
            isActive: curPage == i
        });
    }
    return list;
}
function SeperateCourses(listCourse) {
    if (listCourse === null)
        return null;
    var i = 0;
    const list = [];
    while (i < listCourse.length) {
        list.push({
            item1: listCourse[i],
            item2: listCourse.length - (i+1) === 0 ? null : listCourse[i + 1],
            item3: listCourse.length - (i+2) === 0 ? null : listCourse[i + 2]
        });
        i += 3;
    }
    console.log(list[0]);
    return list;
}
router.get('/', async (req, res) => {
    res.locals.currentView = '#home';
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme();
    res.locals.hotCourses = await courseModel.GetTopHighlightsCourses(3);
    res.locals.mostViewCourses = SeperateCourses(await courseModel.GetMostViewCourses(6));
    res.locals.newCourses = SeperateCourses(await courseModel.GetTopNewCourses(6));
    res.locals.topEnrollField = await courseModel.GetTopEnrollFields(3);
    res.render('vwHome/index');
})
router.get('/about', async (req, res) => {
    res.locals.currentView = '#about';
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme();
    res.render('vwAbout/index');
})
router.get('/categories', async (req, res) => {
    res.locals.currentView = '#categories';
    const newPaginate = parseInt(process.env.PAGINATE) + 3;
    const total = await courseModel.CountAllCourses();
    const nPages = Math.ceil(total / newPaginate);
    const page = (req.query.page || 1) < 1 ? 1 : (req.query.page || 1);
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme();
    res.locals.listHighlightCourse = await courseModel.GetTopNewCourses(5);
    res.locals.pageNumbers = CreatePageNumber(nPages, page);
    res.locals.listCourse = await courseModel.GetAllCourses(newPaginate, (page - 1) * newPaginate,res.locals.user.role === ROLES.ADMIN);
    res.render('vwCategories/index');
})
router.get('/contact', async (req, res) => {
    res.locals.currentView = '#contact';
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme();
    res.render('vwContact/index');
})
module.exports = router;