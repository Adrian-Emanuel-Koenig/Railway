const accountSid = "ACee58f27a95f0f7171ae361021bf17390";
const authToken = "d0b262cc7cd8fe39534b88a9889ea1af";
const client = require("twilio")(accountSid, authToken);

const whatsapp = (body) => {
  client.messages
    .create({
      body: body,
      from: "whatsapp:+14155238886",
      to: "whatsapp:+5492914791039",
    })
    .then((message) => console.log(message.sid));
};

module.exports = whatsapp;
