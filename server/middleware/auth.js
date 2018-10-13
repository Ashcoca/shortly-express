const models = require('../models');
const cookieParser = require('./cookieParser');
const Promise = require('bluebird');


exports.createSession = (req, res, next) => {
  return models.Sessions.create()
    .then( (promiseObj) => {
      return models.Sessions.get( {id: promiseObj.insertId})
        .then( (sessionObj) => {
          return req.cookie('hash', sessionObj.hash, { maxAge: 3000000 } )});
  }).catch( (err) => {
    console.log('err inside of createSession: ', err);
  });
};
 
/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

exports.authentication = (req, res, next) => {
  let cookie = cookieParser(req, res); //obj with key/value of corresponding cookies
  if ( !cookie ) {
    res.redirect('/login');
    return;
  }
  return models.Sessions.get(cookie)
    .then( (session) => {
      console.log('session: ',session);
      // res.sendStatus(200).redirect('/login'); 
      return 200;
    })
    .error( (err) => {
      console.log('err: ',err);
      let statusCode = 403;
      return statusCode;
    });

  next();
};    


// console.log(promiseObj.insertId);
// res.cookie('hash', hash, { maxAge: 3000000 } );
