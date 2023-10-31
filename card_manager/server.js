const { randomUUID } = require('crypto');
const express = require('express');
const morgan = require('morgan');
const redis = require('redis'); //disclaimer: this app is a bad use case for redis.

let app = express();

const client = redis.createClient()
client.on('error', (err) => console.log("Redis Client Error: " + err));
client.connect();

async function cardsInit() {
  if (!await client.json.get("cards")) {
    client.json.set("cards","$",[]);
  }
}


function newcard(req,res) {
  const uuid = randomUUID();  
  const rjson = {
    UUID: uuid.toString(),
    content: req.body.content
  }
  client.json.arrAppend("cards","$", rjson);
  res.send(gencard(uuid,req.body.content));
}

async function loadallcards(res) {
  const cards = await client.json.get("cards");
  let response = ''
  for (let i = 0; i < cards.length; i++) {
    response += gencard(cards[i].UUID,cards[i].content);
  }
  res.send(response);
}

function gencard(uuid, content) {
  let cssid = "id-" + uuid;
  return "<div class=\"carddiv\" id=\"" + cssid + "\">\
  <p class=\"content\">" + content + "</p>\
  <button class=\"deletebutton\" hx-delete=\"/delete/" + uuid + "\" hx-target=\"#" + cssid + "\" hx-swap=\"delete\">X</button>\
</div>"
}

async function deletecard(uuid) {
  const cards = await client.json.get("cards"); 
  /* here we have the bad javascript array (bjarray)
     clients.json.get is returning an itterable object
     but I need an array so I can `.findIndex()`. I'd 
     need to be using typescript to cast it as an array,
     so insteas I just build theis bjarray.
  */
  let bjarray = [];
  for (let i = 0; i < cards.length; i++) {
    bjarray.push(cards[i]);
  }
  const index = bjarray.findIndex(obj => obj.UUID==uuid);
  client.json.del("cards","$["+index+"]");
}

cardsInit(); //make sure redis has a cards key to manipulate

//setting middleware
app.use(morgan('dev')); //logging
app.use(express.static(__dirname + '/static')); // Serve static files

//setting up request body reader
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//non-static response handlers
app.post('/newcard', (req,res) => {newcard(req,res)});
app.delete('/delete/:uuid', (req,res) => {deletecard(req.params.uuid); res.sendStatus(200)});
app.get('/loadall', (req,res) => {loadallcards(res)});

//don't forget to tell the app to listen
var server = app.listen(5000);