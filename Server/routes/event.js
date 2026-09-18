const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/auth.js');

const { 
    getAllEvents, 
    getEventById, 
    createEvent, 
    updateEvent, 
    deleteEvent 
} = require('../controllers/eventController.js'); 


router.get('/', getAllEvents);

router.get('/:id', getEventById);

router.post('/', protect, admin, createEvent);  // CREATE EVENT

router.put('/:id', protect, admin, updateEvent);  // UPDATE EVENT

router.delete('/:id', protect, admin, deleteEvent);  // DELETE EVENT

module.exports = router;