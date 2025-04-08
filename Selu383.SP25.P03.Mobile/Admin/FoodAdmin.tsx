
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import apiClient from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { ConcessionItem } from '../types/cartTypes';

export default function FoodAdminScreen() {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [items, setItems] = useState<ConcessionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = () => {
        setIsLoading(true);
        apiClient.get('/concessionItems')
            .then((res: { data: ConcessionItem[] }) => {
                setItems(res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                setError('Failed to load concession items');
                setIsLoading(false);
                console.error('Error fetching items:', err);
            });
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAddItem = () => {
        if (!name || !price || !imageUrl) {
            Alert.alert('Missing Fields', 'Name, price, and image URL are required.');
            return;
        }

        apiClient.post('/concessionItems', {
            name,
            description,
            price: parseFloat(price),
            imageUrl,
            isAvailable: true
        }).then(() => {
            fetchItems();
            setName('');
            setDescription('');
            setPrice('');
            setImageUrl('');
            Alert.alert('Success', 'Item added');
        }).catch((err) => {
            Alert.alert('Error', 'Failed to add item');
            console.error('Error adding item:', err);
        });
    };

    const handleDeleteItem = (id: number) => {
        apiClient.delete(`/concessionItems/${id}`)
            .then(() => fetchItems())
            .catch((err) => {
                Alert.alert('Error', 'Failed to delete item');
                console.error('Error deleting item:', err);
            });
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading food items...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Retry" onPress={fetchItems} />
            </View>
        );
    }

    // Admin view with management controls
    if (user?.roles?.includes('Admin')) {
        return (
            <View style={styles.container}>
                <Text style={styles.heading}>Food Management</Text>

                {/* Admin Form */}
                <View style={styles.formContainer}>
                    <Text style={styles.subheading}>Add New Food Item</Text>
                    <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
                    <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
                    <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={styles.input} />
                    <TextInput placeholder="Image URL" value={imageUrl} onChangeText={setImageUrl} style={styles.input} />
                    <Button title="Add Item" onPress={handleAddItem} />
                </View>

                {/* Admin Item List */}
                <Text style={styles.heading}>Current Items ({items.length})</Text>
                {items.length === 0 ? (
                    <Text style={styles.emptyText}>No food items available.</Text>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.itemRow}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                                    <Text style={styles.itemDescription}>{item.description}</Text>
                                </View>
                                <Button title="Delete" onPress={() => handleDeleteItem(item.id)} color="#ff3b30" />
                            </View>
                        )}
                    />
                )}
            </View>
        );
    }

    // Customer view (no management controls)
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Concession Menu</Text>
            {items.length === 0 ? (
                <Text style={styles.emptyText}>No food items available at this time.</Text>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.customerItemCard}>
                            {item.imageUrl && (
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.itemImage}
                                    resizeMode="cover"
                                />
                            )}
                            <View style={styles.itemDetails}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                            </View>
                        </View>
                    )}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 16
    },
    subheading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    formContainer: {
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginVertical: 5,
        borderRadius: 8
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee'
    },
    customerItemCard: {
        flex: 1,
        margin: 8,
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    columnWrapper: {
        justifyContent: 'space-between'
    },
    itemImage: {
        width: '100%',
        height: 120
    },
    itemDetails: {
        padding: 12
    },
    itemInfo: {
        flex: 1
    },
    itemName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4
    },
    itemDescription: {
        color: '#666',
        fontSize: 14,
        marginBottom: 8
    },
    itemPrice: {
        color: '#007bff',
        fontWeight: 'bold',
        fontSize: 16
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        color: 'red',
        marginBottom: 15
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666'
    }
});