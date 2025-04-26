import express from "express";
import { createUser, loginUser, logoutUser } from "../controller/user.controller.js";
import { createPost, getPosts, getPostById, updatePost, deletePost, getPostsByUser } from "../controller/post.controller.js";
import { auth } from "../middleware/auth.js";
import { roleAuth } from "../middleware/roleAuth.js";
const router = express.Router();

console.log("Routes loaded");

// User routes
router.post("/signup", createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Post routes
// Public routes - anyone can view posts
router.get("/posts", auth, getPosts);
router.get("/posts/user", auth, getPostsByUser);
router.get("/posts/:id", auth, getPostById);

// Protected routes - only admin can create, update, or delete posts
router.post("/posts", auth,roleAuth, createPost);
router.put("/posts/:id", auth, roleAuth, updatePost);
router.delete("/posts/:id", auth, roleAuth, deletePost);

export default router;
