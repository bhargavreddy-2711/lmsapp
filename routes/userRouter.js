var express = require('express');
var router = express.Router();
var bodyparser = require('body-parser');
var expressvalidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));
router.use(expressvalidator());
router.use(flash());
//passport config and session
router.use(
    require("express-session")({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
    
    })
  );

router.use(passport.initialize());
router.use(passport.session());

//home page
router.get('/', (req, res) => {
    res.render("home");
});

//registration form
router.get("/register", (req, res) => {
    res.render("register");
  });

//registration logic
router.post("/employee/register", (req, res) => {
    var type = req.body.type;
    if (type == "employee") {
      var name = req.body.name;
      var username = req.body.username;
      var password = req.body.password;
      var password2 = req.body.password2;
      var salary = req.body.salary;
      var department = req.body.department;
      var image = req.body.image;
      //validation
      req.checkBody("name", "name is required").notEmpty();
      req.checkBody("username", "Username is required").notEmpty();
      req.checkBody("salary", "salary is required").notEmpty();
      req.checkBody("department", "department is required").notEmpty();
      req.checkBody("password", "Password is required").notEmpty();
      req.checkBody("password2", "Password dont match").equals(req.body.password);
  
      var errors = req.validationErrors();
      if (errors) {
        console.log("errors: " + errors);
        res.render("register", {
          errors: errors
        });
      }
       else {
        var newEmployee = new Employee({
          name: name,
          username: username,
          password: password,
          department: department,
          salary: salary,
          type: type,
          image: image
        });
        Employee.createEmployee(newEmployee, (err, employee) => {
          if (err) throw err;
          console.log(employee);
        });
        req.flash("success", "you are registered successfully,now you can login");
  
        res.redirect("/employee/login");
      }
    }
    else if (type == "manager") {
      var name = req.body.name;
      var username = req.body.username;
      var password = req.body.password;
      var password2 = req.body.password2;
      var department = req.body.department;
      var image = req.body.image;
  
      req.checkBody("name", "Name is required").notEmpty();
      req.checkBody("username", "Username is required").notEmpty();
      req.checkBody("password", "password is required").notEmpty();
      req.checkBody("department", "department is required").notEmpty();
      req.checkBody("password2", "Password dont match").equals(req.body.password);
  
      var errors = req.validationErrors();
      if (errors) {
        res.render("register", {
          errors: errors
        });
      } else {
        var newManager = new Manager({
          name: name,
          username: username,
          password: password,
          department: department,
          type: type,
          image: image
        });
        Manager.createManager(newManager, (err, manager) => {
          if (err) throw err;
          console.log(manager);
        });
        req.flash("success", "you are registered successfully,now you can login");
  
        res.redirect("/manager/login");
      }
    } else if (type == "techlead") {
      var name = req.body.name;
      var username = req.body.username;
      var password = req.body.password;
      var password2 = req.body.password2;
      var salary = req.body.salary;
      var image = req.body.image;
  
      req.checkBody("name", "Name is required").notEmpty();
      req.checkBody("username", "Username is required").notEmpty();
      req.checkBody("password", "password is required").notEmpty();
      req.checkBody("salary", "salary is required").notEmpty();
      req.checkBody("password2", "Password dont match").equals(req.body.password);
  
      var errors = req.validationErrors();
      if (errors) {
        res.render("register", {
          errors: errors
        });
      } else {
        var newTechlead = new Techlead({
          name: name,
          username: username,
          password: password,
          salary: salary,
          type: type,
          image: image
        });
        Techlead.createTechlead(newTechlead, (err, techlead) => {
          if (err) throw err;
          console.log(techlead);
        });
        req.flash("success", "you are registered successfully,now you can login");
  
        res.redirect("/techlead/login");
      }
    }
  });
  
//logout
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

//export router
module.exports = router;