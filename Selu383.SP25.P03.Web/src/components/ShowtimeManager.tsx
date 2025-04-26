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
  IconChevronDown,
  IconChevronUp,
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
import { toast } from "react-hot-toast";
import { useMantineTheme } from "@mantine/core";
import MovieRating from "./MovieRating";

interface ExtendedTheaterRoomDTO extends TheaterRoomDTO {
  theaterName: string;
}

interface ExtendedShowtimeDTO extends ShowtimeDTO {
  rating?: string;
  ratingScore?: number;
}

const ShowtimeManager: React.FC = () => {
  const { isManager, isAdmin, isAuthenticated } = useAuth();
  console.log("Auth state:", { isManager, isAdmin, isAuthenticated });
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
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const theme = useMantineTheme();

  // Load data on component mount
  useEffect(() => {
    setLoading(true);
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
    ])
      .catch((err) => {
        setError("Failed to load data");
        console.error("Error fetching data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      console.log("Fetching showtimes...");
      const data = await showtimeApi.getAllShowtimes();
      console.log("Fetched showtimes:", data);
      setShowtimes(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching showtimes:", err);
      setError(
        err.message || "Failed to fetch showtimes. Please try again later."
      );
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShowtime = () => {
    console.log("Opening create showtime modal");
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
    console.log("Opening edit showtime modal for:", showtime);
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
    console.log("Opening delete confirmation modal for:", showtime);
    setCurrentShowtime(showtime);
    setIsDeleteModalOpen(true);
  };

  const checkShowtimeConflict = async (
    startTime: string,
    movieId: number,
    theaterRoomId: number,
    currentShowtimeId?: number
  ): Promise<boolean> => {
    try {
      // Get movie duration for the selected movie
      const movie = await movieApi.getMovieById(movieId);
      if (!movie) {
        throw new Error("Movie not found");
      }

      const newStartTime = new Date(startTime);
      const newEndTime = new Date(
        newStartTime.getTime() + movie.durationMinutes * 60 * 1000
      );

      // Check against existing showtimes in the same room
      const conflicts = showtimes.filter((showtime) => {
        // Skip checking against itself when editing
        if (currentShowtimeId && showtime.id === currentShowtimeId) {
          return false;
        }

        if (showtime.theaterRoomId !== theaterRoomId) {
          return false;
        }

        const existingStartTime = new Date(showtime.startTime);
        const existingEndTime = new Date(showtime.endTime);

        // Check if new showtime overlaps with existing showtime
        return (
          (newStartTime >= existingStartTime &&
            newStartTime < existingEndTime) ||
          (newEndTime > existingStartTime && newEndTime <= existingEndTime) ||
          (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
        );
      });

      return conflicts.length > 0;
    } catch (error) {
      console.error("Error checking showtime conflicts:", error);
      throw new Error("Failed to check showtime conflicts");
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting showtime form:", formData);

      // Validate form data
      if (!formData.movieId || !formData.theaterRoomId || !formData.startTime) {
        const missingFields = [];
        if (!formData.movieId) missingFields.push("Movie");
        if (!formData.theaterRoomId) missingFields.push("Theater Room");
        if (!formData.startTime) missingFields.push("Start Time");

        const errorMessage = `Please fill in all required fields: ${missingFields.join(
          ", "
        )}`;
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Get the selected theater room to extract theater ID
      const selectedRoom = theaterRooms.find(
        (r) => r.value === formData.theaterRoomId.toString()
      );
      if (!selectedRoom) {
        const errorMessage = "Invalid theater room selected";
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Extract theater ID from the room label (e.g., "Premium (Lions Den 2)" -> extract 2)
      const theaterMatch = selectedRoom.label.match(/Lions Den (\d+)/);
      if (!theaterMatch) {
        const errorMessage = "Could not determine theater ID from room label";
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const theaterId = parseInt(theaterMatch[1]);
      if (isNaN(theaterId)) {
        const errorMessage = "Invalid theater ID format";
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Check for time slot conflicts
      const hasConflict = await checkShowtimeConflict(
        formData.startTime,
        formData.movieId,
        formData.theaterRoomId,
        isEditing ? currentShowtime?.id : undefined
      );

      if (hasConflict) {
        const errorMessage =
          "Time slot conflicts with another showtime in this room";
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      setLoading(true);

      if (isEditing && currentShowtime) {
        const updatedShowtime: ShowtimeDTO = {
          id: currentShowtime.id,
          movieId: formData.movieId,
          theaterRoomId: formData.theaterRoomId,
          theaterId: theaterId,
          startTime: formData.startTime,
          endTime: currentShowtime.endTime,
          baseTicketPrice: formData.baseTicketPrice,
          movieTitle:
            movies.find((m) => m.value === formData.movieId.toString())
              ?.label || "",
          theaterRoomName: selectedRoom.label.split("(")[0].trim(),
          theaterName: `Lions Den ${theaterId}`,
        };
        console.log("Updating showtime:", updatedShowtime);
        await showtimeApi.updateShowtime(currentShowtime.id, updatedShowtime);
        toast.success("Showtime updated successfully");
      } else {
        console.log("Fetching movie details for ID:", formData.movieId);
        const movie = await movieApi.getMovieById(formData.movieId);
        console.log("Movie details:", movie);

        if (!movie) {
          throw new Error("Movie not found");
        }

        const startTime = new Date(formData.startTime);
        const endTime = new Date(
          startTime.getTime() + movie.durationMinutes * 60 * 1000
        );

        const newShowtime = {
          movieId: formData.movieId,
          theaterRoomId: formData.theaterRoomId,
          theaterId: theaterId,
          startTime: startTime.toISOString(),
          baseTicketPrice: formData.baseTicketPrice,
        };

        console.log("Creating new showtime:", newShowtime);
        await showtimeApi.createShowtime(newShowtime);
        toast.success("Showtime created successfully");
      }

      await fetchShowtimes();
      setIsModalOpen(false);
      setError(null);
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      const errorMessage = err.message || "Failed to save showtime";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentShowtime) {
      console.error("No showtime selected for deletion");
      return;
    }

    console.log("Starting delete operation for showtime:", currentShowtime);
    try {
      console.log(
        "Making API call to delete showtime with ID:",
        currentShowtime.id
      );
      await showtimeApi.deleteShowtime(currentShowtime.id);
      console.log("Delete API call successful");

      setShowtimes((prevShowtimes) =>
        prevShowtimes.filter((showtime) => showtime.id !== currentShowtime.id)
      );
      console.log("Local state updated - showtime removed");

      setIsDeleteModalOpen(false);
      setCurrentShowtime(null);
      console.log("Modal closed and selected showtime cleared");

      toast.success("Showtime deleted successfully");
      await fetchShowtimes();
      console.log("Showtimes list refreshed");
    } catch (error) {
      console.error("Error deleting showtime:", error);
      toast.error("Failed to delete showtime");
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

  const renderDayDetails = () => {
    if (!selectedDay) return null;

    const dateString = selectedDay.toDateString();
    const dayShowtimes = filteredShowtimes.filter(
      (showtime) => new Date(showtime.startTime).toDateString() === dateString
    );

    return (
      <Stack>
        <Group justify="space-between" mb="md">
          <Title order={3}>{selectedDay.toLocaleDateString()}</Title>
          <Button
            variant="subtle"
            onClick={() => setSelectedDay(null)}
            leftSection={<IconCalendar size={18} />}
          >
            Back to Calendar
          </Button>
        </Group>
        {dayShowtimes.length > 0 ? (
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
              {dayShowtimes.map((showtime) => (
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
                          : getShowtimeStatus(showtime.startTime) === "upcoming"
                          ? "orange"
                          : "green"
                      }
                    >
                      {getShowtimeStatus(showtime.startTime)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>${showtime.baseTicketPrice.toFixed(2)}</Table.Td>
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
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No showtimes scheduled for this day
          </Text>
        )}
      </Stack>
    );
  };

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
        {selectedDay ? (
          renderDayDetails()
        ) : (
          <>
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
                      color={
                        selectedMonth.getMonth() === index ? "red" : "gray"
                      }
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
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <Grid.Col span={1} key={day}>
                    <Paper
                      p="xs"
                      style={{
                        cursor: "pointer",
                        backgroundColor: "var(--mantine-color-dark-6)",
                        minHeight: "140px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                      onClick={() => {
                        setSelectedDay(date);
                        setDateFilter(null);
                      }}
                    >
                      <Text
                        ta="left"
                        fw={700}
                        size="sm"
                        c={isToday ? "red" : undefined}
                        style={{ marginBottom: 4 }}
                      >
                        {day}
                      </Text>
                      {dayShowtimes.length > 0 ? (
                        <Stack gap={4}>
                          {dayShowtimes.slice(0, 3).map((showtime) => (
                            <Badge
                              key={showtime.id}
                              color="blue"
                              size="sm"
                              variant="light"
                              fullWidth
                              styles={{
                                root: {
                                  padding: "4px 8px",
                                  textAlign: "left",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                },
                              }}
                            >
                              <Group gap={4} wrap="nowrap">
                                <IconMovie size={12} />
                                <Text size="xs" truncate>
                                  {new Date(
                                    showtime.startTime
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  - {showtime.movieTitle}
                                </Text>
                              </Group>
                            </Badge>
                          ))}
                          {dayShowtimes.length > 3 && (
                            <Text
                              size="xs"
                              c="dimmed"
                              ta="right"
                              style={{ marginTop: 2 }}
                            >
                              +{dayShowtimes.length - 3} more showtimes
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
          </>
        )}
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

  // Add debug log for render
  console.log("Rendering ShowtimeManager with modal states:", {
    isModalOpen,
    isDeleteModalOpen,
    isEditing,
    currentShowtime,
    formData,
  });

  if (!isManager && !isAdmin) {
    console.log("Access denied - not a manager or admin");
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
    <Paper
      p="xl"
      radius="md"
      style={{
        width: "95%",
        maxWidth: "1600px",
        backgroundColor: "var(--mantine-color-dark-7)",
        margin: "0 auto",
      }}
    >
      <Group justify="space-between" mb="xl">
        <Title order={2} c="white">
          Showtime Management
        </Title>
        <Button
          onClick={handleCreateShowtime}
          leftSection={<IconPlus size={18} />}
          variant="filled"
          color="red"
          radius="md"
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
            <DatePickerInput
              value={dateFilter}
              onChange={(date) => {
                setDateFilter(date);
                if (date) {
                  setViewMode("list");
                }
              }}
              placeholder="Select date"
              clearable
              size="sm"
              radius="md"
              popoverProps={{
                width: "target",
                withinPortal: true,
                styles: {
                  dropdown: {
                    backgroundColor: "var(--mantine-color-dark-7)",
                    padding: "20px",
                    minWidth: "340px",
                    display: "flex",
                    justifyContent: "center",
                  },
                },
              }}
              nextIcon={<IconChevronDown size={18} />}
              previousIcon={<IconChevronUp size={18} />}
              styles={{
                input: {
                  width: "200px",
                },
                calendarHeader: {
                  padding: "8px 0",
                  width: "300px",
                  margin: "0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
                calendarHeaderLevel: {
                  fontSize: "15px",
                  fontWeight: 500,
                  textAlign: "center",
                  flex: 1,
                },
                calendarHeaderControl: {
                  width: "28px",
                  height: "28px",
                  backgroundColor: "var(--mantine-color-dark-6)",
                  margin: "0 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    backgroundColor: "var(--mantine-color-dark-5)",
                  },
                },
                day: {
                  height: "38px",
                  width: "38px",
                  backgroundColor: "var(--mantine-color-dark-6)",
                  margin: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    backgroundColor: "var(--mantine-color-dark-5)",
                  },
                  "&[data-selected]": {
                    backgroundColor: "var(--mantine-color-blue-filled)",
                  },
                },
                weekday: {
                  width: "38px",
                  height: "38px",
                  padding: "8px 0",
                  textAlign: "center",
                },
                month: {
                  padding: "4px 0",
                  width: "300px",
                  margin: "0 auto",
                },
              }}
              dropdownType="popover"
            />
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
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                styles={{
                  th: {
                    backgroundColor: "var(--mantine-color-dark-6)",
                    color: "var(--mantine-color-white)",
                    padding: "12px 16px",
                  },
                  td: {
                    padding: "12px 16px",
                  },
                  tr: {
                    "&:hover": {
                      backgroundColor: "var(--mantine-color-dark-5)",
                    },
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Movie</Table.Th>
                    <Table.Th>Theater</Table.Th>
                    <Table.Th>Room</Table.Th>
                    <Table.Th>Time</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Rating</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>Price</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {showtimes.map((showtime: ExtendedShowtimeDTO) => (
                    <Table.Tr key={showtime.id}>
                      <Table.Td>{showtime.movieTitle}</Table.Td>
                      <Table.Td>{showtime.theaterName}</Table.Td>
                      <Table.Td>{showtime.theaterRoomName}</Table.Td>
                      <Table.Td>
                        {new Date(showtime.startTime).toLocaleTimeString()}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {showtime.rating || "PG"}
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
                      <Table.Td style={{ textAlign: "right" }}>
                        ${showtime.baseTicketPrice.toFixed(2)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Group gap="xs" justify="center">
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

      {(isManager || isAdmin) && (
        <>
          {/* Edit/Create Modal */}
          <Modal
            opened={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={
              <Title
                order={3}
                style={{
                  borderBottom: `2px solid ${theme.colors.red[6]}`,
                  paddingBottom: 5,
                }}
              >
                {isEditing ? "Edit Showtime" : "Create New Showtime"}
              </Title>
            }
            size="lg"
            radius="md"
            padding="xl"
            overlayProps={{
              backgroundOpacity: 0.55,
              blur: 3,
            }}
          >
            <Stack gap="md">
              <Select
                label="Movie"
                placeholder="Select a movie"
                data={movies}
                value={formData.movieId.toString()}
                onChange={(value) =>
                  setFormData({ ...formData, movieId: parseInt(value || "0") })
                }
                required
              />
              <Select
                label="Theater Room"
                placeholder="Select a theater room"
                data={theaterRooms}
                value={formData.theaterRoomId.toString()}
                onChange={(value) => {
                  const room = theaterRooms.find((r) => r.value === value);
                  if (room) {
                    const theaterId = parseInt(room.value.split("-")[0]);
                    setFormData({
                      ...formData,
                      theaterRoomId: parseInt(value || "0"),
                      theaterId,
                    });
                  }
                }}
                required
              />
              <Box>
                <Text size="sm" fw={500} mb={8}>
                  Start Time
                </Text>
                <Group align="flex-start">
                  <DatePickerInput
                    value={new Date(formData.startTime)}
                    onChange={(date) => {
                      if (date) {
                        const currentTime = new Date(formData.startTime);
                        date.setHours(currentTime.getHours());
                        date.setMinutes(currentTime.getMinutes());
                        setFormData({
                          ...formData,
                          startTime: date.toISOString(),
                        });
                      }
                    }}
                    placeholder="Select date"
                    clearable
                    size="sm"
                    radius="md"
                    required
                    popoverProps={{
                      width: "target",
                      withinPortal: true,
                      styles: {
                        dropdown: {
                          backgroundColor: "var(--mantine-color-dark-7)",
                          padding: "20px",
                          minWidth: "340px",
                          display: "flex",
                          justifyContent: "center",
                        },
                      },
                    }}
                    nextIcon={<IconChevronDown size={18} />}
                    previousIcon={<IconChevronUp size={18} />}
                    styles={{
                      input: {
                        width: "200px",
                        backgroundColor: "var(--mantine-color-dark-6)",
                      },
                      calendarHeader: {
                        padding: "8px 0",
                        width: "300px",
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      calendarHeaderLevel: {
                        fontSize: "15px",
                        fontWeight: 500,
                        textAlign: "center",
                        flex: 1,
                      },
                      calendarHeaderControl: {
                        width: "28px",
                        height: "28px",
                        backgroundColor: "var(--mantine-color-dark-6)",
                        margin: "0 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover": {
                          backgroundColor: "var(--mantine-color-dark-5)",
                        },
                      },
                      day: {
                        height: "38px",
                        width: "38px",
                        backgroundColor: "var(--mantine-color-dark-6)",
                        margin: "2px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover": {
                          backgroundColor: "var(--mantine-color-dark-5)",
                        },
                        "&[data-selected]": {
                          backgroundColor: "var(--mantine-color-blue-filled)",
                        },
                      },
                      weekday: {
                        width: "38px",
                        height: "38px",
                        padding: "8px 0",
                        textAlign: "center",
                      },
                      month: {
                        padding: "4px 0",
                        width: "300px",
                        margin: "0 auto",
                      },
                    }}
                    dropdownType="popover"
                  />
                  <Select
                    placeholder="Hour"
                    value={(new Date(formData.startTime).getHours() % 12 || 12)
                      .toString()
                      .padStart(2, "0")}
                    onChange={(value) => {
                      if (value) {
                        const date = new Date(formData.startTime);
                        const currentHour = date.getHours();
                        const isPM = currentHour >= 12;
                        let newHour = parseInt(value);
                        if (isPM && newHour !== 12) newHour += 12;
                        if (!isPM && newHour === 12) newHour = 0;
                        date.setHours(newHour);
                        setFormData({
                          ...formData,
                          startTime: date.toISOString(),
                        });
                      }
                    }}
                    data={Array.from({ length: 12 }, (_, i) => {
                      const hour = i + 1;
                      return {
                        value: hour.toString().padStart(2, "0"),
                        label: hour.toString().padStart(2, "0"),
                      };
                    })}
                    size="sm"
                    style={{ width: "80px" }}
                    styles={{
                      input: {
                        backgroundColor: "var(--mantine-color-dark-6)",
                      },
                    }}
                  />
                  <Text size="sm" style={{ margin: "0 4px" }}>
                    :
                  </Text>
                  <Select
                    placeholder="Minute"
                    value={new Date(formData.startTime)
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}
                    onChange={(value) => {
                      if (value) {
                        const date = new Date(formData.startTime);
                        date.setMinutes(parseInt(value));
                        setFormData({
                          ...formData,
                          startTime: date.toISOString(),
                        });
                      }
                    }}
                    data={Array.from({ length: 60 }, (_, i) => ({
                      value: i.toString().padStart(2, "0"),
                      label: i.toString().padStart(2, "0"),
                    }))}
                    size="sm"
                    style={{ width: "80px" }}
                    styles={{
                      input: {
                        backgroundColor: "var(--mantine-color-dark-6)",
                      },
                    }}
                  />
                  <Select
                    value={
                      new Date(formData.startTime).getHours() >= 12
                        ? "PM"
                        : "AM"
                    }
                    onChange={(value) => {
                      if (value) {
                        const date = new Date(formData.startTime);
                        const currentHour = date.getHours();
                        const currentIsPM = currentHour >= 12;
                        const newIsPM = value === "PM";

                        if (currentIsPM !== newIsPM) {
                          const newHour = (currentHour + 12) % 24;
                          date.setHours(newHour);
                          setFormData({
                            ...formData,
                            startTime: date.toISOString(),
                          });
                        }
                      }
                    }}
                    data={[
                      { value: "AM", label: "AM" },
                      { value: "PM", label: "PM" },
                    ]}
                    size="sm"
                    style={{ width: "70px" }}
                    styles={{
                      input: {
                        backgroundColor: "var(--mantine-color-dark-6)",
                      },
                    }}
                  />
                </Group>
              </Box>
              <NumberInput
                label="Base Ticket Price"
                value={formData.baseTicketPrice}
                onChange={(value: string | number) =>
                  setFormData({
                    ...formData,
                    baseTicketPrice: typeof value === "number" ? value : 0,
                  })
                }
                min={0}
                decimalScale={2}
                required
                styles={{
                  input: {
                    backgroundColor: "var(--mantine-color-dark-6)",
                  },
                }}
              />
              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
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
            title={
              <Title
                order={3}
                style={{
                  borderBottom: `2px solid ${theme.colors.red[6]}`,
                  paddingBottom: 5,
                }}
              >
                Confirm Deletion
              </Title>
            }
            size="md"
            radius="md"
            padding="xl"
            overlayProps={{
              backgroundOpacity: 0.55,
              blur: 3,
            }}
          >
            <Stack gap="md">
              <Text>
                Are you sure you want to delete this showtime? This action
                cannot be undone.
              </Text>
              {currentShowtime && (
                <Box>
                  <Text fw={500}>Showtime Details:</Text>
                  <Text>Movie: {currentShowtime.movieTitle}</Text>
                  <Text>Theater: {currentShowtime.theaterName}</Text>
                  <Text>Room: {currentShowtime.theaterRoomName}</Text>
                  <Text>
                    Time: {new Date(currentShowtime.startTime).toLocaleString()}
                  </Text>
                </Box>
              )}
              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button color="red" onClick={handleDelete}>
                  Delete
                </Button>
              </Group>
            </Stack>
          </Modal>
        </>
      )}
    </Paper>
  );
};

export default ShowtimeManager;
