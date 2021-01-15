const express = require('express');

const { ROLES } = require('../utils/enum');
const courseModel = require('../models/course.model');
const adminModel = require('../models/admin.model');
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

router.use(async (req, res, next) => {
    // Middleware check auth protect this route
    if (!res.locals.isAuthorized) {
        return res.redirect('/user/login');
    }
    if (res.locals.user.role !== ROLES.ADMIN) {
        return res.redirect('/');
    }
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme(req.params.field);
    next();
})
router.get('/categoriesManagement/', (req, res) => {
    res.render('vwAdmin/categoriesmanage');
    
})

router.get('/studentsManagement', async (req, res) => {
    const total = await adminModel.GetAllStudentSize();
    if (total !== 0) {
        const nPages = Math.ceil(total / process.env.ADMIN_PAGINATE);
        const page = (req.query.page || 1) < 1 ? 1 : (req.query.page || 1);
        res.locals.pageNumbers = CreatePageNumber(nPages, page);
        res.locals.listStudent = await adminModel.GetAllStudent(process.env.ADMIN_PAGINATE, (page - 1) * process.env.ADMIN_PAGINATE);
    }
    res.render('vwAdmin/studentsmanage');
})

router.get('/lecturersManagement',async (req, res) => {
    const total = await adminModel.GetAllLecturerSize();
    if (total !== 0) {
        const nPages = Math.ceil(total / process.env.ADMIN_PAGINATE);
        const page = (req.query.page || 1) < 1 ? 1 : (req.query.page || 1);
        res.locals.pageNumbers = CreatePageNumber(nPages, page);
        res.locals.listLecturer = await adminModel.GetAllLecturer(process.env.ADMIN_PAGINATE, (page - 1) * process.env.ADMIN_PAGINATE);
    }
    res.render('vwAdmin/lecturersmanage');
})

router.post('/edit/categories', async (req, res) => {
    var err = null;
    if ((req.body.fieldName || req.body.subFieldName) === undefined) {
        return res.json("Invalid input");
    }
    if (req.body.fieldName) {
        err = await adminModel.UpdateField(req.body.preFieldName, req.body.fieldName);
    } else {
        err = await adminModel.UpdateSubField(req.body.preSubFieldName, req.body.subFieldName);
    }
    const value = req.body.fieldName || req.body.subFieldName;
    console.log("Change field " + value);
    res.json(err);
})
router.post('/add/categories', async (req, res) => {
    var err = null;
    if ((req.body.newField || req.body.newSubField) === undefined) {
        return res.json("Invalid input");
    }
    err = await adminModel.AddNewField(req.body.newField)
    if (!err && req.body.newSubField.length !== 0) {
        err = await adminModel.AddNewSubField(req.body.newSubField, req.body.newField);
    }
    res.json(err);
})
router.post('/remove/categories', async (req, res) => {
    var err = null;

    if ((req.body.fieldName || req.body.subFieldName) === undefined) {
        return res.json("Invalid input");
    }

    if (req.body.fieldName) {

        const course = await courseModel.GetCourseByField(req.body.fieldName, 1, 0, true);
        if (course) {
            err = "Can not delete because this field has course";
        } else {
            err = await adminModel.RemoveField(req.body.fieldName);
        }
    }
    else {
        const course = await courseModel.GetCourseByTheme(req.body.subFieldName, 1, 0, true);
        if (course) {
            err = "Can not delete because this field has course";
        } else {
            err = await adminModel.RemoveSubField(req.body.subFieldName);
        }
    }
    const value = req.body.fieldName || req.body.subFieldName;
    console.log("Delete field " + value);
    res.json(err);
})
router.post('/ban/student', async (req, res) => {
    const err = await adminModel.UpdateStudentAccount(req.body.id,true);
    res.json(err);
})
router.post('/ban/lecturer', async (req, res) => {
    const err = await adminModel.UpdateLecturerAccount(req.body.id,true);
    res.json(err);
})
router.post('/ban/course', async (req, res) => {
    const err = await adminModel.UpdateCourse(req.body.courseId, false);
    res.json(err);
})
router.post('/unlock/student', async (req, res) => {
    const err = await adminModel.UpdateStudentAccount(req.body.id, false);
    res.json(err);
})
router.post('/unlock/lecturer', async (req, res) => {
    const err = await adminModel.UpdateLecturerAccount(req.body.id, false);
    res.json(err);
})
router.post('/unlock/course', async (req, res) => {
    const err = await adminModel.UpdateCourse(req.body.courseId, true);
    res.json(err);
})
module.exports = router;