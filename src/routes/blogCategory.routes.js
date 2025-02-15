const express = require('express');
const router = express.Router();
const {
    getAllBlogCategories,
    getBlogCategoryById,
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory
} = require('../controllers/blogCategory.controller');

// Blog Category routes
router.get('/', getAllBlogCategories);
router.get('/:id', getBlogCategoryById);
router.post('/', createBlogCategory);
router.put('/:id', updateBlogCategory);
router.delete('/:id', deleteBlogCategory);

module.exports = router;
