// src/components/SignUp.tsx - Updated with AnimatedLion
import { useState } from "react";
import { userApi } from "../services/api";
import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Divider,
  Alert,
  Stack,
  Progress,
  Group,
  Box,
  rem,
  useMantineColorScheme,
  useMantineTheme,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconUser,
  IconLock,
  IconCheck,
  IconX,
  IconUserCheck,
  IconArrowRight,
} from "@tabler/icons-react";
import AnimatedLion from "./AnimatedLion"; // Import our new component

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

interface SignUpProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const SignUp = ({ onSuccess, onSwitchToLogin }: SignUpProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useMantineColorScheme();
  const theme = useMantineTheme();

  // Password
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
        roles: ["User"],
      });

      if (onSuccess) {
        onSuccess();
      }

      // Switch to login after successful registration
      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setError("Registration failed. Please try a different username.");
    } finally {
      setLoading(false);
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
          Join the Den
        </Title>

        <Text size="lg" c="dimmed">
          Create your account to experience the magic of cinema
        </Text>
      </Stack>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Registration Failed"
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
            placeholder="Choose a username"
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

          <div>
            <PasswordInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="lg"
              minLength={6}
              leftSection={<IconLock size={20} />}
              onFocus={() => setShowPasswordFeedback(true)}
              onBlur={() => setShowPasswordFeedback(password.length > 0)}
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

            {(showPasswordFeedback || password.length > 0) && (
              <Box
                mt="sm"
                p="md"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
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
            rightSection={loading ? null : <IconUserCheck size={20} />}
            disabled={
              password !== confirmPassword || getStrength(password) < 50
            }
            mt="md"
          >
            {loading ? "Creating Account..." : "Create Account"}
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
          Already have an account?
        </Text>
        <Button
          variant="outline"
          color="red"
          fullWidth
          size="lg"
          rightSection={<IconArrowRight size={20} />}
          onClick={onSwitchToLogin}
        >
          Login
        </Button>
      </Stack>
    </Stack>
  );
};

export default SignUp;
