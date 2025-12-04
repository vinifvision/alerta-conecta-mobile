import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear: () => void;
  onFilterPress?: () => void;
  filterActive?: boolean;
  filterCount?: number;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Pesquisar...",
  onClear,
  onFilterPress,
  filterActive = false,
  filterCount = 0,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      {/* Campo de Busca */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color="#666"
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <Feather name="x" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Botão de Filtro */}
      {onFilterPress && (
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterActive && styles.filterButtonActive,
          ]}
          onPress={onFilterPress}
        >
          <Feather
            name="filter"
            size={22}
            color={filterActive ? "#FFF" : "#1650A7"}
          />
          {filterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    width: 45,
    height: 45,
    backgroundColor: "#FFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: "#1650A7",
  },
  filterBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  filterBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});
