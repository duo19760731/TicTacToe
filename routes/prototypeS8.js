var express = require('express');
var router = express.Router();


/* POST page. */
router.post('/', function(req, res) {
  //console.log('【Dubug/prototypeS6[1-0]】 : ' + req.body.username);
  res.render('prototypeS8', {
    title : 'Tic tac toe Ver0.1',
    username : req.body.username
  });
});

module.exports = router;
