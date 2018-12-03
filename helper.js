var _ = require('lodash')
const helper = require('./helper.js')
const DEFAULTS = require('./constants.js')

var processMessages = function (botSentMsg, webhookResponse) {
    let processedMessages = []
    _.each(webhookResponse.converted.response, (resp) => {
        console.log("What is resp", JSON.stringify(resp))
        console.log("resp type", resp.MSG_TYPE, "typeof", typeof(resp.MSG_TYPE))
        if (resp.MSG_TYPE === DEFAULTS.APP_CONSTANTS.MSG_TYPE.INFO) {
            processedMessages.push({
                "text": resp.message,
                "response_type": "in_channel",
                "callback_id": webhookResponse.intent.displayName
            })
        } else if (resp.MSG_TYPE === DEFAULTS.APP_CONSTANTS.MSG_TYPE.OPTIONS) {
            let processedMsg = {
                "text": resp.message.chatText,
                "response_type": "in_channel",
                "attachments": [],
                
            }
            let attachment = {
                "text": resp.message.chatText,
                "fallback": "If you could read this message, you'd be choosing something fun to do right now.",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "callback_id": webhookResponse.intent.displayName,
                "actions": []
            }
            for (var i = 0; i< resp.message.repeatOptions;i++) {
                let selectAttachment = {
                    "name": resp.message.repeatOptions > 1?resp.message.name+i:resp.message.name,
                    "text": resp.message.text,
                    "type": "select",
                    "options": []   
                }
                for(key in resp.message.options) {
                    if(resp.message.options.hasOwnProperty(key)) {
                        let opt = {
                            "text": resp.message.options[key],
                            "value": key
                        }
                        selectAttachment.options.push(opt)
                    }
                }
                attachment.actions.push(selectAttachment)
            }
            processedMsg.attachments.push(attachment)
            processedMessages.push(processedMsg)
        }
    })
    return processedMessages
}

var processCustomPayloadMessage = function(object) {
    let outputMessage = Array.isArray(object) ? [] : {};
    Object.entries(object).forEach(([key, value]) => {
      if (value.kind == 'structValue') {
        outputMessage[key] = this.processCustomPayloadMessage(value.structValue.fields);
      } else if (value.kind == 'listValue') {
        outputMessage[key] = this.processCustomPayloadMessage(value.listValue.values);
      } else if (value.kind == 'stringValue') {
        outputMessage[key] = value.stringValue;
      } else if (value.kind == 'boolValue') {
        outputMessage[key] = value.boolValue;
      } else if(value.kind == 'numberValue'){
        outputMessage[key] = value.numberValue;
      } else {
        outputMessage[key] = value;
      }
    });
    return outputMessage;
  }



module.exports = {
    processMessages: processMessages,
    processCustomPayloadMessage: processCustomPayloadMessage
}