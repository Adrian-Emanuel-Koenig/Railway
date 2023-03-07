const accountSid = "ACee58f27a95f0f7171ae361021bf17390";
const authToken = "7a2cb05f260f5cdfca2d463fb5d013d4";
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
