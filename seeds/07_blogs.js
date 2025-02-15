exports.seed = async function(knex) {
  // Clear existing entries
  await knex('blogs').del();

  // Get admin user
  const admin = await knex('users').where('role', 'admin').first();

  // Insert seed entries
  return knex('blogs').insert([
    {
      title: 'The Future of Web Development in 2025',
      content: `The web development landscape is constantly evolving. In this article, we'll explore the latest trends and technologies that will shape the future of web development.

Key topics covered:
- WebAssembly and its impact
- AI-driven development tools
- The rise of edge computing
- New frontend frameworks
- Performance optimization techniques

Join us as we dive deep into these exciting developments and prepare for the future of web development.`,
      image_url: 'https://img.freepik.com/free-photo/open-book-icon-symbol-yellow-background-education-bookstore-concept-3d-rendering_56104-1334.jpg',
      status: 'published',
      created_by: admin.id,
      created_at: knex.fn.now()
    },
    {
      title: 'Building a Successful Startup: Tips from Industry Leaders',
      content: `Starting a business is challenging, but with the right guidance, you can increase your chances of success. Learn from experienced entrepreneurs about what it takes to build a successful startup.

Topics covered:
- Market research and validation
- Building the right team
- Securing funding
- Product development
- Marketing strategies
- Common pitfalls to avoid

Real-world examples and case studies included.`,
      image_url: 'https://img.freepik.com/free-photo/open-book-icon-symbol-yellow-background-education-bookstore-concept-3d-rendering_56104-1334.jpg',
      status: 'published',
      created_by: admin.id,
      created_at: knex.fn.now()
    },
    {
      title: 'UI/UX Design Principles for Better User Experience',
      content: `Good design is crucial for any digital product. In this comprehensive guide, we'll cover essential UI/UX design principles that will help you create better user experiences.

Learn about:
- User research methods
- Information architecture
- Visual hierarchy
- Color theory
- Typography
- Responsive design
- Usability testing

Practical examples and design resources included.`,
      image_url: 'https://img.freepik.com/free-photo/open-book-icon-symbol-yellow-background-education-bookstore-concept-3d-rendering_56104-1334.jpg',
      status: 'published',
      created_by: admin.id,
      created_at: knex.fn.now()
    },
    {
      title: 'Digital Marketing Strategies for 2025',
      content: `Stay ahead of the competition with these cutting-edge digital marketing strategies. Learn how to leverage new technologies and platforms to reach your target audience effectively.

Topics include:
- AI-powered marketing automation
- Social media trends
- Content marketing evolution
- SEO best practices
- Email marketing techniques
- Analytics and measurement

Real case studies and success stories included.`,
      image_url: 'https://img.freepik.com/free-photo/open-book-icon-symbol-yellow-background-education-bookstore-concept-3d-rendering_56104-1334.jpg',
      status: 'published',
      created_by: admin.id,
      created_at: knex.fn.now()
    },
    {
      title: "Getting Started with Data Science: A Beginner's Guide",
      content: `Interested in data science but don't know where to start? This comprehensive guide will help you begin your journey into the world of data science.

We'll cover:
- Essential programming skills
- Statistics fundamentals
- Data visualization
- Machine learning basics
- Tools and technologies
- Learning resources
- Career paths

Practical exercises and project ideas included.`,
      image_url: 'https://img.freepik.com/free-photo/open-book-icon-symbol-yellow-background-education-bookstore-concept-3d-rendering_56104-1334.jpg',
      status: 'published',
      created_by: admin.id,
      created_at: knex.fn.now()
    }
  ]);
};
