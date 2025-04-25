// src/components/managers/TheaterManager.tsx
import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Group,
  Button,
  Table,
  ActionIcon,
  Modal,
  TextInput,
  NumberInput,
  Text,
  Stack,
  Loader,
  Center,
  Tabs,
  Badge,
  Select,
  Box,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconBuilding,
  IconDoorEnter,
} from "@tabler/icons-react";
import { TheaterDTO, TheaterRoomDTO, theaterApi } from "../services/api";

const TheaterManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>("theaters");
  const [theaters, setTheaters] = useState<TheaterDTO[]>([]);
  const [rooms, setRooms] = useState<TheaterRoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states for theaters
  const [isTheaterModalOpen, setIsTheaterModalOpen] = useState(false);
  const [isTheaterDeleteModalOpen, setIsTheaterDeleteModalOpen] =
    useState(false);
  const [currentTheater, setCurrentTheater] = useState<TheaterDTO | null>(null);
  const [isEditingTheater, setIsEditingTheater] = useState(false);

  // Modal states for rooms
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isRoomDeleteModalOpen, setIsRoomDeleteModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<TheaterRoomDTO | null>(null);
  const [isEditingRoom, setIsEditingRoom] = useState(false);

  // Form states
  const [theaterFormData, setTheaterFormData] = useState({
    id: 0,
    name: "",
    address: "",
    seatCount: 100,
    managerId: null as number | null,
  });

  const [roomFormData, setRoomFormData] = useState({
    id: 0,
    name: "",
    theaterId: 0,
    seatCount: 50,
    screenType: "Standard",
  });

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const theatersData = await theaterApi.getAllTheaters();
      setTheaters(theatersData);

      // Fetch rooms for each theater
      const allRooms: TheaterRoomDTO[] = [];
      for (const theater of theatersData) {
        try {
          const theaterRooms = await theaterApi.getTheaterRoomsById(theater.id);
          allRooms.push(...theaterRooms);
        } catch (err) {
          console.error(`Error fetching rooms for theater ${theater.id}:`, err);
        }
      }

      setRooms(allRooms);
      setError(null);
    } catch (err) {
      setError("Failed to load theater data");
      console.error("Error fetching theater data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Theater handlers

  const handleEditTheater = (theater: TheaterDTO) => {
    setIsEditingTheater(true);
    setTheaterFormData({
      id: theater.id,
      name: theater.name,
      address: theater.address,
      seatCount: theater.seatCount,
      managerId: theater.managerId,
    });
    setIsTheaterModalOpen(true);
  };

  const handleDeleteTheater = (theater: TheaterDTO) => {
    setCurrentTheater(theater);
    setIsTheaterDeleteModalOpen(true);
  };

  const confirmDeleteTheater = async () => {
    if (!currentTheater) return;

    try {
      setLoading(true);
      await theaterApi.deleteTheater(currentTheater.id);
      await fetchData();
      setIsTheaterDeleteModalOpen(false);
      setCurrentTheater(null);
    } catch (err) {
      setError("Failed to delete theater");
      console.error("Error deleting theater:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheater = async () => {
    try {
      // Validate required fields
      if (
        !theaterFormData.name ||
        !theaterFormData.address ||
        !theaterFormData.seatCount
      ) {
        setError("Please fill in all required fields");
        return;
      }

      setLoading(true);
      console.log("Saving theater with data:", theaterFormData);

      if (isEditingTheater) {
        const updateData = {
          id: theaterFormData.id,
          name: theaterFormData.name,
          address: theaterFormData.address,
          seatCount: theaterFormData.seatCount,
          managerId: theaterFormData.managerId,
        };
        console.log("Updating theater:", updateData);
        await theaterApi.updateTheater(theaterFormData.id, updateData);
      } else {
        const createData = {
          name: theaterFormData.name,
          address: theaterFormData.address,
          seatCount: theaterFormData.seatCount,
          managerId: theaterFormData.managerId,
        };
        console.log("Creating new theater:", createData);
        await theaterApi.createTheater(createData);
      }

      await fetchData();
      setIsTheaterModalOpen(false);
      setError(null);
    } catch (err: any) {
      console.error("Error in handleSaveTheater:", err);
      setError(
        err.message ||
          `Failed to ${isEditingTheater ? "update" : "create"} theater`
      );
    } finally {
      setLoading(false);
    }
  };

  // Room handlers
  const handleCreateRoom = () => {
    setIsEditingRoom(false);

    // Default to the first theater if available
    const defaultTheaterId = theaters.length > 0 ? theaters[0].id : 0;

    setRoomFormData({
      id: 0,
      name: "",
      theaterId: defaultTheaterId,
      seatCount: 50,
      screenType: "Standard",
    });

    setIsRoomModalOpen(true);
  };

  const handleEditRoom = (room: TheaterRoomDTO) => {
    setIsEditingRoom(true);
    setRoomFormData({
      id: room.id,
      name: room.name,
      theaterId: room.theaterId,
      seatCount: room.seatCount,
      screenType: room.screenType || "Standard",
    });
    setIsRoomModalOpen(true);
  };

  const handleDeleteRoom = (room: TheaterRoomDTO) => {
    setCurrentRoom(room);
    setIsRoomDeleteModalOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (!currentRoom) return;

    try {
      setLoading(true);
      await theaterApi.deleteTheaterRoom(currentRoom.id);
      await fetchData();
      setIsRoomDeleteModalOpen(false);
      setCurrentRoom(null);
    } catch (err) {
      setError("Failed to delete room");
      console.error("Error deleting room:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoom = async () => {
    try {
      setLoading(true);
      if (isEditingRoom) {
        await theaterApi.updateTheaterRoom(roomFormData.id, roomFormData);
      } else {
        await theaterApi.createTheaterRoom(roomFormData);
      }
      await fetchData();
      setIsRoomModalOpen(false);
    } catch (err) {
      setError(`Failed to ${isEditingRoom ? "update" : "create"} room`);
      console.error("Error saving room:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    formType: "theater" | "room",
    name: string,
    value: any
  ) => {
    if (formType === "theater") {
      setTheaterFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setRoomFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Filter theaters based on search query
  const filteredTheaters = theaters.filter(
    (theater) =>
      theater.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theater.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter rooms based on search query
  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.screenType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theaters
        .find((t) => t.id === room.theaterId)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (loading && theaters.length === 0 && rooms.length === 0) {
    return (
      <Center>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <Box p="xl">
      <Paper p="xl" radius="md">
        <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
          <Tabs.List>
            <Tabs.Tab value="theaters" leftSection={<IconBuilding size={16} />}>
              Theaters
            </Tabs.Tab>
            <Tabs.Tab value="rooms" leftSection={<IconDoorEnter size={16} />}>
              Theater Rooms
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="theaters">
            <Group justify="space-between" mb="xl" mt="lg">
              <Title order={2}>Theater Management</Title>
              <Button
                onClick={() => {
                  setIsEditingTheater(false);
                  setTheaterFormData({
                    id: 0,
                    name: "",
                    address: "",
                    seatCount: 100,
                    managerId: null,
                  });
                  setIsTheaterModalOpen(true);
                }}
                leftSection={<IconPlus size={18} />}
                color="red"
              >
                Add Theater
              </Button>
            </Group>

            <TextInput
              placeholder="Search theaters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              mb="lg"
              leftSection={<IconSearch size={18} />}
            />

            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: "25%" }}>Name</Table.Th>
                  <Table.Th style={{ width: "45%" }}>Address</Table.Th>
                  <Table.Th style={{ width: "120px", textAlign: "center" }}>
                    Seats
                  </Table.Th>
                  <Table.Th style={{ width: "120px", textAlign: "center" }}>
                    Actions
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredTheaters.map((theater) => (
                  <Table.Tr key={theater.id}>
                    <Table.Td style={{ padding: "16px" }}>
                      <Text fw={500}>{theater.name}</Text>
                    </Table.Td>
                    <Table.Td style={{ padding: "16px" }}>
                      <Text>{theater.address}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge size="lg" variant="light" color="blue">
                        {theater.seatCount}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Group gap={8} justify="center">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEditTheater(theater)}
                          title="Edit"
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDeleteTheater(theater)}
                          title="Delete"
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>

          <Tabs.Panel value="rooms">
            <Group justify="space-between" mb="xl" mt="lg">
              <Title order={2}>Theater Rooms</Title>
              <Button
                onClick={handleCreateRoom}
                leftSection={<IconPlus size={18} />}
                color="red"
              >
                Add Room
              </Button>
            </Group>

            <TextInput
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              mb="lg"
              leftSection={<IconSearch size={18} />}
            />

            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: "20%" }}>Name</Table.Th>
                  <Table.Th style={{ width: "25%" }}>Theater</Table.Th>
                  <Table.Th style={{ width: "15%", textAlign: "center" }}>
                    Screen Type
                  </Table.Th>
                  <Table.Th style={{ width: "120px", textAlign: "center" }}>
                    Seats
                  </Table.Th>
                  <Table.Th style={{ width: "120px", textAlign: "center" }}>
                    Actions
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredRooms.map((room) => {
                  const theater = theaters.find((t) => t.id === room.theaterId);
                  return (
                    <Table.Tr key={room.id}>
                      <Table.Td style={{ padding: "16px" }}>
                        <Text fw={500}>{room.name}</Text>
                      </Table.Td>
                      <Table.Td style={{ padding: "16px" }}>
                        <Text>{theater?.name || "Unknown"}</Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge
                          size="lg"
                          variant="light"
                          color={
                            room.screenType === "IMAX"
                              ? "blue"
                              : room.screenType === "Premium"
                              ? "yellow"
                              : room.screenType === "3D"
                              ? "grape"
                              : room.screenType === "VIP"
                              ? "red"
                              : room.screenType === "Drive-In"
                              ? "orange"
                              : "green"
                          }
                        >
                          {room.screenType || "Standard"}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge size="lg" variant="light" color="blue">
                          {room.seatCount}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Group gap={8} justify="center">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleEditRoom(room)}
                            title="Edit"
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleDeleteRoom(room)}
                            title="Delete"
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>
        </Tabs>

        {/* Theater Form Modal */}
        <Modal
          opened={isTheaterModalOpen}
          onClose={() => setIsTheaterModalOpen(false)}
          title={isEditingTheater ? "Edit Theater" : "New Theater"}
          size="lg"
        >
          <Stack>
            <TextInput
              label="Name"
              value={theaterFormData.name}
              onChange={(e) =>
                handleInputChange("theater", "name", e.currentTarget.value)
              }
              required
            />
            <TextInput
              label="Address"
              value={theaterFormData.address}
              onChange={(e) =>
                handleInputChange("theater", "address", e.currentTarget.value)
              }
              required
            />
            <NumberInput
              label="Seat Count"
              value={theaterFormData.seatCount}
              onChange={(value) =>
                handleInputChange("theater", "seatCount", value)
              }
              min={1}
              required
            />
            <Group justify="right" mt="md">
              <Button
                variant="outline"
                onClick={() => setIsTheaterModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveTheater} color="red">
                {isEditingTheater ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          opened={isTheaterDeleteModalOpen}
          onClose={() => setIsTheaterDeleteModalOpen(false)}
          title="Delete Theater"
          size="sm"
        >
          <Text>
            Are you sure you want to delete "{currentTheater?.name}"? This
            action cannot be undone.
          </Text>
          <Group justify="right" mt="md">
            <Button
              variant="outline"
              onClick={() => setIsTheaterDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteTheater}>
              Delete
            </Button>
          </Group>
        </Modal>

        {/* Room Form Modal */}
        <Modal
          opened={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          title={isEditingRoom ? "Edit Theater Room" : "New Theater Room"}
          size="lg"
        >
          <Stack>
            <TextInput
              label="Room Name"
              value={roomFormData.name}
              onChange={(e) =>
                handleInputChange("room", "name", e.currentTarget.value)
              }
              required
            />
            <Select
              label="Theater"
              data={theaters.map((theater) => ({
                value: theater.id.toString(),
                label: theater.name,
              }))}
              value={roomFormData.theaterId.toString()}
              onChange={(value) =>
                handleInputChange("room", "theaterId", parseInt(value || "0"))
              }
              required
            />
            <NumberInput
              label="Seat Count"
              value={roomFormData.seatCount}
              onChange={(value) =>
                handleInputChange("room", "seatCount", value)
              }
              min={1}
              required
            />
            <Select
              label="Screen Type"
              data={["Standard", "IMAX", "Premium", "3D", "VIP", "Drive-In"]}
              value={roomFormData.screenType}
              onChange={(value) =>
                handleInputChange("room", "screenType", value || "Standard")
              }
              required
            />
            <Group justify="right" mt="md">
              <Button
                variant="outline"
                onClick={() => setIsRoomModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveRoom} color="red">
                {isEditingRoom ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Room Delete Modal */}
        <Modal
          opened={isRoomDeleteModalOpen}
          onClose={() => setIsRoomDeleteModalOpen(false)}
          title="Delete Theater Room"
          size="sm"
        >
          <Text>
            Are you sure you want to delete "{currentRoom?.name}"? This action
            cannot be undone.
          </Text>
          <Group justify="right" mt="md">
            <Button
              variant="outline"
              onClick={() => setIsRoomDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteRoom}>
              Delete
            </Button>
          </Group>
        </Modal>
      </Paper>
    </Box>
  );
};

export default TheaterManager;
