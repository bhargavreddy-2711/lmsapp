//include modules
const express = require("express");
const mongoose = require("mongoose");
const expressvalidator = require("express-validator");
const session = require("express-session");
const methodOverride = require("method-override");
const bodyparser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");
const flash = require("connect-flash");
const moment = require("moment");
const app = express();

//include models
Employee = require("./models/employee");
Techlead = require("./models/techlead");
Manager = require("./models/manager");
Leave = require("./models/leave");

//indlude passport
require('./config/passport');

//include routes
var userRouter = require("./routes/userRouter");
var managerRouter = require("./routes/managerRouter");
var techleadRouter = require("./routes/techleadRouter");
var employeeRouter = require("./routes/employeeRouter");

//use routes
app.use('/',userRouter);
app.use('/employee',employeeRouter);
app.use('/techlead',techleadRouter);
app.use('/manager',managerRouter);

//connect mongodb
var url =process.env.DATABASEURL|| "mongodb://localhost/LeaveApp";
mongoose
  .connect(url, {
    useNewUrlParser: true
  })
  .then(() => {
    console.log("connected to DB");
  })
  .catch(err => {
    console.log("Error:", err.message);
  });

//set view engine
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(expressvalidator());

//passport config and session
app.use(
  require("express-session")({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.user = req.user || null;
  next();
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
