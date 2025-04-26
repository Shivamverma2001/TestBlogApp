import axios from 'axios';

// Email verification service
const EMAIL_VERIFY_API_URL = 'https://api.emaillistverify.com/api/verifyEmail';

export const emailVerificationService = {
  verifyEmail: async (email) => {
    try {
      const response = await axios.get(EMAIL_VERIFY_API_URL, {
        params: {
          email: email
        },
        headers: {
          'accept': 'text/html'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }
};