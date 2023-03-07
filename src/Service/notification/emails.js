const nodemailer = require("nodemailer");
const emailOwner = "adrian.95.koenig@gmail.com";

const email = async (subject, body) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: "adrian.95.koenig@gmail.com",
      pass: "qrwhhnynmixxzlnj",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: "adrian.95.koenig@gmail.com",
    to: emailOwner,
    subject: subject,
    html: `<h1>Informe</h1>
    <p>${body}</p>`,
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = email;
