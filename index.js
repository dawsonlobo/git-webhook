const express = require('express');
const { exec } = require('child_process');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
// Middleware to parse JSON body
app.use(express.json());

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.post('/vetms-bk/git-webhook', (req, res) => {
    req.body = JSON.parse(req.body.payload) || {};
    console.log(req.body);
    
    if (req.body.ref === 'refs/heads/dev') {
        exec(`pm2 stop ${process.env.PM2_APP_NAME} && cd ${process.env.CD_COMMAND} && git reset --hard && git pull origin dev && npm i && npm run build && pm2 start ${process.env.PM2_APP_NAME}`, (error, stdout, stderr) => {
            // exec(`cd ../../interns/vetms-bk && git reset --hard && git pull origin dev`, (error, stdout, stderr) => {
                if (error) {
                console.error(`Error: ${error.message}`);
                return res.sendStatus(500);
            }
            console.log(`Git Pull Output: ${stdout}`);
            res.sendStatus(200);
        });
    } else {
        res.sendStatus(200);
    }
});

app.listen(process.env.PORT, () => console.log(`Listening for GitHub Webhooks on port ${process.env.PORT}`));
