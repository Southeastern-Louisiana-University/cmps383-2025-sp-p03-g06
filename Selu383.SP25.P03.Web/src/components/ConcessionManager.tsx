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
  Image,
  Badge,
  Switch,
  Textarea,
  Select,
  Box,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash, IconSearch } from "@tabler/icons-react";
import { concessionApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Define type interfaces
export interface ConcessionItemDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  isAvailable: boolean;
}

export interface ConcessionCategoryDTO {
  id: number;
  name: string;
}

const ConcessionManager: React.FC = () => {
  const { isManager, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not admin/manager
  useEffect(() => {
    if (!isAuthenticated || (!isAdmin && !isManager)) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, isAdmin, isManager, navigate]);

  const [] = useState<string | null>("items");
  const [items, setItems] = useState<ConcessionItemDTO[]>([]);
  const [categories, setCategories] = useState<ConcessionCategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal and form states
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isItemDeleteModalOpen, setIsItemDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ConcessionItemDTO | null>(
    null
  );
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [] = useState(false);
  const [] = useState(false);
  const [] = useState<ConcessionCategoryDTO | null>(null);
  const [] = useState(false);

  // Form state types
  const [itemFormData, setItemFormData] = useState<
    Omit<ConcessionItemDTO, "id">
  >({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    categoryId: 0,
    categoryName: "",
    isAvailable: true,
  });
  const [] = useState<Omit<ConcessionCategoryDTO, "id">>({
    name: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        concessionApi.getItems(),
        concessionApi.getCategories(),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError("Failed to load concession data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: ConcessionItemDTO) => {
    setIsEditingItem(true);
    setItemFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      isAvailable: item.isAvailable,
    });
    setCurrentItem(item);
    setIsItemModalOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!currentItem) return;
    try {
      setLoading(true);
      await concessionApi.deleteItem(currentItem.id);
      await fetchData();
      setIsItemDeleteModalOpen(false);
      setCurrentItem(null);
    } catch (err) {
      setError("Failed to delete item");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    try {
      if (!itemFormData.name || !itemFormData.categoryId) {
        setError("Name and category are required");
        return;
      }

      setLoading(true);
      const category = categories.find((c) => c.id === itemFormData.categoryId);
      if (!category) {
        setError("Invalid category selected");
        return;
      }

      const itemToSave = {
        ...itemFormData,
        description: itemFormData.description || "",
        imageUrl: itemFormData.imageUrl || "",
        categoryName: category.name,
      };

      if (isEditingItem && currentItem) {
        await concessionApi.updateItem(currentItem.id, {
          ...itemToSave,
          id: currentItem.id,
        });
      } else {
        await concessionApi.createItem(itemToSave);
      }
      await fetchData();
      setIsItemModalOpen(false);
      setError(null);
    } catch (err) {
      setError("Failed to save item");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !items.length && !categories.length) {
    return (
      <Center>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <Box p="xl">
      <Paper p="xl" radius="md">
        <Group justify="space-between" mb="xl">
          <Title order={2}>Concession Management</Title>
          <Button
            onClick={() => {
              setIsEditingItem(false);
              setCurrentItem(null);
              setItemFormData({
                name: "",
                description: "",
                price: 0,
                imageUrl: "",
                categoryId: 0,
                categoryName: "",
                isAvailable: true,
              });
              setIsItemModalOpen(true);
            }}
            leftSection={<IconPlus size={18} />}
            color="red"
          >
            Add Concession
          </Button>
        </Group>

        <TextInput
          placeholder="Search concessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          mb="lg"
          leftSection={<IconSearch size={18} />}
        />

        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "80px" }}></Table.Th>
              <Table.Th style={{ width: "25%" }}>Name</Table.Th>
              <Table.Th style={{ width: "45%" }}>Description</Table.Th>
              <Table.Th style={{ width: "120px", textAlign: "center" }}>
                Price
              </Table.Th>
              <Table.Th style={{ width: "120px", textAlign: "center" }}>
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items
              .filter((i) =>
                i.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item) => {
                return (
                  <Table.Tr key={item.id}>
                    <Table.Td style={{ textAlign: "center", padding: "8px" }}>
                      <Image
                        src={item.imageUrl || undefined}
                        h={60}
                        w={60}
                        fit="cover"
                        alt={item.name}
                      />
                    </Table.Td>
                    <Table.Td style={{ padding: "16px" }}>
                      <Text fw={500}>{item.name}</Text>
                    </Table.Td>
                    <Table.Td style={{ padding: "16px" }}>
                      <Text>{item.description}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge>${item.price.toFixed(2)}</Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Group gap={8} justify="center">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEditItem(item)}
                          title="Edit"
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => {
                            setCurrentItem(item);
                            setIsItemDeleteModalOpen(true);
                          }}
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

        {/* Concession Form Modal */}
        <Modal
          opened={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          title={isEditingItem ? "Edit Concession" : "New Concession"}
          size="lg"
        >
          <Stack>
            <TextInput
              label="Name"
              value={itemFormData.name}
              onChange={(e) =>
                setItemFormData({
                  ...itemFormData,
                  name: e.currentTarget.value,
                })
              }
              required
            />
            <Textarea
              label="Description"
              value={itemFormData.description}
              onChange={(e) =>
                setItemFormData({
                  ...itemFormData,
                  description: e.currentTarget.value,
                })
              }
            />
            <NumberInput
              label="Price"
              value={itemFormData.price}
              onChange={(val) =>
                setItemFormData({
                  ...itemFormData,
                  price: typeof val === "number" ? val : 0,
                })
              }
              min={0}
              decimalScale={2}
              required
              prefix="$"
            />
            <TextInput
              label="Image URL"
              value={itemFormData.imageUrl}
              onChange={(e) =>
                setItemFormData({
                  ...itemFormData,
                  imageUrl: e.currentTarget.value,
                })
              }
            />
            <Select
              label="Category"
              data={categories.map((c) => ({
                value: c.id.toString(),
                label: c.name,
              }))}
              value={itemFormData.categoryId.toString()}
              onChange={(val) =>
                setItemFormData({ ...itemFormData, categoryId: Number(val) })
              }
              required
            />
            <Switch
              label="Available"
              checked={itemFormData.isAvailable}
              onChange={(e) =>
                setItemFormData({
                  ...itemFormData,
                  isAvailable: e.currentTarget.checked,
                })
              }
            />
            <Group justify="right" mt="md">
              <Button
                variant="outline"
                onClick={() => setIsItemModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveItem} color="red">
                {isEditingItem ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          opened={isItemDeleteModalOpen}
          onClose={() => setIsItemDeleteModalOpen(false)}
          title="Delete Concession"
          size="sm"
        >
          <Text>
            Are you sure you want to delete "{currentItem?.name}"? This action
            cannot be undone.
          </Text>
          <Group justify="right" mt="md">
            <Button
              variant="outline"
              onClick={() => setIsItemDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteItem}>
              Delete
            </Button>
          </Group>
        </Modal>
      </Paper>
    </Box>
  );
};

export default ConcessionManager;
