
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import apiClient from '../hooks/useApi';
import { ConcessionItem } from '../types/cartTypes';
import { Link } from 'expo-router';

export default function FoodMenuScreen() {
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
                setError('Failed to load menu items');
                setIsLoading(false);
                console.error('Error fetching menu:', err);
            });
    };

    useEffect(() => {
        fetchItems();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading menu...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchItems}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Concession Menu</Text>

            {items.length === 0 ? (
                <Text style={styles.emptyText}>No items available at this time.</Text>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.itemCard}>
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
                                <View style={styles.itemFooter}>
                                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                                    <TouchableOpacity style={styles.addButton}>
                                        <Text style={styles.addButtonText}>Add to Cart</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}

            <Link href="/(customer)/cart" asChild>
                <TouchableOpacity style={styles.cartButton}>
                    <Text style={styles.cartButtonText}>View Cart</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f8f8'
    },
    heading: {
        fontSize: 28,
        fontWeight: 'bold',
        marginVertical: 16,
        textAlign: 'center'
    },
    itemCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    itemImage: {
        width: '100%',
        height: 180
    },
    itemDetails: {
        padding: 16
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6
    },
    itemDescription: {
        color: '#666',
        marginBottom: 16,
        lineHeight: 20
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    addButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    cartButton: {
        backgroundColor: '#28a745',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 16
    },
    cartButtonText: {
        color: 'white',
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
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center'
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 40
    },
    retryButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8
    },
    retryText: {
        color: 'white',
        fontWeight: 'bold'
    }
});