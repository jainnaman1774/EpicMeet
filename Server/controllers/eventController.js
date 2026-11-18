
const Event = require('../models/Event.js');

// ==========================================
// GET ALL EVENTS (WITH SEARCH & PAGINATION)
// ==========================================
exports.getAllEvents = async (req, res) => {
    try {
        const filters = {};

        // Category filter
        if (req.query.category) {
            filters.category = {
                $regex: req.query.category,
                $options: 'i'
            };
        }

        // Location filter
        if (req.query.location) {
            filters.location = {
                $regex: req.query.location,
                $options: 'i'
            };
        }

        // Pagination
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const events = await Event.find(filters)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Event.countDocuments(filters);

        res.status(200).json({
            success: true,
            events,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalEvents: total
        });

    } catch (error) {
        console.error('Get Events Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


// ==========================================
// GET SINGLE EVENT BY ID
// ==========================================
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            event
        });

    } catch (error) {
        console.error('Get Event Error:', error);

        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


// ==========================================
// CREATE NEW EVENT
// ==========================================
exports.createEvent = async (req, res) => {
    try {
        // Uploaded image OR image URL
        const image = req.file
            ? req.file.path
            : req.body.image;

        const newEvent = new Event({
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            location: req.body.location,
            category: req.body.category,
            totalSeats: Number(req.body.totalSeats),
            availableSeats: Number(req.body.totalSeats),
            ticketPrice: Number(req.body.ticketPrice),
            image: image,
            createdBy: req.user._id
        });

        const savedEvent = await newEvent.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event: savedEvent
        });

    } catch (error) {
        console.error('Create Event Error:', error);

        res.status(500).json({
            success: false,
            message: 'Error creating event',
            error: error.message
        });
    }
};


// ==========================================
// UPDATE EVENT
// ==========================================
exports.updateEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Authorization check
        if (
            event.createdBy.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'User not authorized to update this event'
            });
        }

        // Update fields
        const updateData = {
            title: req.body.title ?? event.title,
            description: req.body.description ?? event.description,
            date: req.body.date ?? event.date,
            location: req.body.location ?? event.location,
            category: req.body.category ?? event.category,
            totalSeats: req.body.totalSeats !== undefined
                ? Number(req.body.totalSeats)
                : event.totalSeats,
            availableSeats: req.body.availableSeats !== undefined
                ? Number(req.body.availableSeats)
                : event.availableSeats,
            ticketPrice: req.body.ticketPrice !== undefined
                ? Number(req.body.ticketPrice)
                : event.ticketPrice
        };

        // Replace image only when a new image is provided
        if (req.file) {
            updateData.image = req.file.path;
        } else if (req.body.image !== undefined) {
            updateData.image = req.body.image;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            event: updatedEvent
        });

    } catch (error) {
        console.error('Update Event Error:', error);

        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message
        });
    }
};


// ==========================================
// DELETE EVENT
// ==========================================
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Authorization check
        if (
            event.createdBy.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'User not authorized to delete this event'
            });
        }

        await event.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        console.error('Delete Event Error:', error);

        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
};
