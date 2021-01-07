const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ROLES } = require('../utils/enum');
const courseModel = require('../models/course.model');
const lecturerModel = require('../models/lecturer.model');

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
    if (res.locals.user.role !== ROLES.LECTURER) {
        return res.redirect('/');
    }
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme(req.params.field);
    res.locals.lecturesSize = await lecturerModel.GetLecturesSize(res.locals.user.username);
    
    next();
})

router.get('/info', (req, res) => {
    res.locals.currentView = '#user-preferences';
    res.render('vwLecturer/account', {
        layout: 'main.hbs'
    });
})
router.get('/lectures',async (req, res) => {
    res.locals.currentView = '#user-preferences';
    const total = res.locals.lecturesSize;
    const nPages = Math.ceil(total / process.env.PAGINATE);
    const page = ((req.query.page || 1) < 1 || (req.query.page || 1) > nPages) ? 1 : (req.query.page || 1);
    if (total !== 0) {
        res.locals.pageNumbers = CreatePageNumber(nPages, page);
        res.locals.lectures = await lecturerModel.GetLectures(res.locals.user.username, process.env.PAGINATE, (page - 1) * process.env.PAGINATE);
    }
    res.render('vwLecturer/lecture', {
        layout: 'main.hbs'
    });
})
router.get('/editProfile/password', (req, res) => {
    res.locals.currentView = '#user-preferences';
    res.render('vwLecturer/changepassword', {
        layout: 'main.hbs'
    });
})
router.post('/editProfile/password', async (req, res) => {
    if (req.body.oldPassword && req.body.newPassword === undefined) {
        return res.json("Invalid input!");
    }
    if (!await bcrypt.compare(req.body.oldPassword, res.locals.user.password)) {
        return res.json("Password is incorrect!");
    }
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    const err = await lecturerModel.UpdatePassword(res.locals.user.username, hashedPassword);
    if (!err) {
        const newUser = {
            username: res.locals.user.username,
            password: hashedPassword,
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            university: req.body.university,
            gender: res.locals.user.gender,
            role: ROLES.LECTURER
        }
        res.clearCookie('tokenAuthorized');
        res.cookie('tokenAuthorized', jwt.sign(newUser, process.env.PRIVATE_KEY), {
            maxAge: (2 * 60 * 60 * 1000),
            httpOnly: true
        });
    }
    res.json(err);
})
router.post('/editProfile/communication', async (req, res) => {
    res.locals.currentView = '#user-preferences';
    if (req.body.name && req.body.phoneNumber && req.body.email && req.body.university === undefined)
        return res.json("Invalid input!");
    if (await lecturerModel.IsExist(req.body.email,res.locals.user.username))
        return res.json("Email is exist already!");
    const newUser = {
        username: res.locals.user.username,
        password: res.locals.user.password,
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        university: req.body.university,
        gender: res.locals.user.gender,
        role: ROLES.LECTURER
    }
    const err = await lecturerModel.UpdateProfile(newUser,res.locals.user.username);
    if (!err) {
        res.clearCookie('tokenAuthorized');
        res.cookie('tokenAuthorized', jwt.sign(newUser, process.env.PRIVATE_KEY), {
            maxAge: (2 * 60 * 60 * 1000),
            httpOnly: true
        });
    }
    res.json(err);
})
router.get('/editCourse', (req, res) => {
    
})
module.exports = router;