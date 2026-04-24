const app = require('../backend/app');
const { seedDemoData } = require('../backend/utils/demoStore');

let seeded = false;

module.exports = async (req, res) => {
  if (!seeded) {
    await seedDemoData();
    seeded = true;
  }
  
  return app(req, res);
};
