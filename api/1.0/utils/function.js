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
      req.params.passId = req.params.passParams;
      console.log(req.params.passId);
      return next();
    });
  }

function passReqparams(req, res, next) {
  console.log(req.params.user_id);
  req.params.passParams = req.params.user_id;
  console.log(req.params.passParams);
  next();
}


module.exports = {
    checkAuthorization,
    passReqparams
};