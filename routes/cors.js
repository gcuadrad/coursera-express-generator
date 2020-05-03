const express = require('express');
const cors = require('cors');
const app = express();
// Contains all allowed origins
const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionsDeletage = (req, callback) => {
  let corsOptions;

  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDeletage);
