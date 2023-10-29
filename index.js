const express = require('express');
const app = express();

// const PORT = 3000;
// app.listen(PORT, ()=>{
//     console.log(`Server is running on PORT ${PORT}`);
// })

const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const { listRecentEmails } = require('./vacationResponse');

const SCOPES = ["https://www.googleapis.com/auth/gmail.modify", "https://www.googleapis.com/auth/gmail.labels"];


const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');


// load saved client credentials or authorize new credentials
async function authorize(){
    let client = await loadSavedCredentialsIfExist();
    if(client){
        return client;
    }
    
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if(client.credentials){
        await saveCredentials(client);
    }
    return client;
}

// loading previous credentials from a file
async function loadSavedCredentialsIfExist(){
    try{
        // await since reading a file
        const content = await fs.readFile(TOKEN_PATH);

        // assumed content is in json format 
        const credentials = JSON.parse(content);

        // adds content to already created object provided by googleapi 
        return google.auth.fromJSON(credentials);

    } catch (err) {
        return null;
    }
}

// save credentials in a file which is then loaded in 'google.auth.fromJSON' object. 
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;

    // constructing json object 
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

function startEmailHandling(){
    authorize().
        then((auth) =>{
            listRecentEmails(auth);
            return null;
        })
        .catch(console.error);
}

const randomInterval = Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000; 
setTimeout(startEmailHandling, randomInterval);