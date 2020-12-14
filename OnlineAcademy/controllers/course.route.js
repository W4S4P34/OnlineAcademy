const express = require('express');
const model = require('../models/course.model');


const router = express.Router();
router.get('/', function(req,res) {
    res.send("Hello Home Page");
})


module.exports = router;