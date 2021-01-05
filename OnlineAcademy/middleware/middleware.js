const { ROLES } = require('../utils/enum');
const jwt = require('jsonwebtoken');
const studentModel = require('../models/student.model');

module.exports = {
    CheckAuthorized(req, res, next) {
        console.log("middleware check auth call");
        var isAuthorized = false;
        if (req.cookies.tokenAuthorized != undefined) {
            try {
                jwt.verify(req.cookies.tokenAuthorized, process.env.PRIVATE_KEY, (err, authData) => {
                    if (!err) {
                        console.log("Login Success");
                        isAuthorized = true;
                        res.locals.user = authData;
                    }
                })
            } catch (e) {}
        }
        res.locals.isAuthorized = isAuthorized;
        return next();
    },
    async AccessPrivateResource(req, res, next) {
        console.log("Params: " + req.params.id);
        if (res.locals.isAuthorized) {
            // check student permission
            return next();
            if (res.locals.user.role === ROLES.STUDENT && await studentModel.IsEnrolled(res.locals.user.username, req.params.id)) {
                console.log("Has permission");
                return next();
            }
            // check lecturer permission
            if (res.locals.user.role === ROLES.LECTURER) {
                return next();
            }
            // check admin permission(if need)
        }
        res.status(500).send("No Permission");
    },
    InitCart(req, res, next) {
        if (req.session.cart === undefined) {
            req.session.cart = [];
        }
        next();
    }
}