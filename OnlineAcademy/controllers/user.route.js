const express = require('express');
const authModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const emailService = require('../controllers/emailService.route');
const jwt = require('jsonwebtoken');
const moment = require('moment');


const router = express.Router();

const jwtBlackList = [];
let activeAccount = [];

router.get('/login', async (req, res) => {
    if (res.locals.isAuthorized) {
        res.redirect('/');
    } else {
        res.render('vwAccount/login', {
            layout: false
        });
    }
})

router.post('/login', async (req, res) => {
    const user = await authModel.GetByID(req.body);
    console.log(req.body);
    console.log(user);
    if (user == null) {
        return res.status(400).send("Your ID or password is not valid");
    }
    try {
        if (activeAccount.findIndex(value => value === user.username) !== -1) {
            res.send("This account is used in somewhere!");
            return;
        }
        if (await bcrypt.compare(req.body.password, user.password)) {
            // Can't not sign this user -> Change object
            activeAccount.push(user.username);
            res.cookie('tokenAuthorized', jwt.sign(user, process.env.PRIVATE_KEY), {
                maxAge: (2 * 60 * 60 * 1000),
                httpOnly: true
            });
            res.redirect('/');
        } else {
            res.status(400).send("Your ID or password is not valid");
        }

    } catch (e) {
        console.log("Failed");
        res.status(500).send("Catch Error: " + e);
    }
})

router.post('/logout', function (req, res) {
    if (res.locals.isAuthorized) {
        activeAccount = activeAccount.filter((value) => {
            return value !== res.locals.user.username;
        })
        res.clearCookie('tokenAuthorized');
    }
    const url = req.headers.referer || '/';
    res.redirect(url);
})

router.get('/register', function (req, res) {
    if (res.locals.isAuthorized) {
        res.redirect('/');
    } else {
        // res.render('empty', {
        //     layout: 'register.hbs'
        // });
        res.render('vwAccount/register', {
            layout: false
        });
    }
})

router.post('/register', async (req, res) => {
    try {
        if (await authModel.IsExist(req.body)) {
            return res.status(404).send("Account is existed");
        }
        //#region Fields
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = {
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            name: req.body.name,
            phoneNumber: req.body.phoneNumber
        };
        const token = jwt.sign(user, process.env.PRIVATE_KEY, {
            expiresIn: '10m'
        });
        //#endregion

        //const dob = moment(req.body.dob, 'DD/MM/YYYY', 'YYYY-MM-DD');

        //#region Log
        console.log(req.body);
        console.log(user);
        //#endregion

        emailService.sendConfirmationEmail(req.body, token, (err, data) => {
            if (err) {
                // Send OTP failed
                res.send("Failed to send mail verification. " + err);
                
            } else {
                // Send OTP successfully
                res.send("Please check your email to activate account!");
            }

        });
    } catch (e) {
        res.status(500).send("Catch Error: " + e);
    }
})
router.get('/register/isAvailable', async (req, res) => {
    console.log("User: " + req.query.username);
    console.log("Email: " + req.query.email);
    return res.json(!await authModel.IsExist(req.query));
})
router.get('/confirmation/:token', function (req, res) {
    try {
        jwt.verify(req.params.token, process.env.PRIVATE_KEY, async (err, authData) => {
            if (err) {
                res.send("OTP expires");
            } else {
                if (jwtBlackList.findIndex(value => { value === req.params.token }) === -1) {
                    jwtBlackList.push(req.params.token);
                    await authModel.Add(authData);
                }
                res.redirect('/user/login');
            }
        });
    } catch (e) {
        console.log("Error: " + e);
        res.send("Error: " + e);
    }
})
module.exports = router;