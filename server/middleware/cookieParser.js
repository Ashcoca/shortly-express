var _ = require('underscore');

const parseCookies = (req, res, next) => {
  if( !req.headers.cookie ) {
    return false;
  }
  let cookieVal = req.headers.cookie.split('=');
  let cookieObj = {
    hash: cookieVal[1]
  };
  req.cookie = cookieObj;
  next();
};

module.exports = parseCookies;