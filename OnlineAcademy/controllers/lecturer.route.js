const express = require('express');
const router = express.Router();

router.get('/info', async (req, res) => {
    res.render('vwLecturer/account', {
        layout: 'main.hbs'
    });
})
router.get('/lectures', async (req, res) => {
    res.render('vwLecturer/lecture', {
        layout: 'main.hbs'
    });
})
router.get('/edit/password', async (req, res) => {
    res.render('vwLecturer/changepassword', {
        layout: 'main.hbs'
    });
})
router.get('/add/course', async (req, res) => {
    res.render('vwLecturer/addcourse', {
        layout: 'main.hbs'
    });
})

module.exports = router;