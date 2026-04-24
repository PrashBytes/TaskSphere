const app = require('../app');
const { seedDemoData } = require('../utils/demoStore');

let seeded = false;

module.exports = async (req, res) => {
  if (!seeded) {
    await seedDemoData();
    seeded = true;
  }
  
  return app(req, res);
};
