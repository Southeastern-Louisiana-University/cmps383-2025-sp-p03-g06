// src/components/Navbar.tsx
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
  Burger,
  Drawer,
  Stack,
  Avatar,
} from "@mantine/core";
import {
  IconLogout,
  IconTheater,
  IconUser,
  IconTicket,
  IconMovie,
  IconHome,
  IconUserPlus,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [modalOpened, modalHandlers] = useDisclosure(false);
  const closeModal = modalHandlers.close;
  const location = useLocation();

  const [opened, { toggle, close }] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);

  // Consistent red accent color
  const redButtonColor = "#e03131";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
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

  const activeLink = (path: string) => location.pathname === path;

  return (
    <>
      <Box
        component="header"
        h={64}
        px="md"
        style={{
          backgroundColor: scrolled
            ? "rgba(18, 18, 18, 0.95)"
            : "rgba(18, 18, 18, 1)",
          color: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: scrolled ? "0 4px 10px rgba(0, 0, 0, 0.1)" : "none",
          backdropFilter: "blur(8px)",
        }}
      >
        <Group justify="space-between" h="100%" wrap="nowrap">
          <Group>
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <IconMovie size={32} color={redButtonColor} stroke={1.5} />

              <Text
                fw={700}
                className="navbar-title"
                style={{
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
              {isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    to="/"
                    variant={activeLink("/") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconHome size={18} />}
                    style={{ color: "white" }}
                  >
                    Home
                  </Button>

                  <Button
                    component={Link}
                    to="/movies"
                    variant={activeLink("/movies") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconMovie size={18} />}
                    style={{ color: "white" }}
                  >
                    Movies
                  </Button>

                  <Button
                    component={Link}
                    to="/theaters"
                    variant={activeLink("/theaters") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconTheater size={18} />}
                    style={{ color: "white" }}
                  >
                    Theaters
                  </Button>

                  <Button
                    component={Link}
                    to="/my-reservations"
                    variant={
                      activeLink("/my-reservations") ? "filled" : "subtle"
                    }
                    color="primary"
                    leftSection={<IconTicket size={18} />}
                    style={{ color: "white" }}
                  >
                    My Tickets
                  </Button>

                  {/* User menu */}
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <Button
                        variant="subtle"
                        color="primary"
                        leftSection={
                          <Avatar
                            size="sm"
                            color="primary"
                            radius="xl"
                            style={{ backgroundColor: redButtonColor }}
                          >
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
                <>
                  <Button
                    component={Link}
                    to="/movies"
                    variant={activeLink("/movies") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconMovie size={18} />}
                    style={{ color: "white" }}
                  >
                    Movies
                  </Button>

                  <Button
                    component={Link}
                    to="/theaters"
                    variant={activeLink("/theaters") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconTheater size={18} />}
                    style={{ color: "white" }}
                  >
                    Our Theaters
                  </Button>

                  {/* Sign up button */}
                  <Button
                    component={Link}
                    to="/signup"
                    variant="outline"
                    leftSection={<IconUserPlus size={18} />}
                    style={{
                      borderColor: redButtonColor,
                      color: redButtonColor,
                    }}
                    styles={{
                      root: {
                        "&:hover": {
                          backgroundColor: `${redButtonColor}10`,
                        },
                      },
                    }}
                  >
                    Sign Up
                  </Button>

                  {/* Login button - Same red as landing page */}
                  <Button
                    component={Link}
                    to="/login"
                    style={{
                      backgroundColor: redButtonColor,
                      color: "white",
                      fontWeight: 600,
                    }}
                    styles={{
                      root: {
                        "&:hover": {
                          backgroundColor: "#c92a2a",
                        },
                      },
                    }}
                  >
                    LOGIN
                  </Button>
                </>
              )}
            </Group>
          </Group>

          {/* Mobile menu burger */}
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            color="#ffffff"
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
            size="lg"
            style={{
              color: redButtonColor,
            }}
          >
            Lions Den Cinemas
          </Text>
        }
        hiddenFrom="sm"
        withCloseButton
        position="right"
        styles={{
          body: {
            backgroundColor: "#1a1b1e",
          },
          header: {
            backgroundColor: "#1a1b1e",
          },
        }}
      >
        <Stack>
          {isAuthenticated ? (
            <>
              <Group mb="md">
                <Avatar
                  size="md"
                  color="primary"
                  radius="xl"
                  style={{ backgroundColor: redButtonColor }}
                >
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

              <Button
                component={Link}
                to="/"
                variant="subtle"
                color="primary"
                fullWidth
                leftSection={<IconHome size={18} />}
                onClick={close}
              >
                Home
              </Button>

              <Button
                component={Link}
                to="/movies"
                variant={activeLink("/movies") ? "filled" : "subtle"}
                color="primary"
                fullWidth
                leftSection={<IconMovie size={18} />}
                onClick={close}
              >
                Movies
              </Button>

              <Button
                component={Link}
                to="/theaters"
                variant={activeLink("/theaters") ? "filled" : "subtle"}
                color="primary"
                fullWidth
                leftSection={<IconTheater size={18} />}
                onClick={close}
              >
                Theaters
              </Button>

              <Button
                component={Link}
                to="/my-reservations"
                variant={activeLink("/my-reservations") ? "filled" : "subtle"}
                color="primary"
                fullWidth
                leftSection={<IconTicket size={18} />}
                onClick={close}
              >
                Tickets
              </Button>

              <Button
                variant="outline"
                fullWidth
                leftSection={<IconLogout size={18} />}
                onClick={() => {
                  handleLogout();
                  close();
                }}
                style={{
                  borderColor: redButtonColor,
                  color: redButtonColor,
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/movies"
                variant="subtle"
                color="primary"
                fullWidth
                leftSection={<IconMovie size={18} />}
                onClick={close}
              >
                Movies
              </Button>

              <Button
                component={Link}
                to="/signup"
                variant="outline"
                fullWidth
                leftSection={<IconUserPlus size={18} />}
                onClick={close}
                style={{
                  borderColor: redButtonColor,
                  color: redButtonColor,
                }}
              >
                Sign Up
              </Button>

              <Button
                component={Link}
                to="/login"
                fullWidth
                onClick={close}
                style={{
                  backgroundColor: redButtonColor,
                  color: "white",
                  fontWeight: 600,
                }}
              >
                LOGIN
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </>
  );
};

export default Navbar;
