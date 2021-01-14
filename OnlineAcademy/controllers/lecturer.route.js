const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const mkdirp = require('mkdirp');

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
    res.locals.listCourseFields = await courseModel.GetAllFieldsAndTheme();
    res.locals.lecturesSize = await lecturerModel.GetLecturesSize(res.locals.user.username);
    res.locals.courseSize = await courseModel.CountCourse();
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
router.post('/editCourse/details/:courseId',async (req, res) => {
    console.log(req.params.courseId);
    var today = new Date();
    var date = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;
    const err = await lecturerModel.UpdateDetail(req.body, req.params.courseId, date);
    res.json(err);
})
router.post('/editCourse/section/:courseId', (req, res) => {
    console.log(req.params.courseId);
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            console.log(file);
            let path = null;
            if (file.fieldname === "mainVideo") {
                path = `./resource/private/course/${req.params.courseId}`;
            }
            else {
                path = `./resource/public/course/${req.params.courseId}/preview`;
            }
            const made = mkdirp.sync(path);
            cb(null, path);
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    });

    const upload = multer({ storage: storage });
    upload.any()(req, res, async function (err) {
        if (req.body.sectionId && req.body.lectureName !== undefined) {
            const err = await lecturerModel.InsertAndUpdateSection(req.params.courseId, req.body.sectionId, req.body.lectureName, req.body.preview, req.body.imagePath);
            res.json(err);
        }
        if (err) {
            console.log(err);
        }
    });
})
router.post('/editCourse/image/:courseId', (req, res) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const path = `./resource/public/course/${req.params.courseId}`;
            cb(null, path);
        },
        filename: function (req, file, cb) {
            cb(null, "photo.png");
        }
    });

    const upload = multer({ storage: storage });
    upload.any()(req, res, function (err) {
        if (err) {
            console.log(err);
        }
    });
})
router.get('/addCourse', (req, res) => {
    res.locals.currentView = '#user-preferences';
    res.render('vwLecturer/addcourse');
})
router.post('/addCourse', async (req, res) => {
    //console.log(req.body.courseName);
    //console.log(req.body.field);
    //console.log(req.body.subField);
    //console.log(req.body.shortDescription);
    //console.log(req.body.description);
    //console.log(req.body.price);
    //console.log(req.body.status);
    //console.log(req.body.lectureName);
    var today = new Date();
    var date = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;
    let err = await lecturerModel.AddCourse(req.body,res.locals.user.username,res.locals.courseSize+1,date);
    err = await lecturerModel.AddSections(res.locals.courseSize + 1, req.body.lectureName);
    res.json(err);
})
router.post('/upload', (req, res) => {

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const courseId = res.locals.courseSize+1;
            console.log(courseId);
            var path = null;
            if (file.fieldname === "previewVideo") {
                path = `./resource/public/course/${courseId}/preview`;
            } else if (file.fieldname === "mainVideo") {
                path = `./resource/private/course/${courseId}`;
            } else {
                path = `./resource/public/course/${courseId}`;
            }
            const made = mkdirp.sync(path);
            cb(null, path);
        },
        filename: function (req, file, cb) {
            if (file.fieldname === "coverImage") {
                return cb(null, "photo.png");
            }
            cb(null, file.originalname);
        }
    });

    const upload = multer({ storage: storage });
    upload.any()(req, res, function (err) {
        
        if (err) {
            console.log(err);
        }
    });

})
module.exports = router;