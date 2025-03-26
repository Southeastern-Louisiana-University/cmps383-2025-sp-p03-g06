// src/components/Login.tsx - Updated with AnimatedLion
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Paper,
  Container,
  Title,
  Divider,
  Alert,
  Stack,
  Group,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconUser,
  IconLock,
  IconArrowRight,
  IconUserPlus,
} from "@tabler/icons-react";
import AnimatedLion from "./AnimatedLion"; // Import our new component

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useMantineTheme();

  useEffect(() => {
    // Check for success message from signup page
    const message = location.state?.message;
    if (message) {
      // Handle success message if needed
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/"); // Redirect to home page after successful login
    } catch (error) {
      // Error is handled in the AuthContext
      console.error("Login failed:", error);
    }
  };

  return (
    <Container size="xs" px="xs">
      <Paper
        shadow="sm"
        p="xl"
        radius="md"
        withBorder
        style={{
          marginTop: "2.5rem",
          borderTop: "3px solid var(--mantine-color-secondary-6)",
          background: isDark
            ? "rgba(37, 38, 43, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: isDark
            ? "0 4px 20px rgba(0, 0, 0, 0.2)"
            : "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Group justify="center" mb={24}>
          {/* Replace IconMovie with AnimatedLion */}
          <AnimatedLion
            size={80}
            primaryColor={isDark ? "#d4af37" : "#0d6832"}
            secondaryColor={isDark ? "#8B4513" : "#6B4226"}
          />
        </Group>

        <Title
          ta="center"
          order={2}
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            lineHeight: 1.2,
            color: isDark ? "#ffffff" : "#0d6832",
            marginBottom: "8px",
          }}
        >
          Welcome Back
        </Title>
        <Text ta="center" size="md" c={isDark ? "gray.4" : "gray.7"} mb={32}>
          Sign in to continue your cinema journey
        </Text>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Login Failed"
            color="red"
            mb="md"
          >
            {error}
          </Alert>
        )}

        {location.state?.message && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Success"
            color="green"
            mb="md"
          >
            {location.state.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              leftSection={<IconUser size={18} />}
              styles={{
                input: {
                  height: "42px",
                  background: isDark
                    ? "rgba(30, 30, 35, 0.6)"
                    : "rgba(255, 255, 255, 0.8)",
                  border: `1px solid ${
                    isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
                  }`,
                  "&:focus": {
                    borderColor: isDark
                      ? theme.colors.secondary[6]
                      : theme.colors.primary[6],
                  },
                },
                label: {
                  marginBottom: "6px",
                  color: isDark ? theme.colors.gray[3] : theme.colors.gray[7],
                },
              }}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftSection={<IconLock size={18} />}
              styles={{
                input: {
                  height: "42px",
                  background: isDark
                    ? "rgba(30, 30, 35, 0.6)"
                    : "rgba(255, 255, 255, 0.8)",
                  border: `1px solid ${
                    isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
                  }`,
                  "&:focus": {
                    borderColor: isDark
                      ? theme.colors.secondary[6]
                      : theme.colors.primary[6],
                  },
                },
                label: {
                  marginBottom: "6px",
                  color: isDark ? theme.colors.gray[3] : theme.colors.gray[7],
                },
                innerInput: {
                  height: "42px",
                },
                visibilityToggle: {
                  color: isDark ? theme.colors.gray[5] : theme.colors.gray[6],
                },
              }}
            />

            <Button
              fullWidth
              type="submit"
              loading={loading}
              leftSection={null}
              rightSection={loading ? null : <IconArrowRight size={18} />}
              mt={10}
              styles={{
                root: {
                  height: "42px",
                  fontSize: "1rem",
                  background: isDark ? "#d4af37" : "#0d6832",
                  "&:hover": {
                    background: isDark ? "#b3901f" : "#0a5728",
                  },
                  transition: "background 0.2s ease",
                },
              }}
            >
              {loading ? "Logging in..." : "Sign In"}
            </Button>
          </Stack>
        </form>

        <Divider
          my="lg"
          labelPosition="center"
          label={
            <Text size="sm" fw={500} c={isDark ? "gray.5" : "gray.6"}>
              OR
            </Text>
          }
        />

        <Stack align="center" gap="xs">
          <Text size="sm" c="dimmed">
            New to Lions Den Cinemas?
          </Text>
          <Button
            component={Link}
            to="/signup"
            variant="outline"
            color={isDark ? "yellow" : "green"}
            fullWidth
            leftSection={<IconUserPlus size={18} />}
            styles={{
              root: {
                height: "42px",
                borderWidth: "1px",
                transition: "all 0.2s ease",
              },
            }}
          >
            Join the Den
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Login;
