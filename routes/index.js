var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
 res.jso0n({
  name: 'home',	
 })
});

module.exports = router;
