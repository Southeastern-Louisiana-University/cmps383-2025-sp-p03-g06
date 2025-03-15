// src/components/SignUp.tsx - Simplified design with better form styling
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userApi } from "../services/api";
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
  Progress,
  Group,
  Box,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconUser,
  IconLock,
  IconCheck,
  IconX,
  IconArrowLeft,
  IconUserCheck,
  IconMovie,
} from "@tabler/icons-react";

function PasswordRequirement({
  meets,
  label,
}: {
  meets: boolean;
  label: string;
}) {
  return (
    <Text
      c={meets ? "teal" : "red"}
      style={{
        display: "flex",
        alignItems: "center",
        fontSize: rem(12),
      }}
      mt={5}
    >
      {meets ? (
        <IconCheck size={14} stroke={1.5} />
      ) : (
        <IconX size={14} stroke={1.5} />
      )}
      <Box ml={7}>{label}</Box>
    </Text>
  );
}

const requirements = [
  { re: /[0-9]/, label: "Includes number" },
  { re: /[a-z]/, label: "Includes lowercase letter" },
  { re: /[A-Z]/, label: "Includes uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special symbol" },
];

function getStrength(password: string) {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === "dark";

  // Password strength
  const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);
  const strength = getStrength(password);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(password)}
    />
  ));

  const bars = Array(4)
    .fill(0)
    .map((_, index) => (
      <Progress
        key={index}
        value={
          password.length > 0 && index === 0
            ? 100
            : strength >= ((index + 1) / 4) * 100
            ? 100
            : 0
        }
        color={strength > 80 ? "teal" : strength > 50 ? "yellow" : "red"}
        size={4}
        mb={4}
      />
    ));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Validate password strength
    if (getStrength(password) < 50) {
      setError("Password is too weak. Please use a stronger password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await userApi.register({
        username,
        password,
        roles: ["User"], // This will be overridden on the server anyway
      });

      // Redirect to login page after successful registration
      navigate("/login", {
        state: { message: "Account created successfully! Please log in." },
      });
    } catch (error) {
      console.error("Registration failed:", error);
      setError("Registration failed. Please try a different username.");
    } finally {
      setLoading(false);
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
          borderTop: "3px solid var(--mantine-color-primary-6)",
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
          <IconMovie
            size={40}
            color={isDark ? "#d4af37" : "var(--mantine-color-primary-6)"}
            stroke={1.5}
          />
        </Group>

        <Title
          ta="center"
          order={2}
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "8px",
            color: isDark ? "#ffffff" : "#0d6832",
          }}
        >
          Join the Den
        </Title>

        <Text
          ta="center"
          size="md"
          mb={32}
          style={{
            color: isDark ? theme.colors.gray[3] : theme.colors.gray[7],
          }}
        >
          Create your account to experience the magic of cinema
        </Text>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Registration Failed"
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
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              leftSection={<IconUser size={16} />}
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

            <div>
              <PasswordInput
                label="Password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                leftSection={<IconLock size={16} />}
                onFocus={() => setShowPasswordFeedback(true)}
                onBlur={() => setShowPasswordFeedback(password.length > 0)}
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
                }}
              />

              {(showPasswordFeedback || password.length > 0) && (
                <Box
                  mt="sm"
                  p="xs"
                  style={{
                    background: isDark
                      ? "rgba(30, 31, 34, 0.5)"
                      : "rgba(245, 245, 245, 0.5)",
                    borderRadius: "6px",
                  }}
                >
                  <Group gap={5} grow mb="xs">
                    {bars}
                  </Group>

                  <PasswordRequirement
                    label="Has at least 6 characters"
                    meets={password.length >= 6}
                  />
                  {checks}
                </Box>
              )}
            </div>

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              leftSection={<IconLock size={16} />}
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
              }}
            />

            <Button
              fullWidth
              type="submit"
              loading={loading}
              color={isDark ? "yellow" : "green"}
              mt="md"
              rightSection={loading ? null : <IconUserCheck size={18} />}
              disabled={
                password !== confirmPassword || getStrength(password) < 50
              }
              styles={{
                root: {
                  height: "42px",
                  fontSize: "1rem",
                  background: isDark ? "#d4af37" : "#0d6832",
                  "&:hover": {
                    background: isDark ? "#b3901f" : "#0a5728",
                  },
                  "&:disabled": {
                    background: isDark
                      ? "rgba(37, 38, 43, 0.5)"
                      : "rgba(240, 240, 240, 0.8)",
                    color: isDark ? theme.colors.gray[5] : theme.colors.gray[6],
                  },
                  transition: "background 0.2s ease",
                },
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
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
            Already have an account?
          </Text>
          <Button
            component={Link}
            to="/login"
            variant="outline"
            color={isDark ? "yellow" : "green"}
            fullWidth
            leftSection={<IconArrowLeft size={18} />}
            styles={{
              root: {
                height: "42px",
                borderWidth: "1px",
                transition: "background 0.2s ease",
              },
            }}
          >
            Sign In
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default SignUp;
