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
  Alert,
  Stack,
  Loader,
  Center,
  Tabs,
  Image,
  Badge,
  Switch,
  Textarea,
  Select,
  Box,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconAlertCircle,
  IconCoffee,
  IconCategory,
} from "@tabler/icons-react";
import { concessionApi, ConcessionDTO } from "../services/api";

// Define type interfaces
export interface ConcessionItemDTO {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  isAvailable: boolean;
}

export interface ConcessionCategoryDTO {
  id: number;
  name: string;
}

const ConcessionManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>("items");
  const [items, setItems] = useState<ConcessionItemDTO[]>([]);
  const [categories, setCategories] = useState<ConcessionCategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal and form states
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isItemDeleteModalOpen, setIsItemDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ConcessionItemDTO | null>(
    null
  );
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] =
    useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<ConcessionCategoryDTO | null>(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  // Form state types
  const [itemFormData, setItemFormData] = useState<
    Omit<ConcessionItemDTO, "id">
  >({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    categoryId: 0,
    isAvailable: true,
  });
  const [categoryFormData, setCategoryFormData] = useState<
    Omit<ConcessionCategoryDTO, "id">
  >({
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

  const handleCreateItem = () => {
    setIsEditingItem(false);
    const defaultCat = categories[0]?.id ?? 0;
    setItemFormData({
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      categoryId: defaultCat,
      isAvailable: true,
    });
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: ConcessionItemDTO) => {
    setIsEditingItem(true);
    setItemFormData({
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      imageUrl: item.imageUrl ?? "",
      categoryId: item.categoryId,
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
      setLoading(true);
      if (isEditingItem && currentItem) {
        await concessionApi.updateItem(currentItem.id, {
          ...itemFormData,
          description: itemFormData.description || "",
          imageUrl: itemFormData.imageUrl || "",
        });
      } else {
        await concessionApi.createItem({
          ...itemFormData,
          description: itemFormData.description || "",
          imageUrl: itemFormData.imageUrl || "",
        });
      }
      await fetchData();
      setIsItemModalOpen(false);
    } catch (err) {
      setError("Failed to save item");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setIsEditingCategory(false);
    setCategoryFormData({ name: "" });
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: ConcessionCategoryDTO) => {
    setIsEditingCategory(true);
    setCurrentCategory(cat);
    setCategoryFormData({ name: cat.name });
    setIsCategoryModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!currentCategory) return;
    try {
      setLoading(true);
      await concessionApi.deleteCategory(currentCategory.id);
      await fetchData();
      setIsCategoryDeleteModalOpen(false);
      setCurrentCategory(null);
    } catch (err) {
      setError("Failed to delete category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    try {
      setLoading(true);
      if (isEditingCategory && currentCategory) {
        await concessionApi.updateCategory(
          currentCategory.id,
          categoryFormData.name
        );
      } else {
        await concessionApi.createCategory(categoryFormData.name);
      }
      await fetchData();
      setIsCategoryModalOpen(false);
    } catch (err) {
      setError("Failed to save category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string | null) => {
    setActiveTab(value);
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
                const cat = categories.find((c) => c.id === item.categoryId);
                return (
                  <Table.Tr key={item.id}>
                    <Table.Td style={{ textAlign: "center", padding: "8px" }}>
                      <Image
                        src={
                          item.imageUrl
                            ? `/images/food/${item.imageUrl
                                .split("/")
                                .pop()
                                ?.replace(".jpg", "")}.jpg`
                            : undefined
                        }
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
                  price: typeof val === "string" ? parseFloat(val) : val ?? 0,
                })
              }
              min={0}
              precision={2}
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
