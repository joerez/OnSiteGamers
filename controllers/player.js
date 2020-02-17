const express = require('express');
const app = express();
const User = require('../models/user');
const Player = require('../models/player')
const Comment = require('../models/comment')

const requireLogin = require('../middleware/requireLogin');

const moment = require('moment');

let Recaptcha = require('express-recaptcha');
var recaptcha = new Recaptcha('6Ld9VWgUAAAAANMg2fEBUmbC48-Is_KZEFJ2XbBL', '6Ld9VWgUAAAAAOPH-QfoQ6j8_5PP1na-6yKNuWTB');


module.exports = (app) => {

  app.get('/players/new', (req, res) => {
    let currentUser;
    if (req.user) {
      User.findById(req.user._id, (err, user) => {
        res.render('players/newplayer', {currentUser: user});
      })
    } else {
    res.render('auth/login');
    }
  })


//post new player
app.post('/players/new', requireLogin, (req, res) => {
  Player.findOne({ username : req.body.username }, 'username').then((player) => {
    if (player) {
      // User found
      return res.status(401).send({ message: 'Player already exists' });
    }
  })

  let newPlayer = new Player(req.body);
  newPlayer.username = req.body.username;
  newPlayer.description = req.body.description;
  newPlayer.imgurl = req.body.imgurl;
  newPlayer.pending = true;

  recaptcha.verify(req, function(error, data){
       if(!error)
           //success code
           {
             newPlayer.save((err, newplayer) => {
               if(err)  throw err
               res.redirect('/');
             })
           }
       else
           //error code
           {
             res.send('fill out the captcha');
           }
   });
});


app.get('/players/:playername', (req, res) => {

  Player.find({username : req.params.playername}).then((players) => {
  Comment.find({ playerId : players[0].id }).then((comments) => {

    for (let i = 0; i < comments.length; i++) {
      comments[i].day = moment(comments[i].initialTime, "YYYYMMDD h:mm:ss a").fromNow();
      comments[i].save();
    }


  let currentUser;
  if (req.user) {
    User.findById(req.user._id, (err, user) => {

      res.render('players/playershow', {currentUser: user, players, comments});
    })
  } else {
  res.render('players/playershow', { players, comments });
  }
})
})
})






//player by id
app.get('/playersid/:playerid', (req, res) => {

  Player.find({_id : req.params.playerid}).then((players) => {
  Comment.find({ playerId : players[0].id }).then((comments) => {


  let currentUser;
  if (req.user) {
    User.findById(req.user._id, (err, user) => {

      res.render('players/playershow', {currentUser: user, players, comments});
    })
  } else {
  res.render('players/playershow', { players, comments });
  }
})
})
})








}
