module.exports = async function handler(req, res) {
  const { default: app } = await import('../backend/src/app.js');
  return app(req, res);
};
