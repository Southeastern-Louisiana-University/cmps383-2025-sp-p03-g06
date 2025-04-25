// src/components/Footer.tsx
import {
  Group,
  Text,
  Container,
  Stack,
  Box,
  Button,
  Divider,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useAuth } from "../contexts/AuthContext";
import LegalModal from "./LegalModal";
import TicketLookupModal from "./TicketLookupModal";

const Footer = () => {
  // Configuration for social media links
  const socialLinks = [
    {
      icon: <IconBrandInstagram size={24} />,
      url: "https://instagram.com",
      label: "Instagram",
    },
    {
      icon: <IconBrandFacebook size={24} />,
      url: "https://facebook.com",
      label: "Facebook",
    },
    {
      icon: <IconBrandX size={24} />,
      url: "https://x.com",
      label: "X",
    },
  ];

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [
    ticketModalOpened,
    { open: openTicketModal, close: closeTicketModal },
  ] = useDisclosure();
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const handleTicketsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/my-reservations");
    } else {
      openTicketModal();
    }
  };

  const openPrivacyModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setPrivacyModalOpen(true);
  };

  const openTermsModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setTermsModalOpen(true);
  };

  return (
    <Box
      component="footer"
      style={{
        backgroundColor: "var(--background-darker)",
        borderTop: "1px solid var(--border-color)",
        marginTop: "auto",
      }}
    >
      <Container size="xl" py="xl">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Text fw={700} size="lg" className="navbar-title">
                Lions Den Cinemas
              </Text>
              <Text size="sm" c="dimmed">
                The ultimate movie experience
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text fw={600} size="sm">
                Quick Links
              </Text>
              <Group gap="md">
                <Link
                  to="/movies"
                  style={{
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  Movies
                </Link>
                <Link
                  to="/theaters"
                  style={{
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  Theaters
                </Link>
                <Link
                  to="#"
                  onClick={handleTicketsClick}
                  style={{
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  My Tickets
                </Link>
              </Group>
            </Stack>

            <Stack gap="xs">
              <Text fw={600} size="sm">
                Connect With Us
              </Text>
              <Group gap="md">
                {socialLinks.map((social, index) => (
                  <Button
                    key={index}
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    radius="xl"
                    px="xs"
                    styles={{
                      root: {
                        borderColor: "var(--primary-color)",
                        color: "var(--primary-color)",
                        "&:hover": {
                          backgroundColor: "var(--primary-color)",
                          color: "white",
                          transform: "translateY(-3px)",
                        },
                        transition: "all 0.3s ease",
                      },
                    }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </Button>
                ))}
              </Group>
            </Stack>
          </Group>

          <Divider color="var(--border-color)" />

          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              © {new Date().getFullYear()} Lions Den Cinemas. All rights
              reserved.
            </Text>
            <Group gap="md">
              <Text
                size="xs"
                c="dimmed"
                component="a"
                href="#"
                onClick={openPrivacyModal}
                style={{ textDecoration: "none", cursor: "pointer" }}
              >
                Privacy Policy
              </Text>
              <Text
                size="xs"
                c="dimmed"
                component="a"
                href="#"
                onClick={openTermsModal}
                style={{ textDecoration: "none", cursor: "pointer" }}
              >
                Terms of Service
              </Text>
            </Group>
          </Group>
        </Stack>
      </Container>

      <LegalModal
        opened={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        type="privacy"
      />

      <LegalModal
        opened={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        type="terms"
      />

      <TicketLookupModal
        opened={ticketModalOpened}
        onClose={closeTicketModal}
      />
    </Box>
  );
};

export default Footer;
