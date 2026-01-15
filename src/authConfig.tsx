import { Configuration, LogLevel } from "@azure/msal-browser";

// MSAL Configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,  // From .env file
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,  // From .env file
    redirectUri: import.meta.env.VITE_REDIRECT_URI,  // From .env file
  },
  cache: {
    cacheLocation: "sessionStorage",  
    storeAuthStateInCookie: true,  
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Info,
      loggerCallback(logLevel, message, piiEnabled) {
        console.log(message);
      },
    },
  },
};

// Login request
export const loginRequest = {
  scopes: ["User.Read"],  // Scopes you want to request
};