const express = require('express');
const router = express.Router();
const courseModel = require('../models/course.model');
const studentModel = require('../models/student.model');


router.use(function (req, res, next) {
    // Middleware check auth protect this route
    if (!res.locals.isAuthorized) {
        res.redirect('/user/login');
        return;
    }
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
router.post('/addToWatchList', async (req, res) => {
    console.log("Result: " + await studentModel.AddToWatchList(res.locals.user.username, req.body.id));
    res.send("Add to my watch list");
})
router.post('/removeFromWatchList', async (req, res) => {
    console.log("Result: " + await studentModel.RemoveFromWatchList(res.locals.user.username, req.body.id));
    res.send("Remove from my watch list");
})
router.get('/myWatchList', async (req, res) => {
    // Load student's watch list
    const course = await studentModel.GetWatchList(res.locals.user.username);
    res.render('vwStudent/favorite', {
        layout: 'main.hbs'
    });
})
router.get('/info', async (req, res) => {
    // Load student's information
    const info = await studentModel.GetInfo(res.locals.user.username);
    // res.send("My information");
    res.render('vwStudent/account', {
        layout: 'main.hbs'
    });
})
router.get('/enrolledCourses', async (req, res) => {
    // Load my enroll course
    const courses = await studentModel.GetEnrolledCourses(res.locals.user.username);
    res.render('vwStudent/enroll', {
        layout: 'main.hbs'
    });
})
router.get('/edit/password', async (req, res) => {
    res.render('vwStudent/changepassword', {
        layout: 'main.hbs'
    });
})
router.post('/edit/password', function (req, res) {
    console.log('Changed!')
})
module.exports = router;