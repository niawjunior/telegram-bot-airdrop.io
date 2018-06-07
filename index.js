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

bot.onText(/\/start/, (msg) => {
    bot.sendPhoto(msg.chat.id,img_url).then(() => {
        var option = {
            "reply_markup": {
                "keyboard": [["1. Join the Domeno Telegram group", "2. Your Telegram Username"],   ["3. E-mail address" , "4. ETH address (No exchange wallet!)"]]
                }
        };
        bot.sendMessage(msg.chat.id, "Welcome to Domeno Airdrop! 😍😍 \nPlease join our community and get 100 token.\n \n Airdrop Rules \n 1. Join the Domeno Telegram group \n 2. Your Telegram Username \n 3. E-mail address \n 4. ETH address (No exchange wallet!) \n",option);
    })
})

bot.on('message', (msg) => {
    var send_text = msg.text;
    var step1_text = '1. Join the Domeno Telegram group'
    if (send_text.toString().indexOf(step1_text) === 0) {
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

    var step2_text = '2. Your Telegram Username';
    if (send_text.toString().indexOf(step2_text) === 0) {
        bot.sendMessage(msg.chat.id, "Please Enter Your Telegram Username (@username)")
    }

    if(send_text.toString().charAt(0) === '@') {
        t_username = send_text;
        bot.sendMessage(msg.chat.id, "Hello "+send_text);
    }

    var step3_text = '3. E-mail address';
    if(send_text.toString().indexOf(step3_text) === 0) {
        bot.sendMessage(msg.chat.id, "Enter your email address")
    }
    
    var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
    
    if(re.test(send_text)) {
        u_email = send_text;
        bot.sendMessage(msg.chat.id, "Email address: "+send_text);
    }

    var step4_text = '4. ETH address (No exchange wallet!)';
    if(send_text.toString().indexOf(step4_text) === 0) {
        bot.sendMessage(msg.chat.id, "Make sure that you have an erc20 wallet (0x) 🔑")
    }
    var re_eth = /^0x[a-fA-F0-9]{40}$/g
    if(re_eth.test(send_text)) {
        e_wallet = send_text;
        bot.sendMessage(msg.chat.id, 'Confirm❓', {
            reply_markup: {
              keyboard: [
               [{"text": "Yes ✅"}],
               [{"text": "Cancel ❌"}]
            ],
            resize_keyboard: true
            }
         })
    }
    var confirm = 'Yes ✅';
    if(send_text.toString().indexOf(confirm) === 0) {
        firebase.auth().signInWithEmailAndPassword(email, password).then((response) => {
            var db = firebase.database().ref('Airdrop');
            db.child(e_wallet.toLocaleLowerCase()).once('value', snap => {
                if(!snap.exists()) {
                    db.child(e_wallet.toLocaleLowerCase()).update({
                        telegram_username: t_username,
                        email: u_email,
                        wallet: e_wallet.toLocaleLowerCase(),
                        status: 'pending',
                        createAt: Date.now()
                    }).then(() => {
                        bot.sendMessage(msg.chat.id, "Thank'you 🙏🙏 \n"); 
                        bot.sendMessage(msg.chat.id, `Telegram username: ${t_username} \n Email: ${u_email} \n Ethereum wallet: ${e_wallet} \n`).then(() => {
                        bot.sendMessage(msg.chat.id, "Check your account 👉 "+ 'https://niawjunior.github.io/telegram-bot-airdrop.io/index.html?id='+e_wallet.toLocaleLowerCase())

                        })
                    }).catch((err) => {
                        console.log(err)
                    })
                } else {
                    bot.sendMessage(msg.chat.id, "This wallet is already in use")
                }
            })
        })
    }
    var calcel = 'Cancel ❌';
    if(send_text.toString().indexOf(calcel) === 0) {
        bot.sendMessage(msg.chat.id, "Good bye ✌️✌️"); 
    }
});

