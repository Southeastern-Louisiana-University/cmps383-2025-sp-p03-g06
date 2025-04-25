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
  Image,
  Badge,
  Switch,
  Textarea,
  Select,
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
import { concessionApi } from "../services/api";

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

const ConcessionManager = () => {
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
    <Paper p="md" withBorder>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List>
          <Tabs.Tab value="items" leftSection={<IconCoffee size={16} />}>
            Items
          </Tabs.Tab>
          <Tabs.Tab value="categories" leftSection={<IconCategory size={16} />}>
            Categories
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="items" pt="md">
          <Group justify="space-between" mb="md">
            <Title order={3}>Concession Items</Title>
            <Button leftSection={<IconPlus />} onClick={handleCreateItem}>
              Add Item
            </Button>
          </Group>

          {error && (
            <Alert icon={<IconAlertCircle />} color="red" mb="md">
              {error}
            </Alert>
          )}

          <TextInput
            placeholder="Search items..."
            mb="md"
            leftSection={<IconSearch />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />

          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter((i) =>
                  i.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => {
                  const cat = categories.find((c) => c.id === item.categoryId);
                  return (
                    <tr key={item.id}>
                      <td>
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
                          fallbackSrc="https://placehold.co/400x200/gray/white?text=Food+Item"
                        />
                      </td>
                      <td>
                        <Text fw={500}>{item.name}</Text>
                      </td>
                      <td>
                        <Badge>${item.price.toFixed(2)}</Badge>
                      </td>
                      <td>{cat?.name || "Unknown"}</td>
                      <td>
                        <Badge color={item.isAvailable ? "green" : "red"}>
                          {item.isAvailable ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td>
                        <Group gap="xs">
                          <ActionIcon
                            color="blue"
                            onClick={() => handleEditItem(item)}
                          >
                            <IconEdit />
                          </ActionIcon>
                          <ActionIcon
                            color="red"
                            onClick={() => {
                              setCurrentItem(item);
                              setIsItemDeleteModalOpen(true);
                            }}
                          >
                            <IconTrash />
                          </ActionIcon>
                        </Group>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="categories" pt="md">
          <Group justify="space-between" mb="md">
            <Title order={3}>Categories</Title>
            <Button leftSection={<IconPlus />} onClick={handleCreateCategory}>
              Add Category
            </Button>
          </Group>

          {error && (
            <Alert icon={<IconAlertCircle />} color="red" mb="md">
              {error}
            </Alert>
          )}
          <TextInput
            placeholder="Search categories..."
            mb="md"
            leftSection={<IconSearch />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />

          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories
                .filter((c) =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((cat) => {
                  const count = items.filter(
                    (i) => i.categoryId === cat.id
                  ).length;
                  return (
                    <tr key={cat.id}>
                      <td>
                        <Text fw={500}>{cat.name}</Text>
                      </td>
                      <td>{count}</td>
                      <td>
                        <Group gap="xs">
                          <ActionIcon
                            color="blue"
                            onClick={() => handleEditCategory(cat)}
                          >
                            <IconEdit />
                          </ActionIcon>
                          <ActionIcon
                            color="red"
                            disabled={count > 0}
                            onClick={() => {
                              setCurrentCategory(cat);
                              setIsCategoryDeleteModalOpen(true);
                            }}
                            title={count > 0 ? "Has items" : undefined}
                          >
                            <IconTrash />
                          </ActionIcon>
                        </Group>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>

      {/* Item Modal */}
      <Modal
        opened={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={isEditingItem ? "Edit Item" : "New Item"}
        size="md"
      >
        <Stack>
          <TextInput
            label="Name"
            value={itemFormData.name}
            onChange={(e) =>
              setItemFormData({ ...itemFormData, name: e.currentTarget.value })
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
            onChange={(val: number | string) =>
              setItemFormData({
                ...itemFormData,
                price: typeof val === "string" ? parseFloat(val) : val ?? 0,
              })
            }
            min={0.01}
            step={0.01}
            required
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
          <Group justify="right">
            <Button variant="outline" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>
              {isEditingItem ? "Update" : "Create"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modals */}
      <Modal
        opened={isItemDeleteModalOpen}
        onClose={() => setIsItemDeleteModalOpen(false)}
        title="Delete Item?"
        size="sm"
      >
        <Text>Are you sure you want to delete "{currentItem?.name}"?</Text>
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

      <Modal
        opened={isCategoryDeleteModalOpen}
        onClose={() => setIsCategoryDeleteModalOpen(false)}
        title="Delete Category?"
        size="sm"
      >
        <Text>
          Are you sure you want to delete "{currentCategory?.name}" category?
        </Text>
        <Group justify="right" mt="md">
          <Button
            variant="outline"
            onClick={() => setIsCategoryDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button color="red" onClick={confirmDeleteCategory}>
            Delete
          </Button>
        </Group>
      </Modal>

      {/* Category Modal */}
      <Modal
        opened={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={isEditingCategory ? "Edit Category" : "New Category"}
        size="md"
      >
        <Stack>
          <TextInput
            label="Name"
            value={categoryFormData.name}
            onChange={(e) =>
              setCategoryFormData({ name: e.currentTarget.value })
            }
            required
          />
          <Group justify="right">
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {isEditingCategory ? "Update" : "Create"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
};

export default ConcessionManager;
