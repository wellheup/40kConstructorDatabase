//set up Express
const express = require('express');
const app = express();
const path = require('path');

//set up handlebars
//const handlebars = require('express-handlebars').create({defaultLayout: 'main'});
const handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: require(path.join(__dirname, './customHelpers/selectHelper')),
    helpers: require(path.join(__dirname, './customHelpers/forTwoHelper'))
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/public')));

//Setup Routes
const homeRouter = require('./routes/home');
const equipmentsRouter = require('./routes/equipments');
const spacemarinesRouter = require('./routes/spacemarines');
const sergeantsRouter = require('./routes/sergeants');
const equipmentSearchRouter = require('./routes/equipmentSearch');

//set port to use and console message to remind how to end process
app.set('port', 4361);
app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

//include body parser so we can parse the bodies of post requests...
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//app.use(bodyParser);

// Assign routes
app.use('/', homeRouter);
app.use('/equipments', equipmentsRouter);
app.use('/spacemarines', spacemarinesRouter);
app.use('/sergeants', sergeantsRouter);
app.use('/equipmentSearch', equipmentSearchRouter);

//Handle errors
app.use(function(req, res) {
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

app.get('/', function(req, res, next){
    context = {};
    context.planSubtitle = req.query.myData;
    res.render('home', context);
})

//Needed for routes, no idea what this does
module.exports = app;