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

const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];


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

// extracting labels in client's account 
async function listLabels(auth){
    const gmail = google.gmail({version: 'v1', auth});
    const res = await gmail.users.labels.list({
        userId: 'me',
    });
    const labels = res.data.labels;
    if( !labels || labels.length === 0){
        console.log('No labels found');
        return;
    }
    console.log('Labels:');
    labels.forEach((label) =>{
        console.log(` - ${label.name}`);
    });
}

authorize().then((auth) => {
        listLabels(auth); 
        listRecentEmails(auth);
        // console.log("auth: ", auth);
        return null;
    }).catch(console.error);

// authorize().then(listRecentEmails).catch(console.error);
