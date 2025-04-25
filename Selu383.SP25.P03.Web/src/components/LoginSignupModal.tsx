import { Modal } from "@mantine/core";
import Login from "./Login";

type Props = { opened: boolean; onClose: () => void };

const LoginSignupModal = ({ opened, onClose }: Props) => (
  <Modal
    opened={opened}
    onClose={onClose}
    centered
    size="xl"
    overlayProps={{
      backgroundOpacity: 0.7,
      blur: 5,
    }}
    title="Sign In"
    styles={{
      title: {
        fontWeight: 600,
        fontSize: "1.5rem",
        color: "#fff",
      },
      header: {
        backgroundColor: "transparent",
        padding: "20px 30px 0",
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
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
      },
    }}
    transitionProps={{
      transition: "slide-up",
      duration: 300,
    }}
  >
    <Login onSuccess={onClose} />
  </Modal>
);

export default LoginSignupModal;
