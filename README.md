# Email Hander

*using Gmail API and Node.JS* 

## Features

- Authentication using OAuth
- Identifies email threads which do not contain any reply from client and sends back appropriate email in the same thread by adhering to RFC 2822 standard.
- Further, it applies a label named “Vacation” to each thread where an automated reply was sent.
- If label named “Vacation” does not exist, it is created using Gmail API.
- This set of operations is run at random internal between 45 - 120 seconds.

## Project Setup

- Create a google account
- Create a project on Google cloud
- Enable Gmail API
- Setup OAuth client ID and its credentials which includes
    - defining relevant scopes ([documentation](https://developers.google.com/gmail/api/auth/scopes))
    - adding test users
- Extract your credentials.json file and add it to your node.js application
- run **`node index.js`**
