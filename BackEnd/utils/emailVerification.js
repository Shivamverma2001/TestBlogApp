const { VerifaliaRestClient } = require('verifalia');

// Initialize Verifalia client with your credentials
const verifalia = new VerifaliaRestClient({
    username: process.env.VERIFALIA_USERNAME,
    password: process.env.VERIFALIA_PASSWORD
});

/**
 * Verifies an email address using Verifalia
 * @param {string} email - The email address to verify
 * @returns {Promise<Object>} - The verification result
 */
const verifyEmail = async (email) => {
    try {
        const result = await verifalia
            .emailValidations
            .submit(email);

        const entry = result.entries[0];
        
        return {
            isValid: entry.classification === 'Deliverable',
            classification: entry.classification,
            status: entry.status,
            isDisposable: entry.isDisposableEmailAddress,
            isFree: entry.isFreeEmailAddress,
            isRoleAccount: entry.isRoleAccount,
            suggestions: entry.suggestions || []
        };
    } catch (error) {
        console.error('Email verification error:', error);
        throw error;
    }
};

/**
 * Verifies multiple email addresses in batch
 * @param {string[]} emails - Array of email addresses to verify
 * @returns {Promise<Object[]>} - Array of verification results
 */
const verifyEmails = async (emails) => {
    try {
        const result = await verifalia
            .emailValidations
            .submit(emails);

        return result.entries.map(entry => ({
            email: entry.inputData,
            isValid: entry.classification === 'Deliverable',
            classification: entry.classification,
            status: entry.status,
            isDisposable: entry.isDisposableEmailAddress,
            isFree: entry.isFreeEmailAddress,
            isRoleAccount: entry.isRoleAccount,
            suggestions: entry.suggestions || []
        }));
    } catch (error) {
        console.error('Batch email verification error:', error);
        throw error;
    }
};

module.exports = {
    verifyEmail,
    verifyEmails
}; 