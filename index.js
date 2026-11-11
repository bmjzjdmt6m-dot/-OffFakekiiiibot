
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

const ADMIN_ID = Number(process.env.ADMIN_ID);
const WALLET = 'UQAMZDQPqy0Z-_GYjV8RcBbP89JyGAFcB2NFu2udy_t9rFB6';
const AMOUNT = 7;
const COMMENT = '009';

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
    `Добро пожаловать!\n\nДля получения доступа оплатите 7 TON.\n\nАдрес кошелька:\n${WALLET}\n\nКомментарий к платежу: ${COMMENT}\n\nПосле оплаты нажмите кнопку ниже.`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: 'Я оплатил', callback_data: 'confirm_payment' }
        ]]
      }
    }
  );
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (query.data === 'confirm_payment') {
    await bot.answerCallbackQuery(query.id, {
      text: 'Заявка отправлена администратору'
    });

    await bot.sendMessage(chatId,
      'Ваша заявка отправлена на проверку. Дождитесь подтверждения.'
    );

    await bot.sendMessage(ADMIN_ID,
      `Заявка на проверку оплаты\n\nПользователь: ${userId}\nСумма: ${AMOUNT} TON\nКомментарий: ${COMMENT}\n\nПроверьте транзакцию вручную.`,
      {
        reply_markup: {
          inline_keyboard: [[
            { text: 'Подтвердить', callback_data: `approve_${userId}` },
            { text: 'Отклонить', callback_data: `reject_${userId}` }
          ]]
        }
      }
    );
  }

  if (query.data.startsWith('approve_') &&
      userId === ADMIN_ID) {
    const target = Number(query.data.split('_')[1]);

    await bot.sendMessage(target,
      'Оплата подтверждена! Добро пожаловать.'
    );

    await bot.answerCallbackQuery(query.id, {
      text: 'Подтверждено'
    });
  }

  if (query.data.startsWith('reject_') &&
      userId === ADMIN_ID) {
    const target = Number(query.data.split('_')[1]);

    await bot.sendMessage(target,
      'Оплата пока не подтверждена. Обратитесь к администратору.'
    );

    await bot.answerCallbackQuery(query.id, {
      text: 'Отклонено'
    });
  }
});

console.log('OffFakekiiiBot запущен');
