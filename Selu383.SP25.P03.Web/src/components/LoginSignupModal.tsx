import { useState, useEffect } from "react";
import { Modal, useMantineTheme } from "@mantine/core";
import Login from "./Login";
import SignUp from "./SignUp";

interface LoginSignupModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialView?: "login" | "signup";
}

const LoginSignupModal = ({
  opened,
  onClose,
  onSuccess,
  initialView = "login",
}: LoginSignupModalProps) => {
  const [isLoginView, setIsLoginView] = useState(initialView === "login");
  const theme = useMantineTheme();

  // Update view when initialView prop changes
  useEffect(() => {
    setIsLoginView(initialView === "login");
  }, [initialView]);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  return (
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
      {isLoginView ? (
        <Login
          onSuccess={handleSuccess}
          onSwitchToSignup={() => setIsLoginView(false)}
        />
      ) : (
        <SignUp
          onSuccess={handleSuccess}
          onSwitchToLogin={() => setIsLoginView(true)}
        />
      )}
    </Modal>
  );
};

export default LoginSignupModal;
