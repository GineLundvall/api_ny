const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const pool     = require("../db/connection");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();