const nodemailer = require("nodemailer");
const emailOwner = "adrian.95.koenig@gmail.com";

const email = async (body, subject) => {
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
    from: "adrian.95.koenig@gmail.com", // sender address
    to: emailOwner, // list of receivers
    subject: "hola", // Subject line
    text: "New user registered", // plain text body
    html: `<h1>Hola</h1>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
};

export default email
