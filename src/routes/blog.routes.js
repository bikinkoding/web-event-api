const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);
router.get('/category/:categoryId', blogController.getBlogsByCategory);

// Protected routes (admin only)
router.post('/', authMiddleware.isAdmin, blogController.createBlog);
router.put('/:id', authMiddleware.isAdmin, blogController.updateBlog);
router.delete('/:id', authMiddleware.isAdmin, blogController.deleteBlog);

module.exports = router;
