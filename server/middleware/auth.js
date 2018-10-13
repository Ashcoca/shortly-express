const models = require('../models');
const cookieParser = require('./cookieParser');
const Promise = require('bluebird');


exports.createSession = (req, res, next) => {
  return models.Sessions.create().then( (cookie) => {
    res.cookie('id', cookie.insertId, { maxAge: 3000000 } );
  }).catch( (err) => {
    console.log('err inside of createSession: ', err);
  });
};
 
/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

exports.authentication = (req, res) => {
  let cookie = cookieParser(req, res); //obj with key/value of corresponding cookies
  models.Sessions.get(cookie)
    .then( (session) => {
      console.log('This is the session: ', session);
    });
};