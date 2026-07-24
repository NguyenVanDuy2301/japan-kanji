import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import LessonSession from "./pages/LessonSession";
import ReviewSession from "./pages/ReviewSession";
import DeckManager from "./pages/DeckManager";
import KanjiDictionary from "./pages/KanjiDictionary";
import AdminKanjiManager from "./pages/AdminKanjiManager";

// A simple protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/kanji" 
          element={
            <ProtectedRoute>
              <KanjiDictionary />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/study/lesson/:deckId" 
          element={
            <ProtectedRoute>
              <LessonSession />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/study/review" 
          element={
            <ProtectedRoute>
              <ReviewSession />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/decks/:deckId/manage" 
          element={
            <ProtectedRoute>
              <DeckManager />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/kanji" 
          element={
            <ProtectedRoute>
              <AdminKanjiManager />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
