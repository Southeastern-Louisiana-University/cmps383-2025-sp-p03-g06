// src/components/LoginSignupModal.tsx
import {
  Modal,
  Tabs,
  Text,
  Button,
  TextInput,
  PasswordInput,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

type Props = {
  opened: boolean;
  onClose: () => void;
};

//type LoginSignupModalProps = {
//opened: boolean;
//onClose: () => void;
//};

const LoginSignupModal = ({ opened, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Welcome to Lion's Den"
      size="md"
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Tabs value={activeTab} onChange={(val) => setActiveTab(val as any)}>
        <Tabs.List grow>
          <Tabs.Tab value="login">Login</Tabs.Tab>
          <Tabs.Tab value="signup">Sign Up</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="login" pt="md">
          <Stack>
            <TextInput label="Email" placeholder="you@example.com" required />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
            />
            <Button fullWidth color="brand">
              Login
            </Button>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="signup" pt="md">
          <Stack>
            <TextInput label="Name" placeholder="John Doe" required />
            <TextInput label="Email" placeholder="you@example.com" required />
            <PasswordInput
              label="Password"
              placeholder="Create a password"
              required
            />
            <Button fullWidth color="brand">
              Sign Up
            </Button>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
};

export default LoginSignupModal;
