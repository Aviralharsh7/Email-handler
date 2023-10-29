const { google } = require('googleapis');
const { gmail } = require("googleapis/build/src/apis/gmail");
// const nodemailer = require('nodemailer');

async function listRecentEmails(auth){
    try {
        const gmail = google.gmail({
            version: 'v1',
            auth,
        });

        // extract top 10 threads with inbox label
        const response = await gmail.users.threads.list({
            userId: 'me',
            maxResults: 10,
            labelIds: ['INBOX'],
        })
        const allThread = response.data.threads;

        for (const thread of allThread){
            
            // extract each thread
            const threadDetails = await gmail.users.threads.get({
                userId: 'me',
                id: thread.id,
            });

            const allMessage = threadDetails.data.messages;

            // check for atleast one reply made in thread 
            const hasReplied = await hasRepliedMessage(allMessage);
            

            if (!hasReplied){
                await sendVacationEmail(auth, thread.id);
                let labelName = "Vacation"
                await applyLabelToThread(auth, thread.id, labelName);
            }
        }
    } catch (error){
        console.error("Error listing threads: ", error);
    }
}

async function hasRepliedMessage(messages) {
    try {
            for(const message of messages){
                if(message.labelIds.includes('SENT')){
                    return true;
                }
            }
            return false;

    } catch (error){
        console.log("Error checking for previous replies: ", error);
    }
}


// async function sendVacationEmail(auth, threadId) {
//   try {

//     // const accessToken = await auth.oAuth2Client.getAccessToken();

//     const transport = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: 'larrypageverified@gmail.com',
//         clientId: auth._clientId,
//         clientSecret: auth.clientSecret,
//         refreshToken: auth.credentials.refresh_token,
//         accessToken: auth.credentials.access_token,
//       },
//     });

//     const mailOptions = {
//       from: 'SENDER NAME <yours authorised email address@gmail.com>',
//       to: 'to email address here',
//       subject: 'Hello from gmail using API',
//       text: 'Hello from gmail email using API',
//       html: '<h1>Hello from gmail email using API</h1>',
//     };

//     const result = await transport.sendMail(mailOptions);
//     return result;
//   } catch (error) {
//     return error;
//   }
// }

async function sendVacationEmail(auth, threadId) {
    try {
        const gmail = google.gmail({
            version: 'v1',
            auth,
        });

        const threadDetails = await gmail.users.threads.get({
            userId: 'me',
            id: threadId,
        });

        const messages = threadDetails.data.messages;

        // extract most recent message in thread
        const message = messages[0];
        // console.log("message: ", message);

        // Extract the sender's email from the 'From' header
        // const headers = message.payload.headers;
        // const fromHeader = headers.find(header => header.name === 'from');
        
        function makeBody(ref, InReply, to, from, subject, message) {
            var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
                "MIME-Version: 1.0\n",
                "Content-Transfer-Encoding: 7bit\n",
                "References:", ref, "\n" +
                "In-Reply-To: ", InReply, "\n" +
                "to: ", to, "\n",
                "from: ", from, "\n",
                "subject: ", subject, "\n\n",
                message
            ].join('');

            const encodedMail = Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
            return encodedMail
        }
        const headers = message.payload.headers
        let sub
        let to
        let ref
        let InReply
        headers.forEach(element => {
            if (element.name === 'Subject' || element.name === 'subject') {
                sub = element.value
            }
            if (element.name === 'From' || element.name === 'from') {
                to = element.value
            }
            if (element.name === 'Message-ID' || element.name === 'Message-Id') {
                ref = element.value
                InReply = element.value
            }
        });
        const raw = makeBody(ref, InReply, to, 'larrypageverified@gmail.com', sub, 'I am on vacation');

        await gmail.users.messages.send({
            userId: 'me',
            resource: {
                raw: raw,
                threadId: threadId,
            },
        });
    } catch (error){
        console.error("Error sending vacation email: ", error);
    }
}

async function applyLabelToThread(auth, threadId, labelName){
    try {
        const gmail = google.gmail({
            version: 'v1',
            auth,
        });

        const {labelId} = await listLabels(auth);
        // console.log("label id: ", labelId);

        if (labelId === null){
            await createLabel(auth, labelName); 
        }
        
        await gmail.users.threads.modify({
            userId: 'me',
            id: threadId,
            resource:  {
                addLabelIds: [labelId],
            },
        });
    } catch (error){
        console.error("Error applying label: ", error);
    }
}

// extracting labels in client's account 
async function listLabels(auth){
    try {
        const gmail = google.gmail({
            version: 'v1', 
            auth
        });

        const response = await gmail.users.labels.list({
            userId: 'me',
        });
        const labels = response.data.labels;
        for (const label of labels){
            if (label.name === 'Vacation'){
                return {labelId: label.id}
            }
        }
        return {labelId: null};
    } catch (error){
        console.log("Error finding Vacation label: ", error);
    }

}

async function createLabel (auth, labelName){
    try{
        const gmail = google.gmail({
            version: 'v1',
            auth,
        });

        await gmail.users.labels.create({
            userId: 'me',
            resource: {
                name: labelName,
            },
        });
    } catch (error) {
            console.log("Error creating label: ", error);
    }
}

module.exports = {
    listRecentEmails
}