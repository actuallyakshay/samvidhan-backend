// // run-once/get-tokens.ts  — run this ONCE locally, then delete it
// import { google } from 'googleapis';
// import * as readline from 'readline';

// const oauth2Client = new google.auth.OAuth2();

// const url = oauth2Client.generateAuthUrl({
//   access_type: 'offline',
//   prompt: 'consent', // forces refresh_token to be returned
//   scope: ['https://www.googleapis.com/auth/meetings.space.created'],
// });

// console.log('Visit this URL:', url);

// const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
// rl.question('Paste the code from the callback URL: ', async (code) => {
//   const { tokens } = await oauth2Client.getToken(code);
//   console.log('REFRESH TOKEN:', tokens.refresh_token); // 👈 copy this to .env
//   rl.close();
// });
