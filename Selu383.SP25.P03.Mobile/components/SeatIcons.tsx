import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface SeatIconProps {
    seatNumber: number;
    seatType: string;
    isAvailable: boolean;
    isSelected: boolean;
    size?: number;
}



const SeatIcon: React.FC<SeatIconProps> = ({
    seatNumber,
    seatType = 'Standard',
    isAvailable = true,
    isSelected = false,
    size = 28,
}) => {
    const fillColor = '#aaa';

    const StandardSeat = () => (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Rect x="4" y="4" width="16" height="6" rx="1" fill={fillColor} />
            <Rect x="4" y="10" width="16" height="8" rx="1" fill={fillColor} />
            <Rect x="2" y="10" width="2" height="8" rx="0.5" fill={fillColor} />
            <Rect x="20" y="10" width="2" height="8" rx="0.5" fill={fillColor} />
        </Svg>
    );

    return (
        <View style={styles.container}>
            <StandardSeat />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 3,
    },
});

export default SeatIcon;
