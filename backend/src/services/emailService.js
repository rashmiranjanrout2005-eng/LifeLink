export const emailService = {
  sendVerificationEmail: async (email) => ({ email, status: 'queued' }),
  sendPasswordReset: async (email) => ({ email, status: 'queued' })
};
