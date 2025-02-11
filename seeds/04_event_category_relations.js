exports.seed = async function(knex) {
  // Clear existing entries
  await knex('event_category_relations').del();

  // Get events and categories
  const events = await knex('events').select('id', 'title');
  const categories = await knex('event_categories').select('id', 'name');

  // Create relations
  const relations = [
    // Web Development Workshop
    {
      event_id: events[0].id,
      category_id: categories.find(c => c.name === 'Workshop').id
    },
    {
      event_id: events[0].id,
      category_id: categories.find(c => c.name === 'Training').id
    },

    // Digital Marketing Summit
    {
      event_id: events[1].id,
      category_id: categories.find(c => c.name === 'Conference').id
    },
    {
      event_id: events[1].id,
      category_id: categories.find(c => c.name === 'Seminar').id
    },

    // UI/UX Design Masterclass
    {
      event_id: events[2].id,
      category_id: categories.find(c => c.name === 'Workshop').id
    },
    {
      event_id: events[2].id,
      category_id: categories.find(c => c.name === 'Training').id
    },

    // Startup Pitch Competition
    {
      event_id: events[3].id,
      category_id: categories.find(c => c.name === 'Competition').id
    },

    // Data Science Bootcamp
    {
      event_id: events[4].id,
      category_id: categories.find(c => c.name === 'Training').id
    },
    {
      event_id: events[4].id,
      category_id: categories.find(c => c.name === 'Workshop').id
    }
  ];

  // Insert seed entries
  return knex('event_category_relations').insert(relations);
};
