
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showEventForm, setShowEventForm] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: '',
        totalSeats: '',
        ticketPrice: '',
        image: ''
    });

    // Normalize API response into an array
    const extractArray = (response, key) => {
        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.[key])) {
            return response[key];
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.data?.[key])) {
            return response.data[key];
        }

        return [];
    };

    // Fetch dashboard data
    const fetchData = async () => {
        try {
            const [eventsRes, bookingsRes] = await Promise.all([
                api.get('/events'),
                api.get('/bookings/my')
            ]);

            console.log('Events API Response:', eventsRes.data);
            console.log('Bookings API Response:', bookingsRes.data);

            const eventsData = extractArray(eventsRes.data, 'events');
            const bookingsData = extractArray(bookingsRes.data, 'bookings');

            setEvents(eventsData);
            setBookings(bookingsData);

        } catch (error) {
            console.error('Error fetching admin data:', error);

            setEvents([]);
            setBookings([]);

            alert(
                error.response?.data?.message ||
                'Unable to load admin dashboard data'
            );
        } finally {
            setLoading(false);
        }
    };

    // Check admin authentication
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        fetchData();
    }, [user, navigate]);

    // Create new event
    const handleCreateEvent = async (e) => {
        e.preventDefault();

        try {
            const eventData = {
                ...formData,
                totalSeats: Number(formData.totalSeats),
                ticketPrice: Number(formData.ticketPrice)
            };

            await api.post('/events', eventData);

            setShowEventForm(false);

            setFormData({
                title: '',
                description: '',
                date: '',
                location: '',
                category: '',
                totalSeats: '',
                ticketPrice: '',
                image: ''
            });

            await fetchData();

            alert('Event created successfully!');

        } catch (error) {
            console.error('Error creating event:', error);

            alert(
                error.response?.data?.message ||
                'Error creating event'
            );
        }
    };

    // Delete event
    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/events/${id}`);

                await fetchData();

                alert('Event deleted successfully!');

            } catch (error) {
                console.error('Error deleting event:', error);
                alert(
                    error.response?.data?.message ||
                    'Error deleting event'
                );
            }
        }
    };

    // Confirm booking
    const handleConfirmBooking = async (id, paymentStatus) => {
        try {
            await api.put(`/bookings/${id}/confirm`, {
                paymentStatus
            });

            await fetchData();

            alert('Booking updated successfully!');

        } catch (error) {
            console.error('Error confirming booking:', error);

            alert(
                error.response?.data?.message ||
                'Error confirming booking'
            );
        }
    };

    // Cancel booking
    const handleCancelBooking = async (id) => {
        if (window.confirm("Cancel this user's booking request?")) {
            try {
                await api.delete(`/bookings/${id}`);

                await fetchData();

                alert('Booking cancelled successfully!');

            } catch (error) {
                console.error('Error cancelling booking:', error);

                alert(
                    error.response?.data?.message ||
                    'Error cancelling booking'
                );
            }
        }
    };

    // Dashboard calculations
    const paidBookings = bookings.filter(
        b =>
            b.paymentStatus === 'paid' &&
            b.status === 'confirmed'
    );

    const totalRevenue = paidBookings.reduce(
        (sum, booking) => sum + (Number(booking.amount) || 0),
        0
    );

    const paidClients = new Set(
        paidBookings
            .map(b => b.userId?._id)
            .filter(Boolean)
    ).size;

    const pendingRequests = bookings.filter(
        b => b.status === 'pending'
    ).length;

    if (loading) {
        return (
            <div className="text-center py-20 text-xl font-semibold">
                Loading admin panel...
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">

            {/* Dashboard Header */}
            <div className="bg-black text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">

                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
                        Admin Dashboard
                    </h1>

                    <p className="text-gray-300">
                        Manage events and manually confirm bookings.
                    </p>
                </div>

                <button
                    onClick={() => setShowEventForm(!showEventForm)}
                    className="w-full md:w-auto bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition shadow-md"
                >
                    {showEventForm
                        ? 'Cancel Creation'
                        : '+ Create New Event'}
                </button>
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">

                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">
                            Total Revenue
                        </p>

                        <h3 className="text-3xl font-black text-green-600">
                            ₹{totalRevenue.toLocaleString('en-IN')}
                        </h3>
                    </div>

                    <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-xl font-bold">
                        ₹
                    </div>
                </div>

                {/* Paid Clients */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">

                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">
                            Paid Clients
                        </p>

                        <h3 className="text-3xl font-black text-blue-600">
                            {paidClients}
                        </h3>
                    </div>

                    <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-xl font-bold">
                        👤
                    </div>
                </div>

                {/* Pending Requests */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">

                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">
                            Pending Requests
                        </p>

                        <h3 className="text-3xl font-black text-yellow-600">
                            {pendingRequests}
                        </h3>
                    </div>

                    <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xl font-bold">
                        ⏳
                    </div>
                </div>

            </div>

            {/* Create Event Form */}
            {showEventForm && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 animation-slideDown">

                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                        Create New Event
                    </h2>

                    <form
                        onSubmit={handleCreateEvent}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >

                        <input
                            required
                            type="text"
                            placeholder="Event Title"
                            className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-700 outline-none transition"
                            value={formData.title}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value
                                })
                            }
                        />

                        <input
                            required
                            type="text"
                            placeholder="Category (e.g., Tech, Music)"
                            className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-700 outline-none transition"
                            value={formData.category}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    category: e.target.value
                                })
                            }
                        />

                        <input
                            required
                            type="date"
                            className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-700 outline-none transition"
                            value={formData.date}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    date: e.target.value
                                })
                            }
                        />

                        <input
                            required
                            type="text"
                            placeholder="Location"
                            className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-700 outline-none transition"
                            value={formData.location}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    location: e.target.value
                                })
                            }
                        />

                        <input
                            required
                            type="number"
                            min="1"
                            placeholder="Total Seats"
                            className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-700 outline-none transition"
                            value={formData.totalSeats}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    totalSeats: e.target.value
                                })
                            }
                        />

                        <input
                            required
                            type="number"
                            min="0"
                            placeholder="Ticket Price (0 for free)"
                            className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-700 outline-none transition"
                            value={formData.ticketPrice}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    ticketPrice: e.target.value
                                })
                            }
                        />

                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Image URL (Provide any direct link to an image)"
                                className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-700 outline-none transition"
                                value={formData.image}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        image: e.target.value
                                    })
                                }
                            />
                        </div>

                        <textarea
                            required
                            placeholder="Event Description"
                            className="border px-4 py-3 rounded-lg md:col-span-2 h-32 focus:ring-2 focus:ring-gray-700 outline-none transition"
                            value={formData.description}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value
                                })
                            }
                        />

                        <button
                            type="submit"
                            className="md:col-span-2 bg-gray-900 text-white font-bold py-3 mt-2 rounded-lg hover:bg-black transition shadow-md"
                        >
                            Publish Event
                        </button>

                    </form>
                </div>
            )}

            {/* Events and Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* All Events */}
                <div className="flex flex-col">

                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-sm">
                            {events.length}
                        </span>
                        All Events
                    </h2>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                        <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">

                            {events.length === 0 ? (
                                <li className="p-6 text-gray-500 text-center">
                                    No events created yet.
                                </li>
                            ) : (
                                events.map(event => (
                                    <li
                                        key={event._id}
                                        className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                                    >

                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1 leading-tight">
                                                {event.title}
                                            </h4>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">

                                                <span className="flex items-center gap-1 font-medium">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                    {new Date(event.date).toLocaleDateString()}
                                                </span>

                                                <span className="flex items-center gap-1 font-medium">
                                                    <div className={`w-2 h-2 rounded-full ${event.availableSeats > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    {event.availableSeats}/{event.totalSeats} seats
                                                </span>

                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteEvent(event._id)}
                                            className="w-full sm:w-auto text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm shrink-0"
                                        >
                                            Delete
                                        </button>

                                    </li>
                                ))
                            )}

                        </ul>
                    </div>
                </div>

                {/* Booking Requests */}
                <div className="flex flex-col">

                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">

                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 text-sm font-bold">
                            {bookings.length}
                        </span>

                        Booking Requests
                    </h2>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                        <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">

                            {bookings.length === 0 ? (
                                <li className="p-6 text-gray-500 text-center">
                                    No bookings yet.
                                </li>
                            ) : (
                                bookings.map(booking => (
                                    <li
                                        key={booking._id}
                                        className={`p-6 hover:bg-gray-50 transition border-l-4 ${
                                            booking.status === 'pending'
                                                ? 'border-l-yellow-400'
                                                : booking.status === 'confirmed'
                                                ? 'border-l-green-400'
                                                : 'border-l-red-400'
                                        }`}
                                    >

                                        <div className="flex justify-between items-start mb-3">

                                            <h4 className="font-bold text-gray-900 text-lg leading-tight">
                                                {booking.eventId?.title || 'Deleted Event'}
                                            </h4>

                                            <div className="flex flex-col gap-1 items-end shrink-0 ml-4">

                                                <span
                                                    className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${
                                                        booking.status === 'confirmed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : booking.status === 'cancelled'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                                >
                                                    {booking.status || 'unknown'}
                                                </span>

                                                {booking.status !== 'cancelled' && (
                                                    <span
                                                        className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${
                                                            booking.paymentStatus === 'paid'
                                                                ? 'bg-indigo-100 text-indigo-700'
                                                                : 'bg-gray-200 text-gray-800'
                                                        }`}
                                                    >
                                                        {(booking.paymentStatus || 'not_paid').replace('_', ' ')}
                                                    </span>
                                                )}

                                            </div>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100 text-sm">

                                            <p className="text-gray-700 flex items-center gap-2 mb-1">

                                                <span className="font-bold w-16 text-gray-500 uppercase text-xs">
                                                    User:
                                                </span>

                                                <span className="font-semibold">
                                                    {booking.userId?.name || 'Unknown User'}
                                                </span>

                                                <span className="text-gray-400">
                                                    ({booking.userId?.email || 'No email'})
                                                </span>

                                            </p>

                                            <p className="text-gray-700 flex items-center gap-2 mb-1">

                                                <span className="font-bold w-16 text-gray-500 uppercase text-xs">
                                                    Amount:
                                                </span>

                                                <span className={`font-semibold ${Number(booking.amount) === 0 ? 'text-green-600' : ''}`}>
                                                    {Number(booking.amount) === 0
                                                        ? 'Free'
                                                        : `₹${Number(booking.amount) || 0}`}
                                                </span>

                                            </p>

                                            <p className="text-gray-700 flex items-center gap-2 mb-1">

                                                <span className="font-bold w-16 text-gray-500 uppercase text-xs">
                                                    Date:
                                                </span>

                                                <span>
                                                    {booking.bookedAt
                                                        ? new Date(booking.bookedAt).toLocaleString()
                                                        : 'Not available'}
                                                </span>

                                            </p>

                                            {booking.eventId && (
                                                <p className="text-gray-700 flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">

                                                    <span className="font-bold w-16 text-gray-500 uppercase text-xs">
                                                        Seats:
                                                    </span>

                                                    <span className={`font-bold ${booking.eventId.availableSeats > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                        {booking.eventId.availableSeats}
                                                    </span>

                                                    remaining of {booking.eventId.totalSeats}

                                                </p>
                                            )}

                                        </div>

                                        {/* Admin Actions */}
                                        {booking.status === 'pending' && (
                                            <div className="flex flex-wrap gap-2 mt-2">

                                                <button
                                                    onClick={() => handleConfirmBooking(booking._id, 'paid')}
                                                    className="flex-1 min-w-[120px] bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition"
                                                >
                                                    ✓ Approve as Paid
                                                </button>

                                                <button
                                                    onClick={() => handleConfirmBooking(booking._id, 'not_paid')}
                                                    className="flex-1 min-w-[120px] bg-gray-50 text-gray-700 hover:bg-gray-800 hover:text-white border border-gray-200 text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition"
                                                >
                                                    ✓ Approve Undecided
                                                </button>

                                                <button
                                                    onClick={() => handleCancelBooking(booking._id)}
                                                    className="w-[80px] bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 text-xs font-bold py-2.5 px-3 rounded-lg transition"
                                                >
                                                    ✕ Reject
                                                </button>

                                            </div>
                                        )}

                                    </li>
                                ))
                            )}

                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
