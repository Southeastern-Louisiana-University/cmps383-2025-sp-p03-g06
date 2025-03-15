// src/components/TheaterForm.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { theaterApi, TheaterDTO } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Container,
  TextInput,
  NumberInput,
  Button,
  Group,
  Paper,
  Title,
  Alert,
  Stack,
  Loader,
  Box,
  Transition,
  Text,
  Stepper,
  Center,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBuilding,
  IconMapPin,
  IconSofa,
  IconDeviceFloppy,
  IconX,
  IconArrowBack,
  IconCheck,
  IconTheater,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

interface TheaterFormProps {
  mode: "create" | "edit";
}

const TheaterForm = ({ mode }: TheaterFormProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [saveSuccessful, { open: openSaveSuccess }] = useDisclosure(false);
  const theme = useMantineTheme();

  const [theater, setTheater] = useState<Omit<TheaterDTO, "id">>({
    name: "",
    address: "",
    seatCount: 100, // Default value
    managerId: null,
  });

  const [validationErrors, setValidationErrors] = useState({
    name: "",
    address: "",
    seatCount: "",
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchTheater = async () => {
        try {
          const data = await theaterApi.getTheaterById(parseInt(id));
          setTheater({
            name: data.name,
            address: data.address,
            seatCount: data.seatCount,
            managerId: data.managerId,
          });
        } catch (error) {
          setError("Failed to fetch theater details");
          console.error("Error fetching theater:", error);
        } finally {
          setLoading(false);
          setTimeout(() => setMounted(true), 100);
        }
      };

      fetchTheater();
    } else {
      setTimeout(() => setMounted(true), 100);
    }
  }, [id, mode]);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/theaters");
    }
  }, [isAdmin, navigate]);

  const handleChange = (name: string, value: any) => {
    setTheater({
      ...theater,
      [name]: value,
    });

    // Clear validation errors when user types
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  const validateStep = (step: number): boolean => {
    let isValid = true;
    const newErrors = { ...validationErrors };

    if (step === 0) {
      // Validate theater name
      if (!theater.name.trim()) {
        newErrors.name = "Theater name is required";
        isValid = false;
      } else if (theater.name.trim().length > 120) {
        newErrors.name = "Theater name must be 120 characters or less";
        isValid = false;
      }
    } else if (step === 1) {
      // Validate address
      if (!theater.address.trim()) {
        newErrors.address = "Address is required";
        isValid = false;
      }
    } else if (step === 2) {
      // Validate seat count
      if (!theater.seatCount || theater.seatCount <= 0) {
        newErrors.seatCount = "Seat count must be greater than 0";
        isValid = false;
      } else if (theater.seatCount > 1000) {
        newErrors.seatCount = "Maximum seat count is 1000";
        isValid = false;
      }
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((current) => current + 1);
    }
  };

  const prevStep = () => {
    setActiveStep((current) => current - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation check
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      return;
    }

    setLoading(true);

    try {
      if (mode === "create") {
        await theaterApi.createTheater(theater);
      } else if (mode === "edit" && id) {
        await theaterApi.updateTheater(parseInt(id), theater);
      }

      // Show success animation
      openSaveSuccess();

      // Redirect after delay
      setTimeout(() => {
        navigate("/theaters");
      }, 1500);
    } catch (error) {
      setError(`Failed to ${mode} theater`);
      console.error(`Error ${mode}ing theater:`, error);
      setLoading(false);
    }
  };

  if (loading && !saveSuccessful) {
    return (
      <Container mt="xl" ta="center">
        <Loader size="lg" />
        <Title order={4} mt="md">
          {mode === "edit" ? "Loading theater details..." : "Preparing form..."}
        </Title>
      </Container>
    );
  }

  if (!isAdmin) return null; // Don't render anything while redirecting

  return (
    <Container size="md" className="fade-in">
      <Transition
        mounted={mounted}
        transition="slide-up"
        duration={400}
        timingFunction="ease"
      >
        {(styles) => (
          <Paper
            shadow="md"
            p="xl"
            pt="lg"
            radius="md"
            withBorder
            style={{
              ...styles,
              marginTop: "2.5rem",
              borderTop: "4px solid var(--mantine-color-secondary-6)",
              position: "relative",
              overflow: "hidden",
            }}
            className="floating-form"
          >
            {/* Background decorative elements */}
            <Box
              className="slide-in-right"
              style={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: `radial-gradient(circle, var(--mantine-color-secondary-2) 0%, transparent 70%)`,
                opacity: 0.4,
                zIndex: 0,
              }}
            />

            <Box
              className="slide-in-left"
              style={{
                position: "absolute",
                bottom: -40,
                left: -40,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: `radial-gradient(circle, var(--mantine-color-primary-2) 0%, transparent 70%)`,
                opacity: 0.4,
                zIndex: 0,
              }}
            />

            <Transition
              mounted={saveSuccessful}
              transition="fade"
              duration={400}
            >
              {(styles) => (
                <Center
                  style={{
                    ...styles,
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                    backgroundColor: theme.colors.dark
                      ? "rgba(37, 38, 43, 0.9)"
                      : "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  <Box ta="center">
                    <ThemeIcon
                      color="teal"
                      size={80}
                      radius="xl"
                      className="zoom-in"
                    >
                      <IconCheck size={50} stroke={1.5} />
                    </ThemeIcon>
                    <Title order={3} mt="md" className="fade-in delay-100">
                      {mode === "create"
                        ? "Theater Created!"
                        : "Theater Updated!"}
                    </Title>
                    <Text c="dimmed" mt="sm" className="fade-in delay-200">
                      Redirecting to theaters list...
                    </Text>
                  </Box>
                </Center>
              )}
            </Transition>

            <Group justify="center" mb="md" className="slide-in-down">
              <IconTheater
                size={48}
                color="var(--mantine-color-secondary-6)"
                stroke={1.5}
              />
            </Group>

            <Title
              ta="center"
              order={2}
              c="primary.6"
              mb="xl"
              className="fade-in"
            >
              {mode === "create" ? "Add New Theater" : "Edit Theater"}
            </Title>

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Error"
                color="red"
                mb="lg"
                className="shake"
              >
                {error}
              </Alert>
            )}

            <Stepper
              active={activeStep}
              onStepClick={setActiveStep}
              allowNextStepsSelect
              mb="xl"
              className="fade-in delay-200"
            >
              <Stepper.Step
                label="Basic Info"
                description="Theater name"
                icon={<IconBuilding size="1.1rem" />}
                color="primary.6"
              >
                <Box pt="md" pb="lg">
                  <TextInput
                    label="Theater Name"
                    placeholder="Enter theater name"
                    value={theater.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    maxLength={120}
                    error={validationErrors.name}
                    leftSection={<IconBuilding size={16} />}
                    className="slide-in-right"
                  />
                  <Text size="xs" c="dimmed" mt={5}>
                    Max 120 characters
                  </Text>
                </Box>
              </Stepper.Step>

              <Stepper.Step
                label="Location"
                description="Theater address"
                icon={<IconMapPin size="1.1rem" />}
                color="primary.6"
              >
                <Box pt="md" pb="lg">
                  <TextInput
                    label="Theater Address"
                    placeholder="Enter full address"
                    value={theater.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    required
                    error={validationErrors.address}
                    leftSection={<IconMapPin size={16} />}
                    className="slide-in-right"
                  />
                </Box>
              </Stepper.Step>

              <Stepper.Step
                label="Capacity"
                description="Seat count"
                icon={<IconSofa size="1.1rem" />}
                color="primary.6"
              >
                <Box pt="md" pb="lg">
                  <NumberInput
                    label="Seat Count"
                    placeholder="Enter seat count"
                    value={theater.seatCount}
                    onChange={(val) => handleChange("seatCount", val)}
                    required
                    min={1}
                    max={1000}
                    error={validationErrors.seatCount}
                    leftSection={<IconSofa size={16} />}
                    className="slide-in-right"
                  />
                </Box>
              </Stepper.Step>

              <Stepper.Completed>
                <Box my="xl">
                  <Alert
                    icon={<IconCheck size={16} />}
                    title="All set!"
                    color="teal"
                    mb="lg"
                  >
                    Theater information is complete. Review the details and
                    submit.
                  </Alert>

                  <Stack gap="md" my="lg">
                    <Group>
                      <Text fw={500}>Theater Name:</Text>
                      <Text>{theater.name}</Text>
                    </Group>
                    <Group>
                      <Text fw={500}>Address:</Text>
                      <Text>{theater.address}</Text>
                    </Group>
                    <Group>
                      <Text fw={500}>Seat Count:</Text>
                      <Text>{theater.seatCount}</Text>
                    </Group>
                  </Stack>
                </Box>
              </Stepper.Completed>
            </Stepper>

            <Group justify="space-between" mt="xl">
              {activeStep > 0 ? (
                <Button
                  variant="default"
                  onClick={prevStep}
                  leftSection={<IconArrowBack size={16} />}
                  className="slide-in-left"
                >
                  Back
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => navigate("/theaters")}
                  leftSection={<IconX size={16} />}
                  className="slide-in-left"
                >
                  Cancel
                </Button>
              )}

              {activeStep === 3 ? (
                <Button
                  color="primary.6"
                  onClick={handleSubmit}
                  leftSection={<IconDeviceFloppy size={16} />}
                  loading={loading}
                  className="slide-in-right button-push"
                >
                  {mode === "create" ? "Create Theater" : "Update Theater"}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  color="secondary.6"
                  rightSection={<IconCheck size={16} />}
                  className="slide-in-right"
                >
                  Next Step
                </Button>
              )}
            </Group>
          </Paper>
        )}
      </Transition>
    </Container>
  );
};

export default TheaterForm;
