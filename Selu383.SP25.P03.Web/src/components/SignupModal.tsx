// src/components/SignupModal.tsx
import { Modal } from "@mantine/core";
import SignUp from "./SignUp";

type Props = { opened: boolean; onClose: () => void };

const SignupModal = ({ opened, onClose }: Props) => (
  <Modal
    opened={opened}
    onClose={onClose}
    centered
    size="md"
    overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
  >
    <SignUp />
  </Modal>
);

export default SignupModal;
