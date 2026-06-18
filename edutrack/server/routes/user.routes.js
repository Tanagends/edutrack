const express = require('express');
const router = express.Router();
const { getUsers, createUser, toggleUser } = require('../controllers/user.controller');
const { protect, authorise } = require('../middleware/auth');

router.use(protect);
router.use(authorise('admin'));

router.route('/').get(getUsers).post(createUser);
router.put('/:id/toggle', toggleUser);

module.exports = router;
