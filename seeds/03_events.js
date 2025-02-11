exports.seed = async function(knex) {
  // Clear existing entries
  await knex('events').del();

  // Get admin user id
  const admin = await knex('users').where('role', 'admin').first();

  // Insert seed entries
  return knex('events').insert([
    {
      title: 'Web Development Workshop 2025',
      description: 'Learn modern web development techniques including React, Node.js, and cloud deployment. Perfect for beginners and intermediate developers looking to upgrade their skills.',
      date: '2025-03-15',
      time: '09:00:00',
      location: 'Tech Hub Jakarta',
      capacity: 50,
      price: 750000,
      image_url: 'https://example.com/images/webdev-workshop.jpg',
      status: 'published',
      created_by: admin.id,
      created_at: knex.fn.now()
    },
    {
      title: 'Digital Marketing Summit',
      description: 'Join industry experts as they share insights on the latest digital marketing trends, SEO strategies, and social media marketing techniques.',
      date: '2025-04-20',
      time: '10:00:00',
      location: 'Grand Ballroom, Hotel Indonesia',
      capacity: 200,
      price: 1500000,
      image_url: 'https://example.com/images/marketing-summit.jpg',
      status: 'published',
      created_by: admin.id,
      created_at: knex.fn.now()
    },
    {
      title: 'UI/UX Design Masterclass',
      description: 'Master the art of user interface and user experience design. Learn from experienced designers and work on real-world projects.',
      date: '2025-05-10',
      time: '13:00:00',
      location: 'Design Studio Jakarta',
      capacity: 30,
      price: 1000000,
      image_url: 'https://example.com/images/uiux-masterclass.jpg',
      status: 'published',
      created_by: admin.id,
      created_at: knex.fn.now()
    },
    {
      title: 'Startup Pitch Competition',
      description: 'Present your startup idea to a panel of investors and industry experts. Win funding and mentorship opportunities.',
      date: '2025-06-05',
      time: '14:00:00',
      location: 'Jakarta Convention Center',
      capacity: 100,
      price: 500000,
      image_url: 'https://example.com/images/startup-pitch.jpg',
      status: 'published',
      created_by: admin.id,
      created_at: knex.fn.now()
    },
    {
      title: 'Data Science Bootcamp',
      description: 'Intensive 3-day bootcamp covering Python, machine learning, and data visualization. Includes hands-on projects and mentoring.',
      date: '2025-07-15',
      time: '08:00:00',
      location: 'Data Center Jakarta',
      capacity: 40,
      price: 2000000,
      image_url: 'https://example.com/images/data-science.jpg',
      status: 'published',
      created_by: admin.id,
      created_at: knex.fn.now()
    }
  ]);
};
