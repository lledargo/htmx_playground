const express = require('express');
const morgan = require('morgan');

let app = express();

//setting middleware
app.use(morgan('dev'));
app.use(express.static(__dirname + '/htmx')); //Serves resources from public folder
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.get('/clear', (req,res) => {
  res.send("");
});
app.post('/roll', (req,res) => {
    let list = []
    for (let i = 0; i < req.body.roll; i++) {
      let roll = 0;
      roll = Math.round((Math.random() * 5 ) + 1);
      list.push(roll)
    }
  let total = list.reduce((a,b)=> {return a+b},0)
  res.send("<p>" + req.body.roll + "d6 results: " + list + " total: " + total + "</p>");
});

var server = app.listen(5000);