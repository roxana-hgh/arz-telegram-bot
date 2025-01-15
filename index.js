const TelegramBot = require('node-telegram-bot-api'); // Telegram bot library
const axios = require('axios'); // HTTP request library
require('dotenv').config();


// Use environment variable for the token
const token = process.env.BOT_TOKEN;

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Handle the '/start' command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const message = `
👋 سلام! به ربات **چقدر بدبختیم** خوش اومدی! 

📉 اینجا می‌تونی اطلاعات زیر رو دریافت کنی:
🔹 قیمت طلا
🔹 قیمت ارز
🔹 قیمت ارز دیجیتال

برای شروع، از دکمه‌ها یا دستورات زیر استفاده کن:
- /help برای راهنما
- /gold برای مشاهده قیمت‌های طلا
- /currency برای مشاهده قیمت‌های ارز
- /crypto برای مشاهده قیمت‌های ارز دیجیتال

⬇️ از دکمه‌های زیر استفاده کن:
    `;
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📊 چقدر بدبختیم؟ (لیست کامل)', callback_data: 'all_data' }],
                [
                    { text: '💰 قیمت طلا', callback_data: 'gold' },
                    { text: '💵 قیمت ارز', callback_data: 'currency' },
                    { text: '💎 ارز دیجیتال', callback_data: 'crypto' },
                ],
            ],
        },
    };
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown', ...options });
});

// Handle the '/help' command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const message = `
🆘 **راهنمای استفاده از ربات چقدر بدبختیم**:

🤔 می‌خوای بدونی اوضاع اقتصادی چطوره؟ ربات اینجاست که بهت کمک کنه:
🔹 /start: شروع ربات و نمایش منو.
    `;
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Fetch and send data based on the type (all, gold, currency, or crypto)
const fetchDataAndSend = async (chatId, type) => {
    try {
        const response = await axios.get('https://brsapi.ir/FreeTsetmcBourseApi/Api_Free_Gold_Currency_v2.json');
        const data = response.data;

        let message = `📊 **الان اینقدر بدبختیم**:\n\n`;

        if (type === 'all' || type === 'gold') {
            message += '💰 **قیمت‌های طلا**:\n\n';
            data.gold.forEach((item) => {
                message += `🔸 *${item.name}*:\n`;
                message += `  💵 قیمت: ${item.price.toLocaleString()} تومان\n\n`;
              
            });
        }

        if (type === 'all' || type === 'currency') {
            message += '\n💵 **قیمت‌های ارز**:\n\n';
            data.currency.forEach((item) => {
                message += `🔹 *${item.name}*:\n`;
                message += `  💵 قیمت: ${item.price.toLocaleString('')} تومان\n\n`;
            
            });
        }

        if (type === 'all' || type === 'crypto') {
            if (data.cryptocurrency.length > 0) {
                message += '\n💎 **قیمت‌های ارز دیجیتال**:\n\n';
                data.cryptocurrency.forEach((item) => {
                    message += `🔸 *${item.name}*:\n`;
                    message += `  💵 قیمت: ${item.price.toLocaleString('')} USD\n`;
                   
                });
            } else {
                message += '\n💎 **ارز دیجیتال**:\nاطلاعاتی موجود نیست.\n\n';
            }
        }

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error fetching data:', error);
        bot.sendMessage(chatId, '🚨 خطایی در دریافت اطلاعات رخ داده است.');
    }
};

// Handle button clicks
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;

    switch (callbackQuery.data) {
        case 'all_data':
            fetchDataAndSend(chatId, 'all');
            break;
        case 'gold':
            fetchDataAndSend(chatId, 'gold');
            break;
        case 'currency':
            fetchDataAndSend(chatId, 'currency');
            break;
        case 'crypto':
            fetchDataAndSend(chatId, 'crypto');
            break;
        default:
            bot.sendMessage(chatId, '🚨 گزینه نامعتبر است.');
            break;
    }
});

// Handle polling errors
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

console.log('Bot is running...');
