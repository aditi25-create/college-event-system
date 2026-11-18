import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { CalendarDays, LogOut, User as UserIcon, PlusCircle, Ticket } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const canCreateEvent = user && (user.role === "organizer" || user.role === "admin");

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-xl">
                <CalendarDays size={20} />
              </div>
              <span className="font-bold text-lg text-slate-900">
                CampusEvents
              </span>
            </Link>

            <Link
              to="/"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
            >
              All Events
            </Link>

            {user && (
              <Link
                to="/my-events"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
              >
                <Ticket size={16} />
                <span>My Tickets</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {canCreateEvent && (
              <Link
                to="/create-event"
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl shadow-sm transition"
              >
                <PlusCircle size={16} />
                <span>Create Event</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 py-1.5 px-3 rounded-full">
                  <UserIcon size={15} className="text-slate-500" />
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold tracking-wide">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
