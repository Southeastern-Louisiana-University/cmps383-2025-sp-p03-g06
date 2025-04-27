// src/components/Navbar.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// import LoginSignupModal from "./LoginSignupModal"; // Commented out since file doesn't exist yet

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
  useMantineTheme,
} from "@mantine/core";
import {
  IconLogout,
  IconTheater,
  IconUser,
  IconTicket,
  IconMovie,
  IconHome,
  IconUserPlus,
  IconSettings,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import LoginSignupModal from "./LoginSignupModal";
import AnimatedLion from "./AnimatedLion";

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [initialView, setInitialView] = useState<"login" | "signup">("login");

  const location = useLocation();
  const [opened, { toggle, close }] = useDisclosure(false);

  // Remove scroll state since we'll keep it at the smaller size
  const redButtonColor = "#e03131";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const activeLink = (path: string) => location.pathname === path;

  const NavLink = ({ to, children, ...props }: any) => (
    <Link to={to} {...props}>
      {children}
    </Link>
  );

  const handleOpenLogin = () => {
    setInitialView("login");
    openModal();
  };

  const handleOpenSignup = () => {
    setInitialView("signup");
    openModal();
  };

  return (
    <Box>
      <Box
        style={{
          height: 60,
          backgroundColor: "rgba(18, 18, 18, 1)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Group
          justify="space-between"
          style={{
            height: "100%",
            padding: "0 80px",
            maxWidth: 1800,
            margin: "0 auto",
          }}
        >
          {/* Logo and Brand */}
          <Group style={{ flex: 1, marginLeft: "-40px" }}>
            <NavLink
              to="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AnimatedLion
                size={40}
                primaryColor="#d4af37"
                secondaryColor="#6B4226"
              />
              <Text
                size="lg"
                fw={700}
                style={{
                  color: "#ffffff",
                }}
                visibleFrom="xs"
              >
                Lions Den Cinemas
              </Text>
            </NavLink>
          </Group>

          {/* Desktop menu */}
          <Group
            visibleFrom="sm"
            style={{
              flex: 2,
              justifyContent: "flex-end",
              marginRight: "-40px",
            }}
          >
            <Group gap="md">
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  {/* Use color="primary" for consistent coloring */}
                  <Button
                    component={NavLink}
                    to="/"
                    variant={activeLink("/") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconHome size={18} />}
                    style={{
                      color: "white",
                    }}
                  >
                    Home
                  </Button>

                  <Button
                    component={NavLink}
                    to="/movies"
                    variant={activeLink("/movies") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconMovie size={18} />}
                    style={{
                      color: "white",
                    }}
                  >
                    Movies
                  </Button>

                  <Button
                    component={NavLink}
                    to="/theaters"
                    variant={activeLink("/theaters") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconTheater size={18} />}
                    style={{
                      color: "white",
                    }}
                  >
                    Our Theaters
                  </Button>

                  <Button
                    component={NavLink}
                    to="/my-reservations"
                    variant={
                      activeLink("/my-reservations") ? "filled" : "subtle"
                    }
                    color="primary"
                    leftSection={<IconTicket size={18} />}
                    style={{
                      color: "white",
                    }}
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
                          <Avatar size="sm" color="primary" radius="xl">
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
                      {isAdmin && (
                        <Menu.Item
                          component={Link}
                          to="/admin"
                          leftSection={<IconSettings size={14} />}
                        >
                          Admin Panel
                        </Menu.Item>
                      )}
                      <Menu.Item
                        color="primary"
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
                    style={{
                      color: "white",
                    }}
                  >
                    Home
                  </Button>

                  <Button
                    component={NavLink}
                    to="/movies"
                    variant={activeLink("/movies") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconMovie size={18} />}
                    style={{
                      color: "white",
                    }}
                  >
                    Movies
                  </Button>
                  <Button
                    component={NavLink}
                    to="/theaters"
                    variant={activeLink("/theaters") ? "filled" : "subtle"}
                    color="primary"
                    leftSection={<IconTheater size={18} />}
                    style={{
                      color: "white",
                    }}
                  >
                    Our Theaters
                  </Button>

                  <Group gap="sm">
                    <Button
                      variant="subtle"
                      color="primary"
                      onClick={handleOpenLogin}
                      styles={(theme) => ({
                        root: {
                          color: "white",
                          "&:hover": {
                            backgroundColor: theme.colors.red[6],
                          },
                        },
                      })}
                    >
                      Login
                    </Button>
                    <Button
                      variant="filled"
                      color="red"
                      onClick={handleOpenSignup}
                      leftSection={<IconUserPlus size={18} />}
                      style={{}}
                    >
                      Sign Up
                    </Button>
                  </Group>
                </>
              )}
            </Group>
          </Group>

          {/* Mobile menu burger */}
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            color={theme.colors.brand[0]}
            size="sm"
          />
        </Group>
      </Box>

      {/* Fixed height spacing element */}
      <Box style={{ height: 60 }} />

      <LoginSignupModal
        opened={modalOpened}
        onClose={closeModal}
        initialView={initialView}
      />

      {/* Mobile drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        size="xs"
        padding="md"
        title={
          <Group align="center" gap="sm">
            <AnimatedLion
              size={40}
              primaryColor="#d4af37"
              secondaryColor="#6B4226"
            />
            <Text
              fw={700}
              size="lg"
              style={{
                color: redButtonColor,
              }}
            >
              Lions Den Cinemas
            </Text>
          </Group>
        }
        hiddenFrom="sm"
        withCloseButton
        position="right"
        styles={{
          body: { backgroundColor: "#1a1b1e" },
          header: { backgroundColor: "#1a1b1e" },
        }}
      >
        {/* Similarly update colors in drawer content */}
        <Stack>
          {isAuthenticated ? (
            // Similar color updates for mobile drawer
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
                Our Theaters
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
                onClick={handleOpenLogin}
                variant="filled"
                style={{ backgroundColor: redButtonColor }}
                leftSection={<IconUserPlus size={18} />}
                fullWidth
              >
                Login
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
};

export default Navbar;
