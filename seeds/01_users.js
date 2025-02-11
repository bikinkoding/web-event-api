const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Clear related tables in correct order
  await knex('blog_category_relations').del();
  await knex('event_category_relations').del();
  await knex('blogs').del();
  await knex('event_registrations').del();
  await knex('events').del();
  await knex('users').del();

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password', salt);

  // Insert seed entries
  return knex('users').insert([
    {
      name: 'Admin User',
      email: 'admin@webevent.com',
      password: password,
      role: 'admin',
      created_at: knex.fn.now()
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: password,
      role: 'mahasiswa',
      created_at: knex.fn.now()
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: password,
      role: 'mahasiswa',
      created_at: knex.fn.now()
    },
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: password,
      role: 'mahasiswa',
      created_at: knex.fn.now()
    },
    {
      name: 'Bob Wilson',
      email: 'bob@example.com',
      password: password,
      role: 'mahasiswa',
      created_at: knex.fn.now()
    }
  ]);
};
