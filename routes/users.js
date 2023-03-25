var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/post',async (req,res)=>{
try {
  res.json({
    profile:req.body
  })
} catch (error) {
  res.json({
    error
  })
}
})

module.exports = router;
