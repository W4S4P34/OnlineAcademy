const express = require('express');
const model = require('../models/course.model');

const router = express.Router();
router.get('/', (req, res) => {
    res.render('vwHome/index');
})

module.exports = router;