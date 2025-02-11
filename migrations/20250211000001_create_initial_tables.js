exports.up = function(knex) {
  return knex.schema
    // Users table
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.enum('role', ['mahasiswa', 'admin']).defaultTo('mahasiswa');
      table.string('reset_token').nullable();
      table.timestamps(true, true);
    })
    
    // Events table
    .createTable('events', function(table) {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('description').notNullable();
      table.date('date').notNullable();
      table.time('time').notNullable();
      table.string('location').notNullable();
      table.integer('capacity').unsigned();
      table.decimal('price', 10, 2).defaultTo(0);
      table.string('image_url').nullable();
      table.string('status').defaultTo('draft');
      table.integer('created_by').unsigned().references('id').inTable('users');
      table.timestamps(true, true);
    })
    
    // Blogs table
    .createTable('blogs', function(table) {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.string('image_url').nullable();
      table.string('status').defaultTo('draft');
      table.integer('created_by').unsigned().references('id').inTable('users');
      table.timestamps(true, true);
    })
    
    // Event Categories table
    .createTable('event_categories', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.timestamps(true, true);
    })
    
    // Event-Category relationship table
    .createTable('event_category_relations', function(table) {
      table.integer('event_id').unsigned().references('id').inTable('events');
      table.integer('category_id').unsigned().references('id').inTable('event_categories');
      table.primary(['event_id', 'category_id']);
    })
    
    // Blog Categories table
    .createTable('blog_categories', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.timestamps(true, true);
    })
    
    // Blog-Category relationship table
    .createTable('blog_category_relations', function(table) {
      table.integer('blog_id').unsigned().references('id').inTable('blogs');
      table.integer('category_id').unsigned().references('id').inTable('blog_categories');
      table.primary(['blog_id', 'category_id']);
    })
    
    // Event Registrations table
    .createTable('event_registrations', function(table) {
      table.increments('id').primary();
      table.integer('event_id').unsigned().references('id').inTable('events');
      table.integer('user_id').unsigned().references('id').inTable('users');
      table.string('status').defaultTo('pending');
      table.string('payment_status').defaultTo('pending');
      table.decimal('amount_paid', 10, 2);
      table.timestamp('payment_date').nullable();
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('event_registrations')
    .dropTableIfExists('blog_category_relations')
    .dropTableIfExists('blog_categories')
    .dropTableIfExists('event_category_relations')
    .dropTableIfExists('event_categories')
    .dropTableIfExists('blogs')
    .dropTableIfExists('events')
    .dropTableIfExists('users');
};
