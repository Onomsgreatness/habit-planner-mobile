import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

export default function BackButton({ onpress }) {
    return (
        <Pressable onPress={onPress} style={({pressed}) => [StyleSheet.btn, pressed && { opacity: 0.8 }]}>
            <Ionicons name="chevron-back" size={26} color={COLORS.white} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
});