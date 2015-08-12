var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser')

var sketchfile = path.dirname( path.dirname( require.main.filename ) ) + "/app/data/sketch.json"
var jsonParser = bodyParser.json()


router.get('/', function(req, res, next) {
  res.send("sketch")
});


router.get('/enter/get', function(req, res, next) {
  var content = fs.readFileSync(sketchfile);
  console.log(content)
  var data=JSON.parse(content);
  res.json(data.enter);
});

router.get('/exit/get', function(req, res, next) {
  var content = fs.readFileSync(sketchfile);
  console.log(content)
  var data=JSON.parse(content);
  res.json(data.exit);
});

router.post('/update', function(req, res, next) {
  data = {
    enter: req.body.enter,
    exit: req.body.exit
  }
  var json = JSON.stringify(data, null, 2);
  fs.writeFileSync(sketchfile,json,'utf8');
  res.json({status:true});
});

module.exports = router;
