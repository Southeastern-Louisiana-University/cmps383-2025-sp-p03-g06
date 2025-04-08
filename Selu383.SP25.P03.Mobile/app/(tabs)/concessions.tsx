
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import apiClient from '../../hooks/useApi';
import FoodMenu from '../../components/Foodmenu';
import Cart from '../../components/cart';
import { ConcessionItem, CartItem } from '../../types/cartTypes';

interface RouteParams {
    showtimeId?: number;
}

const ConcessionsScreen: React.FC = () => {
    
    const route = useRoute();
    const params = route.params as RouteParams | undefined;
    const showtimeId = params?.showtimeId;

    const [items, setItems] = useState<ConcessionItem[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [seatNumber, setSeatNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchConcessionItems();
    }, []);

    const fetchConcessionItems = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/concessionItems');
            setItems(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to load concession items:', err);
            setError('Unable to load menu items. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectItem = (item: ConcessionItem) => {
        setCartItems(prev => {
            const existing = prev.find(ci => ci.id === item.id);
            if (existing) {
                return prev.map(ci =>
                    ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
                );
            } else {
                return [...prev, { ...item, quantity: 1 }];
            }
        });
    };

    const increaseQuantity = (item: CartItem) => {
        setCartItems(prev =>
            prev.map(ci =>
                ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
            )
        );
    };

    const decreaseQuantity = (item: CartItem) => {
        setCartItems(prev =>
            prev.map(ci => {
                if (ci.id === item.id) {
                    const newQuantity = ci.quantity - 1;
                    return newQuantity > 0 ? { ...ci, quantity: newQuantity } : ci;
                }
                return ci;
            })
        );
    };

    const removeItem = (item: CartItem) => {
        setCartItems(prev => prev.filter(ci => ci.id !== item.id));
    };

    const placeOrder = async () => {
        if (!seatNumber.trim()) {
            Alert.alert('Missing Information', 'Please enter your seat number.');
            return;
        }

        try {
            setLoading(true);
            await apiClient.post('/concessionOrders', {
                orderItems: cartItems.map(i => ({
                    concessionItemId: i.id,
                    quantity: i.quantity
                })),
                seatNumber,
                showtimeId
            });

            Alert.alert(
                'Order Successful',
                `Your order has been placed and will be delivered to seat ${seatNumber}.`
            );

            // Reset cart and seat number after successful order
            setCartItems([]);
            setSeatNumber('');
        } catch (err) {
            console.error('Failed to place order:', err);
            Alert.alert(
                'Order Failed',
                'Unable to place your order. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading && items.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading menu items...</Text>
            </View>
        );
    }

    if (error && items.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Try Again" onPress={fetchConcessionItems} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>
                Concessions
                {showtimeId ? ' for Show #' + showtimeId : ''}
            </Text>

            <FoodMenu items={items} onSelectItem={handleSelectItem} />

            {cartItems.length > 0 ? (
                <>
                    <Cart
                        items={cartItems}
                        onIncrease={increaseQuantity}
                        onDecrease={decreaseQuantity}
                        onRemove={removeItem}
                    />

                    <View style={styles.checkoutSection}>
                        <Text style={styles.sectionTitle}>Delivery Details</Text>
                        <TextInput
                            placeholder="Enter seat number (e.g., C12)"
                            value={seatNumber}
                            onChangeText={setSeatNumber}
                            style={styles.input}
                        />
                        <Button
                            title={loading ? "Processing..." : "Place Order"}
                            onPress={placeOrder}
                            disabled={loading}
                        />
                    </View>
                </>
            ) : (
                <Text style={styles.emptyCartText}>
                    Your cart is empty. Add items from the menu to get started.
                </Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 15,
    },
    emptyCartText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 30,
        fontStyle: 'italic',
    },
    checkoutSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    input: {
        marginVertical: 15,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
});

export default ConcessionsScreen;