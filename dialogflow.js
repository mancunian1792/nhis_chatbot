require('dotenv').config()
const dialogflow = require('dialogflow');
const projectId = 'nhis-2017-ds5110'; //https://dialogflow.com/docs/agents#settings
const sessionId = '123456';
const languageCode = 'en-US';
const fetch = require('node-fetch')
const DEFAULTS = require('./constants.js')
const sessionClient = new dialogflow.SessionsClient(DEFAULTS.CONFIG);
const sessionPath = sessionClient.sessionPath(projectId, sessionId);
const entitiesClient = new dialogflow.EntityTypesClient(DEFAULTS.CONFIG);
const agentPath = entitiesClient.projectAgentPath(projectId);

var sendTextMessageToDialogFlow = async function (textMessage) {
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: textMessage,
                languageCode: languageCode
            }
        }
    }
    try {
        let responses = await sessionClient.detectIntent(request)
        console.log('DialogFlow.sendTextMessageToDialogFlow: Detected intent');
        return responses
    }
    catch (err) {
        console.error('DialogFlow.sendTextMessageToDialogFlow ERROR:', err);
        return {isError: true, "error": err}
    }
}

var writeEntities = async function (type) {
    try {
        let url = ""
        if (type === DEFAULTS.APP_CONSTANTS.TYPE.COLUMNS) {
            url = DEFAULTS.APP_CONSTANTS.URL.COLUMNS
        } else {
            url = DEFAULTS.APP_CONSTANTS.URL.DATAFRAMES
        }
        let fetched = await fetch(url)
        let response = await fetched.json()
        let entities = response.entities
        let modifiedEntites = []
        modifiedEntites.push(entities)
        response.entities = modifiedEntites
        const entityRequest = {
            parent: agentPath,
            entityType: response
        };
        let entityCreated = await entitiesClient.createEntityType(entityRequest)
        return entityCreated[0]
    } catch (err) {
        console.error("Error while writing entities", err)
        return {"isError": true, "error": err}
    }
}


module.exports = {
    sendTextMessageToDialogFlow: sendTextMessageToDialogFlow,
    writeEntities: writeEntities
}
