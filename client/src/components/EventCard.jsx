import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

const categoryColors = {
  Technical: "bg-blue-50 text-blue-700 border-blue-200",
  Cultural: "bg-purple-50 text-purple-700 border-purple-200",
  Workshop: "bg-amber-50 text-amber-700 border-amber-200",
  Sports: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Seminar: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Other: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function EventCard({ event }) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const spotsLeft = event.capacity - (event.registeredCount || 0);
  const fillPercentage = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / event.capacity) * 100)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              categoryColors[event.category] || categoryColors.Other
            }`}
          >
            {event.category}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {event.status?.toUpperCase() || "UPCOMING"}
          </span>
        </div>

        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition line-clamp-1 mb-2">
          {event.title}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {event.description}
        </p>

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

      <div className="bg-slate-50/70 p-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <Users size={14} /> Capacity
          </span>
          <span
            className={`font-semibold ${
              spotsLeft <= 5 ? "text-amber-600" : "text-slate-700"
            }`}
          >
            {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
          </span>
        </div>

        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-blue-600 h-full rounded-full transition-all"
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        <Link
          to={`/events/${event._id}`}
          className="block w-full text-center py-2 px-3 text-sm font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition shadow-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
