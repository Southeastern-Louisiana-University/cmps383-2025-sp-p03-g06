import {
  Group,
  Text,
  Container,
  Stack,
  Box,
  Button,
  Divider,
} from "@mantine/core";
import { Link } from "react-router-dom";
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandX,
} from "@tabler/icons-react";

const Footer = () => {
  // Configuration for social media links - just change the URLs when accounts are created
  const socialLinks = [
    {
      icon: <IconBrandInstagram size={24} />,
      url: "https://instagram.com", // Change when official account is created
      label: "Instagram",
    },
    {
      icon: <IconBrandFacebook size={24} />,
      url: "https://facebook.com", // Change when official account is created
      label: "Facebook",
    },
    {
      icon: <IconBrandX size={24} />,
      url: "https://x.com", // Change when official account is created
      label: "X",
    },
  ];

  const currentYear = new Date().getFullYear();

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
          {/* Main footer content */}
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
                  to="/my-reservations"
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

          {/* Copyright section */}
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              © {currentYear} Lions Den Cinemas. All rights reserved.
            </Text>
            <Group gap="md">
              <Text
                size="xs"
                c="dimmed"
                component={Link}
                to="/privacy"
                style={{ textDecoration: "none" }}
              >
                Privacy Policy
              </Text>
              <Text
                size="xs"
                c="dimmed"
                component={Link}
                to="/terms"
                style={{ textDecoration: "none" }}
              >
                Terms of Service
              </Text>
            </Group>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
