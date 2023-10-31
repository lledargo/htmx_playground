var express = require('express');
var morgan = require('morgan');

var app = express();

//setting middleware
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public')); //Serves resources from public folder
// responses can be served out with the static files, or they can be a response constructed in js like below
app.get('/dontclick', (req,res) => {res.status(200).send('<div style="background-color: red;width:100%;height:100%;">' + Date.now().toString() + '</div>');})

var server = app.listen(5000);