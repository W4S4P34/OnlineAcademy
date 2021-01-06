const express = require('express');
const { ROLES } = require('../utils/enum');
const courseModel = require('../models/course.model');
const studentModel = require('../models/student.model');
const authModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { json } = require('express');
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
        res.redirect('/user/login');
        return;
    }
    console.log("STUDENT MIDDLEWARE ROUTE");
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme(req.params.field);
    res.locals.watchListSize = await studentModel.GetWatchListSize(res.locals.user.username);
    res.locals.enrolledCoursesSize = await studentModel.GetEnrolledCoursesSize(res.locals.user.username);
    next();
})
router.post('/addToCart', async (req, res) => {
    //req.body.id = req.params.id;
    const item = await courseModel.GetDetailCourseById(req.body.id);
    if (item !== null) {
        studentModel.AddToCart(req.session.cart, item);
    }
    res.json(req.session.cart);
    //res.redirect(req.headers.referer);
})
router.post('/removeFromCart', (req, res) => {
    //req.body.id = req.params.id;
    req.session.cart = studentModel.RemoveFromCart(req.session.cart, req.body.id);
    res.json(req.session.cart);
    //res.redirect(req.headers.referer);
})


router.post('/removeAllCart', (req, res) => {
    req.session.cart = [];
    res.redirect(req.headers.referer);
})
router.post('/checkOut', (req, res) => {
    // Check out
    res.send("Check out");
})
router.post('/buyNow',async (req, res) => {
    if (req.body.id === undefined) {
        return res.json("Invalid course ID");
    }
    if (await studentModel.IsEnrolled(res.locals.user.username, req.body.id)) {
        return res.json("You bought this course already!");
    }
    var today = new Date();
    var date = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;
    const err = await studentModel.BuyNow(res.locals.user.username, req.body.id, date);
    res.json(err);
})
router.post('/addToWatchList', async (req, res) => {
    console.log(req.body.id);
    await studentModel.AddToWatchList(res.locals.user.username, req.body.id);
    res.json(true);
})
router.post('/removeFromWatchList', async (req, res) => {
    await studentModel.RemoveFromWatchList(res.locals.user.username, req.body.id);
    res.json(true);
})
router.get('/myWatchList', async (req, res) => {
    // Load student's watch list
    res.locals.currentView = '#user-preferences';
    const total = res.locals.watchListSize;
    const nPages = Math.ceil(total / process.env.PAGINATE);
    const page = ((req.query.page || 1) < 1 || (req.query.page || 1) > nPages) ? 1 : (req.query.page || 1);
    if (total !== 0) {
        res.locals.pageNumbers = CreatePageNumber(nPages, page);
        res.locals.watchList = await studentModel.GetWatchList(res.locals.user.username, process.env.PAGINATE, (page - 1) * process.env.PAGINATE);
    }
    res.render('vwStudent/favorite', {
        layout: 'main.hbs'
    });
})
router.get('/info', async (req, res) => {
    // Load student's information
    res.locals.currentView = '#user-preferences';
    res.render('vwStudent/account', {
        layout: 'main.hbs'
    });
})
router.get('/enrolledCourses', async (req, res) => {
    // Load my enroll course
    res.locals.currentView = '#user-preferences';
    const total = res.locals.enrolledCoursesSize;
    const nPages = Math.ceil(total / process.env.PAGINATE);
    const page = ((req.query.page || 1) < 1 || (req.query.page || 1) > nPages) ? 1 : (req.query.page || 1);
    if (total !== 0) {
        res.locals.pageNumbers = CreatePageNumber(nPages, page);
        res.locals.enrolledCourses = await studentModel.GetEnrolledCourses(res.locals.user.username, process.env.PAGINATE, (page - 1) * process.env.PAGINATE);
    }
    res.render('vwStudent/enroll', {
        layout: 'main.hbs'
    });
})
router.get('/editProfile/password', (req, res) => {
    res.locals.currentView = '#user-preferences';
    res.render('vwStudent/changepassword', {
        layout: 'main.hbs'
    });
})
router.post('/editProfile/password', async (req, res) => {
    res.locals.currentView = '#user-preferences';
    if (req.body.oldPassword && req.body.newPassword === undefined) {
        return res.json("Invalid input!");
    }
    if (!await bcrypt.compare(req.body.oldPassword, res.locals.user.password)) {
        return res.json("Password is incorrect!");    
    }
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    const err = await studentModel.UpdatePassword(res.locals.user.username, hashedPassword);
    res.json(err);
})
router.post('/editProfile/communication', async (req, res) => {
    res.locals.currentView = '#user-preferences';
    if (req.body.name && req.body.phoneNumber && req.body.email === undefined) {
        return res.json("Invalid input!");
    }
    if (await authModel.IsExist({ username: '', email: req.body.email }))
        return res.json("Email is exist already!");
    err = await studentModel.UpdateProfile(res.locals.user.username,req.body.name,req.body.phoneNumber,req.body.email);
    if (err === null) {
        const newUser = {
            username: res.locals.user.username,
            password: res.locals.user.password,
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            role: ROLES.STUDENT
        }
        console.log(newUser);
        res.clearCookie('tokenAuthorized');
        res.cookie('tokenAuthorized', jwt.sign(newUser, process.env.PRIVATE_KEY), {
            maxAge: (2 * 60 * 60 * 1000),
            httpOnly: true
        });
    }
    res.json(err);
})
module.exports = router;