import { Modal } from "@mantine/core";
import Login from "./Login";

type Props = {
  opened: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
};

const LoginModal = ({ opened, onClose, onSwitchToSignup }: Props) => (
  <Modal
    opened={opened}
    onClose={onClose}
    centered
    size="xl"
    withCloseButton
    title={null}
    closeButtonProps={{
      style: {
        background: "none",
        backgroundColor: "transparent !important",
        "&:hover": {
          background: "rgba(255, 255, 255, 0.1) !important",
        },
      },
    }}
    overlayProps={{
      backgroundOpacity: 0.7,
      blur: 5,
    }}
    styles={{
      header: {
        position: "absolute",
        right: 0,
        top: 0,
        zIndex: 10,
        padding: "12px",
        background: "none",
        backgroundColor: "transparent !important",
      },
      body: {
        padding: "20px 30px 30px",
      },
      content: {
        backgroundColor: "rgba(26, 27, 30, 0.95)",
        backdropFilter: "blur(16px)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      },
      close: {
        color: "#fff",
        background: "none !important",
        backgroundColor: "transparent !important",
        border: "none",
        "&::before": {
          background: "none !important",
          backgroundColor: "transparent !important",
        },
        "&::after": {
          background: "none !important",
          backgroundColor: "transparent !important",
        },
        "&:hover": {
          background: "rgba(255, 255, 255, 0.1) !important",
        },
      },
    }}
    transitionProps={{
      transition: "slide-up",
      duration: 300,
    }}
  >
    <Login onSuccess={onClose} onSwitchToSignup={onSwitchToSignup} />
  </Modal>
);

export default LoginModal;
