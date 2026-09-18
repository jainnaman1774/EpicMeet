const Event = require('../models/Event.js');

// Get all events (with basic pagination)
exports.getAllEvents = async (req, res) => {
    try {
        const filters = {};
        
        // Case-insensitive regex search for flexible querying
        if (req.query.category) {
            filters.category = { $regex: new RegExp(req.query.category, 'i') };
        }
        if (req.query.location) {
            filters.location = { $regex: new RegExp(req.query.location, 'i') };
        }

        // Pagination setup (default to page 1, 10 items per page)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const events = await Event.find(filters).skip(skip).limit(limit);
        const total = await Event.countDocuments(filters);

        res.status(200).json({
            events,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalEvents: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        // Handle invalid MongoDB ObjectId format gracefully
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Create a new event
exports.createEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, availableSeats, ticketPrice, imageUrl } = req.body;
    
    try {    
        const newEvent = new Event({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            // Default availableSeats to totalSeats if not explicitly provided
            availableSeats: availableSeats !== undefined ? availableSeats : totalSeats,
            ticketPrice,
            imageUrl,
            createdBy: req.user._id // Assumes auth middleware populates req.user
        });
        
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an event
exports.updateEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, availableSeats, ticketPrice, imageUrl } = req.body;
    
    try {
        let event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Authorization check: Ensure only the creator can update the event
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to update this event' });
        }

        event = await Event.findByIdAndUpdate(
            req.params.id,
            { title, description, date, location, category, totalSeats, availableSeats, ticketPrice, imageUrl },
            { new: true, runValidators: true } // runValidators ensures schema rules are applied on update
        );

        res.status(200).json(event);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Authorization check: Ensure only the creator can delete the event
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to delete this event' });
        }

        await event.deleteOne(); // Use deleteOne() on the document instance
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(500).json({ error: error.message });
    }
};