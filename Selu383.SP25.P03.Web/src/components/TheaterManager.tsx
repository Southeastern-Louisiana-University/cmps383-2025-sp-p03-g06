// src/components/managers/TheaterManager.tsx
import { useState, useEffect } from "react";
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
  Alert,
  Stack,
  Loader,
  Center,
  Tabs,
  Badge,
  Select,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconAlertCircle,
  IconBuilding,
  IconDoorEnter,
} from "@tabler/icons-react";
import { TheaterDTO, TheaterRoomDTO, theaterApi } from "../services/api";

const TheaterManager = () => {
  const [activeTab, setActiveTab] = useState<string | null>("theaters");
  const [theaters, setTheaters] = useState<TheaterDTO[]>([]);
  const [rooms, setRooms] = useState<TheaterRoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const handleCreateTheater = () => {
    setIsEditingTheater(false);
    setTheaterFormData({
      id: 0,
      name: "",
      address: "",
      seatCount: 100,
      managerId: null,
    });
    setIsTheaterModalOpen(true);
  };

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
    <Paper p="md" withBorder>
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="theaters" leftSection={<IconBuilding size={16} />}>
            Theaters
          </Tabs.Tab>
          <Tabs.Tab value="rooms" leftSection={<IconDoorEnter size={16} />}>
            Theater Rooms
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="theaters" pt="md">
          <Group justify="space-between" mb="md">
            <Title order={3}>Theater Management</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleCreateTheater}
              color="green"
            >
              Add Theater
            </Button>
          </Group>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              mb="md"
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <TextInput
            placeholder="Search theaters..."
            mb="md"
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Address</Table.Th>
                <Table.Th>Seat Count</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredTheaters.map((theater) => (
                <Table.Tr key={theater.id}>
                  <Table.Td>
                    <Text fw={500}>{theater.name}</Text>
                  </Table.Td>
                  <Table.Td>{theater.address}</Table.Td>
                  <Table.Td>{theater.seatCount}</Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <ActionIcon
                        color="blue"
                        onClick={() => handleEditTheater(theater)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        onClick={() => handleDeleteTheater(theater)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="rooms" pt="md">
          <Group justify="space-between" mb="md">
            <Title order={3}>Theater Rooms</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleCreateRoom}
              color="green"
            >
              Add Room
            </Button>
          </Group>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              mb="md"
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <TextInput
            placeholder="Search rooms..."
            mb="md"
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Theater</Table.Th>
                <Table.Th>Screen Type</Table.Th>
                <Table.Th>Seat Count</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredRooms.map((room) => {
                const theater = theaters.find((t) => t.id === room.theaterId);
                return (
                  <Table.Tr key={room.id}>
                    <Table.Td>
                      <Text fw={500}>{room.name}</Text>
                    </Table.Td>
                    <Table.Td>{theater?.name || "Unknown"}</Table.Td>
                    <Table.Td>
                      <Badge
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
                    <Table.Td>{room.seatCount}</Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <ActionIcon
                          color="blue"
                          onClick={() => handleEditRoom(room)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          onClick={() => handleDeleteRoom(room)}
                        >
                          <IconTrash size={16} />
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

      {/* Create/Edit Theater Modal */}
      <Modal
        opened={isTheaterModalOpen}
        onClose={() => setIsTheaterModalOpen(false)}
        title={
          isEditingTheater
            ? `Edit Theater: ${theaterFormData.name}`
            : "Create New Theater"
        }
        size="md"
      >
        <Stack>
          <TextInput
            label="Theater Name"
            placeholder="Enter theater name"
            value={theaterFormData.name}
            onChange={(e) =>
              handleInputChange("theater", "name", e.currentTarget.value)
            }
            required
          />

          <TextInput
            label="Address"
            placeholder="Enter theater address"
            value={theaterFormData.address}
            onChange={(e) =>
              handleInputChange("theater", "address", e.currentTarget.value)
            }
            required
          />

          <NumberInput
            label="Seat Count"
            placeholder="Enter total seat count"
            value={theaterFormData.seatCount}
            onChange={(value) =>
              handleInputChange("theater", "seatCount", value)
            }
            min={1}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={() => setIsTheaterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="green" onClick={handleSaveTheater}>
              {isEditingTheater ? "Update" : "Create"} Theater
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Create/Edit Room Modal */}
      <Modal
        opened={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        title={
          isEditingRoom
            ? `Edit Room: ${roomFormData.name}`
            : "Create New Theater Room"
        }
        size="md"
      >
        <Stack>
          <TextInput
            label="Room Name"
            placeholder="Enter room name"
            value={roomFormData.name}
            onChange={(e) =>
              handleInputChange("room", "name", e.currentTarget.value)
            }
            required
          />

          <NumberInput
            label="Seat Count"
            placeholder="Enter seat count"
            value={roomFormData.seatCount}
            onChange={(value) => handleInputChange("room", "seatCount", value)}
            min={1}
            required
          />

          <Select
            label="Screen Type"
            placeholder="Select screen type"
            data={["Standard", "IMAX", "Premium", "3D", "VIP", "Drive-In"]}
            value={roomFormData.screenType}
            onChange={(value) =>
              handleInputChange("room", "screenType", value || "Standard")
            }
            required
          />

          <Select
            label="Theater"
            placeholder="Select theater"
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

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setIsRoomModalOpen(false)}>
              Cancel
            </Button>
            <Button color="green" onClick={handleSaveRoom}>
              {isEditingRoom ? "Update" : "Create"} Room
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Theater Confirmation Modal */}
      <Modal
        opened={isTheaterDeleteModalOpen}
        onClose={() => setIsTheaterDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <Text>
          Are you sure you want to delete the theater "{currentTheater?.name}"?
          This action cannot be undone.
        </Text>

        <Group justify="flex-end" mt="md">
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

      {/* Delete Room Confirmation Modal */}
      <Modal
        opened={isRoomDeleteModalOpen}
        onClose={() => setIsRoomDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <Text>
          Are you sure you want to delete the room "{currentRoom?.name}"? This
          action cannot be undone.
        </Text>

        <Group justify="flex-end" mt="md">
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
  );
};

export default TheaterManager;
