// Support framework modules
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const exphbs = require('express-handlebars');
const ip = require("ip");

// Self-Definition modules
const middleware = require('./middleware/middleware');

// App-using declaration
const app = express();
require('dotenv').config();

app.use(cookieParser());
app.use(morgan('dev'));
app.use(middleware.CheckAuthorized);

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/'
}));

// Static declaration
app.use('/views/assets', express.static('views/assets'));

// Program configurations
app.set('view engine', 'hbs');

app.use(express.urlencoded({
    extended: true
}));

// Controllers declaration
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

// App start listening
app.listen(process.env.PORT, ip.address(), function () {
    console.log(`App is listening at http://${ip.address()}:${process.env.PORT}`);
})