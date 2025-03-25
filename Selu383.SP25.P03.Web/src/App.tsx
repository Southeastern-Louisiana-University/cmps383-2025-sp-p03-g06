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
    return <Navigate to="/login" replace />;
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
      "#fce4e8", // lightest shade
      "#f9c9d1",
      "#f6aeba",
      "#f294a3",
      "#ef798c",
      "#eb5f75",
      "#e7455e",
      "#e42b47",
      "#e11230",
      "#c70036", // darkest shade - your primary brand color
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
