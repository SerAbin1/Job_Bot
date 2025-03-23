const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./bot');
const { TELEGRAM_TOKEN, PORT, WEBHOOK_URL } = require('./config');

const app = express();
app.use(bodyParser.json());

app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        bot.setWebHook(`${WEBHOOK_URL}/bot${TELEGRAM_TOKEN}`);
    });
};

module.exports = startServer;

