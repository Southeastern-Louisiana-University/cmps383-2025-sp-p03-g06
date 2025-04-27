import { Group, Button, AppShell, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import TicketLookupModal from "./TicketLookupModal";
import classes from "./Navigation.module.css";

const HEADER_HEIGHT = 60;

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const [opened, { toggle }] = useDisclosure();
  const [
    ticketModalOpened,
    { open: openTicketModal, close: closeTicketModal },
  ] = useDisclosure();
  const navigate = useNavigate();

  const handleTicketsClick = () => {
    if (isAuthenticated) {
      navigate("/my-reservations");
    } else {
      openTicketModal();
    }
  };

  return (
    <>
      <AppShell.Header style={{ height: HEADER_HEIGHT, marginBottom: 120 }}>
        <Group h="100%" px="md">
          <Group h="100%" gap={0} visibleFrom="sm">
            <Link to="/" className={classes.link}>
              HOME
            </Link>
            <Link to="/movies" className={classes.link}>
              MOVIES
            </Link>
            <Link to="/theaters" className={classes.link}>
              OUR THEATERS
            </Link>
          </Group>

          <Group visibleFrom="sm">
            <Button variant="default" onClick={handleTicketsClick}>
              MY TICKETS
            </Button>
            {isAuthenticated ? (
              <Button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                LOGOUT
              </Button>
            ) : (
              <Button onClick={() => navigate("/login")}>LOGIN</Button>
            )}
          </Group>

          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" />
        </Group>
      </AppShell.Header>

      <TicketLookupModal
        opened={ticketModalOpened}
        onClose={closeTicketModal}
      />
    </>
  );
}
