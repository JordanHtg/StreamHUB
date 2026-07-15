const app = require('../server/src/server');

module.exports = (req, res) => {
  return app(req, res);
};
