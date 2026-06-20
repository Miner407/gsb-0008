import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import MeetingDetail from "@/pages/MeetingDetail";
import TodoList from "@/pages/TodoList";
import MeetingForm from "@/components/MeetingForm";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/meetings/new" element={<MeetingForm mode="create" />} />
            <Route path="/meetings/:id" element={<MeetingDetail />} />
            <Route path="/meetings/:id/edit" element={<MeetingForm mode="edit" />} />
            <Route path="/todos" element={<TodoList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
