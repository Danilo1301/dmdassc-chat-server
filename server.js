const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const chat = require("./chat/Chat.js");

app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.get("*", (request, response) => {
  response.end();
});

const listener = http.listen(3000, () => {
  console.log("Your app is listening on port " + listener.address().port);

  chat.start(io);
});
