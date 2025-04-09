// src/components/Login.tsx
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
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconUser,
  IconLock,
  IconArrowRight,
  IconUserPlus,
} from "@tabler/icons-react";
import AnimatedLion from "./AnimatedLion";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMantineTheme();

  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      // Handle success message if needed
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/");
    } catch (error) {
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
          borderTop: `3px solid ${theme.colors.primary[5]}`,
          background: theme.colors.dark[8],
          backdropFilter: "blur(10px)",
          boxShadow: theme.shadows.md,
        }}
      >
        <Group justify="center" mb={24}>
          <AnimatedLion
            size={80}
            primaryColor="#D2691E" // Deep Chestnut/Reddish-Brown
            secondaryColor="#8B4513" // Saddle Brown (darker shade for depth)
          />
        </Group>
        <Title
          ta="center"
          order={2}
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: theme.colors.primary[0],
          }}
        >
          Welcome Back
        </Title>

        <Text ta="center" size="md" c="dimmed" mb={32}>
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
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftSection={<IconLock size={18} />}
            />

            <Button
              fullWidth
              type="submit"
              loading={loading}
              color="primary"
              rightSection={loading ? null : <IconArrowRight size={18} />}
              mt={10}
            >
              {loading ? "Logging in..." : "Sign In"}
            </Button>
          </Stack>
        </form>

        <Divider
          my="lg"
          labelPosition="center"
          label={
            <Text size="sm" fw={500} c="dimmed">
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
            color="primary"
            fullWidth
            leftSection={<IconUserPlus size={18} />}
          >
            Join the Den
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Login;
