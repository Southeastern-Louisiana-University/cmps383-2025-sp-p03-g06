// src/components/Navbar.tsx - Simplified design with better contrast
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginSignupModal from "./LoginSignupModal";

import {
  Box,
  Group,
  Text,
  Button,
  Menu,
  ActionIcon,
  Burger,
  Drawer,
  Stack,
  Divider,
  Avatar,
  Tooltip,
  useMantineColorScheme,
  rgba,
} from "@mantine/core";
import {
  IconLogout,
  IconTheater,
  IconUser,
  IconMoon,
  IconSun,
  IconTicket,
  IconMovie,
  IconHome,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [modalOpened, modalHandlers] = useDisclosure(false);
  const openModal = modalHandlers.open;
  const closeModal = modalHandlers.close;
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const [opened, { toggle, close }] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const activeLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <Box
        component="header"
        h={64}
        px="md"
        style={{
          backgroundColor: "#121212", // Very dark black background
          color: "white", // White text for better contrast
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: `1px solid ${
            isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
          }`,
          boxShadow: scrolled
            ? "0 4px 10px rgba(0, 0, 0, 0.3)"
            : "0 1px 3px rgba(0, 0, 0, 0.15)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Group justify="space-between" h="100%" wrap="nowrap">
          <Group>
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: isDark ? "white" : "#1a1b1e",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <IconMovie size={32} color="#c70036" stroke={1.5} />

              <Text
                fw={700}
                style={{
                  color: "white",
                  letterSpacing: "0.5px",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "1.25rem",
                }}
              >
                Lions Den Cinemas
              </Text>
            </Link>
          </Group>

          {/* Desktop menu */}
          <Group visibleFrom="sm">
            <Group gap="md">
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    to="/"
                    variant={activeLink("/") ? "filled" : "subtle"}
                    color="white"
                    leftSection={<IconHome size={18} />}
                  >
                    Home
                  </Button>

                  <Button
                    component={Link}
                    to="/theaters"
                    variant={activeLink("/theaters") ? "filled" : "subtle"}
                    color="brand"
                    leftSection={<IconTheater size={18} />}
                  >
                    Theaters
                  </Button>

                  <Menu
                    position="bottom-end"
                    shadow="md"
                    width={200}
                    transitionProps={{
                      transition: "pop",
                      duration: 150,
                    }}
                  >
                    <Menu.Target>
                      <Button
                        variant="subtle"
                        color="brand"
                        leftSection={
                          <Avatar size="sm" color="brand" radius="xl">
                            {user?.userName.charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        rightSection={<IconUser size={18} />}
                      >
                        {user?.userName}
                      </Button>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Label>Account</Menu.Label>
                      <Menu.Item leftSection={<IconUser size={14} />}>
                        Profile
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        color="red"
                        leftSection={<IconLogout size={14} />}
                        onClick={handleLogout}
                      >
                        Logout
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </>
              ) : (
                <Button onClick={openModal} variant="filled" color="brand">
                  Login
                </Button>
              )}
            </Group>
          </Group>

          {/* Mobile menu burger */}
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            color="brand"
            size="sm"
          />
        </Group>
        <LoginSignupModal opened={modalOpened} onClose={closeModal} />
      </Box>

      {/* Mobile drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        size="xs"
        padding="md"
        title={
          <Text
            fw={700}
            style={{
              color: "white", // Always white regardless of theme
              letterSpacing: "0.5px",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1.25rem",
            }}
          >
            Lions Den Cinemas
          </Text>
        }
        hiddenFrom="sm"
        withCloseButton
        position="right"
      >
        <Stack>
          {isAuthenticated ? (
            <>
              <Group mb="md">
                <Avatar size="md" color="brand" radius="xl">
                  {user?.userName.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <Text fw={500}>{user?.userName}</Text>
                  <Text size="xs" c="dimmed">
                    {user?.roles?.includes("Admin")
                      ? "Administrator"
                      : "Member"}
                  </Text>
                </div>
              </Group>
              <Divider />

              <Button
                component={Link}
                to="/"
                variant="subtle"
                color="brand"
                fullWidth
                leftSection={<IconHome size={18} />}
                onClick={close}
              >
                Home
              </Button>

              <Button
                component={Link}
                to="/theaters"
                variant="subtle"
                color="brand"
                fullWidth
                leftSection={<IconTheater size={18} />}
                onClick={close}
              >
                Theaters
              </Button>

              <Button
                variant="subtle"
                color="brand"
                fullWidth
                leftSection={<IconMovie size={18} />}
                onClick={close}
              >
                Movies
              </Button>

              <Button
                variant="subtle"
                color="brand"
                fullWidth
                leftSection={<IconTicket size={18} />}
                onClick={close}
              >
                Tickets
              </Button>

              <Divider />

              <Group grow mt="md">
                <ThemeToggle />

                <Button
                  variant="filled"
                  color="brand"
                  leftSection={<IconLogout size={16} />}
                  onClick={() => {
                    handleLogout();
                    close();
                  }}
                >
                  Logout
                </Button>
              </Group>
            </>
          ) : (
            <>
              <Text my="md">Please log in to access all features</Text>
              <Button
                component={Link}
                to="/login"
                variant="filled"
                color="brand"
                fullWidth
                onClick={close}
              >
                Login
              </Button>

              <Button
                component={Link}
                to="/signup"
                variant="outline"
                color="brand"
                fullWidth
                onClick={close}
                mt="xs"
              >
                Sign Up
              </Button>

              <Divider my="md" />

              <ThemeToggle fullWidth />
            </>
          )}
        </Stack>
      </Drawer>
    </>
  );
};

export default Navbar;
