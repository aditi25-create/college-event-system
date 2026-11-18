import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import MyEvents from "./pages/MyEvents.jsx";
import QRScanner from "./pages/QRScanner.jsx";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/my-events" element={<MyEvents />} />
            <Route path="/scanner" element={<QRScanner />} />
            <Route path="/scanner/:eventId" element={<QRScanner />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
