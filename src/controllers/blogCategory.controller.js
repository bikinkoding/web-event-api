const knex = require('../config/database');

// Get all blog categories
const getAllBlogCategories = async (req, res) => {
    try {
        const categories = await knex('blog_categories')
            .select('*')
            .orderBy('created_at', 'desc');
        
        res.json({
            status: 'success',
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get single blog category by ID
const getBlogCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await knex('blog_categories')
            .select('*')
            .where('id', id)
            .first();

        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        res.json({
            status: 'success',
            data: category
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create new blog category
const createBlogCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'Name is required'
            });
        }

        const [id] = await knex('blog_categories')
            .insert({
                name,
                description,
                created_at: new Date(),
                updated_at: new Date()
            });

        const newCategory = await knex('blog_categories')
            .select('*')
            .where('id', id)
            .first();

        res.status(201).json({
            status: 'success',
            data: newCategory
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update blog category
const updateBlogCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'Name is required'
            });
        }

        const category = await knex('blog_categories')
            .where('id', id)
            .first();

        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        await knex('blog_categories')
            .where('id', id)
            .update({
                name,
                description,
                updated_at: new Date()
            });

        const updatedCategory = await knex('blog_categories')
            .select('*')
            .where('id', id)
            .first();

        res.json({
            status: 'success',
            data: updatedCategory
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete blog category
const deleteBlogCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await knex('blog_categories')
            .where('id', id)
            .first();

        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        await knex('blog_categories')
            .where('id', id)
            .del();

        res.json({
            status: 'success',
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

module.exports = {
    getAllBlogCategories,
    getBlogCategoryById,
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory
};
