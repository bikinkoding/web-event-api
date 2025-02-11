exports.seed = async function(knex) {
  // Clear existing entries
  await knex('event_categories').del();

  // Insert seed entries
  return knex('event_categories').insert([
    {
      name: 'Workshop',
      created_at: knex.fn.now()
    },
    {
      name: 'Seminar',
      created_at: knex.fn.now()
    },
    {
      name: 'Conference',
      created_at: knex.fn.now()
    },
    {
      name: 'Competition',
      created_at: knex.fn.now()
    },
    {
      name: 'Webinar',
      created_at: knex.fn.now()
    },
    {
      name: 'Training',
      created_at: knex.fn.now()
    }
  ]);
};
