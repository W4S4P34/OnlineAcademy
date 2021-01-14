const express = require('express');
const courseModel = require('../models/course.model');
const studentModel = require('../models/student.model');
const lecturerModel = require('../models/lecturer.model');
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
function InitMarkCompleteSection(listSection, listMarkComplete) {
    if (!listMarkComplete)
        return listSection;
    const newlst = [];
    for (var i = 0; i < listSection.length; i++) {
        newlst.push({
            id: listSection[i].id,
            title: listSection[i].title,
            description: listSection[i].description,
            videoPath: listSection[i].videoPath,
            courseId: listSection[i].courseId,
            preview: listSection[i].preview,
            isComplete: false
        })
    }
    console.log(listMarkComplete);
    for (var i = 0; i < listMarkComplete.length; i++) {
        var sectionId = listMarkComplete[i].sectionId;
        newlst[parseInt(sectionId)-1].isComplete = listMarkComplete[i].isComplete;
    }
    return newlst;
}
router.use(async (req, res, next) => {
    // Middleware check auth protect this route
    if (!res.locals.isAuthorized) {
        res.locals.user = {
            role: ROLES.GUEST
        }
    }
    next();
})

router.get('/byField/:field', async (req, res) => {
    res.locals.currentView = '#categories';
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme(req.params.field);
    if (res.locals.listCourseFields !== null) {
        const total = await courseModel.CountCourseByField(req.params.field);
        const nPages = Math.ceil(total / process.env.PAGINATE);
        const page = (req.query.page || 1) < 1 ? 1 : (req.query.page || 1);
        res.locals.pageNumbers = CreatePageNumber(nPages, page);
        res.locals.listCourse = await courseModel.GetCourseByField(req.params.field, process.env.PAGINATE, (page - 1) * process.env.PAGINATE);
    }

    res.locals.listHighlightCourse = await courseModel.GetTopNewCourses(5);
    res.render('vwCategories/index');
})
router.get('/byTheme/:theme', async (req, res) => {
    res.locals.currentView = '#categories';
    const field = await courseModel.GetFieldByTheme(req.params.theme);
    if (field !== null) {
        const total = await courseModel.CountCourseByTheme(req.params.theme);
        const nPages = Math.ceil(total / process.env.PAGINATE);
        const page = (req.query.page || 1) < 1 ? 1 : (req.query.page || 1);
        res.locals.pageNumbers = CreatePageNumber(nPages, page);
        res.locals.listCourse = await courseModel.GetCourseByTheme(req.params.theme, process.env.PAGINATE, (page - 1) * process.env.PAGINATE);
        res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme(field);
    }
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
    courseModel.UpdateNumberOfView(req.params.id);
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme(res.locals.detailCourse.fieldName);
    res.locals.lecturer = await courseModel.GetLecturer(req.params.id);
    res.locals.relatedCourses = await courseModel.GetRelatedCourses(req.params.id, 3);
    res.locals.listSections = await courseModel.GetSections(req.params.id);
    res.locals.numberOfSection = res.locals.listSections === null ? 0 : res.locals.listSections.length;
    res.locals.listFeedbacks = await courseModel.GetFeedbacks(req.params.id);
    if (res.locals.isAuthorized) {
        if (res.locals.user.role === ROLES.STUDENT) {
            res.locals.isEnrolled = await studentModel.IsEnrolled(res.locals.user.username, req.params.id);
            res.locals.isInCart = studentModel.IsInCart(req.session.cart, req.params.id) || res.locals.isEnrolled;
            res.locals.isInWatchList = await studentModel.IsInWatchList(res.locals.user.username, req.params.id);
            const mark = await studentModel.GetMarkComplete(res.locals.user.username, req.params.id);
            res.locals.listSections = InitMarkCompleteSection(res.locals.listSections, mark);
            const numComplete = mark === null ? 0 : mark.filter((value) => { return value.isComplete }).length;
            res.locals.currentProgress = res.locals.numberOfSection !== 0 ? Math.round((numComplete / res.locals.numberOfSection * 100)) : 0;
        }
        if (res.locals.user.role === ROLES.LECTURER && await lecturerModel.IsMyLecture(res.locals.user.username, req.params.id)) {
            return res.render('vwLecturer/editcourse');
        }
    }

    return res.render('vwCategories/details');
})
module.exports = router;