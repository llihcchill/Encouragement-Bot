const express = require("express");
const server = express();

server.all("/", (req, res) => {
  res.send("Bot is up and running!")
})

function keepOn() {
  server.listen(3000, () => {
    console.log("Server is ready!")
  })
}

module.exports = keepOn;
