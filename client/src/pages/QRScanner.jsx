import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ArrowLeft,
  ShieldAlert,
  Search,
  UserCheck,
} from "lucide-react";

export default function QRScanner() {
  const { eventId } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [manualTicket, setManualTicket] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");

  const scannerRef = useRef(null);

  const isAuthorized = user && (user.role === "organizer" || user.role === "admin");

  useEffect(() => {
    if (eventId) {
      api
        .get(`/events/${eventId}`)
        .then((res) => setEvent(res.data))
        .catch(() => {});
    }
  }, [eventId]);

  useEffect(() => {
    if (!isAuthorized) return;

    // Initialize HTML5 QR Code Scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        handleProcessCheckIn({ qrToken: decodedText });
      },
      (scanError) => {
        // Ignored routine frame errors while searching for QR
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isAuthorized, eventId]);

  const handleProcessCheckIn = async (payload) => {
    setSubmitting(true);
    setError("");
    setScanResult(null);

    try {
      const body = {
        ...payload,
        ...(eventId && { eventId }),
      };
      const res = await api.post("/registrations/check-in", body);
      setScanResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to check in ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualTicket.trim()) return;
    handleProcessCheckIn({ ticketId: manualTicket.trim() });
    setManualTicket("");
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <ShieldAlert size={36} className="text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Organizer Scanner Restricted
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Only verified <strong>Event Organizers</strong> and <strong>Admins</strong> can
          access the check-in scanner.
        </p>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={eventId ? `/events/${eventId}` : "/"}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={16} /> {eventId ? "Back to Event" : "Back to Events"}
        </Link>
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
          Phase 5 Live Scanner
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <QrCode size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Live Event Check-in
            </h1>
            <p className="text-sm text-slate-500">
              {event
                ? `Scanning tickets for: ${event.title}`
                : "Scan student QR passes or enter Ticket IDs for admission"}
            </p>
          </div>
        </div>

        {/* Scan Status Alert Banners */}
        {scanResult?.success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-base mb-2">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <span>{scanResult.message}</span>
            </div>
            <div className="text-xs space-y-1 bg-white/70 p-3 rounded-xl border border-emerald-100">
              <p>
                <strong>Attendee:</strong> {scanResult.attendee?.name}
              </p>
              <p>
                <strong>Email:</strong> {scanResult.attendee?.email}
              </p>
              {scanResult.attendee?.collegeId && (
                <p>
                  <strong>College ID:</strong> {scanResult.attendee?.collegeId}
                </p>
              )}
              {scanResult.attendee?.department && (
                <p>
                  <strong>Department:</strong> {scanResult.attendee?.department}
                </p>
              )}
              <p className="font-mono text-emerald-700 font-bold pt-1">
                Ticket: {scanResult.ticketId}
              </p>
            </div>
          </div>
        )}

        {scanResult?.alreadyAttended && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-base mb-1">
              <AlertTriangle size={20} className="text-amber-600" />
              <span>Already Checked In</span>
            </div>
            <p className="text-xs mb-2">
              This ticket has already been used for entry.
            </p>
            <div className="text-xs space-y-1 bg-white/70 p-3 rounded-xl border border-amber-100">
              <p>
                <strong>Attendee:</strong> {scanResult.attendee?.name}
              </p>
              <p className="font-mono text-amber-700 font-bold">
                Ticket: {scanResult.ticketId}
              </p>
              {scanResult.checkInTime && (
                <p className="text-[11px] text-slate-500">
                  Recorded at: {new Date(scanResult.checkInTime).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-sm">
            <XCircle size={18} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Camera Scanner View */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-white">
            <div id="qr-reader" className="w-full text-slate-800" />
          </div>

          {/* Manual Entry Fallback */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Or Enter Ticket ID Manually
            </h3>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="e.g. TKT-310766-5EF108"
                  value={manualTicket}
                  onChange={(e) => setManualTicket(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-mono rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !manualTicket.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                <span>Verify</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
