import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSidebar, markAllMessagesAsSeen, markMessageAsSeen, sendMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();
messageRouter.put("/mark-all/:userId", protectRoute, markAllMessagesAsSeen);
messageRouter.get("/users",protectRoute,getUsersForSidebar);
messageRouter.get("/:id",protectRoute,getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen); 
messageRouter.post("/send/:id",protectRoute,sendMessage);



export default messageRouter;