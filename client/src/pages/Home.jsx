import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  User,
  Search,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import EventCard from "../components/EventCard.jsx";

const CATEGORIES = [
  "All",
  "Technical",
  "Cultural",
  "Workshop",
  "Sports",
  "Seminar",
  "Other",
];

export default function Home() {
  const { user } = useAuth();

  // Phase 1 Health check
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  // Phase 3 Events state
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Check health on mount
  useEffect(() => {
    api
      .get("/health")
      .then((res) => setHealth(res.data))
      .catch(() => setHealth({ status: "error", database: "disconnected" }))
      .finally(() => setHealthLoading(false));
  }, []);

  // Fetch events based on filters
  useEffect(() => {
    setEventsLoading(true);
    const params = {};
    if (selectedCategory && selectedCategory !== "All") {
      params.category = selectedCategory;
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    api
      .get("/events", { params })
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Failed to fetch events:", err))
      .finally(() => setEventsLoading(false));
  }, [selectedCategory, searchQuery]);

  const isOrganizer = user && (user.role === "organizer" || user.role === "admin");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-8 sm:p-12 overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-sm">
            <Sparkles size={14} /> Campus Event Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Discover & Join College Events
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
            From technical hackathons and expert workshops to cultural fests and
            tournaments — explore, register, and never miss an event on campus.
          </p>

          <div className="flex flex-wrap gap-3">
            {isOrganizer ? (
              <Link
                to="/create-event"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-800 font-bold text-sm shadow hover:bg-blue-50 transition"
              >
                <PlusCircle size={18} /> Publish New Event
              </Link>
            ) : !user ? (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-800 font-bold text-sm shadow hover:bg-blue-50 transition"
              >
                Get Started
              </Link>
            ) : null}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Events Browsing Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Events</h2>
            <p className="text-sm text-slate-500">
              Browse and reserve your spot in upcoming campus activities
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search title, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {eventsLoading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <CalendarDays size={40} className="text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No events found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {searchQuery || selectedCategory !== "All"
                ? "Try clearing your filters or search keywords to see more events."
                : "No events are currently scheduled. Be the first organizer to post an event!"}
            </p>
            {isOrganizer ? (
              <Link
                to="/create-event"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                <PlusCircle size={16} /> Create Event
              </Link>
            ) : (
              (searchQuery || selectedCategory !== "All") && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="px-4 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset Filters
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* System Status & Session Overview Footer Cards (Preserving Phase 1 & 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
        {/* Phase 2: Active User Session */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-600" />
            <span>
              {user ? (
                <>
                  Logged in as <strong>{user.name}</strong> ({user.role})
                </>
              ) : (
                "Browsing as Guest"
              )}
            </span>
          </div>
          {!user && (
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Sign In
            </Link>
          )}
        </div>

        {/* Phase 1: Database & System Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={16}
              className={
                health?.database === "connected" ? "text-green-600" : "text-amber-500"
              }
            />
            <span>
              MongoDB Atlas:{" "}
              <strong>
                {healthLoading
                  ? "Checking..."
                  : health?.database || "Status Unknown"}
              </strong>
            </span>
          </div>
          <span className="text-slate-400">Database: college_events</span>
        </div>
      </div>
    </div>
  );
}
