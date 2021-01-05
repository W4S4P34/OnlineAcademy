const express = require('express');
const model = require('../models/user.model');
const bcrypt = require('bcrypt');
const emailService = require('../controllers/emailService.route');
const jwt = require('jsonwebtoken');
const moment = require('moment');


const router = express.Router();

router.get('/login' ,async (req, res) => {
    if (res.locals.isAuthorized) {
        res.redirect('/');
    }
    else {
        res.render('empty', { layout: 'login.hbs' });
    }
    await model.GetAll();
})



router.post('/login', async (req, res) => {
    const user = await model.GetByID(req.body);
    console.log(req.body);
    console.log(user);
    if (user == null) {
        return res.status(400).send("Your ID or password is not valid");
    }
    try {

        if (await bcrypt.compare(req.body.password, user.password)) {
            // Can't not sign this user -> Change object
            res.cookie('tokenAuthorized', jwt.sign(user, process.env.PRIVATE_KEY), { maxAge: (2 * 60 * 60 * 1000), httpOnly: true });
            res.send("Success");
        }
        else {
            res.status(400).send("Your ID or password is not valid");
        }

    } catch (e) {
        console.log("Failed");
        res.status(500).send(e);
    }  
})

router.post('/logout', function (req, res) {
    if (res.locals.isAuthorized) {
        res.clearCookie('tokenAuthorized');
    }
    const url = req.headers.referer || '/';
    res.redirect(url);
})

router.get('/register', function (req, res) {
    if (res.locals.isAuthorized) {
        res.redirect('/');
    }
    else {
        res.render('empty', { layout: 'register.hbs' });
    }
})

router.post('/register', async (req, res) => {
    try {
        if (await model.IsExist(req.body)) {
            res.status(400).send("ID or email exist already");
            return;
        }

        //#region Fields
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { username: req.body.username, password: hashedPassword, email: req.body.email };
        const token = jwt.sign(user, process.env.PRIVATE_KEY, { expiresIn: '10m' });
        //#endregion

        //const dob = moment(req.body.dob, 'DD/MM/YYYY', 'YYYY-MM-DD');

        //#region Log
        console.log(req.body);
        console.log(user);
        //#endregion
        
        emailService.sendConfirmationEmail(req.body, token ,(err, data) => {
            if (err) {
                res.render('vwLogin/sendOTPFailed', { layout: 'register.hbs' });
            }
            else {
                res.render('vwLogin/sendOTPSuccess', { layout: 'register.hbs' });
            }
        });
    } catch (e) {
        res.status(500).send("Catch Error: " + e);
    }
})
router.get('/isAvailable', function () {

})
router.get('/confirmation/:token', function (req, res) {
    try {
        jwt.verify(req.params.token, process.env.PRIVATE_KEY,async (err, authData) => {
            if (err) {
                res.send("OTP expires");
            }
            else {
                res.redirect('/user/login');
                await model.Add(authData);
            }
        });
    } catch (e) {
        console.log("Error: " + e);
        res.send("Error: " + e);
    }
})

module.exports = router;