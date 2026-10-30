const express = require('express');
const auth = require('./auth.service');
const authenticate = require('../../middleware/authenticate');
const { validateBody } = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { registerSchema, loginSchema } = require('./auth.schemas');

const router = express.Router();

router.post('/register', validateBody(registerSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await auth.register(req.body));
}));

router.post('/login', validateBody(loginSchema), asyncHandler(async (req, res) => {
  res.json(await auth.login(req.body));
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json(await auth.getProfile(req.user.id));
}));

module.exports = router;
