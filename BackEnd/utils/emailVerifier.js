import axios from 'axios';

class EmailVerifier {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async verifyEmail(email) {
    try {
      const response = await axios.get(`https://emaillistverify.com/api/verifyEmail?secret=${this.apiKey}&email=${email}`);
      
      // The API returns 'ok' for valid emails and 'fail' for invalid ones
      const result = response.data.trim().toLowerCase();
      
      return {
        isValid: result === 'ok',
        status: result,
        error: null
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        isValid: false,
        status: 'error',
        error: error.message
      };
    }
  }
}

export default EmailVerifier; 