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
  UnstyledButton,
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

  // Custom Link component that handles React Router integration
  // This is a simpler approach than using complex typings
  const NavLink = ({ to, children, ...props }: any) => (
    <Link to={to} {...props}>
      {children}
    </Link>
  );

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
            {/* Updated branding button */}
            <UnstyledButton
              component={NavLink}
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                padding: "8px", // Direct value instead of theme
                borderRadius: "8px", // Direct value instead of theme
                transition: "background-color 0.2s, transform 0.2s",
              }}
              sx={() => ({
                "&:hover": {
                  backgroundColor: `rgba(224, 49, 49, 0.1)`,
                  transform: "scale(1.03)",
                },
              })}
            >
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "8px", // Direct value instead of theme
                  backgroundColor: "#e03131", // Direct color value
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px", // Direct value instead of theme
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", // Direct shadow
                }}
              >
                <IconMovie size={24} color="#fff" stroke={2} />
              </Box>

              <Text
                size="xl"
                fw={700}
                style={{
                  background: "linear-gradient(90deg, #e03131, #ff6b6b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: 0.5,
                }}
              >
                Lions Den Cinemas
              </Text>
            </UnstyledButton>
          </Group>

          {/* Desktop menu */}
          <Group visibleFrom="sm">
            <Group gap="md">
              {isAuthenticated ? (
                <>
                  <Button
                    component={NavLink}
                    to="/"
                    variant={activeLink("/") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconHome size={18} />}
                    style={{ color: "white" }}
                  >
                    Home
                  </Button>

                  <Button
                    component={NavLink}
                    to="/movies"
                    variant={activeLink("/movies") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconMovie size={18} />}
                    style={{ color: "white" }}
                  >
                    Movies
                  </Button>

                  <Button
                    component={NavLink}
                    to="/theaters"
                    variant={activeLink("/theaters") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconTheater size={18} />}
                    style={{ color: "white" }}
                  >
                    Theaters
                  </Button>

                  <Button
                    component={NavLink}
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
                    component={NavLink}
                    to="/"
                    variant={activeLink("/") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconHome size={18} />}
                    style={{ color: "white" }}
                  >
                    Home
                  </Button>

                  <Button
                    component={NavLink}
                    to="/movies"
                    variant={activeLink("/movies") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconMovie size={18} />}
                    style={{ color: "white" }}
                  >
                    Movies
                  </Button>

                  <Button
                    onClick={modalHandlers.open}
                    variant="filled"
                    style={{ backgroundColor: redButtonColor }}
                    leftSection={<IconUserPlus size={18} />}
                  >
                    Sign In
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
          body: { backgroundColor: "#1a1b1e" },
          header: { backgroundColor: "#1a1b1e" },
        }}
      >
        <Stack>
          {isAuthenticated ? (
            <>
              <Button
                component={NavLink}
                to="/"
                variant={activeLink("/") ? "filled" : "subtle"}
                color="primary"
                leftSection={<IconHome size={18} />}
                fullWidth
              >
                Home
              </Button>

              <Button
                component={NavLink}
                to="/movies"
                variant={activeLink("/movies") ? "filled" : "subtle"}
                color="primary"
                leftSection={<IconMovie size={18} />}
                fullWidth
              >
                Movies
              </Button>

              <Button
                component={NavLink}
                to="/theaters"
                variant={activeLink("/theaters") ? "filled" : "subtle"}
                color="primary"
                leftSection={<IconTheater size={18} />}
                fullWidth
              >
                Theaters
              </Button>

              <Button
                component={NavLink}
                to="/my-reservations"
                variant={activeLink("/my-reservations") ? "filled" : "subtle"}
                color="primary"
                leftSection={<IconTicket size={18} />}
                fullWidth
              >
                My Tickets
              </Button>

              <Button
                color="red"
                leftSection={<IconLogout size={18} />}
                onClick={handleLogout}
                fullWidth
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                component={NavLink}
                to="/"
                variant={activeLink("/") ? "filled" : "subtle"}
                color="primary"
                leftSection={<IconHome size={18} />}
                fullWidth
              >
                Home
              </Button>

              <Button
                component={NavLink}
                to="/movies"
                variant={activeLink("/movies") ? "filled" : "subtle"}
                color="primary"
                leftSection={<IconMovie size={18} />}
                fullWidth
              >
                Movies
              </Button>

              <Button
                onClick={modalHandlers.open}
                variant="filled"
                style={{ backgroundColor: redButtonColor }}
                leftSection={<IconUserPlus size={18} />}
                fullWidth
              >
                Sign In
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </>
  );
};

export default Navbar;
