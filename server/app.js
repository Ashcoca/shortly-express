const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const cookieParser = require('./middleware/cookieParser');
const models = require('./models');
const user = require('./models/user');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser(req, res, next));
app.use((req, res, next) => {
  console.log('REQUEST AFTER COOKIEPARSER\N===========', req.cookies);
  next();
})
app.use(Auth.authentication(req, res, next));



app.get('/signup', 
  (req, res) => {
    res.render('signup');
  });

app.get('/login', 
  (req, res) => {
    res.render('login');
  });

//all of the following need to check the session before the move through with their requests

app.get('/', 
  (req, res) => {
    res.render('index');
  });

app.get('/create', 
  (req, res) => {
    Auth.authentication(req, res)
      .then( (status) => {
        // res.redirect('/create');
        res.render('/create');
      })
      .error( (status) => {
        res.render('/login');
      });
  });
 
app.get('/links', 
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links', 
  (req, res, next) => {

    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/signup',
  (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    user.create({ username, password }).then( (data) => {
      Auth.createSession(req, res).then( () => {
        res.redirect('/');
      });
    }).catch( (err) => {
      console.log(err);
      res.send(err);
    });
  });

app.post('/login',
  (req, res) => {
    var username = req.body.username;
    var attemptedPassword = req.body.password;    
    user.get({ username }).then( (data) => {
      return user.compare(attemptedPassword, data.password, data.salt);
    }).then( (isValid) => {
      if (isValid) {
        res.redirect('/');
      } else {
        res.render('login');
      }
    }).catch( (err) => {
      console.log('err: ', err);
    });
  });

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
