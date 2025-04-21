import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Image
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { theatersApi, Theater } from "@/services/api/theatersApi";

export default function TheatersScreen() {
    const router = useRouter();
    const [theaters, setTheaters] = useState<Theater[]>([]);
    const [filteredTheaters, setFilteredTheaters] = useState<Theater[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function loadTheaters() {
            try {
                console.log("Fetching theaters from API...");
                const data = await theatersApi.getAll();
                console.log("Theaters data received:", JSON.stringify(data));
                setTheaters(data);
                setFilteredTheaters(data);
            } catch (error) {
                console.error("Failed to load theaters:", error);
            } finally {
                setLoading(false);
            }
        }

        loadTheaters();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredTheaters(theaters);
        } else {
            const filtered = theaters.filter(theater =>
                theater.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                theater.address.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredTheaters(filtered);
        }
    }, [searchQuery, theaters]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#c70036" />
            </View>
        );
    }

    if (!theaters || theaters.length === 0) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#c70036" />
                <Text style={styles.errorText}>No theaters found. Please check your connection.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Find a Theater</Text>
                <Text style={styles.subtitle}>Select a theater to view available movies and showtimes</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by theater name or location"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredTheaters}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.theaterCard}
                        onPress={() => {
                            console.log("Navigating to theater details:", item.id);
                            router.push(`/theaters/${item.id}/showtimes`);
                        }}
                    >
                        <View style={styles.theaterCardContent}>
                            <View style={styles.theaterInfo}>
                                <Text style={styles.theaterName}>{item.name}</Text>
                                <Text style={styles.theaterLocation}>{item.address}</Text>
                                <View style={styles.featureContainer}>
                                    <View style={styles.featureBadge}>
                                        <Text style={styles.featureText}>IMAX</Text>
                                    </View>
                                    <View style={styles.featureBadge}>
                                        <Text style={styles.featureText}>Dolby</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.distanceContainer}>
                                <Ionicons name="location-outline" size={16} color="#c70036" />
                                <Text style={styles.distanceText}>2.5 mi</Text>
                            </View>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.showtimesButton}
                                onPress={() => {
                                    router.push(`/theaters/${item.id}/showtimes`);
                                }}
                            >
                                <Text style={styles.showtimesButtonText}>VIEW SHOWTIMES</Text>
                            </TouchableOpacity>
                        </View>
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
        backgroundColor: '#121212',
        padding: 16,
    },
    headerContainer: {
        marginBottom: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 14,
        color: '#CCCCCC',
        textAlign: 'center',
        marginBottom: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 44,
        color: '#FFFFFF',
    },
    list: {
        paddingBottom: 20,
    },
    theaterCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderLeftWidth: 4,
        borderLeftColor: '#c70036',
    },
    theaterCardContent: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    theaterInfo: {
        flex: 1,
    },
    theaterName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#FFFFFF',
    },
    theaterLocation: {
        fontSize: 14,
        marginBottom: 8,
        color: '#CCCCCC',
    },
    featureContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    featureBadge: {
        backgroundColor: '#333',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 8,
    },
    featureText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    distanceText: {
        color: '#CCCCCC',
        marginLeft: 4,
    },
    buttonContainer: {
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    showtimesButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    showtimesButtonText: {
        color: '#c70036',
        fontWeight: 'bold',
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#121212',
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: '#121212',
    },
    errorText: {
        fontSize: 18,
        color: '#ff3b30',
        textAlign: 'center',
        marginTop: 16,
    },
});