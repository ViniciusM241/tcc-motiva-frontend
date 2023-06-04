const dotenv = require('dotenv');

dotenv.config();

module.exports = () => {
  const context = {
    title: 'MotiViva - Painel Admin',
    baseURL: process.env.BASE_URL,
    apiBaseURL: process.env.API_BASE_URL,
  };

  return context;
};
