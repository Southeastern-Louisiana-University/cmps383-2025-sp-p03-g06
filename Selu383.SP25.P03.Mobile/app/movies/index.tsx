// Now Showing Screen
// app/movies/index.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { moviesApi, Movie } from "@/services/api/moviesApi";
import MovieCard from "@/components/movie/MovieCard";

export default function NowShowingScreen() {
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMovies() {
            try {
                const data = await moviesApi.getAll();
                setMovies(data);
            } catch (error) {
                console.error("Failed to load movies:", error);
            } finally {
                setLoading(false);
            }
        }
        loadMovies();
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
            <TouchableOpacity
                style={styles.theaterButton}
                onPress={() => {
                    console.log("Navigating to theaters list");
                    // @ts-ignore
                    router.push("/theaters");
                }}
            >
                <Text style={styles.buttonText}>View Our Theaters</Text>
            </TouchableOpacity>

            <FlatList
                data={movies}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <MovieCard
                        movie={item}
                        onPress={() => router.push(`/movies/${item.id}`)}
                    />
                )}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    theaterButton: {
        backgroundColor: '#0066cc',
        padding: 12,
        margin: 16,
        marginBottom: 0,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    list: {
        padding: 16,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});