const express = require('express');
const app = express();

const {listRecentEmails} = require('./vacationResponse');
const { authorize } = require('./loginGmailAPI');

const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`Server is running on PORT ${PORT}`);
})

// app.use(express.static('public'));
// app.use(express.json());
// app.use(express.urlencoded({extended: false}));

app.get ('/email-handler', async (req, res) => {
    try {
        const client = await authorize();
        await listRecentEmails();
        res.send("Email hander is up!");
    } catch (error){
        console.error("Error starting email-handler: ", error);
    }
});
