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

interface LoginProps {
  onSuccess?: () => void;
}

const Login = ({ onSuccess }: LoginProps) => {
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
      if (onSuccess) {
        onSuccess();
      }
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="center">
        <AnimatedLion
          size={100}
          primaryColor="#d4af37"
          secondaryColor="#6B4226"
        />
      </Group>

      <Stack gap={8} align="center">
        <Title
          order={2}
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: theme.colors.gray[0],
          }}
        >
          Welcome Back
        </Title>

        <Text size="lg" c="dimmed">
          Sign in to continue your cinema journey
        </Text>
      </Stack>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Login Failed"
          color="red"
          variant="filled"
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <Stack gap="md">
          <TextInput
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            size="lg"
            autoFocus
            leftSection={<IconUser size={20} />}
            styles={{
              input: {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                "&:focus": {
                  borderColor: theme.colors.red[7],
                },
              },
              label: {
                color: theme.colors.gray[3],
                marginBottom: 8,
              },
            }}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            size="lg"
            leftSection={<IconLock size={20} />}
            styles={{
              input: {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                "&:focus": {
                  borderColor: theme.colors.red[7],
                },
              },
              label: {
                color: theme.colors.gray[3],
                marginBottom: 8,
              },
              innerInput: {
                height: "100%",
              },
            }}
          />

          <Button
            fullWidth
            type="submit"
            loading={loading}
            color="red"
            size="lg"
            rightSection={loading ? null : <IconArrowRight size={20} />}
            mt="md"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Stack>
      </form>

      <Divider
        label={
          <Text size="sm" fw={500} c="dimmed">
            OR
          </Text>
        }
        labelPosition="center"
      />

      <Stack gap="xs" align="center">
        <Text size="sm" c="dimmed">
          New to Lions Den Cinemas?
        </Text>
        <Button
          component={Link}
          to="/signup"
          variant="outline"
          color="red"
          fullWidth
          size="lg"
          leftSection={<IconUserPlus size={20} />}
        >
          Join the Den
        </Button>
      </Stack>
    </Stack>
  );
};

export default Login;
