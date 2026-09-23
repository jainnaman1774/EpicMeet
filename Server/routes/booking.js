// const express = require("express");
// const router = express.Router();

// const { protect, admin } = require("../middlewares/auth.js");
// const { bookEvents, verifyOtp, getMyBookings, confirmBooking, cancelBooking } = require("../controllers/bookingController.js");

// router.post("/", protect, bookEvents);
// router.post('/verify-otp', protect, verifyOtp);
// router.get("/my", protect, getMyBookings);

// router.put("/:id/confirm", protect, admin, confirmBooking);
// router.delete("/:id", protect, cancelBooking);

// module.exports = router;


const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middlewares/auth.js");

const {
  sendBookingOtp,
  bookEvent,
  getMyBookings,
  confirmBooking,
  cancelBooking,
} = require("../controllers/bookingController.js");

// Send OTP for booking
router.post("/send-otp", protect, sendBookingOtp);

// Create booking using OTP
router.post("/", protect, bookEvent);

// Get logged-in user's bookings
router.get("/my", protect, getMyBookings);

// Admin confirms booking
router.put("/:id/confirm", protect, admin, confirmBooking);

// User cancels booking
router.delete("/:id", protect, cancelBooking);

module.exports = router;


