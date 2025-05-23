import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
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
import MovieTheaterAssignment from "./components/MovieTheaterAssignment";
import AdminPanel from "./components/AdminPanel";
import LoginSignupModal from "./components/LoginSignupModal";
import {
  MantineProvider,
  createTheme,
  Loader,
  Center,
  Transition,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import "./styles/animations.css";
import "./App.css";
import TheaterDetails from "./components/TheaterDetails";

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
  const [, { open: openLogin, close: closeLogin }] = useDisclosure(false);

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

  if (!isAuthenticated) {
    openLogin();
    return (
      <>
        {children}
        <LoginSignupModal opened={true} onClose={closeLogin} />
      </>
    );
  }

  return <>{children}</>;
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
  const [loginOpened, { open: openLogin, close: closeLogin }] =
    useDisclosure(false);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-color-scheme", "dark");
    document.documentElement.classList.add("dark-mode");
    setVisible(true);
  }, []);

  // Handle opening login modal from URL
  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/signup") {
      // Store the previous path before opening the modal
      if (!loginOpened && !previousPath) {
        setPreviousPath(document.referrer || "/");
      }
      openLogin();
    }
  }, [location.pathname, openLogin, loginOpened, previousPath]);

  // Custom close handler for the modal
  const handleCloseModal = () => {
    closeLogin();
    // Navigate back to the previous path if it exists
    if (previousPath) {
      window.history.back();
      setPreviousPath(null);
    }
  };

  return (
    <div className="app">
      <Navbar />
      <Transition mounted={visible} transition="fade" duration={400}>
        {(styles) => (
          <main className="content" style={styles}>
            <PageTransition>
              <Routes location={location}>
                <Route path="/" element={<LandingPage />} />

                {/* These routes should be accessible without authentication */}
                <Route path="/movies" element={<MovieList />} />
                <Route
                  path="/movies/:id/showtimes"
                  element={<MovieShowtimes />}
                />
                <Route path="/theaters" element={<TheaterList />} />
                <Route path="/theaters/:id" element={<TheaterDetails />} />

                {/* Admin routes */}
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

                {/* Guest checkout */}
                <Route
                  path="/reservations/create/:id"
                  element={<SeatSelection />}
                />

                {/* Protected user routes */}
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
                  element={<ConcessionSelection />}
                />

                {/* Admin Panel Route */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  }
                />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PageTransition>
          </main>
        )}
      </Transition>
      <Footer />
      <LoginSignupModal opened={loginOpened} onClose={handleCloseModal} />
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
