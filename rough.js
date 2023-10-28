{
  "id": string,
  "threadId": string,
  "labelIds": [
    string
  ],
  "snippet": string,
  "historyId": string,
  "internalDate": string,
  "payload": {
    object (MessagePart)
  },
  "sizeEstimate": integer,
  "raw": string
}







---------------------------------

const fs = require('fs');
const path = require('path');

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

/**
 * Reads the token from the specified path or from default path.
 * @param {String | null} token_path Path to the token file
 * @returns {Object} token object
 */
function get(token_path) {
  try {
    return JSON.parse(fs.readFileSync(
      token_path || path.resolve(__dirname, TOKEN_PATH)
    ).toString());
  } catch (error) {
    throw new Error("No token found.");
  }
}

/**
 * Stores the token in the specified path or in default path.
 * @param {Object} token Token
 * @param {String | null} token_path Path
 */
function store(token, token_path) {
  fs.writeFileSync(
    token_path || path.resolve(__dirname, TOKEN_PATH),
    JSON.stringify(token)
  );
}

----- mine ---- 
async function authorize(CREDENTIALS_PATH){
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
 
    const {client_secret, client_id, redirect_uris} = key;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    try {
        oAuth2Client.setCredentials()
    }

}




