var _ = require('lodash')

const private_key = _.replace(process.env.DIALOGFLOW_PRIVATE_KEY, new RegExp("\\\\n", "\g"), "\n");
const APP_CONSTANTS = {
    TYPE: {
        COLUMNS: "columns",
        DATAFRAMES: "dataframes",
        FUNCTIONS: "functions"
    },
    URL: {
        COLUMNS: process.env.DATA_URL + '/names/columns',
        DATAFRAMES: process.env.DATA_URL + '/names/dataframes'
    },
    MSG_TYPE: {
        INFO: "INFO",
        OPTIONS: "OPTIONS"
    },
    INTENTS: {
        DATA_OPTIONS: "get-data-options",
        RELATIONSHIP_OPTIONS: "get-relationship-options"
    },
    COLUMNS: {
        COLUMNPICK1: "columns0",
        COLUMNPICK2: "columns1"
    }
}

const config = {
    credentials: {
        private_key: private_key,
        client_email: process.env.DIALOGFLOW_CLIENT_EMAIL
    }
};

module.exports = {
    APP_CONSTANTS: APP_CONSTANTS,
    CONFIG: config
}