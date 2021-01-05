// Support framework modules
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const exphbs = require('express-handlebars');
const express_handlebars_sections = require('express-handlebars-sections');
const ip = require("ip");

// Self-Definition modules
const middleware = require('./middleware/middleware');

// App-using declaration
const app = express();
require('dotenv').config();

app.use(cookieParser());
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'PRIVATE_KEY',
    resave: false,
    saveUninitialized: true
}))
app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: true
}));

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    helpers: {
        section: express_handlebars_sections()
    }
}));

// Middleware
app.use(middleware.CheckAuthorized);
app.use(middleware.InitCart);
// Static declaration
app.use('/resource/public', express.static('resource/public'));
app.use('/resource/private', middleware.AccessPrivateResource ,express.static('resource/private'));
app.use('/views/assets',express.static('views/assets'));
// Program configurations
app.set('view engine', 'hbs');


// Controllers declaration
try {
    app.use('/', require('./controllers/homepage.route'));
    app.use('/student', require('./controllers/student.route'));
    app.use('/course', require('./controllers/course.route'));
    app.use('/user', require('./controllers/user.route'));
} catch (e) {
    console.log(e);
}


// App start listening
app.listen(process.env.PORT, ip.address(), function () {
    console.log(`App is listening at http://${ip.address()}:${process.env.PORT}`);
})