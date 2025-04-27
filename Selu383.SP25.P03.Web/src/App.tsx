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
  const [showLoader, setShowLoader] = useState(false);
  const [, { open: openLogin, close: closeLogin }] = useDisclosure(false);

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
    brand: [
      "#ffeaef", // primary-light
      "#ffbfcd",
      "#ff94ab",
      "#ff698a",
      "#ff3d68",
      "#ff1147",
      "#c70036", // primary-color (client's requested color)
      "#a10029", // primary-dark
      "#7a001f",
      "#540015",
    ],
    secondary: [
      "#e6e6e6", // secondary-light
      "#cccccc",
      "#b3b3b3",
      "#999999",
      "#808080",
      "#666666",
      "#2d2d2d", // secondary-color (dark)
      "#1f1f1f", // secondary-dark
      "#121212",
      "#0a0a0a",
    ],
  },
  primaryColor: "brand",
  primaryShade: 9,
  fontFamily: "Poppins, sans-serif",
  headings: {
    fontFamily: "Poppins, sans-serif",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
        color: "brand",
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
  const [loginOpened, { open: openLogin, close: closeLogin }] =
    useDisclosure(false);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  useEffect(() => {
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
                  path="/theaters"
                  element={
                    <ProtectedRoute>
                      <TheaterList />
                    </ProtectedRoute>
                  }
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

// Root App component with providers
function App() {
  return (
    <BrowserRouter>
      <MantineProvider
        theme={{
          ...theme,
          components: {
            ActionIcon: {
              defaultProps: {
                color: "brand",
              },
            },
          },
        }}
        defaultColorScheme="auto"
      >
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
