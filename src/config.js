require('dotenv').config();

module.exports = {
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    PORT: process.env.PORT || 8080,
    WEBHOOK_URL: process.env.WEBHOOK_URL,
    GROUP_CHAT_ID: process.env.TELEGRAM_GROUP_CHAT_ID
};

