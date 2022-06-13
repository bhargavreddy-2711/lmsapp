var express = require('express');
var router = express.Router();
var passport = require('passport');
var moment = require('moment');

router.use(passport.initialize());
router.use(passport.session());

//authentication function
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("error", "You need to be logged in");
      res.redirect("/employee/login");
    }
  }
  
//employee login
router.get('/login', (req, res) => {
    res.render("login");
  });

//post employee login data
router.post(
    "/login",
    passport.authenticate("employee", {
      successRedirect: "/employee/home",
      failureRedirect: "/employee/login",
      failureFlash: true
    }),
    (req, res) => {
      res.redirect("/employee/home");
    }
  );
  
//go to employee home page after login
router.get("/home", ensureAuthenticated, (req, res) => {
    var employee = req.user.username;
    console.log(employee);
    Employee.findOne({ username: req.user.username })
      .populate("leaves")
      .exec((err, employee) => {
        if (err || !employee) {
          req.flash("error", "employee not found");
          res.redirect("back");
          console.log("err");
        } else {
          res.render("homeemp", {
            employee: employee,
            moment: moment
          });
        }
      });
  });

//get employee profile page
router.get("/:id", ensureAuthenticated, (req, res) => {
    console.log(req.params.id);
    Employee.findById(req.params.id)
      .populate("leaves")
      .exec((err, foundEmployee) => {
        if (err || !foundEmployee) {
          req.flash("error", "Employee not found");
          res.redirect("back");
        } else {
          res.render("profileemp", { employee: foundEmployee });
        }
      });
  });

//get employee data edit page
router.get("/:id/edit", ensureAuthenticated, (req, res) => {
    Employee.findById(req.params.id, (err, foundEmployee) => {
      res.render("editE", { employee: foundEmployee });
    });
  });
  
 //post edited employee data 
router.post("/:id", ensureAuthenticated, (req, res) => {
    console.log(req.body.employee);
    Employee.findByIdAndUpdate(
      req.params.id,
      req.body.employee,
      (err, updatedEmployee) => {
        if (err) {
          req.flash("error", err.message);
          res.redirect("back");
        } else {
          req.flash("success", "Succesfully updated");
          res.redirect("/employee/" + req.params.id);
        }
      }
    );
  });
 
//get leave apply page 
router.get("/:id/apply", ensureAuthenticated, (req, res) => {
    Employee.findById(req.params.id, (err, foundEmp) => {
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        res.render("leaveApply", { employee: foundEmp });
      }
    });
  });

//post leave apply data
router.post("/:id/apply", (req, res) => {
    Employee.findById(req.params.id)
      .populate("leaves")
      .exec((err, employee) => {
        if (err) {
          res.redirect("/employee/home");
        } else {
          date = new Date(req.body.leave.from);
          todate = new Date(req.body.leave.to);
          year = date.getFullYear();
          month = date.getMonth() + 1;
          dt = date.getDate();
          todt = todate.getDate();
  
          if (dt < 10) {
            dt = "0" + dt;
          }
          if (month < 10) {
            month = "0" + month;
          }
          console.log(todt - dt);
          req.body.leave.days = todt - dt;
          console.log(year + "-" + month + "-" + dt);
          console.log(req.body.leave);
          Leave.create(req.body.leave, (err, newLeave) => {
            if (err) {
              req.flash("error", "Something went wrong");
              res.redirect("back");
              console.log(err);
            } else {
              newLeave.emp.id = req.user._id;
              newLeave.emp.username = req.user.username;
              console.log("leave is applied by--" + req.user.username);
              newLeave.save();
              employee.leaves.push(newLeave);
              employee.save();
              req.flash("success", "Successfully applied for leave");
              res.render("homeemp", { employee: employee, moment: moment });
            }
          });
        }
      });
  });

//track leave of an employee
router.get("/:id/track", (req, res) => {
    Employee.findById(req.params.id)
      .populate("leaves")
      .exec((err, foundEmp) => {
        if (err) {
          req.flash("error", "No employeee with requested id");
          res.redirect("back");
        } else {
  
          res.render("trackLeave", { employee: foundEmp, moment: moment });
        }
      });
  });

module.exports = router;