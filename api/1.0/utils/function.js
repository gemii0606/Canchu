const express = require('express');
const jwt = require('jsonwebtoken');

function checkAuthorization(req, res, next) {

    if (!req.headers.authorization) {
      return res.status(401).send({ error: 'No token provided' });
    }
    const token = req.headers.authorization.split(' ')[1];
  
    const jwtSecret = 'Secret';
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return res.status(403).send({ error: "Wrong token" });
      }
      const decodedToken = decoded;
      req.decodedToken = decodedToken;
      return next();
    });
  }

function passReqparams(req, res, next) {
  req.params = req.params;
  next();
}


module.exports = {
    checkAuthorization,
    passReqparams
};