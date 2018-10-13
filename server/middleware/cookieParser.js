var _ = require('underscore');

const parseCookies = (req, res) => {
  if( _.isEmpty(req.cookie) ) {
    res.redirect('/login');
  }
  let cookieVal = req.headers.cookie.split('=');
  let cookieObj = {
    hash: Number(cookieVal[1])
  };
  return cookieObj;
};

module.exports = parseCookies;