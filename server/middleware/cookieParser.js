var _ = require('underscore');

const parseCookies = (req, res) => {
  if( _.isEmpty(req.cookie) ) {
    res.redirect('/login');
  }
  let cookieVal = req.headers.cookie.split('=');
  let cookieObj = {
    id: Number(cookieVal[1])
  };
  return cookieObj;
};

module.exports = parseCookies;