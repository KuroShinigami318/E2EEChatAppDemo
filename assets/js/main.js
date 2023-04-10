const keySize = 1024;
// Bob
var k_BobKey;
// Ashley
var k_AliceKey;

$.getScript("assets/js/jsencrypt.min.js", function() {
  fetch('./assets/BobKey.json').then(response => {
    return response.json();
  }).then(credentials => {
    k_BobKey = { privateKey: credentials.privateKey, publicKey: credentials.publicKey};
  });
  fetch('./assets/AliceKey.json').then(response => {
    return response.json();
  }).then(credentials => {
    k_AliceKey = { privateKey: credentials.privateKey, publicKey: credentials.publicKey};
  });
  setTimeout(generateKeys, 10);
});

$.getScript("assets/js/aesencrypt.min.js", function() {

});

$.getScript("assets/js/scrypt.js", function() {

});

const generateKeys = () => {
  // Create the encryption object and set the key.
  if (k_BobKey == null && k_AliceKey == null)
  {
    let BobCrypt = new JSEncrypt({default_key_size: keySize});
    let AliceCrypt = new JSEncrypt({default_key_size: keySize});
    BobCrypt.getKey();
    AliceCrypt.getKey();
    k_BobKey = { privateKey: BobCrypt.getPrivateKey(), publicKey: BobCrypt.getPublicKey()};
    k_AliceKey = { privateKey: AliceCrypt.getPrivateKey(), publicKey: AliceCrypt.getPublicKey()};
  }
}

const messagebox = document.querySelectorAll(".message-box");
const encrypt_mssge = document.querySelector(".encrypted_message");
const encryptKey = document.querySelectorAll(".encryptKey input");
const decryptKey = document.querySelectorAll(".decryptKey input");
const phone1 = document.querySelector(".chats__phone1");
const phone2 = document.querySelector(".chats__phone2");
const phone3 = document.querySelector(".chats__phone3");
var currentSender;
var receiverKey;

let secretKey = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];
const counter = 5;

const Sender = mssge => {
  let SenderCht = document.createElement("div");
  let SenderMssg = document.createElement("div");
  SenderCht.classList.add("Bob", "chat", "chat-sent");
  SenderMssg.classList.add("Bob", "message-sent");
  SenderMssg.innerText = mssge;
  SenderCht.appendChild(SenderMssg);
  switch (currentSender)
  {
    case 0:
      phone1.appendChild(SenderCht);
      break;
    
    case 2:
      phone3.appendChild(SenderCht);
      break;
  }
}

const hckrReceive = (mssge, i_messageKey) => {
  let text = mssge;
  let hckrCht = document.createElement("div");
  let hckrMssg = document.createElement("div");
  hckrCht.classList.add("Bob", "chat", "chat-sent");
  hckrMssg.classList.add("Bob", "message-sent");
  hckrMssg.innerText = "package_message: " + text + "\n package_key: " + i_messageKey;
  hckrCht.appendChild(hckrMssg);
  phone2.appendChild(hckrCht);
}

const Receiver = (mssge, i_messageKey) => {
  let ReceiverCht = document.createElement("div"); 
  let ReceiverMssg = document.createElement("div");
  ReceiverCht.classList.add("Ashley","chat", "chat-received")
  ReceiverMssg.classList.add("Ashley", "message-received");
  ReceiverCht.appendChild(ReceiverMssg);
  //
  let crypt = new JSEncrypt();
  crypt.setKey(receiverKey.privateKey);
  const unlockKey = JSON.parse(crypt.decrypt(i_messageKey));
  ReceiverMssg.innerText = decrypt(mssge, unlockKey);
  switch (currentSender)
  {
    case 0:
      phone3.appendChild(ReceiverCht);
      break;
    
    case 2:
      phone1.appendChild(ReceiverCht);
      break;
  }
}

// function to encrypt plain text (message) using AES
function encrypt (message, lock) {
  let textBytes = aesjs.utils.utf8.toBytes(message);
  let aesCtr = new aesjs.ModeOfOperation.ctr(lock, new aesjs.Counter(counter));
  const encryptedBytes = aesCtr.encrypt(textBytes);
  const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
  return encryptedHex;
}

// function to decrypt plain text (message) using AES
function decrypt(encrypted_message, unlockKey){
  const encryptedBytes = aesjs.utils.hex.toBytes(encrypted_message);
  var aesCtr = new aesjs.ModeOfOperation.ctr(unlockKey, new aesjs.Counter(counter));
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);
  const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  return decryptedText;
}
const send = (mssge, sender) => {
  let enkeys = [];
  messageToSend = encrypt(mssge, secretKey);
  let crypt = new JSEncrypt();
  var publicKeyReciever;
  switch (sender)
  {
    case 0:
      publicKeyReciever = k_AliceKey.publicKey;
      receiverKey = k_AliceKey;
      break;
    
    case 2:
      publicKeyReciever = k_BobKey.publicKey;
      receiverKey = k_BobKey;
      break;

    default:
      publicKeyReciever = "Not Sender";
      break;
  }
  if (publicKeyReciever == "Not Sender")
  {
    console.log("This is not sender! Failed to send message.");
    return;
  }
  crypt.setKey(publicKeyReciever);
  let rsaEncryptedSecretKey = crypt.encrypt(JSON.stringify(secretKey));
  Sender(mssge);
  hckrReceive(messageToSend, rsaEncryptedSecretKey);
  Receiver(messageToSend, rsaEncryptedSecretKey);
  messagebox[sender].value = "";
}

messagebox.forEach((element, index) => {
  element.addEventListener('keydown', function(e) {
    if(e.keyCode === 13){
      currentSender = index;
      send(element.value, index);
    }
  });
});