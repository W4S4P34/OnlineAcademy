const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const ip = require("ip");
const app = express();

app.use(morgan('dev'));
app.use(cookieParser());

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(express.urlencoded({
    extended: true
}));

app.get('/', function (req, res) {
    //res.render('home');
    res.send("Hello world");
});
try {
    app.use('/user', require('./controllers/user.route'));
} catch (e) {
    console.log(e);
}
//app.use(function (req, res) {
//    res.status(404).send("Link not found");
//});

// Handle error
app.get('/err', function (req, res) {
    throw new Error('Error!');
});

app.use(function (err, req, res, next) {
    console.log("Error call");
    res.status(404).send("Link not found");
})
const PORT = 80;
app.listen(PORT, ip.address(), function () {
    console.log(`App is listening at http://${ip.address()}:${PORT}`);
})

