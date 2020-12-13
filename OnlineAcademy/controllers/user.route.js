const express = require('express');
const model = require('../models/user.model');
const bcrypt = require('bcrypt');
const emailService = require('../controllers/emailService.route');
const jwt = require('jsonwebtoken');
const middleware = require('../middleware/middleware');
//const category = require('../models/login.model');

const router = express.Router();
const PRIVATE_KEY = "5E884898DA28047151D0E56F8DC6292773603D0D6AABBDD62A11EF721D1542D8";

router.get('/login', middleware.isAuthorized ,async (req, res) => {
    if (res.locals.post) {
        res.send("Watch List");
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
            res.cookie('tokenAuthorized', jwt.sign(user, PRIVATE_KEY), { maxAge: (2 * 60 * 60 * 1000), httpOnly: true });
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

router.get('/logout', function (req, res) {
    const tokenAuthorized = req.cookies.tokenAuthorized;
    if (tokenAuthorized) {
        jwt.verify(tokenAuthorized, PRIVATE_KEY, (err, authData) => {
            if (!err) {
                res.clearCookie('tokenAuthorized');
                res.redirect('http://yanghoco.ddns.net/user/login');
            }
        })
    }
})

router.get('/register', function (req, res) {
    res.render('empty', { layout: 'register.hbs' });
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
        const token = jwt.sign(user, PRIVATE_KEY, { expiresIn: '10m' });
        //#endregion

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
router.get('/confirmation/:token', function (req, res) {
    try {
        jwt.verify(req.params.token, PRIVATE_KEY,async (err, authData) => {
            if (err) {
                res.send("OTP expires");
            }
            else {
                res.redirect('http://yanghoco.ddns.net/user/login');
                await model.Add(authData);
            }
        });
    } catch (e) {
        console.log("Error: " + e);
        res.send("Error: " + e);
    }
})

router.get('/myWatchList', middleware.isAuthorized, function (req, res) {
    if (res.locals.post) {
        res.send("Watch List");
    }
    else {
        res.redirect('http://yanghoco.ddns.net/user/login');
    }
})
module.exports = router;