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

//techlead login
router.get("/login", (req, res) => {
    res.render("techleadlogin");
  });
  
//post techlead login info
router.post(
    "/login",
    passport.authenticate("techlead", {
      successRedirect: "/techlead/home",
      failureRedirect: "/techlead/login",
      failureFlash: true
    }),
    (req, res) => {
      res.redirect("/techlead/home");
    }
  );

//techlead home page
router.get("/home", ensureAuthenticated, (req, res) => {
    Techlead.find({}, (err, manager) => {
      if (err) {
        console.log("err");
      } else {
        res.render("hometechlead", {
          techlead: req.user
        });
      }
    });
  });
 
//techlead profile page
router.get("/:id", ensureAuthenticated, (req, res) => {
    console.log(req.params.id);
    Techlead.findById(req.params.id).exec((err, foundTechlead) => {
      if (err || !foundTechlead) {
        req.flash("error", "Techlead not found");
        res.redirect("back");
      } else {
        res.render("profiletechlead", { techlead: foundTechlead });
      }
    });
  });

//techlead edit profile page
router.get("/:id/edit", ensureAuthenticated, (req, res) => {
    Techlead.findById(req.params.id, (err, foundTechlead) => {
      res.render("editT", { techlead: foundTechlead });
    });
  });
  
//post techlead edited data
router.post("/:id", ensureAuthenticated, (req, res) => {
    console.log(req.body.techlead);
    Techlead.findByIdAndUpdate(
      req.params.id,
      req.body.techlead,
      (err, updatedTechlead) => {
        if (err) {
          req.flash("error", err.message);
          res.redirect("back");
        } else {
          req.flash("success", "Succesfully updated");
          res.redirect("/techlead/" + req.params.id);
        }
      }
    );
  });
 
//techlead leave page
router.get("/:id/leave", (req, res) => {
    Techlead.findById(req.params.id).exec((err, techleadFound) => {
      if (err) {
        req.flash("error", "techlead not found with requested id");
        res.redirect("back");
      } else {
        
        Employee.find({ department: techleadFound.department })
          .populate("leaves")
          .exec((err, employees) => {
            if (err) {
              req.flash("error", "employee not found with your department");
              res.redirect("back");
            } else {
              res.render("techleadLeaveSign", {
                techlead: techleadFound,
                employees: employees,
  
                moment: moment
              });
            }
          });
      }
    });
  });

//more info of emp in techlead profile
router.get("/:id/leave/:emp_id/info", (req, res) => {
    Techlead.findById(req.params.id).exec((err, techleadFound) => {
      if (err) {
        req.flash("error", "techlead not found with requested id");
        res.redirect("back");
      } else {
        Employee.findById(req.params.emp_id)
          .populate("leaves")
          .exec((err, foundEmployee) => {
            if (err) {
              req.flash("error", "employee not found with this id");
              res.redirect("back");
            } else {
              res.render("techleadmoreinfoemp", {
                employee: foundEmployee,
                techlead: techleadFound,
                moment: moment
              });
            }
          });
      }
    });
  });
  
 //post techlead decision on emp leave 
router.post("/:id/leave/:emp_id/info", (req, res) => {
    Techlead.findById(req.params.id).exec((err, techleadFound) => {
      if (err) {
        req.flash("error", "techlead not found with requested id");
        res.redirect("back");
      } else {
        Employee.findById(req.params.emp_id)
          .populate("leaves")
          .exec((err, foundEmployee) => {
            if (err) {
              req.flash("error", "employee not found with this id");
              res.redirect("back");
            } else {
              if (req.body.action === "Approve") {
                foundEmployee.leaves.forEach(function(leave) {
                  if (leave.techleadstatus === "pending") {
                    leave.techleadstatus = "approved";
  
                    leave.save();
                  }
                });
              } else {
                console.log("u denied");
                foundEmployee.leaves.forEach(function(leave) {
                  if (leave.techleadstatus === "pending") {
                    leave.techleadstatus = "denied";
  
                    leave.save();
                  }
                });
              }
              res.render("techleadmoreinfoemp", {
                employee: foundEmployee,
                techlead: techleadFound,
                moment: moment
              });
            }
          });
      }
    });
  });
  
module.exports = router;