exports.seed = async function(knex) {
  // Clear existing entries
  await knex('blog_categories').del();

  // Insert seed entries
  return knex('blog_categories').insert([
    {
      name: 'Technology',
      created_at: knex.fn.now()
    },
    {
      name: 'Business',
      created_at: knex.fn.now()
    },
    {
      name: 'Design',
      created_at: knex.fn.now()
    },
    {
      name: 'Education',
      created_at: knex.fn.now()
    },
    {
      name: 'Career',
      created_at: knex.fn.now()
    },
    {
      name: 'Entrepreneurship',
      created_at: knex.fn.now()
    }
  ]);
};
