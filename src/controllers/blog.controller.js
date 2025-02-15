const db = require('../config/database');
const logger = require('../utils/logger');

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await db('blogs')
      .select(
        'blogs.*',
        db.raw('GROUP_CONCAT(DISTINCT bc.name) as category_names'),
        db.raw('GROUP_CONCAT(DISTINCT bc.id) as category_ids')
      )
      .leftJoin('blog_category_relations as bcr', 'blogs.id', 'bcr.blog_id')
      .leftJoin('blog_categories as bc', 'bcr.category_id', 'bc.id')
      .where('blogs.status', 'published')
      .groupBy('blogs.id')
      .orderBy('blogs.created_at', 'desc');

    // Transform the response to include categories as an array of IDs
    const transformedBlogs = blogs.map(blog => ({
      ...blog,
      categories: blog.category_ids ? blog.category_ids.split(',').map(id => parseInt(id)) : [],
      category_names: blog.category_names ? blog.category_names.split(',').map(name => name.trim()) : []
    }));

    res.json(transformedBlogs);
  } catch (error) {
    logger.error('Error in getAllBlogs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await db('blogs')
      .select(
        'blogs.*',
        db.raw('GROUP_CONCAT(DISTINCT bc.name) as categories')
      )
      .leftJoin('blog_category_relations as bcr', 'blogs.id', 'bcr.blog_id')
      .leftJoin('blog_categories as bc', 'bcr.category_id', 'bc.id')
      .where('blogs.id', id)
      .where('blogs.status', 'published')
      .groupBy('blogs.id')
      .first();

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    logger.error('Error in getBlogById:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getBlogsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const blogs = await db('blogs')
      .select(
        'blogs.*',
        db.raw('GROUP_CONCAT(DISTINCT bc.name) as categories')
      )
      .leftJoin('blog_category_relations as bcr', 'blogs.id', 'bcr.blog_id')
      .leftJoin('blog_categories as bc', 'bcr.category_id', 'bc.id')
      .where('blogs.status', 'published')
      .where('bcr.category_id', categoryId)
      .groupBy('blogs.id')
      .orderBy('blogs.created_at', 'desc');

    res.json(blogs);
  } catch (error) {
    logger.error('Error in getBlogsByCategory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, content, image_url, categories } = req.body;

    const [blogId] = await db('blogs').insert({
      title,
      content,
      image_url,
      status: 'published',
      created_by: req.user.id,
      created_at: db.fn.now()
    });

    if (categories && categories.length > 0) {
      const categoryRelations = categories.map(categoryId => ({
        blog_id: blogId,
        category_id: categoryId
      }));
      await db('blog_category_relations').insert(categoryRelations);
    }

    res.status(201).json({ message: 'Blog created successfully', blogId });
  } catch (error) {
    logger.error('Error in createBlog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image_url, categories } = req.body;

    await db('blogs').where('id', id).update({
      title,
      content,
      image_url,
      updated_at: db.fn.now()
    });

    if (categories) {
      await db('blog_category_relations').where('blog_id', id).del();
      if (categories.length > 0) {
        const categoryRelations = categories.map(categoryId => ({
          blog_id: id,
          category_id: categoryId
        }));
        await db('blog_category_relations').insert(categoryRelations);
      }
    }

    res.json({ message: 'Blog updated successfully' });
  } catch (error) {
    logger.error('Error in updateBlog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    await db('blog_category_relations').where('blog_id', id).del();
    await db('blogs').where('id', id).del();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteBlog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  getBlogsByCategory,
  createBlog,
  updateBlog,
  deleteBlog
};
