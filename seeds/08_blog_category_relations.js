exports.seed = async function(knex) {
  // Clear existing entries
  await knex('blog_category_relations').del();

  // Get blogs and categories
  const blogs = await knex('blogs').select('id', 'title');
  const categories = await knex('blog_categories').select('id', 'name');

  // Create relations
  const relations = [
    // The Future of Web Development
    {
      blog_id: blogs[0].id,
      category_id: categories.find(c => c.name === 'Technology').id
    },
    {
      blog_id: blogs[0].id,
      category_id: categories.find(c => c.name === 'Education').id
    },

    // Building a Successful Startup
    {
      blog_id: blogs[1].id,
      category_id: categories.find(c => c.name === 'Business').id
    },
    {
      blog_id: blogs[1].id,
      category_id: categories.find(c => c.name === 'Entrepreneurship').id
    },

    // UI/UX Design Principles
    {
      blog_id: blogs[2].id,
      category_id: categories.find(c => c.name === 'Design').id
    },
    {
      blog_id: blogs[2].id,
      category_id: categories.find(c => c.name === 'Technology').id
    },

    // Digital Marketing Strategies
    {
      blog_id: blogs[3].id,
      category_id: categories.find(c => c.name === 'Business').id
    },
    {
      blog_id: blogs[3].id,
      category_id: categories.find(c => c.name === 'Technology').id
    },

    // Getting Started with Data Science
    {
      blog_id: blogs[4].id,
      category_id: categories.find(c => c.name === 'Technology').id
    },
    {
      blog_id: blogs[4].id,
      category_id: categories.find(c => c.name === 'Education').id
    },
    {
      blog_id: blogs[4].id,
      category_id: categories.find(c => c.name === 'Career').id
    }
  ];

  // Insert seed entries
  return knex('blog_category_relations').insert(relations);
};
