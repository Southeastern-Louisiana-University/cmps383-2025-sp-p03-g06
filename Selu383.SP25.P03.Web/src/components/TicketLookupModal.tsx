import {
  Modal,
  Stack,
  Text,
  TextInput,
  Button,
  Group,
  Divider,
  Alert,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginSignupModal from "./LoginSignupModal";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertCircle } from "@tabler/icons-react";

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
      // Create a guest session with the provided email
      await createGuestSession(email, ""); // Pass empty string as phone number
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
        title="View Your Tickets"
        size="md"
        centered
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Enter your email to view your tickets and concessions, or sign in to
            your account
          </Text>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
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
          />

          <Button
            fullWidth
            onClick={handleGuestLookup}
            loading={loading}
            disabled={!email}
          >
            Look Up My Tickets
          </Button>

          <Divider
            label={
              <Text size="sm" c="dimmed">
                OR
              </Text>
            }
            labelPosition="center"
            my="md"
          />

          <Group grow>
            <Button variant="outline" onClick={handleSignInClick}>
              Sign In
            </Button>
            <Button variant="outline" onClick={handleSignUpClick}>
              Create Account
            </Button>
          </Group>
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
