const express = require('express');

const {
  createTask,
  deleteTask,
  getTasks,
  updateTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { taskCreateValidator, taskUpdateValidator } = require('../utils/validators');

const router = express.Router();

router.use(protect);

router.route('/').get(getTasks).post(validateRequest(taskCreateValidator), createTask);
router.route('/:id').put(validateRequest(taskUpdateValidator), updateTask).delete(deleteTask);

module.exports = router;
