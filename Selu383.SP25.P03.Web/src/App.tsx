import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import TheaterList from "./components/TheaterList";
import TheaterForm from "./components/TheaterForm";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import ConcessionSelection from "./components/ConcessionSelection";
import MovieList from "./components/MovieList";
import MovieShowtimes from "./components/MovieShowtimes";
import SeatSelection from "./components/SeatSelection";
import MyReservations from "./components/MyReservations";
import TicketView from "./components/TicketView";
import Footer from "./components/Footer";
import {
  MantineProvider,
  createTheme,
  Loader,
  Center,
  Transition,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import "./styles/animations.css";
import "./App.css";
import MovieTheaterAssignment from "./components/MovieTheaterAssignment";

// Component to animate page transitions
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [stage, setStage] = useState("fadeIn");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setStage("fadeOut");
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setStage("fadeIn");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  return <div className={`page-transition ${stage}`}>{children}</div>;
};

// Route wrapper handling auth & loading
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowLoader(true), 300);
      return () => clearTimeout(timer);
    }
    setShowLoader(false);
  }, [loading]);

  if (showLoader) {
    return (
      <Center style={{ height: "calc(100vh - 60px)" }}>
        <Loader size="lg" variant="dots" />
      </Center>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin-only route
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowLoader(true), 300);
      return () => clearTimeout(timer);
    }
    setShowLoader(false);
  }, [loading]);

  if (showLoader) {
    return (
      <Center style={{ height: "calc(100vh - 60px)" }}>
        <Loader size="lg" variant="dots" />
      </Center>
    );
  }
  return isAdmin ? <>{children}</> : <Navigate to="/theaters" replace />;
};

// Unified red palette theme
const theme = createTheme({
  colors: {
    primary: [
      "#ffe5e8",
      "#ffc2c8",
      "#ff9eaa",
      "#ff7574",
      "#ff4d58",
      "#ff1a3c",
      "#c70036",
      "#a8002c",
      "#860022",
      "#600018",
    ],
    dark: [
      "#c1c2c5",
      "#a6a7ab",
      "#909296",
      "#5c5f66",
      "#373a40",
      "#2c2e33",
      "#25262b",
      "#1a1b1e",
      "#141517",
      "#101113",
    ],
  },
  primaryColor: "primary",
  primaryShade: 6,
  defaultRadius: "md",
  fontFamily: "Poppins, sans-serif",
  headings: { fontFamily: "Poppins, sans-serif" },
});

// Main app layout with forced dark mode
const AppContent = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-color-scheme", "dark");
    document.documentElement.classList.add("dark-mode");
    setVisible(true);
  }, []);

  return (
    <div className="app">
      <Navbar />
      <Transition mounted={visible} transition="fade" duration={400}>
        {(styles) => (
          <main className="content" style={styles}>
            <PageTransition>
              <Routes location={location}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/" element={<LandingPage />} />

                {/* These routes should be accessible without authentication */}
                <Route path="/movies" element={<MovieList />} />
                <Route
                  path="/movies/:id/showtimes"
                  element={<MovieShowtimes />}
                />
                <Route path="/theaters" element={<TheaterList />} />

                {/* These admin routes should still be protected */}
                <Route
                  path="/theaters/new"
                  element={
                    <AdminRoute>
                      <TheaterForm mode="create" />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/theaters/edit/:id"
                  element={
                    <AdminRoute>
                      <TheaterForm mode="edit" />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/movies/:id/theaters"
                  element={
                    <AdminRoute>
                      <MovieTheaterAssignment />
                    </AdminRoute>
                  }
                />

                {/* This is where you'd handle the protected vs. guest checkout */}
                <Route
                  path="/reservations/create/:id"
                  element={<SeatSelection />} // No longer wrapped in ProtectedRoute
                />

                {/* These should still be protected */}
                <Route
                  path="/my-reservations"
                  element={
                    <ProtectedRoute>
                      <MyReservations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ticket/:id"
                  element={
                    <ProtectedRoute>
                      <TicketView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/concessions/:id"
                  element={
                    <ProtectedRoute>
                      <ConcessionSelection />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PageTransition>
          </main>
        )}
      </Transition>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <ModalsProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ModalsProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}
