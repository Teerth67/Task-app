const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'teerthmittal05@gmail.com', 
    pass: 'csgsrsbaprblrbqp' 
  }
});

const sendWelcomeEmail = (email, name) => {
  const mailOptions = {
    from: 'teerthmittal05@gmail.com', 
    to: email,
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const sendCancelationEmail = (email, name) => {
  const mailOptions = {
    from: 'teerthmittal05@gmail.com', 
    to: email,
    subject: 'Sorry to see you go!',
    text: `Goodbye, ${name}. I hope to see you back sometime soon.`
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
};
