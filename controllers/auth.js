const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

var Recaptcha = require('express-recaptcha');
//import Recaptcha from 'express-recaptcha'
var recaptcha = new Recaptcha('6Ld9VWgUAAAAANMg2fEBUmbC48-Is_KZEFJ2XbBL', '6Ld9VWgUAAAAAOPH-QfoQ6j8_5PP1na-6yKNuWTB');


module.exports = (app) => {

  // SIGN UP FORM

  app.get('/register',  (req, res) => {
    res.render('auth/register');
  });

  // SIGN UP POST
  app.post('/register/', (req, res) => {
    // Create User and JWT
    const user = new User({username: req.body.username, password: req.body.password});
    recaptcha.verify(req, function(error, data){

      User.findOne({ username : req.body.username }, 'username password').then((user) => {

        if (user) {
          // User found
          return res.status(401).send({ message: 'Username Taken' });
        }
      })
          if(!error) {
              //success code
              user.save().then((user) => {
              var token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "60 days" });
              res.cookie('nToken', token, { maxAge: 90000000000000, httpOnly: true });
              res.redirect('/profiles/' + user.username);

              }).catch((err) => {
                console.log(err.message);
                return res.status(400).send({ err: err });
              });

            }
          else {
              //error code
              res.redirect('/robot');
          }
      });



  });


  // LOGOUT
  app.get('/logout', (req, res) => {
    res.clearCookie('nToken');
    res.redirect('/');
  });

  // LOGIN FORM
  app.get('/login', (req, res) => {
    var currentUser = req.user;

    res.render('auth/login.handlebars', { currentUser });
  });

  // LOGIN
  app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Find this user name
    User.findOne({ username }, 'username password').then((user) => {

      if (!user) {
        // User not found

        return res.status(401).send({ message: 'Wrong Username or Password *' });
      }
      // Check the password
      user.comparePassword(password, (err, isMatch) => {
        if (!isMatch) {
          // Password does not match
          return res.status(401).send({ message: "Wrong Username or password ?"});
        }
        // Create a token

        // const obj = {...user}

        const token = jwt.sign(
          { _id: user._id,
            username: user.username,
            mod: user.mod
          }, process.env.SECRET);
        //  { expiresIn: "60 days" }

        // Set a cookie and redirect to dashboard
        res.cookie('nToken', token, { maxAge: 9000000000000000, httpOnly: true });
        res.redirect('/profiles/' + user.username);
      });
    }).catch((err) => {
      console.log(err);
    });
  });




} //module.exports
