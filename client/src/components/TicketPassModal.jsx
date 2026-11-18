import { useEffect, useState } from "react";
import api from "../services/api.js";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Loader2,
  AlertCircle,
  QrCode,
  Printer,
} from "lucide-react";

export default function TicketPassModal({ registrationId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!registrationId) return;
    setLoading(true);
    api
      .get(`/registrations/${registrationId}/qr`)
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to generate QR ticket.")
      )
      .finally(() => setLoading(false));
  }, [registrationId]);

  if (!registrationId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition"
        >
          <X size={18} />
        </button>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
            <p className="text-sm text-slate-500">Generating secure QR pass...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
            <h3 className="font-bold text-slate-900 mb-1">Error</h3>
            <p className="text-xs text-slate-500 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            {/* Header Ticket Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm inline-block mb-2">
                Digital Event Pass
              </span>
              <h2 className="font-extrabold text-lg line-clamp-1">
                {data.event?.title}
              </h2>
              <p className="text-xs text-blue-100 mt-1">
                {data.event?.venue}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-6 text-center space-y-4">
              <div className="inline-block p-3 rounded-2xl bg-white border border-slate-200 shadow-inner">
                {data.qrCodeImage ? (
                  <img
                    src={data.qrCodeImage}
                    alt="Ticket QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                    <QrCode size={48} />
                  </div>
                )}
              </div>

              {/* Ticket ID & Status */}
              <div>
                <p className="font-mono text-sm font-bold text-slate-800 tracking-wider">
                  {data.ticketId}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold">
                  {data.status === "attended" ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Verified & Attended
                    </span>
                  ) : (
                    <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Active Ticket
                    </span>
                  )}
                </div>
              </div>

              {/* Attendee Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-left text-slate-600 space-y-1">
                <p>
                  <span className="font-medium text-slate-400">Attendee:</span>{" "}
                  <strong>{data.user?.name}</strong>
                </p>
                {data.user?.collegeId && (
                  <p>
                    <span className="font-medium text-slate-400">ID:</span>{" "}
                    {data.user.collegeId}
                  </p>
                )}
                <p>
                  <span className="font-medium text-slate-400">Time:</span>{" "}
                  {data.event?.time}
                </p>
              </div>

              <p className="text-[11px] text-slate-400">
                Present this QR code at the check-in desk for admission.
              </p>

              <button
                onClick={() => window.print()}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Printer size={14} /> Print Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
