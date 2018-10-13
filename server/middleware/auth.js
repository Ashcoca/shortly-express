const models = require('../models');
const Promise = require('bluebird');
console.log('models session: ', models.Sessions);

module.exports.createSession = (req, res, next) => {
  return models.Sessions.create().then( (cookie) => {
    console.log('cookie inside of createSession: ', cookie.insertId);
    res.cookie('sessionID', cookie.insertId, { maxAge: 300000 } );
  }).catch( (err) => {
    console.log('err inside of createSession: ', err);
  });
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

