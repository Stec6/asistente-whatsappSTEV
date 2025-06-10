const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { OpenAI } = require('openai');
require('dotenv').config();

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.on('qr', qr => {
  console.log('Escanea este código QR con tu WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot conectado a WhatsApp y listo.');
});

client.on('message', async message => {
  if (message.fromMe || !message.body) return;

  const prompt = `Cliente: ${message.body}\nTú:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Eres un emprendedor colombiano que responde con claridad, amabilidad y emojis cuando aplica.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200
    });

    const reply = response.choices[0].message.content.trim();
    await message.reply(reply);
  } catch (error) {
    console.error('❌ Error con OpenAI:', error.message);
    await message.reply('Ups, hubo un error generando la respuesta.');
  }
});

client.initialize();
