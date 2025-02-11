const axios = require('axios');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Escape newlines in HTML content
    const body = html ? html.replace(/\n/g, '') : text;

    const response = await axios.post(process.env.SMTP_API_URL + '/send-email', {
      to,
      subject,
      body,
      isHtml: !!html
    }, {
      headers: {
        'X-API-Key': process.env.SMTP_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = {
  sendEmail
};
