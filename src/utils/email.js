const axios = require('axios');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const response = await axios.post(process.env.SMTP_API_URL + '/send-email', {
      to,
      subject,
      text,
      html
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.SMTP_API_KEY}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
};

module.exports = {
  sendEmail
};
