// const Booking = require("../models/Booking.js");
// const OTP = require("../models/OTP.js");
// const Event = require("../models/Event.js");
// const { sendOtpEmail, sendBookingEmail } = require("../utils/email.js");

// const generateOtp = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// exports.sendBookingOtp = async (req, res) => {
//     const Otp = generateOtp();
//         await Otp.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
//         await Otp.create({ email: req.user.email, otp: Otp, action: 'event_booking' });
//         await sendOtpEmail(req.user.email, Otp, 'event_booking');
//         return res.status(200).json({ message: 'OTP sent to your email for booking confirmation.' });
    
// }

// exports.bookEvent = async (req, res) => {
//   const { eventId, otp } = req.body;

//   const otpRecord = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
//   if(!otpRecord) {  
//     return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
//   }
//   const event = await Event.findById(eventId);
//   if(!event) {
//     return res.status(404).json({ message: 'Event not found.' });
//   }

//   if(event.availableSeats <= 0) {
//     return res.status(400).json({ message: 'No available seats for this event.' });
//   }

//   const booking = await Booking.create({
//     user: req.user._id,
//     eventId,
//     status: 'pending',
//     paymentStatus: 'unpaid',
//     amount: event.price,
//   });

//   await OTP.deleteMany({ email: req.user.email, action: 'event_booking' });
//   //await sendBookingEmail(req.user.email, booking._id, event.name, event.date, event.price);
//   res.status(201).json({ message: 'Booking successful. Please check your email for confirmation.' });
// }

// exports.confirmBooking = async (req, res) => {
//   const paymentStatus = req.body.paymentStatus; // 'paid' or 'non paid   '
//   if(!['paid', 'non_paid'].includes(paymentStatus)) {
//     return res.status(400).json({ message: 'Invalid payment status.' });
//   }
//   const booking = await Booking.findById(req.params.id).populate('eventId');
//   if(!booking) {
//     return res.status(404).json({ message: 'Booking not found.' });
//   }

//   if(booking.status === 'confirmed') {
//     return res.status(400).json({ message: 'Booking is already confirmed.' });
//   }
//   Booking.status = 'confirmed';
//   Booking.paymentStatus = paymentStatus;
//   await booking.save();

//   const event = await Event.findById(booking.eventId);
//   if(event.availableSeats <= 0) {
//     return res.status(400).json({ message: 'No available seats for this event.' });
//   }
//   booking.status = 'confirmed';
//   if(paymentStatus === 'paid') {
//     booking.paymentStatus = paymentStatus;
//   }
//   await booking.save();
//   event.availableSeats -= 1;
//   await event.save();

//   //If Admin confirms the booking, send an email to the user confirming the booking
//   await sendBookingEmail(req.user.email, booking._id, event.name, event.date, event.price);
//   res.status(200).json({ message: 'Booking confirmed successfully.' });
// }

// exports.getMyBookings = async (req, res) => {
//   const bookings = await Booking.find({ user: req.user._id }).populate('eventId');
//   res.status(200).json({ bookings });
// }

// exports.cancleBooking = async (req, res) => {
//   const booking = await Booking.findById(req.params.id).populate('eventId');
//   if(!booking) {
//     return res.status(404).json({ message: 'Booking not found.' });
//   }

//   if(booking.user.toString() !== req.user._id.toString()) {
//     return res.status(403).json({ message: 'You are not authorized to cancel this booking.' });
//   }

//   booking.status = 'cancelled';
//   await booking.save();

//   if(booking.status === 'confirmed') {
//     const event = await Event.findById(booking.eventId.id);
//     event.availableSeats += 1;
//     await event.save();
//   }
//   await booking.remove();
//   res.status(200).json({ message: 'Booking cancelled successfully.' });
// }


const Booking = require("../models/Booking.js");
const OTP = require("../models/OTP.js");
const Event = require("../models/Event.js");
const {
  sendOtpEmail,
  sendBookingEmail,
} = require("../utils/email.js");

// Generate 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ======================================================
// SEND BOOKING OTP
// ======================================================

exports.sendBookingOtp = async (req, res) => {
  try {
    const otp = generateOtp();

    // Delete any existing booking OTP
    await OTP.findOneAndDelete({
      email: req.user.email,
      action: "event_booking",
    });

    // Create new OTP
    await OTP.create({
      email: req.user.email,
      otp,
      action: "event_booking",
    });

    // Send OTP email
    await sendOtpEmail(
      req.user.email,
      otp,
      "event_booking"
    );

    return res.status(200).json({
      message: "OTP sent to your email for booking confirmation.",
    });
  } catch (error) {
    console.error("Send booking OTP error:", error);

    return res.status(500).json({
      message: "Failed to send booking OTP.",
      error: error.message,
    });
  }
};

// ======================================================
// CREATE BOOKING
// ======================================================

exports.bookEvent = async (req, res) => {
  try {
    const { eventId, otp } = req.body;

    // Validate input
    if (!eventId || !otp) {
      return res.status(400).json({
        message: "Event ID and OTP are required.",
      });
    }

    // Find OTP
    const otpRecord = await OTP.findOne({
      email: req.user.email,
      otp,
      action: "event_booking",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP. Please try again.",
      });
    }

    // Find event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    // Check available seats
    if (event.availableSeats <= 0) {
      return res.status(400).json({
        message: "No available seats for this event.",
      });
    }

    // Optional: prevent duplicate booking
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      eventId,
      status: {
        $in: ["pending", "confirmed"],
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "You have already booked this event.",
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      eventId,
      status: "pending",
      paymentStatus: "unpaid",
      amount: event.price,
    });

    // Delete OTP after successful booking
    await OTP.deleteMany({
      email: req.user.email,
      action: "event_booking",
    });

    // Send booking email if needed
    // await sendBookingEmail(
    //   req.user.email,
    //   booking._id,
    //   event.name,
    //   event.date,
    //   event.price
    // );

    return res.status(201).json({
      message:
        "Booking successful. Please wait for admin confirmation.",
      booking,
    });
  } catch (error) {
    console.error("Book event error:", error);

    return res.status(500).json({
      message: "Failed to create booking.",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY BOOKINGS
// ======================================================

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    }).populate("eventId");

    return res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    return res.status(500).json({
      message: "Failed to fetch bookings.",
      error: error.message,
    });
  }
};

// ======================================================
// ADMIN CONFIRM BOOKING
// ======================================================

exports.confirmBooking = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    // Validate payment status
    if (!["paid", "non_paid"].includes(paymentStatus)) {
      return res.status(400).json({
        message:
          "Invalid payment status. Use 'paid' or 'non_paid'.",
      });
    }

    // Find booking
    const booking = await Booking.findById(req.params.id).populate(
      "eventId"
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    // Check if already confirmed
    if (booking.status === "confirmed") {
      return res.status(400).json({
        message: "Booking is already confirmed.",
      });
    }

    // Get event
    const event = await Event.findById(booking.eventId._id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    // Check available seats
    if (event.availableSeats <= 0) {
      return res.status(400).json({
        message: "No available seats for this event.",
      });
    }

    // Confirm booking
    booking.status = "confirmed";
    booking.paymentStatus = paymentStatus;

    await booking.save();

    // Reduce available seats
    event.availableSeats -= 1;

    await event.save();

    // Send confirmation email
    await sendBookingEmail(
      booking.user ? req.user.email : req.user.email,
      booking._id,
      event.name,
      event.date,
      event.price
    );

    return res.status(200).json({
      message: "Booking confirmed successfully.",
      booking,
    });
  } catch (error) {
    console.error("Confirm booking error:", error);

    return res.status(500).json({
      message: "Failed to confirm booking.",
      error: error.message,
    });
  }
};

// ======================================================
// CANCEL BOOKING
// ======================================================

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    // Make sure booking belongs to logged-in user
    if (
      booking.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to cancel this booking.",
      });
    }

    // Don't allow cancelling an already cancelled booking
    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled.",
      });
    }

    // Remember whether booking was confirmed
    const wasConfirmed = booking.status === "confirmed";

    // Get event before changing/removing booking
    const event = await Event.findById(booking.eventId);

    // Cancel booking
    booking.status = "cancelled";

    await booking.save();

    // If confirmed booking was cancelled,
    // return the seat to the event
    if (wasConfirmed && event) {
      event.availableSeats += 1;
      await event.save();
    }

    return res.status(200).json({
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      message: "Failed to cancel booking.",
      error: error.message,
    });
  }
};
