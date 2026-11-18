import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  QrCode,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import TicketPassModal from "../components/TicketPassModal.jsx";

export default function MyEvents() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedRegId, setSelectedRegId] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = () => {
    setLoading(true);
    api
      .get("/registrations/my-events")
      .then((res) => setRegistrations(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load your event tickets.")
      )
      .finally(() => setLoading(false));
  };

  const handleCancel = async (regId, eventTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel your registration for "${eventTitle}"? Your spot will be released.`
      )
    ) {
      return;
    }

    setCancellingId(regId);
    try {
      await api.delete(`/registrations/${regId}`);
      setRegistrations((prev) => prev.filter((r) => r._id !== regId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel registration.");
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Ticket size={32} className="text-blue-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign In Required</h2>
        <p className="text-sm text-slate-600 mb-6">
          Please sign in to view your registered event tickets and RSVP status.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 text-blue-600 font-semibold text-sm mb-1">
            <Ticket size={18} />
            <span>Event Passes & Tickets</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            My Registered Events
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View your active bookings, QR admission passes, and RSVP tickets
          </p>
        </div>

        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Explore More Events <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="min-h-[250px] flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : registrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((reg) => {
            const event = reg.event;
            if (!event) return null;

            const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            const isAttended = reg.status === "attended";

            return (
              <div
                key={reg._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
              >
                {/* Ticket Top Banner */}
                <div
                  className={`p-5 text-white flex items-center justify-between ${
                    isAttended
                      ? "bg-gradient-to-r from-emerald-600 to-teal-700"
                      : "bg-gradient-to-r from-blue-600 to-indigo-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-white" />
                    <span className="text-xs uppercase tracking-wider font-bold">
                      {isAttended ? "Verified & Attended" : "Confirmed RSVP"}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    {reg.ticketId}
                  </span>
                </div>

                {/* Ticket Content */}
                <div className="p-6 flex-1 space-y-4">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {event.category}
                    </span>
                    <h3 className="font-bold text-xl text-slate-900 mt-2 mb-1">
                      {event.title}
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-blue-500 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-blue-500 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-blue-500 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedRegId(reg._id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    <QrCode size={15} />
                    <span>View QR Pass</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/events/${event._id}`}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1"
                    >
                      Details
                    </Link>

                    {!isAttended && (
                      <button
                        onClick={() => handleCancel(reg._id, event.title)}
                        disabled={cancellingId === reg._id}
                        className="text-xs font-medium text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {cancellingId === reg._id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <Ticket size={44} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No Event Tickets Yet
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            You haven't registered for any events. Browse the upcoming events catalog and
            claim your spot!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            Explore Events
          </Link>
        </div>
      )}

      {/* QR Ticket Modal */}
      {selectedRegId && (
        <TicketPassModal
          registrationId={selectedRegId}
          onClose={() => setSelectedRegId(null)}
        />
      )}
    </div>
  );
}
