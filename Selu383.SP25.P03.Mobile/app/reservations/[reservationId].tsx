import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import SeatIcon from "../../components/SeatIcon"; // Adjust this path if needed

const rowLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
const seatsPerRow = 10;

const mockShowtime = {
  movieTitle: "Avengers: Endgame",
  theaterName: "AMC Theater",
  startTime: new Date().toISOString(),
};

const generateDummySeats = () => {
  const seats = [];
  for (let row = 0; row < rowLabels.length; row++) {
    for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
      seats.push({
        id: `${rowLabels[row]}-${seatNum}`,
        available: Math.random() > 0.2,
      });
    }
  }
  return seats;
};

export default function SeatSelectionScreen() {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const seatPrice = 12.99;

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSeats(generateDummySeats());
      } catch (err) {
        setError("Failed to load seats");
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, []);

  const toggleSeatSelection = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleAddToCart = () => {
    alert(`You added ${selectedSeats.length} seat(s) to your cart!`);
  };

  const totalPrice = selectedSeats.length * seatPrice;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#c70036" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: "white" }}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageContent}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.movieInfoHeader}>
            <Text style={styles.movieTitle}>{mockShowtime.movieTitle}</Text>
            <Text style={styles.theaterText}>{mockShowtime.theaterName}</Text>
            <Text style={styles.timeText}>
              {new Date(mockShowtime.startTime).toLocaleDateString()} •{" "}
              {new Date(mockShowtime.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <View style={styles.seatMap}>
            {rowLabels.map((row) => (
              <View key={row} style={styles.row}>
                {Array.from({ length: seatsPerRow }, (_, i) => {
                  const seatNum = i + 1;
                  const seatId = `${row}-${seatNum}`;
                  const seat = seats.find((s) => s.id === seatId);
                  const isAvailable = seat?.available ?? false;
                  const isSelected = selectedSeats.includes(seatId);

                  return (
                    <TouchableOpacity
                      key={seatId}
                      style={styles.seatTouchable}
                      onPress={() => isAvailable && toggleSeatSelection(seatId)}
                      disabled={!isAvailable}
                    >
                      <SeatIcon
                        seatNumber={seatNum}
                        seatType="Standard"
                        isAvailable={isAvailable}
                        isSelected={isSelected}
                        size={30}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendBox, { backgroundColor: "#c70036" }]}
              />
              <Text style={styles.legendText}>Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: "#aaa" }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: "#555" }]} />
              <Text style={styles.legendText}>Unavailable</Text>
            </View>
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {selectedSeats.length} Seat{selectedSeats.length !== 1 ? "s" : ""}{" "}
              Selected
            </Text>
            <Text style={styles.summaryText}>
              Total: ${totalPrice.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              { opacity: selectedSeats.length === 0 ? 0.5 : 1 },
            ]}
            onPress={handleAddToCart}
            disabled={selectedSeats.length === 0}
          >
            <Text style={styles.addToCartButtonText}>
              {selectedSeats.length === 0 ? "Select Seats" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  pageContent: {
    flex: 1,
    alignItems: "center", // Center everything horizontally
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center", // Center inside ScrollView too
  },
  movieInfoHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  movieTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  theaterText: {
    fontSize: 16,
    color: "#CCC",
    marginTop: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  seatMap: {
    alignItems: "center",
    paddingVertical: 20,
    width: 320, // Fixed width for consistent seat layout
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  seatTouchable: {
    margin: 1,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: "white",
    fontSize: 14,
  },
  summary: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    alignItems: "center",
  },
  summaryText: {
    color: "white",
    fontSize: 16,
    marginBottom: 4,
  },
  addToCartButton: {
    backgroundColor: "#c70036",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
