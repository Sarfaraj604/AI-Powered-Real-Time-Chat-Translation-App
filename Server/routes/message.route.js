import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, translateMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get('/all-users', protectedRoute, getUsersForSidebar);
router.post('/translate/:messageId', protectedRoute, translateMessage);
router.get('/:id', protectedRoute, getMessages);
router.post('/send/:id', protectedRoute, sendMessage);


export default router;
