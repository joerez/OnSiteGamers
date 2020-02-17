const express = require('express');
const app = express();
const User = require('../models/user');
const Player = require('../models/player');
const Faction = require('../models/faction');
const Comment = require('../models/comment');

const moment = require('moment');

module.exports = (app) => {

    app.get('/', (req, res) => {
      let currentUser;

      Player.find({pending : false}).then((players) => {

        players.sort((a, b) => a.username.localeCompare(b.username));


        Faction.find({pending : false}).then((factions) => {
          factions.sort((a, b) => a.name.localeCompare(b.name));


      if (req.user) {
        User.findById(req.user._id, (err, user) => {
          res.render('index', { currentUser: user, players, factions });
        })
      } else {
      res.render('index/index', { players, factions });
      }
    })
    })
  })

  app.get('/market', (req, res) => {

    User.find({gamer: true, pending: false}).then((gamers) => {
      console.log('first', gamers)

      if (req.user) {
        User.findById(req.user._id, (err, user) => {
          console.log(gamers)
          res.render('index/market', { currentUser: user, gamers: gamers.reverse() });
        })
      } else {
        res.render('index/market', {gamers: gamers});
      }
    })


  })



  app.get('/recent', (req, res) => {
    let currentUser;

    Player.find({pending : false}).then((players) => {
      Faction.find({pending : false}).then((factions) => {
        Comment.find({}).then((comments) => {

          for (let i = 0; i < comments.length; i++) {
            comments[i].day = moment(comments[i].initialTime, "YYYYMMDD h:mm:ss a").fromNow();
            comments[i].save();
          }


          Player.find({_id : comments.playerId}).then((playerName) => {


    if (req.user) {
      User.findById(req.user._id, (err, user) => {
        res.render('index/recent', { currentUser: user, players, factions, comments, playerName });
      })
    } else {
    res.render('index/recent', { players, factions, comments, playerName });
    }
  })
  })
})
})

})



app.get('/profiles/:username', (req, res) => {


  User.findOne({username: req.params.username}).then((profile) => {
    if (req.user) {
      User.findById(req.user._id).then((user) => {

        let sameUser = false;

        if (profile.username === user.username) {
          sameUser = true
        }


        res.render('index/profile', { profile: profile, currentUser: user, sameUser: sameUser  });
      })
    } else {
      res.render('index/profile', { profile: profile });
    }
  }).catch((err) => {
    res.send('Profile not found')
  })

})

app.post('/profiles/:username', (req, res) => {
  User.findOne({username: req.params.username}).then((user) => {
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.bio = req.body.bio;
    user.photo = req.body.photo;
    user.contact = req.body.contact;
    user.colorValue = req.body.colorValue;
    user.sliderValue = req.body.sliderValue;
    user.location = req.body.location;
    user.save().then((user) => {
      res.redirect('/profiles/' + user.username)
    })
  })
})


};
