var createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileUpload = require('express-fileupload');

const expressLayouts = require('express-ejs-layouts')
const db = require('./config/connection')
const session = require('express-session')
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const auth = require('./controllers/auth');

const ConnectMongoDBSession = require('connect-mongodb-session');

const mongoDbSesson = new ConnectMongoDBSession(session);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/admin')));
app.use(fileUpload())

app.use(function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


app.use(session({
  saveUninitialized: false,
  secret: 'secrek',
  resave: false,
  store: new mongoDbSesson({
    uri:'mongodb://localhost:27017/ecommerce',
    collection: "session"
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 10 // 10 days
  }
}));
app.use(auth.authInit);

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
