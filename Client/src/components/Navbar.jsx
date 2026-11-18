import React, { useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaTicketAlt, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setOpen(false);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-white/10 text-white"
        : "text-gray-300 hover:text-white hover:bg-white/5"
    }`;

  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();
  const dashboardPath = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2 text-white text-xl font-extrabold tracking-tight"
          >
            <span className="w-9 h-9 rounded-lg bg-white text-gray-900 flex items-center justify-center">
              <FaTicketAlt />
            </span>
            EpicMeet
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" end className={linkClass}>
              Events
            </NavLink>

            {user ? (
              <>
                <NavLink to={dashboardPath} className={linkClass}>
                  Dashboard
                </NavLink>

                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-900 flex items-center justify-center font-bold">
                      {initial}
                    </div>
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-white max-w-[140px] truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-white/10 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white transition px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-gray-900 hover:bg-gray-200 text-sm font-bold px-5 py-2 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white text-xl p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Toggle menu"
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/10 flex flex-col gap-1">
            <NavLink to="/" end onClick={closeMenu} className={linkClass}>
              Events
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to={dashboardPath}
                  onClick={closeMenu}
                  className={linkClass}
                >
                  Dashboard
                </NavLink>

                <div className="flex items-center gap-3 px-3 py-3 mt-2 bg-white/5 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-900 flex items-center justify-center font-bold">
                    {initial}
                  </div>
                  <div className="leading-tight min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">
                      {user.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 mt-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="text-center text-sm font-medium text-gray-200 border border-white/20 hover:bg-white/10 px-4 py-2.5 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="text-center bg-white text-gray-900 hover:bg-gray-200 text-sm font-bold px-4 py-2.5 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
