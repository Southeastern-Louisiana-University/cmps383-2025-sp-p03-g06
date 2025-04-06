import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ColorSchemeProvider } from "./contexts/ColorSchemeContext";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import TheaterList from "./components/TheaterList";
import TheaterForm from "./components/TheaterForm";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import MovieList from "./components/MovieList";
import MovieShowtimes from "./components/MovieShowtimes";
import SeatSelection from "./components/SeatSelection";
import MyReservations from "./components/MyReservations";
import ConcessionSelection from "./components/ConcessionSelection";
import TicketView from "./components/TicketView";
import {
  MantineProvider,
  createTheme,
  Loader,
  Center,
  Transition,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import "./App.css";

// Page transition component
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("fadeOut");
      setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fadeIn");
      }, 300);
    }
  }, [location, displayLocation]);

  return <div className={`page-transition ${transitionStage}`}>{children}</div>;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showLoader, setShowLoader] = useState(loading);
  const location = useLocation();

  // Add a delay before showing the loader to prevent flicker
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowLoader(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(false);
    }
  }, [loading]);

  if (showLoader) {
    return (
      <Center style={{ height: "calc(100vh - 60px)" }}>
        <Loader size="lg" variant="dots" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />
    );
  }

  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  const [showLoader, setShowLoader] = useState(loading);

  // Add a delay before showing the loader to prevent flicker
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowLoader(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(false);
    }
  }, [loading]);

  if (showLoader) {
    return (
      <Center style={{ height: "calc(100vh - 60px)" }}>
        <Loader size="lg" variant="dots" />
      </Center>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/theaters" replace />;
  }

  return <>{children}</>;
};

// Enhanced theme
const theme = createTheme({
  colors: {
    primary: [
      "#e8f5ed", // primary-light
      "#c5e4d3",
      "#a2d4b9",
      "#7fc49f",
      "#5cb485",
      "#39a46b",
      "#0d6832", // primary-color
      "#064023", // primary-dark
      "#043519",
      "#02280f",
    ],
    secondary: [
      "#fdf7e4", // secondary-light
      "#f9eec9",
      "#f5e4ae",
      "#f1db93",
      "#ecd178",
      "#e8c85d",
      "#d4af37", // secondary-color
      "#b3901f", // secondary-dark
      "#856b17",
      "#57460f",
    ],
  },
  primaryColor: "primary",
  primaryShade: 6,
  fontFamily: "Poppins, sans-serif",
  headings: {
    fontFamily: "Poppins, sans-serif",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: "md",
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
      },
    },
    NumberInput: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});

// Main component with animation
const AppContent = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
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

                {/* Landing page accessible by everyone */}
                <Route path="/" element={<LandingPage />} />

                {/* Theater routes */}
                <Route
                  path="/theaters"
                  element={
                    <ProtectedRoute>
                      <TheaterList />
                    </ProtectedRoute>
                  }
                />

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

                {/* Movie and showtime routes */}
                <Route path="/movies" element={<MovieList />} />
                <Route
                  path="/movies/:id/showtimes"
                  element={<MovieShowtimes />}
                />

                {/* Reservation and ticket routes */}
                <Route
                  path="/reservations/create/:id"
                  element={
                    <ProtectedRoute>
                      <SeatSelection />
                    </ProtectedRoute>
                  }
                />
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

                <Route path="*" element={<Navigate to="/" replace />} />

                <Route
                  path="/concessions/:id"
                  element={
                    <ProtectedRoute>
                      <ConcessionSelection />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </PageTransition>
          </main>
        )}
      </Transition>
    </div>
  );
};

// Root App component with providers
function App() {
  return (
    <BrowserRouter>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <ModalsProvider>
          <ColorSchemeProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ColorSchemeProvider>
        </ModalsProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;
