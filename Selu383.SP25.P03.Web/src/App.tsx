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
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  const [showLoader, setShowLoader] = useState(loading);

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

// Enhanced theme with consistent colors
const theme = createTheme({
  colors: {
    // Red color scheme based on landing page
    primary: [
      "#ffeaef",
      "#ffbfcd",
      "#ff94ab",
      "#ff698a",
      "#ff3d68",
      "#ff1147",
      "#e03131", // primary-color (matches landing page red buttons)
      "#c92a2a", // primary-dark
      "#a10029",
      "#540015",
    ],
    // Gold accent colors for the lion theme
    secondary: [
      "#fff8e0",
      "#ffefc0",
      "#ffe7a0",
      "#ffde80",
      "#ffd55f",
      "#d4af37", // Lion gold color
      "#c49102",
      "#a97c01",
      "#8d6700",
      "#6b4d00",
    ],
    // Dark theme colors
    dark: [
      "#c1c2c5",
      "#a6a7ab",
      "#909296",
      "#5c5f66",
      "#373a40",
      "#2c2e33",
      "#25262b",
      "#1a1b1e", // main background color
      "#141517",
      "#101113",
    ],
  },
  primaryColor: "primary",
  primaryShade: 6,
  defaultRadius: "md",
  fontFamily: "Poppins, sans-serif",
  headings: {
    fontFamily: "Poppins, sans-serif",
  },
});

// Main component with animation
const AppContent = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  // Force dark mode for the entire application
  useEffect(() => {
    document.documentElement.setAttribute("data-mantine-color-scheme", "dark");
    document.documentElement.setAttribute("data-color-scheme", "dark");
    document.documentElement.classList.add("dark-mode");
  }, []);

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
                <Route path="/" element={<LandingPage />} />
                <Route path="/movies" element={<MovieList />} />
                <Route
                  path="/movies/:id/showtimes"
                  element={<MovieShowtimes />}
                />
                <Route path="/theaters" element={<TheaterList />} />
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
    </div>
  );
};

// Root App component with providers
function App() {
  return (
    <BrowserRouter>
      <MantineProvider
        theme={theme}
        defaultColorScheme="dark" // Force dark theme
      >
        <ModalsProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ModalsProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;
