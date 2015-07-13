var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res) {
  res.render('prototypeS7', {
    title : 'Login'
  });
});

module.exports = router;