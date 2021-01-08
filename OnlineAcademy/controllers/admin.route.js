const express = require('express');
const router = express.Router();

router.get('/categoriesManagement', async (req, res) => {
    res.render('vwAdmin/categoriesmanage');
})

router.get('/studentsManagement', async (req, res) => {
    res.render('vwAdmin/studentsmanage');
})

router.get('/lecturersManagement', async (req, res) => {
    res.render('vwAdmin/lecturersmanage');
})

module.exports = router;