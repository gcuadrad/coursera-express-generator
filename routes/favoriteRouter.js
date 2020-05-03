const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorites');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOne({ user: req.user._id })
  .populate('user')
  .populate('dishes')
  .then(favorite => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorite);
  }, err => next(err))
  .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  if (Array.isArray(req.body) && req.body.length > 0) {
    const newDishes = req.body.map(dish => dish._id);
    Favorites.findOne({ user: req.user._id })
    .then(favorite => {
      if (favorite) {
        newDishes.forEach(newDish => {
          if (newDish && favorite.dishes.indexOf(newDish) === -1) {
            favorite.dishes.push(newDish);
          }
        });
        favorite.save()
        .then(favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        });
      } else {
        Favorites.create({ user: req.user._id })
        .then(favorite => {
          newDishes.forEach(newDish => {
            if (newDish && favorite.dishes.indexOf(newDish) === -1) {
              favorite.dishes.push(newDish);
            }
          });
          favorite.save()
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          });
        }, err => next(err))
        .catch(err => next(err));
      }
    }, err => next(err))
    .catch(err => next(err));
  } else {
    err = new Error('Invalid body format');
    err.status = 400;
    return next(err);
  }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOneAndDelete({ user: req.user._id })
  .then(resp => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, err => next(err))
  .catch(err => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
  res.statusCode = 403;
  res.end(`GET operation not supported on /favorites/${req.params.dishId}.`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  if (req.params.dishId) {
    Favorites.findOne({ user: req.user._id })
    .then(favorite => {
      if (favorite) {
        if (favorite.dishes.indexOf(req.params.dishId) === -1) {
          favorite.dishes.push(req.params.dishId);
          favorite.save()
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          });
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        }
      } else {
        Favorites.create({ user: req.user._id })
        .then(favorite => {
          favorite.dishes.push(req.params.dishId);
          favorite.save()
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          });
        }, err => next(err))
        .catch(err => next(err));
      }
    }, err => next(err))
    .catch(err => next(err));
  } else {
    err = new Error('Invalid body format');
    err.status = 400;
    return next(err);
  }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end(`PUT operation not supported on /favorites/${req.params.dishId}.`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOne({ user: req.user._id })
  .then(favorite => {
    if (favorite) {
      if (favorite.dishes.indexOf(req.params.dishId) !== -1) {
        const dishIdToDelete = JSON.stringify(req.params.dishId);
        favorite.dishes = favorite.dishes.filter(dish => dishIdToDelete !== JSON.stringify(dish));
        favorite.save()
        .then(favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        });
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
      }
    } else {
      err = new Error(`Favorite ${req.params.dishId} not found`);
      err.status = 404;
      return next(err);
    }
  }, err => next(err))
  .catch(err => next(err));
});

module.exports = favoriteRouter;
