// app/theaters/index.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity
} from "react-native";
import { theatersApi, Theater } from "@/services/api/theatersApi";

export default function TheatersScreen() {
    const router = useRouter();
    const [theaters, setTheaters] = useState<Theater[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTheaters() {
            try {
                const data = await theatersApi.getAll();
                setTheaters(data);
            } catch (error) {
                console.error("Failed to load theaters:", error);
            } finally {
                setLoading(false);
            }
        }

        loadTheaters();
    }, []);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Our Theaters</Text>
            <FlatList
                data={theaters}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.theaterCard}
                        onPress={() => {
                            const theaterId = item.id;
                            console.log("Navigating to theater details:", theaterId);
                            // @ts-ignore
                            router.push(`/theaters/${theaterId}`);
                        }}
                    >
                        <Text style={styles.theaterName}>{item.name}</Text>
                        <Text style={styles.theaterLocation}>{item.address}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    list: {
        paddingBottom: 20,
    },
    theaterCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    theaterName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    theaterLocation: {
        fontSize: 16,
        color: '#666',
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});