import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import AppShell from "./components/ui/AppShell";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import LessonSession from "./pages/LessonSession";
import ReviewSession from "./pages/ReviewSession";
import DeckManager from "./pages/DeckManager";
import KanjiDictionary from "./pages/KanjiDictionary";
import AdminKanjiManager from "./pages/AdminKanjiManager";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />

          {/* Shared Persistent Workbench Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/kanji" element={<KanjiDictionary />} />
            <Route path="/decks/:deckId/manage" element={<DeckManager />} />
            <Route path="/admin/kanji" element={<AdminKanjiManager />} />
          </Route>

          {/* Focused Zen Study Studio Routes */}
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
