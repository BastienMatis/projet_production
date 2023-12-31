import express from "express";
import { register, magic, login, loginAsAdmin } from '../controllers/authController';

const ROUTES_AUTH = express.Router();

ROUTES_AUTH.post('/register', register);
ROUTES_AUTH.post('/loginAsAdmin', loginAsAdmin);
ROUTES_AUTH.get('/magic', magic);
ROUTES_AUTH.get('/login', login);

export default ROUTES_AUTH;
