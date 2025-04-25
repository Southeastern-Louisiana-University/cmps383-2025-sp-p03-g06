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
  Select,
  Text,
  Stack,
  Loader,
  Center,
  Alert,
  Box,
  SegmentedControl,
  Badge,
  Collapse,
  Divider,
  Grid,
  Card,
} from "@mantine/core";
import { DatePickerInput, MonthPicker, Calendar } from "@mantine/dates";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconAlertCircle,
  IconClock,
  IconCalendar,
  IconList,
  IconFilter,
  IconMovie,
} from "@tabler/icons-react";
import {
  showtimeApi,
  movieApi,
  theaterApi,
  ShowtimeDTO,
  MovieDTO,
  TheaterDTO,
  TheaterRoomDTO,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface ExtendedTheaterRoomDTO extends TheaterRoomDTO {
  theaterName: string;
}

const ShowtimeManager: React.FC = () => {
  const { isManager, isAdmin, isAuthenticated } = useAuth();
  const [showtimes, setShowtimes] = useState<ShowtimeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<{ value: string; label: string }[]>([]);
  const [theaterRooms, setTheaterRooms] = useState<
    { value: string; label: string }[]
  >([]);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "movie" | "theater">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentShowtime, setCurrentShowtime] = useState<ShowtimeDTO | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<
    Omit<
      ShowtimeDTO,
      "id" | "movieTitle" | "theaterRoomName" | "theaterName" | "endTime"
    >
  >({
    movieId: 0,
    theaterRoomId: 0,
    theaterId: 0,
    startTime: new Date().toISOString(),
    baseTicketPrice: 12.99,
  });

  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Load data on component mount
  useEffect(() => {
    Promise.all([
      fetchShowtimes(),
      movieApi.getAllMovies().then((movies) => {
        setMovies(
          movies.map((movie) => ({
            value: movie.id.toString(),
            label: movie.title,
          }))
        );
      }),
      theaterApi.getAllTheaters().then((theaters) => {
        const roomPromises = theaters.map((theater) =>
          theaterApi.getTheaterRoomsById(theater.id).then((rooms) =>
            rooms.map(
              (room) =>
                ({
                  ...room,
                  theaterName: theater.name,
                } as ExtendedTheaterRoomDTO)
            )
          )
        );
        return Promise.all(roomPromises).then((rooms) => {
          const allRooms = rooms.flat();
          setTheaterRooms(
            allRooms.map((room) => ({
              value: room.id.toString(),
              label: `${room.name} (${room.theaterName})`,
            }))
          );
        });
      }),
    ]).catch((err) => {
      setError("Failed to load data");
      console.error("Error fetching data:", err);
    });
  }, []);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const data = await showtimeApi.getAllShowtimes();
      setShowtimes(data);
      setError(null);
    } catch (err) {
      setError("Failed to load showtimes");
      console.error("Error fetching showtimes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShowtime = () => {
    setIsEditing(false);
    setFormData({
      movieId: 0,
      theaterRoomId: 0,
      theaterId: 0,
      startTime: new Date().toISOString(),
      baseTicketPrice: 12.99,
    });
    setIsModalOpen(true);
  };

  const handleEditShowtime = (showtime: ShowtimeDTO) => {
    setIsEditing(true);
    setCurrentShowtime(showtime);
    setFormData({
      movieId: showtime.movieId,
      theaterRoomId: showtime.theaterRoomId,
      theaterId: showtime.theaterId,
      startTime: showtime.startTime,
      baseTicketPrice: showtime.baseTicketPrice,
    });
    setIsModalOpen(true);
  };

  const handleDeleteShowtime = (showtime: ShowtimeDTO) => {
    setCurrentShowtime(showtime);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && currentShowtime) {
        const updatedShowtime: ShowtimeDTO = {
          ...currentShowtime,
          ...formData,
        };
        await showtimeApi.updateShowtime(currentShowtime.id, updatedShowtime);
      } else {
        const newShowtime: ShowtimeDTO = {
          id: 0,
          movieId: formData.movieId,
          theaterRoomId: formData.theaterRoomId,
          theaterId: formData.theaterId,
          startTime: formData.startTime,
          baseTicketPrice: formData.baseTicketPrice,
          movieTitle:
            movies.find((m) => m.value === formData.movieId.toString())
              ?.label || "",
          theaterRoomName:
            theaterRooms.find(
              (r) => r.value === formData.theaterRoomId.toString()
            )?.label || "",
          theaterName:
            theaterRooms
              .find((r) => r.value === formData.theaterRoomId.toString())
              ?.label.split("(")[1]
              .replace(")", "") || "",
          endTime: new Date(
            new Date(formData.startTime).getTime() + 2 * 60 * 60 * 1000
          ).toISOString(),
        };
        await showtimeApi.createShowtime(newShowtime);
      }
      await fetchShowtimes();
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to save showtime");
      console.error("Error saving showtime:", err);
    }
  };

  const handleDelete = async () => {
    if (!currentShowtime) return;
    try {
      await showtimeApi.deleteShowtime(currentShowtime.id);
      await fetchShowtimes();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError("Failed to delete showtime");
      console.error("Error deleting showtime:", err);
    }
  };

  const getShowtimeStatus = (startTime: string) => {
    const now = new Date();
    const showtimeDate = new Date(startTime);
    if (showtimeDate < now) return "past";
    if (showtimeDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000)
      return "upcoming";
    return "future";
  };

  const filteredShowtimes = showtimes
    .filter((showtime) => {
      const matchesSearch =
        showtime.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        showtime.theaterName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        showtime.theaterRoomName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesDate =
        !dateFilter ||
        new Date(showtime.startTime).toDateString() ===
          dateFilter.toDateString();

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const aDate = new Date(a.startTime);
      const bDate = new Date(b.startTime);

      if (sortBy === "date") {
        return sortOrder === "asc"
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }

      if (sortBy === "movie") {
        return sortOrder === "asc"
          ? a.movieTitle.localeCompare(b.movieTitle)
          : b.movieTitle.localeCompare(a.movieTitle);
      }

      if (sortBy === "theater") {
        return sortOrder === "asc"
          ? a.theaterName.localeCompare(b.theaterName)
          : b.theaterName.localeCompare(a.theaterName);
      }

      return 0;
    });

  const groupedShowtimes = filteredShowtimes.reduce((acc, showtime) => {
    const date = new Date(showtime.startTime).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(showtime);
    return acc;
  }, {} as Record<string, ShowtimeDTO[]>);

  const renderCalendarView = () => {
    const daysInMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0
    ).getDate();

    const firstDayOfMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      1
    ).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const showtimesByDay = days.reduce((acc, day) => {
      const date = new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth(),
        day
      );
      const dateString = date.toDateString();
      acc[dateString] = filteredShowtimes.filter(
        (showtime) => new Date(showtime.startTime).toDateString() === dateString
      );
      return acc;
    }, {} as Record<string, ShowtimeDTO[]>);

    return (
      <Stack>
        <Group justify="center" mb="xl">
          <Box>
            <Text fw={700} size="xl" mb="md" ta="center">
              {selectedMonth.getFullYear()}
            </Text>
            <Group gap="xs">
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((month, index) => (
                <Button
                  key={month}
                  variant={
                    selectedMonth.getMonth() === index ? "filled" : "subtle"
                  }
                  color={selectedMonth.getMonth() === index ? "red" : "gray"}
                  onClick={() =>
                    setSelectedMonth(
                      new Date(selectedMonth.getFullYear(), index)
                    )
                  }
                  size="compact-sm"
                >
                  {month}
                </Button>
              ))}
            </Group>
          </Box>
        </Group>
        <Grid>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Grid.Col span={1} key={day}>
              <Text ta="center" c="dimmed" fw={500} mb="md">
                {day}
              </Text>
            </Grid.Col>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <Grid.Col span={1} key={`empty-${index}`} />
          ))}
          {days.map((day) => {
            const date = new Date(
              selectedMonth.getFullYear(),
              selectedMonth.getMonth(),
              day
            );
            const dateString = date.toDateString();
            const dayShowtimes = showtimesByDay[dateString] || [];
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <Grid.Col span={1} key={day}>
                <Paper
                  p="md"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "var(--mantine-color-dark-6)",
                    minHeight: "120px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                  onClick={() => setDateFilter(date)}
                >
                  <Text
                    ta="left"
                    fw={500}
                    size="lg"
                    c={isToday ? "red" : undefined}
                  >
                    {day}
                  </Text>
                  {dayShowtimes.length > 0 ? (
                    <Stack gap={4}>
                      {dayShowtimes.slice(0, 3).map((showtime, index) => (
                        <Badge
                          key={showtime.id}
                          color="blue"
                          size="sm"
                          variant="light"
                          fullWidth
                          leftSection={<IconMovie size={12} />}
                        >
                          {showtime.movieTitle}
                        </Badge>
                      ))}
                      {dayShowtimes.length > 3 && (
                        <Text size="xs" c="dimmed" ta="right">
                          +{dayShowtimes.length - 3} more
                        </Text>
                      )}
                    </Stack>
                  ) : (
                    <Text size="sm" c="dimmed">
                      No showtimes
                    </Text>
                  )}
                </Paper>
              </Grid.Col>
            );
          })}
        </Grid>
      </Stack>
    );
  };

  const handleDateFilter = (date: Date | null) => {
    setDateFilter(date);
    if (date) {
      setViewMode("list");
    }
  };

  // Add this function to handle theater assignments
  const handleTheaterAssignments = (showtime: ShowtimeDTO) => {
    // Implementation for theater assignments
    console.log("Managing theater assignments for showtime:", showtime);
  };

  if (!isManager && !isAdmin) {
    return (
      <Paper p="xl">
        <Stack align="center" gap="md">
          <Title order={2}>Access Denied</Title>
          <Text c="dimmed">
            You do not have permission to access the showtime management page.
          </Text>
          {!isAuthenticated && (
            <Text size="sm" c="dimmed">
              Please log in with a manager or admin account to access this
              feature.
            </Text>
          )}
        </Stack>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Showtime Management</Title>
        <Button
          onClick={handleCreateShowtime}
          leftSection={<IconPlus size={18} />}
          color="red"
        >
          Add Showtime
        </Button>
      </Group>

      <Group mb="md" gap="md">
        <TextInput
          placeholder="Search showtimes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={18} />}
          style={{ flex: 1 }}
        />
        <Button
          variant="light"
          leftSection={<IconFilter size={18} />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
        <SegmentedControl
          value={viewMode}
          onChange={(value) => setViewMode(value as "list" | "calendar")}
          data={[
            { label: "List View", value: "list" },
            { label: "Calendar View", value: "calendar" },
          ]}
        />
      </Group>

      <Collapse in={showFilters}>
        <Group mb="md" gap="md" align="flex-start">
          <Box style={{ flex: 1, maxWidth: "300px" }}>
            <Text size="sm" fw={500} mb={8}>
              Filter by Date
            </Text>
            <Group gap="xs">
              <Button
                variant={!dateFilter ? "filled" : "light"}
                color={!dateFilter ? "red" : "gray"}
                onClick={() => handleDateFilter(null)}
                size="compact-sm"
              >
                All Dates
              </Button>
              <Button
                variant={
                  dateFilter?.toDateString() === new Date().toDateString()
                    ? "filled"
                    : "light"
                }
                color={
                  dateFilter?.toDateString() === new Date().toDateString()
                    ? "red"
                    : "gray"
                }
                onClick={() => handleDateFilter(new Date())}
                size="compact-sm"
              >
                Today
              </Button>
              <Button
                variant="light"
                color={
                  dateFilter &&
                  dateFilter.toDateString() !== new Date().toDateString()
                    ? "red"
                    : "gray"
                }
                onClick={() => setIsDatePickerOpen(true)}
                size="compact-sm"
                rightSection={<IconCalendar size={14} />}
              >
                {dateFilter &&
                dateFilter.toDateString() !== new Date().toDateString()
                  ? dateFilter.toLocaleDateString()
                  : "Pick Date"}
              </Button>
            </Group>
          </Box>

          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={500} mb={8}>
              Sort By
            </Text>
            <Select
              value={sortBy}
              onChange={(value) =>
                setSortBy(value as "date" | "movie" | "theater")
              }
              data={[
                { value: "date", label: "Date" },
                { value: "movie", label: "Movie" },
                { value: "theater", label: "Theater" },
              ]}
              size="sm"
            />
          </Box>

          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={500} mb={8}>
              Sort Order
            </Text>
            <Select
              value={sortOrder}
              onChange={(value) => setSortOrder(value as "asc" | "desc")}
              data={[
                { value: "asc", label: "Ascending" },
                { value: "desc", label: "Descending" },
              ]}
              size="sm"
            />
          </Box>
        </Group>
      </Collapse>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )}

      {viewMode === "list"
        ? Object.entries(groupedShowtimes).map(([date, showtimes]) => (
            <Box key={date} mb="xl">
              <Group justify="space-between" mb="sm">
                <Title order={3}>{new Date(date).toLocaleDateString()}</Title>
                <Badge color="blue" size="lg">
                  {showtimes.length} showtimes
                </Badge>
              </Group>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Movie</Table.Th>
                    <Table.Th>Theater</Table.Th>
                    <Table.Th>Room</Table.Th>
                    <Table.Th>Time</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {showtimes.map((showtime) => (
                    <Table.Tr key={showtime.id}>
                      <Table.Td>{showtime.movieTitle}</Table.Td>
                      <Table.Td>{showtime.theaterName}</Table.Td>
                      <Table.Td>{showtime.theaterRoomName}</Table.Td>
                      <Table.Td>
                        {new Date(showtime.startTime).toLocaleTimeString()}
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            getShowtimeStatus(showtime.startTime) === "past"
                              ? "gray"
                              : getShowtimeStatus(showtime.startTime) ===
                                "upcoming"
                              ? "orange"
                              : "green"
                          }
                        >
                          {getShowtimeStatus(showtime.startTime)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        ${showtime.baseTicketPrice.toFixed(2)}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleEditShowtime(showtime)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDeleteShowtime(showtime)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Divider my="md" />
            </Box>
          ))
        : renderCalendarView()}

      {/* Only render modals if user is a manager */}
      {isManager && (
        <>
          {/* Create/Edit Modal */}
          <Modal
            opened={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={isEditing ? "Edit Showtime" : "Add Showtime"}
            size="lg"
          >
            <Stack>
              <Select
                label="Movie"
                data={movies}
                value={formData.movieId.toString()}
                onChange={(value) =>
                  setFormData({ ...formData, movieId: parseInt(value || "0") })
                }
                required
              />
              <Select
                label="Theater Room"
                data={theaterRooms}
                value={formData.theaterRoomId.toString()}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    theaterRoomId: parseInt(value || "0"),
                  })
                }
                required
              />
              <DatePickerInput
                label="Start Time"
                value={new Date(formData.startTime)}
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    startTime: date?.toISOString() || new Date().toISOString(),
                  })
                }
                required
              />
              <NumberInput
                label="Base Ticket Price"
                value={formData.baseTicketPrice}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    baseTicketPrice: typeof value === "number" ? value : 0,
                  })
                }
                min={0}
                decimalScale={2}
                required
              />
              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button color="red" onClick={handleSubmit}>
                  {isEditing ? "Update" : "Create"}
                </Button>
              </Group>
            </Stack>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            opened={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Delete Showtime"
          >
            <Text>
              Are you sure you want to delete this showtime? This action cannot
              be undone.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button
                variant="default"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button color="red" onClick={handleDelete}>
                Delete
              </Button>
            </Group>
          </Modal>
        </>
      )}

      {/* Add the date picker modal */}
      <Modal
        opened={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        title="Select Date"
        size="auto"
      >
        <DatePickerInput
          value={dateFilter}
          onChange={handleDateFilter}
          size="lg"
          popoverProps={{ withinPortal: false }}
          hideOutsideDates
          styles={(theme) => ({
            input: {
              display: "none",
            },
            calendarHeader: {
              backgroundColor: theme.colors.dark[6],
            },
            day: {
              backgroundColor: theme.colors.dark[6],
            },
          })}
        />
      </Modal>
    </Paper>
  );
};

export default ShowtimeManager;
