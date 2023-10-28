async function authorize(credentials, token) {
  const { client_secret, client_id, redirect_uris } =
    _get_credentials_object(credentials).installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  // Check if we have previously stored a token.
  try {
    oAuth2Client.setCredentials(_get_token_object(token));
    return oAuth2Client;
  } catch (error) {
    const newOAuth2Client = await get_new_token(oAuth2Client, token);
    if (token instanceof Object) {
      tokenStore.store(newOAuth2Client.credentials);
    } else {
      tokenStore.store(newOAuth2Client.credentials, token);
    }
    return newOAuth2Client;
  }
}

function _get_token_object(token) {
  if (token instanceof Object) {
    return token;
  }
  return tokenStore.get(token);
}

function get(token_path) {
  try {
    return JSON.parse(fs.readFileSync(
      token_path || path.resolve(__dirname, TOKEN_PATH)
    ).toString());
  } catch (error) {
    throw new Error("No token found.");
  }
}

async function get_new_token(oAuth2Client, token) {
  return authenticate(oAuth2Client, SCOPES, token);
}







function _gmail_client(oAuth2Client) {
  return google.gmail({ version: "v1", oAuth2Client });
}

function _get_credentials_object(credentials) {
  if (credentials instanceof Object) {
    return credentials;
  }
  return JSON.parse(fs.readFileSync(credentials));
}

