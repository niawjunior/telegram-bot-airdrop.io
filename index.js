const TelegramBot = require('node-telegram-bot-api');
var config = require('./config')
var firebase = require('firebase')
var email = config.user.email
var password = config.user.password
var firebase_config = config.firebase_config;
var token = config.token;
firebase.initializeApp(firebase_config);

const bot = new TelegramBot(token, {polling: true});
const img_url = 'http://4.bp.blogspot.com/-UWigFFa17fw/Vf1H-c2MGyI/AAAAAAAGbDs/DqbEz3kFXQY/s1600/TW004859.png'
var t_username = '';
var u_email = '';
var e_wallet = '';
bot.on('message', (msg) => {
var select_text = msg.text;
if( select_text.toLowerCase().indexOf("/start") === 0) {
    bot.sendPhoto(msg.chat.id,img_url).then(() => {
        bot.sendMessage(msg.chat.id, "Welcome to Domeno Airdrop! 😍😍😍 \nPlease join our community and get 100 token.", {
            "reply_markup": {
                "keyboard": [["1. Join the Domeno Telegram group", "2. Your Telegram Username"],   ["3. E-mail address" , "4. ETH address (No exchange wallet!)"]]
                }
        });
    })
}
if (select_text.indexOf("1. Join the Domeno Telegram group") === 0) {
    var text = 'Domeno Telegram Group';
    var keyboardStr = JSON.stringify({
        inline_keyboard: [
        [
            {text:'Join the chat',url:'https://t.me/joinchat/FP5H8RIFast0BbjwqiO1_w'}
        ]
        ]
    });

    var keyboard = {reply_markup: JSON.parse(keyboardStr)};
    bot.sendMessage(msg.chat.id,text,keyboard);
}

if (select_text.indexOf("2. Your Telegram Username") === 0) {
    bot.sendMessage(msg.chat.id, "Please Enter Your Telegram Username (@username)")
    var i = 0;
    bot.on('message',msg_name => {
        if(select_text.indexOf('2. Your Telegram Username') === 0 && msg_name.text.toString().includes('@') && i < 1) {
            t_username = msg_name.text;
            bot.sendMessage(msg.chat.id, "Hello "+msg_name.text);
            i++;
        }
    });
}
if (select_text.indexOf("3. E-mail address") === 0) {
    bot.sendMessage(msg.chat.id, "Enter your email address")
    var i = 0;
    var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
    bot.on('message',msg_email => {
        if(select_text.indexOf('3. E-mail address') === 0  && re.test(msg_email.text) && i < 1) {
            u_email = msg_email.text;
            bot.sendMessage(msg.chat.id, "Email address: "+msg_email.text);
            i++;
        }
    });
}

if (select_text.indexOf("4. ETH address (No exchange wallet!") === 0) {
    bot.sendMessage(msg.chat.id, "Make sure that you have an erc20 wallet (0x) 🔑")
    var i = 0;
    bot.on('message',eth_wallet => {
        if(select_text.indexOf('4. ETH address (No exchange wallet!') === 0  && i < 1) {
            bot.sendMessage(msg.chat.id, "Ethereum wallet: "+eth_wallet.text).then(() => {
                if(eth_wallet.text.toString().includes('0x')) {
                    e_wallet = eth_wallet.text;
                    bot.sendMessage(msg.chat.id, 'Confirm❓', {
                        reply_markup: {
                          inline_keyboard: [
                           [{"text": "Yes ✅", "callback_data": "1"}],
                           [{"text": "Cancel ❌",  "callback_data": "0"}]
                        ]
                        }
                      })
                }
            })
            i++;
        }
    })
    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
        var answer = callbackQuery.data;
        var i = 0;
        if(answer === '1' && i < 1) {
            bot.sendMessage(msg.chat.id, "Thank'you 🙏🙏 \n"); 
            bot.sendMessage(msg.chat.id, `Telegram username: ${t_username} \n Email: ${u_email} \n Ethereum wallet: ${e_wallet} \n`).then(() => {
            })
            firebase.auth().signInWithEmailAndPassword(email, password).then((response) => {
                var db = firebase.database().ref('Airdrop');
                var key = db.push().key;
                db.child(key).update({
                    telegram_username: t_username,
                    email: u_email,
                    wallet: e_wallet.toLocaleLowerCase(),
                    createAt: Date.now()
                }).then(() => {
                    bot.sendMessage(msg.chat.id, "Check your account 👉 "+ 'https://www.website.com?id'+e_wallet.toLocaleLowerCase())
                }).catch((err) => {
                    console.log(err)
                })
            })
        } 
        if(answer === '0' && i < 1) {
            bot.sendMessage(msg.chat.id, "Good bye ✌️✌️"); 
        }
        i++
     });
    }
})