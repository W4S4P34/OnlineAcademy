const express = require('express');
const courseModel = require('../models/course.model');
const studentModel = require('../models/student.model');
const { IsEnrolled } = require('../models/student.model');
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
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme(req.params.field);
    res.locals.listHighlightCourse = await courseModel.GetTopNewCourses(5);
    const total = await courseModel.CountCourseByField(req.params.field);
    const nPages = Math.ceil(total / process.env.PAGINATE);
    const page = (req.query.page || 1) < 1 ? 1 : (req.query.page || 1);
    res.locals.listCourse = await courseModel.GetCourseByField(req.params.field, process.env.PAGINATE, (page - 1) * process.env.PAGINATE);
    res.locals.pageNumbers = CreatePageNumber(nPages, page);
    
    // console.log(req.params.field);
    res.render('vwCategories/index');
})
router.get('/byTheme/:theme', async (req, res) => {
    res.locals.currentView = '#categories';
    const field = await courseModel.GetFieldByTheme(req.params.theme);
    if (field !== null) {
        const total = await courseModel.CountCourseByTheme(req.params.theme);
        const nPages = Math.ceil(total / process.env.PAGINATE);
        const page = (req.query.page || 1) < 1 ? 1 : (req.query.page || 1);
        res.locals.listCourse = await courseModel.GetCourseByTheme(req.params.theme, process.env.PAGINATE, (page - 1) * process.env.PAGINATE);
        res.locals.pageNumbers = CreatePageNumber(nPages, page);
    }
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme(field);
    res.locals.listHighlightCourse = await courseModel.GetTopNewCourses(5);

    // console.log(req.params.theme);
    res.render('vwCategories/index');

})
router.get('/detail/:id', async (req, res) => {
    res.locals.currentView = '#categories';
    res.locals.detailCourse = await courseModel.GetDetailCourseById(req.params.id);
    if (res.locals.detailCourse === null) {
        res.status(500).send("Not found");
        return;
    }
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme(res.locals.detailCourse.fieldName);
    res.locals.lecturer = await courseModel.GetLecturer(req.params.id);
    res.locals.relatedCourses = await courseModel.GetRelatedCourses(req.params.id, 3);
    res.locals.listSections = await courseModel.GetSections(req.params.id);
    res.locals.numberOfSection = res.locals.listSections === null ? 0 : res.locals.listSections.length;
    res.locals.listFeedbacks = await courseModel.GetFeedbacks(req.params.id);
    if (res.locals.isAuthorized) {
        res.locals.isInCart = studentModel.IsInCart(req.session.cart, req.params.id) || await studentModel.IsEnrolled(res.locals.user.username, req.params.id);
        res.locals.isInWatchList = await studentModel.IsInWatchList(res.locals.user.username, req.params.id);
        res.locals.isEnrolled = await IsEnrolled(res.locals.user.username, req.params.id);
    }
    res.render('vwCategories/details');
})
module.exports = router;

