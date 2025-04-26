import {
  Modal,
  Stack,
  Text,
  TextInput,
  Button,
  Group,
  Divider,
  Alert,
  useMantineTheme,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginSignupModal from "./LoginSignupModal";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertCircle } from "@tabler/icons-react";
import AnimatedLion from "./AnimatedLion";
import { reservationApi } from "../services/api";

interface TicketLookupModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function TicketLookupModal({
  opened,
  onClose,
}: TicketLookupModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated, createGuestSession } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginModalOpened, { open: openLoginModal, close: closeLoginModal }] =
    useDisclosure(false);
  const [initialView, setInitialView] = useState<"login" | "signup">("login");
  const theme = useMantineTheme();

  // Use useEffect to handle navigation when authentication state changes
  useEffect(() => {
    if (opened && isAuthenticated) {
      onClose();
      navigate("/my-reservations");
    }
  }, [isAuthenticated, opened, navigate, onClose]);

  const handleGuestLookup = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Look up reservations by email first
      const reservations = await reservationApi.lookupReservationsByEmail(
        email
      );

      if (reservations.length === 0) {
        setError("No reservations found for this email address");
        return;
      }

      // Create a guest session with the provided email
      await createGuestSession(email, "");
      onClose();
      navigate("/my-reservations");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to look up tickets. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignInClick = () => {
    onClose();
    setInitialView("login");
    openLoginModal();
  };

  const handleSignUpClick = () => {
    onClose();
    setInitialView("signup");
    openLoginModal();
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size="lg"
        padding="xl"
        centered
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          content: {
            backgroundColor: theme.colors.dark[7],
          },
          header: {
            display: "none",
          },
        }}
      >
        <Stack gap="lg">
          <Group justify="center">
            <AnimatedLion
              size={100}
              primaryColor="#d4af37"
              secondaryColor="#6B4226"
            />
          </Group>

          <Stack gap={8} align="center">
            <Text
              size="xl"
              fw={700}
              style={{
                color: theme.colors.gray[0],
                fontSize: "2rem",
              }}
            >
              View Your Tickets
            </Text>

            <Text size="md" c="dimmed">
              Enter your email to view your tickets and concessions, or sign in
              to your account
            </Text>
          </Stack>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              variant="filled"
              onClose={() => setError(null)}
              withCloseButton
            >
              {error}
            </Alert>
          )}

          <TextInput
            label="Email Address"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            size="lg"
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

          <Button
            fullWidth
            onClick={handleGuestLookup}
            loading={loading}
            disabled={!email}
            color="red"
            size="lg"
          >
            Look Up My Tickets
          </Button>

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
              Have an account?
            </Text>
            <Group grow w="100%">
              <Button
                variant="outline"
                color="red"
                size="lg"
                onClick={handleSignInClick}
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                color="red"
                size="lg"
                onClick={handleSignUpClick}
              >
                Create Account
              </Button>
            </Group>
          </Stack>
        </Stack>
      </Modal>

      <LoginSignupModal
        opened={loginModalOpened}
        onClose={closeLoginModal}
        onSuccess={() => {
          closeLoginModal();
          navigate("/my-reservations");
        }}
        initialView={initialView}
      />
    </>
  );
}
