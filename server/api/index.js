const app = require('../src/server');

// Vercel Serverless Function handler
module.exports = (req, res) => {
  return app(req, res);
};
