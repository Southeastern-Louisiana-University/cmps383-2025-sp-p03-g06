// src/components/AdminPanel.tsx
import { useState } from "react";
import { Container, Tabs, Title, Paper } from "@mantine/core";
import {
  IconMovie,
  IconClock,
  IconCoffee,
  IconBuilding,
} from "@tabler/icons-react";
import MovieManager from "./MovieManager";
import ConcessionManager from "./ConcessionManager";
import TheaterManager from "./TheaterManager";
import ShowtimeManager from "./ShowtimeManager";
import { useAuth } from "../contexts/AuthContext";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<string | null>("movies");
  const { isManager, isAdmin } = useAuth();

  return (
    <Container size="xl" py="xl">
      <Paper p="md" withBorder mb="xl">
        <Title order={2}>Lions Den Cinema Admin Panel</Title>
      </Paper>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="movies" leftSection={<IconMovie size={16} />}>
            Movies
          </Tabs.Tab>
          {(isManager || isAdmin) && (
            <Tabs.Tab value="showtimes" leftSection={<IconClock size={16} />}>
              Showtimes
            </Tabs.Tab>
          )}
          <Tabs.Tab value="concessions" leftSection={<IconCoffee size={16} />}>
            Concessions
          </Tabs.Tab>
          <Tabs.Tab value="theaters" leftSection={<IconBuilding size={16} />}>
            Theaters
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="movies" pt="md">
          <MovieManager />
        </Tabs.Panel>

        {(isManager || isAdmin) && (
          <Tabs.Panel value="showtimes" pt="md">
            <ShowtimeManager />
          </Tabs.Panel>
        )}

        <Tabs.Panel value="concessions" pt="md">
          <ConcessionManager />
        </Tabs.Panel>

        <Tabs.Panel value="theaters" pt="md">
          <TheaterManager />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default AdminPanel;
