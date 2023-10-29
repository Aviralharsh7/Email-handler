const express = require('express');
const app = express();

const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const { listRecentEmails } = require('./vacationResponse');

// Modify for modifying threads and sending emails
// Labels for creating lables
const SCOPES = ["https://www.googleapis.com/auth/gmail.modify", "https://www.googleapis.com/auth/gmail.labels"];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');


// load saved client credentials or authorize new credentials
async function authorize(){
    let client = await loadSavedCredentialsIfExist();
    if(client){
        return client;
    }

    // via local-auth library
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if(client.credentials){
        await saveCredentials(client);
    }
    return client;
}

// OAuth type is External ~ 1 day expiry
async function loadSavedCredentialsIfExist(){
    try{
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);

    } catch (err) {
        return null;
    }
}

// Saving new credentials which are later loaded in 'google.auth' object. 
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
        .catch((error) => {
            console.log("Error starting email handler: ", error);
        });
}

// Creating random interval or 45-120 seconds
const randomInterval = Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000; 
setTimeout(startEmailHandling, randomInterval);