// Framework support modules
const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const ip = require("ip");

//Self-Definition modules
const middleware = require('./middleware/middleware');

const app = express();
require('dotenv').config();

app.use(cookieParser());
app.use(morgan('dev'));
app.use(middleware.CheckAuthorized);



app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(express.urlencoded({
    extended: true
}));



try {
    app.use('/', require('./controllers/course.route'));
    app.use('/user', require('./controllers/user.route'));

} catch (e) {
    console.log(e);
}

// Handle error
//app.get('/err', function (req, res) {
//    throw new Error('Error!');
//});

//app.use(function (err, req, res, next) {
//    console.log("Error call");
//    res.status(404).send("Link not found");
//})

app.listen(process.env.PORT, ip.address(), function () {
    console.log(`App is listening at http://${ip.address()}:${process.env.PORT}`);
})

