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

//manager login                
router.get("/login", (req, res) => {
    res.render("managerlogin");
  });
 
//post manager login data
router.post(
    "/login",
    passport.authenticate("manager", {
      successRedirect: "/manager/home",
      failureRedirect: "/manager/login",
      failureFlash: true
    }),
    (req, res) => {
      res.redirect("/manager/home");
    }
  );

//get manager home page
router.get("/home", ensureAuthenticated, (req, res) => {
    Manager.find({}, (err, manager) => {
      if (err) {
        console.log("err");
      } else {
        res.render("homemanager", {
          manager: req.user
        });
      }
    });
  });

//get manager profile page
router.get("/:id", ensureAuthenticated, (req, res) => {
    console.log(req.params.id);
    Manager.findById(req.params.id).exec((err, foundManager) => {
      if (err || !foundManager) {
        req.flash("error", "Manager not found");
        res.redirect("back");
      } else {
        res.render("profilemanager", { manager: foundManager });
      }
    });
  });

//edit manager profile page 
router.get("/:id/edit", ensureAuthenticated, (req, res) => {
    Manager.findById(req.params.id, (err, foundManager) => {
      res.render("editM", { manager: foundManager });
    });
  });

//update manager profile data
router.post("/:id", ensureAuthenticated, (req, res) => {
    console.log(req.body.manager);
    Manager.findByIdAndUpdate(req.params.id, req.body.manager, (err, updatedManager) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Succesfully updated");
        res.redirect("/manager/" + req.params.id);
      }
    });
  });

//manager leave sign page
router.get("/:id/leave", (req, res) => {
    Manager.findById(req.params.id).exec((err, ManagerFound) => {
      if (err) {
        req.flash("error", "Manager not found with requested id");
        res.redirect("back");
      } else {
        
        Employee.find({ department: ManagerFound.department })
          .populate("leaves")
          .exec((err, employees) => {
            if (err) {
              req.flash("error", "employee not found with your department");
              res.redirect("back");
            } else {
              
              res.render("managerLeaveSign", {
                manager: ManagerFound,
                employees: employees,
                moment: moment
              });
              
            }
          });
      }
      
    });
  });
  
//emp leave info
router.get("/:id/leave/:emp_id/info", (req, res) => {
    Manager.findById(req.params.id).exec((err, ManagerFound) => {
      if (err) {
        req.flash("error", "hod not found with requested id");
        res.redirect("back");
      } else {
        Employee.findById(req.params.emp_id)
          .populate("leaves")
          .exec((err, foundEmployee) => {
            if (err) {
              req.flash("error", "employee not found with this id");
              res.redirect("back");
            } else {
              res.render("moreinfoemp", {
                employee: foundEmployee,
                manager: ManagerFound,
                moment: moment
              });
            }
          });
      }
    });
  });

//manager leave status
router.post("/:id/leave/:emp_id/info", (req, res) => {
    Manager.findById(req.params.id).exec((err, ManagerFound) => {
      if (err) {
        req.flash("error", "manager not found with requested id");
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
                  if (leave.status === "pending") {
                    leave.status = "approved";
                    leave.approved = true;
                    leave.save();
                  }
                });
              } else {
                console.log("u denied");
                foundStudent.leaves.forEach(function(leave) {
                  if (leave.status === "pending") {
                    leave.status = "denied";
                    leave.denied = true;
                    leave.save();
                  }
                });
              }
              res.render("moreinfoemp", {
                employee: foundEmployee,
                manager: ManagerFound,
                moment: moment
              });
            }
          });
      }
    });
  });

module.exports = router;