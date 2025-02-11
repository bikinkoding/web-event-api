const db = require('../config/database');

const eventController = {
  async getAllEvents(req, res) {
    try {
      const { search, category, startDate, endDate, limit } = req.query;

      let query = db('events as e')
        .leftJoin('event_category_relations as ecr', 'e.id', 'ecr.event_id')
        .leftJoin('event_categories as ec', 'ecr.category_id', 'ec.id')
        .select(
          'e.id',
          'e.title',
          'e.description',
          'e.date',
          'e.time',
          'e.location',
          'e.capacity',
          'e.price',
          'e.image_url',
          'e.status',
          db.raw('GROUP_CONCAT(DISTINCT ec.name) as categories')
        )
        .where('e.status', 'published')
        .groupBy('e.id');

      // Apply filters
      if (search) {
        query = query.where(function() {
          this.where('e.title', 'like', `%${search}%`)
              .orWhere('e.description', 'like', `%${search}%`)
              .orWhere('e.location', 'like', `%${search}%`);
        });
      }

      if (category) {
        query = query.having('categories', 'like', `%${category}%`);
      }

      if (startDate) {
        query = query.where('e.date', '>=', startDate);
      }

      if (endDate) {
        query = query.where('e.date', '<=', endDate);
      }

      // Apply ordering and limit
      query = query.orderBy('e.date', 'asc');
      
      if (limit) {
        query = query.limit(parseInt(limit));
      }

      const events = await query;

      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async getEventById(req, res) {
    try {
      const eventId = req.params.id;

      const event = await db('events as e')
        .leftJoin('event_category_relations as ecr', 'e.id', 'ecr.event_id')
        .leftJoin('event_categories as ec', 'ecr.category_id', 'ec.id')
        .leftJoin('users as u', 'e.created_by', 'u.id')
        .select(
          'e.*',
          db.raw('GROUP_CONCAT(DISTINCT ec.name) as categories'),
          'u.name as organizer_name'
        )
        .where('e.id', eventId)
        .andWhere('e.status', 'published')
        .groupBy('e.id')
        .first();

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Get registration count
      const registrationCount = await db('event_registrations')
        .where('event_id', eventId)
        .count('id as count')
        .first();

      event.registered_users = registrationCount.count;

      res.json(event);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async createEvent(req, res) {
    try {
      const {
        title,
        description,
        date,
        time,
        location,
        capacity,
        price,
        image_url,
        categories
      } = req.body;

      // Begin transaction
      await db.transaction(async (trx) => {
        // Create event
        const [eventId] = await trx('events').insert({
          title,
          description,
          date,
          time,
          location,
          capacity,
          price: price || 0,
          image_url,
          status: 'draft',
          created_by: req.user.id
        });

        // Add categories if provided
        if (categories && categories.length > 0) {
          const categoryRelations = categories.map(categoryId => ({
            event_id: eventId,
            category_id: categoryId
          }));

          await trx('event_category_relations').insert(categoryRelations);
        }

        res.status(201).json({
          message: 'Event created successfully',
          eventId
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async updateEvent(req, res) {
    try {
      const eventId = req.params.id;
      const {
        title,
        description,
        date,
        time,
        location,
        capacity,
        price,
        image_url,
        status,
        categories
      } = req.body;

      // Check if event exists
      const event = await db('events')
        .where('id', eventId)
        .first();

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Begin transaction
      await db.transaction(async (trx) => {
        // Update event
        await trx('events')
          .where('id', eventId)
          .update({
            title: title || undefined,
            description: description || undefined,
            date: date || undefined,
            time: time || undefined,
            location: location || undefined,
            capacity: capacity || undefined,
            price: price || undefined,
            image_url: image_url || undefined,
            status: status || undefined,
            updated_at: trx.fn.now()
          });

        // Update categories if provided
        if (categories) {
          // Remove old categories
          await trx('event_category_relations')
            .where('event_id', eventId)
            .delete();

          // Add new categories
          if (categories.length > 0) {
            const categoryRelations = categories.map(categoryId => ({
              event_id: eventId,
              category_id: categoryId
            }));

            await trx('event_category_relations').insert(categoryRelations);
          }
        }
      });

      res.json({ message: 'Event updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async deleteEvent(req, res) {
    try {
      const eventId = req.params.id;

      // Check if event exists
      const event = await db('events')
        .where('id', eventId)
        .first();

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Begin transaction
      await db.transaction(async (trx) => {
        // Delete event registrations
        await trx('event_registrations')
          .where('event_id', eventId)
          .delete();

        // Delete category relations
        await trx('event_category_relations')
          .where('event_id', eventId)
          .delete();

        // Delete event
        await trx('events')
          .where('id', eventId)
          .delete();
      });

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async registerForEvent(req, res) {
    try {
      const eventId = req.params.id;
      const userId = req.user.id;

      // Check if event exists and is published
      const event = await db('events')
        .where({
          id: eventId,
          status: 'published'
        })
        .first();

      if (!event) {
        return res.status(404).json({ message: 'Event not found or not available' });
      }

      // Check if user is already registered
      const existingRegistration = await db('event_registrations')
        .where({
          event_id: eventId,
          user_id: userId
        })
        .first();

      if (existingRegistration) {
        return res.status(400).json({ message: 'You are already registered for this event' });
      }

      // Check event capacity
      const registrationCount = await db('event_registrations')
        .where('event_id', eventId)
        .count('id as count')
        .first();

      if (event.capacity && registrationCount.count >= event.capacity) {
        return res.status(400).json({ message: 'Event is already full' });
      }

      // Create registration
      const [registrationId] = await db('event_registrations').insert({
        event_id: eventId,
        user_id: userId,
        status: 'pending',
        payment_status: event.price > 0 ? 'pending' : 'completed',
        amount_paid: event.price,
        payment_date: event.price > 0 ? null : db.fn.now()
      });

      res.status(201).json({ 
        message: 'Successfully registered for event',
        id: registrationId
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = eventController;
