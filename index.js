const Discord = require("discord.js")
const fetch = require("node-fetch")
const client = new Discord.Client()
const keepOn = require("./server")
const Database = require("@replit/database")
const db = new Database()

const helpEmbed = new Discord.MessageEmbed()
  .setColor("#ffcc00")
  .setTitle("Encouragement Bot Commands")
  .setDescription("These are all the commads for the Encouragement Bot:")
  .addFields(
    {name: "$inspire", value: "$inspire sends an inspiring quote"},
    {name: "$list", value: "$list gives you a the list of encouraging messages"},
    {name: "$del" , value: "$del deletes an encouraging message"},
    {name: "$new", value: "$new adds an encouraging message"},
    {name: "$responding", value: "$responding makes it wheather the bot responds to sad messages. You can set this to either true or false"}
  );

  const respondingTrueEmbed = new Discord.MessageEmbed()
    .setColor("#ffcc00")
    .setTitle("We are responding to your sadness!");

  const respondingFalseEmbed = new Discord.MessageEmbed()
    .setColor("#ffcc00")
    .setTitle("We are not responding to your sadness :(");

  const encouragingMessageAddedEmbed = new Discord.MessageEmbed()
    .setColor("#ffcc00")
    .setTitle("New encouraging message added.");

  const encouragingMessageDeletedEmbed = new Discord.MessageEmbed() 
    .setColor("#ffcc00")
    .setTitle("Encouraging message deleted.");
    
const sadWords = ["sad", "depressed", "not happy", "unhappy", "miserable", "dejected", "regretful", "downhearted", "discolate", "hurt"]
const starterEncouragements = ["Cheer up!", "Hang in there!", "You'll be alright, ay!", "You are a great person!"]
const mySecret = process.env['TOKEN']

db.get("encouragements").then(encouragements => {
  if(!encouragements || encouragements.length < 1) {
    db.set("encouragements", starterEncouragements)
  }
})

db.get("responding").then(value => {
  if(value == null) {
    db.set("responding", true);
  }
})

function updateEncouragements(encouragingMessage) {
  db.get("encouragements").then(encouragements => {
    encouragements.push([encouragingMessage])
    db.set("encouragements", encouragements)
  })
}

function deleteEncouragements(index) {
    db.get("encouragements").then(encouragements => {
      if(encouragements.length > index) {
        encouragements.splice(index, 1)
      }
    db.set("encouragements", encouragements)
    })
  }

function getQuote() {
  return fetch("https://zenquotes.io/api/random") //make this function async then not and the .then's work??????
    .then(res => res.json())
    .then(data => data[0]["q"] + " - " + data[0]["a"])
}

client.on("ready", () => {
  console.log('logged in as ' + client.user.tag)
});

client.on("message", msg => {
  if(msg.author.bot) return
  if(msg.content == "$inspire") {
    getQuote().then(quote => msg.channel.send(quote))
  }


  db.get("responding").then(responding => {
      if(responding == true && sadWords.some(word => msg.content.includes(word))) {
        db.get("encouragements").then(encouragements => {
        const encouragement = starterEncouragements[Math.floor(Math.random()* starterEncouragements.length)]
        msg.reply(encouragement)
      })
    }
  })

  if(msg.content.startsWith("$new")) {
    encouragingMessage = msg.content.split("$new ")[1]
    updateEncouragements(encouragingMessage)
    msg.channel.send(encouragingMessageAddedEmbed)
  }

    if(msg.content.startsWith("$del")) {
    index = parseInt(msg.content.split("$del ")[1])
    deleteEncouragements(index)
    msg.channel.send(encouragingMessageDeletedEmbed)
  }

  if(msg.content.startsWith("$list")) {
    db.get("encouragements").then(encouragements => {
      msg.channel.send(encouragements)
    })
  }

  if(msg.content.startsWith("$responding")) {
    value = msg.content.split("$responding")[1]

    if(value.toLowerCase() == " true") {
      db.set("responding", true)
      msg.channel.send(respondingTrueEmbed)
    } else {
      db.set("responding", false)
      msg.channel.send(respondingFalseEmbed)
    }
  }

  if(msg.content == "$help") {
    msg.channel.send(helpEmbed);
  }
});

keepOn();
client.login(mySecret);
