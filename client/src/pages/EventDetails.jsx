import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Trash2,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Ticket,
  UserCheck,
  QrCode,
  Scan,
} from "lucide-react";
import TicketPassModal from "../components/TicketPassModal.jsx";

const categoryColors = {
  Technical: "bg-blue-50 text-blue-700 border-blue-200",
  Cultural: "bg-purple-50 text-purple-700 border-purple-200",
  Workshop: "bg-amber-50 text-amber-700 border-amber-200",
  Sports: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Seminar: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Other: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Phase 4: Registration state
  const [registration, setRegistration] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Phase 5: QR Modal state
  const [showQRModal, setShowQRModal] = useState(false);

  // Attendees list for organizer
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    if (user) {
      checkStatus();
    }
  }, [id, user]);

  const fetchEventDetails = () => {
    api
      .get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data);
        if (
          user &&
          (user._id === res.data.organizer?._id || user.role === "admin")
        ) {
          fetchAttendees();
        }
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load event details.")
      )
      .finally(() => setLoading(false));
  };

  const checkStatus = () => {
    api
      .get(`/registrations/events/${id}/status`)
      .then((res) => setRegistration(res.data.registration))
      .catch(() => {});
  };

  const fetchAttendees = () => {
    setLoadingAttendees(true);
    api
      .get(`/registrations/event/${id}/attendees`)
      .then((res) => setAttendees(res.data))
      .catch(() => {})
      .finally(() => setLoadingAttendees(false));
  };

  const handleRegister = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setRegistering(true);
    try {
      const res = await api.post(`/registrations/events/${id}`);
      setRegistration(res.data);
      setEvent((prev) => ({
        ...prev,
        registeredCount: (prev.registeredCount || 0) + 1,
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed.");
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!registration) return;
    if (!window.confirm("Are you sure you want to cancel your registration?")) return;

    setCancelling(true);
    try {
      await api.delete(`/registrations/${registration._id}`);
      setRegistration(null);
      setEvent((prev) => ({
        ...prev,
        registeredCount: Math.max(0, (prev.registeredCount || 1) - 1),
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel ticket.");
    } finally {
      setCancelling(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${id}`);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Error Loading Event</h2>
        <p className="text-sm text-slate-600 mb-6">{error || "Event not found."}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          <ArrowLeft size={16} /> Return to Events
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isCreatorOrAdmin =
    user && (user._id === event.organizer?._id || user.role === "admin");

  const spotsLeft = event.capacity - (event.registeredCount || 0);
  const fillPercentage = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / event.capacity) * 100)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={16} /> Back to Events
        </Link>

        <div className="flex items-center gap-3">
          {isCreatorOrAdmin && (
            <>
              <Link
                to={`/scanner/${event._id}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <Scan size={15} />
                <span>QR Check-in Scanner</span>
              </Link>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition disabled:opacity-50"
              >
                <Trash2 size={15} />
                <span>{deleting ? "Deleting..." : "Delete Event"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Event Header Banner */}
        <div className="p-8 sm:p-10 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                categoryColors[event.category] || categoryColors.Other
              }`}
            >
              {event.category}
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              {event.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
            {event.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Date</p>
                <p className="font-semibold text-slate-800">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Time</p>
                <p className="font-semibold text-slate-800">{event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Location</p>
                <p className="font-semibold text-slate-800">{event.venue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">About This Event</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {event.description}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Registration RSVP Card (Phase 4 & 5) */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Users size={16} className="text-blue-600" /> Availability
                </span>
                <span className="font-bold text-slate-900">
                  {event.registeredCount || 0} / {event.capacity}
                </span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>

              <p className="text-xs text-slate-500">
                {spotsLeft > 0 ? (
                  <span className="text-emerald-600 font-semibold">
                    {spotsLeft} spots available
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">Event is fully booked</span>
                )}
              </p>

              {/* Action Buttons based on User Auth & Registration State */}
              <div className="pt-2">
                {registration ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800">
                      <div className="flex items-center gap-1.5 font-bold text-xs uppercase mb-1">
                        <CheckCircle2 size={16} /> You're Attending!
                      </div>
                      <p className="font-mono text-xs font-semibold">
                        Ticket: {registration.ticketId}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowQRModal(true)}
                      className="w-full py-2.5 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow flex items-center justify-center gap-1.5"
                    >
                      <QrCode size={16} />
                      <span>View QR Admission Pass</span>
                    </button>

                    <button
                      onClick={handleCancelRegistration}
                      disabled={cancelling}
                      className="w-full py-2 px-3 text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-xl transition disabled:opacity-50"
                    >
                      {cancelling ? "Cancelling..." : "Cancel My Ticket"}
                    </button>
                  </div>
                ) : spotsLeft > 0 ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full py-3 px-4 font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {registering && <Loader2 size={18} className="animate-spin" />}
                    <Ticket size={18} />
                    <span>{registering ? "Booking Spot..." : "Register for Event"}</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 font-bold text-sm text-slate-400 bg-slate-200 rounded-xl cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                )}
              </div>
            </div>

            {/* Organizer Profile Card */}
            {event.organizer && (
              <div className="p-5 rounded-2xl border border-slate-200 bg-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Organized by
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">
                      {event.organizer.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {event.organizer.department || "Event Coordinator"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Organizer Attendees List Section (Phase 4 & 5) */}
      {isCreatorOrAdmin && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UserCheck size={20} className="text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Registered Attendees ({attendees.length})
              </h2>
            </div>
            <Link
              to={`/scanner/${event._id}`}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Scan size={14} /> Open Scanner
            </Link>
          </div>

          {loadingAttendees ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          ) : attendees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">College ID</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4 text-right">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendees.map((att) => (
                    <tr key={att._id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {att.user?.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{att.user?.email}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {att.user?.collegeId || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {att.user?.department || "N/A"}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-blue-600">
                        {att.ticketId}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {att.status === "attended" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} /> Attended
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            Registered
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              No students have registered for this event yet.
            </p>
          )}
        </div>
      )}

      {/* QR Code Pass Modal */}
      {showQRModal && registration && (
        <TicketPassModal
          registrationId={registration._id}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
}
