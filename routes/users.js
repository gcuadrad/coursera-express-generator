const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/users');
const passport = require('passport');
const authenticate = require('../authenticate');

const userRouter = express.Router();
userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

userRouter.post('/signup', (req, res, next) => {
  User.register(new User({ username: req.body.username }),
  req.body.password,
  (err, user) => {
    console.log('err', err);
    console.log('user', user);

    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err: err });
    } else {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'Registration Successful!' });
      });
    }
  });
});

userRouter.post('/login', passport.authenticate('local'), (req, res) => {
  const token =  authenticate.getToken({ _id: req.user.id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully login!' });
});

userRouter.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    const err = new Error('You are not loggin');
    err.status = 403;
    next(err);
  }
});

module.exports = userRouter;
