const accountSid = "ACee58f27a95f0f7171ae361021bf17390";
const authToken = "cf9e9ef373ac376a35084d3b7f6bdd9d";
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
