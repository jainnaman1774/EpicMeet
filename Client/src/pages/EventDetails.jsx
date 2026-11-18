import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/axios";
import { AuthContext } from "../context/AuthContext";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChair,
  FaMoneyBillWave,
  FaMinus,
  FaPlus,
} from "react-icons/fa";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [tickets, setTickets] = useState(1);
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data.event || data); // works if the API wraps it or not
      } catch (err) {
        setLoadError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const sendOtp = async () => {
    await api.post("/bookings/send-otp");
    setShowOTP(true);
    setSuccessMsg("OTP sent to your email. Enter it below to confirm.");
  };

  const handleBooking = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setBookingLoading(true);
    setError("");

    try {
      if (!showOTP) {
        await sendOtp();
      } else {
        await api.post("/bookings", {
          eventId: event._id,
          otp,
          numberOfTickets: tickets,
        });
        setBooked(true);
        setShowOTP(false);
        setOtp("");
        setSuccessMsg("Booking requested! Awaiting admin confirmation.");
        // Seats are only deducted when admin confirms, so don't touch availableSeats here
      }
    } catch (err) {
      setSuccessMsg("");
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleResend = async () => {
    setBookingLoading(true);
    setError("");
    try {
      await sendOtp();
      setSuccessMsg("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-xl font-semibold">Loading...</div>
    );
  if (loadError || !event)
    return (
      <div className="text-center py-20 text-xl text-red-500">
        {loadError || "Event not found"}
      </div>
    );

  const isSoldOut = event.availableSeats <= 0;
  const isPast = new Date(event.date) < new Date();
  const maxTickets = Math.max(1, Math.min(event.availableSeats, 10));
  const total = (event.ticketPrice || 0) * tickets;
  const blocked = isSoldOut || isPast || booked;

  const buttonLabel = bookingLoading
    ? "Processing..."
    : booked
      ? "Request Sent"
      : isPast
        ? "Event Ended"
        : isSoldOut
          ? "Sold Out"
          : showOTP
            ? "Verify OTP & Confirm"
            : !user
              ? "Login to Book"
              : "Confirm Registration";

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
      {event.image ? (
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-80 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gray-900 flex items-center justify-center text-white/50 text-6xl font-black uppercase tracking-widest">
          {event.category}
        </div>
      )}

      <div className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div>
            <div className="inline-block bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
              {event.category}
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              {event.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {event.description}
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 min-w-[300px] w-full md:w-auto shrink-0 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Booking Details
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase">
                    Ticket Price
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {event.ticketPrice === 0 ? (
                      <span className="text-green-500">Free</span>
                    ) : (
                      `₹${event.ticketPrice}`
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaChair />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase">
                    Availability
                  </p>
                  <p className="font-bold text-gray-800">
                    <span
                      className={
                        event.availableSeats < 10 ? "text-orange-500" : ""
                      }
                    >
                      {event.availableSeats}
                    </span>{" "}
                    / {event.totalSeats}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaCalendarAlt />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase">
                    Date
                  </p>
                  <p className="font-bold text-gray-800">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase">
                    Location
                  </p>
                  <p className="font-bold text-gray-800">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Ticket quantity (locked once the OTP step starts) */}
            {!blocked && (
              <div className="mb-6 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-400 uppercase mb-2">
                  Tickets
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTickets((t) => Math.max(1, t - 1))}
                      disabled={showOTP || tickets <= 1}
                      className="w-9 h-9 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-40 flex items-center justify-center"
                      aria-label="Decrease tickets"
                    >
                      <FaMinus />
                    </button>
                    <span className="w-8 text-center font-bold text-lg">
                      {tickets}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setTickets((t) => Math.min(maxTickets, t + 1))
                      }
                      disabled={showOTP || tickets >= maxTickets}
                      className="w-9 h-9 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-40 flex items-center justify-center"
                      aria-label="Increase tickets"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-semibold">
                      Total
                    </p>
                    <p className="font-extrabold text-gray-900 text-lg">
                      {total === 0 ? "Free" : `₹${total}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showOTP && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP to Confirm
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit code"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-700 transition shadow-sm font-bold tracking-widest text-center text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={bookingLoading}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-900 underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={
                blocked || bookingLoading || (showOTP && otp.length !== 6)
              }
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg ${
                blocked
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-black text-white hover:shadow-xl hover:-translate-y-1 disabled:opacity-60 disabled:hover:translate-y-0"
              }`}
            >
              {buttonLabel}
            </button>

            {error && (
              <p className="text-red-500 mt-4 text-center font-medium bg-red-50 p-2 rounded">
                {error}
              </p>
            )}
            {successMsg && (
              <p className="text-green-600 mt-4 text-center font-medium bg-green-50 p-2 rounded">
                {successMsg}
              </p>
            )}

            {booked && (
              <Link
                to="/dashboard"
                className="block text-center mt-4 text-sm font-semibold text-gray-900 hover:underline"
              >
                View my bookings →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
