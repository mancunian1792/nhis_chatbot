'use strict';
var express = require('express');
var app = express();
var botkit = require('botkit');
var bodyParser = require('body-parser');
var router = express.Router();
var http = require('http').Server(app);
var _ = require('lodash')
const dialogflowClient = require('./dialogflow.js')
const helper = require('./helper.js')
const DEFAULTS = require('./constants.js')
require('dotenv').config()

// You need it to get the body attribute in the request object.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}))


let columnPick1 = "";
let columnPick2 = ""

// Creating a route for writing dialogflow entities.

app.get('/writeEntities', function(req, res) {
  console.log("Inside write Entities")
  let type = req.query.type;
  dialogflowClient.writeEntities(type).then(response => {
    if (response.isError) {
      return res.send('Error in creating entities')
    }
    console.log("Response in index js ", JSON.stringify(response))
    return res.send('Entities Created')
  });
})



// Creating a slack controller via botkit. This would help us in authenticating our bot and interacting with the desired slack channel.
var slackController = botkit.slackbot({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: ['bot'],
  redirectUri: process.env.URL + '/oauth',
  json_file_store: __dirname + '/.data/db/',
  disable_startup_messages: true,
  hostname: 'localhost',
  port: '8080'
});

slackController.startTicking();
slackController.createOauthEndpoints(app);
slackController.createWebhookEndpoints(app);



slackController.hears(['.*'], 'direct_message,direct_mention,mention, interactive_message_callback', function(bot, message) {
  


  // Step 1 Pre process inputs for certain intents which come from interactive callback.
  console.log("What is message", JSON.stringify(message))
  if (message.callback_id && message.callback_id === DEFAULTS.APP_CONSTANTS.INTENTS.DATA_OPTIONS) {
    if (message.match && message.match.length > 0) {
      message.text = "Use "+ message.text
    } else {
      message.text = ""
    }
  } else if(message.callback_id && message.callback_id === DEFAULTS.APP_CONSTANTS.INTENTS.RELATIONSHIP_OPTIONS){
    console.log("In Relationship options")
    if (message.actions[0].name === DEFAULTS.APP_CONSTANTS.COLUMNS.COLUMNPICK1) {
      columnPick1 = message.match[0]
    } else if (message.actions[0].name === DEFAULTS.APP_CONSTANTS.COLUMNS.COLUMNPICK2){
      columnPick2 = message.match[0]
    }

    if (columnPick1!="" && columnPick2!="") {
      message.text = "What is the relation between "+columnPick1+ " and "+ columnPick2
      columnPick1 = ""
      columnPick2 = ""
    } else {
      message.text = ""
    }
  }

  console.log("what is message.text", JSON.stringify(message.text))

  // Step 2 - Call Dialogflow

  // Step 3 - Get the response from dialogflow and then make a reply.

  if (message.text && message.text != "") {
    console.log("What is the message passed to dialogflow", JSON.stringify(message.text))
    dialogflowClient.sendTextMessageToDialogFlow(message.text).then(response => {
      if (response.isError) {
        bot.reply(message, "Something went wrong. Sorry about that.")
      } else {
        let dialogFlowResponse = response[0]
      let queryResult = dialogFlowResponse.queryResult
      let converted = helper.processCustomPayloadMessage(queryResult.webhookPayload.fields)
      console.log("Converted ", JSON.stringify(converted))
      queryResult.converted = converted
      if (response == null) {
        bot.reply(message, "Something went wrong!!!")
      } else {
        let processedMessages = helper.processMessages(message, queryResult);
        console.log("What is processedMessages", JSON.stringify(processedMessages))
        _.each(processedMessages, (msg) => {
          console.log("What is msg ?!", JSON.stringify(msg))
          bot.reply(message, msg);
        })
       }
      }      
    });
  }
});

app.listen(8080);
console.log('Listening on port 8080...');
