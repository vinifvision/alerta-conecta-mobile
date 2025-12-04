import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// Tipos (podemos mover para um arquivo types.ts depois)
export type OccurrenceStatus = "Em_andamento" | "Encerrada" | "Cancelada";
export type OccurrencePriority = "Baixa" | "Media" | "Alta" | "Critica";

interface OccurrenceCardProps {
  id: number;
  title: string;
  type: string;
  date: string;
  status: OccurrenceStatus;
  priority: OccurrencePriority;
  onPress: () => void;
}

export default function OccurrenceCard({
  id,
  title,
  type,
  date,
  status,
  priority,
  onPress,
}: OccurrenceCardProps) {
  // Função para cor do status
  const getStatusColor = (s: OccurrenceStatus) => {
    switch (s) {
      case "Em_andamento":
        return "#FF4444";
      case "Encerrada":
        return "#4CAF50";
      case "Cancelada":
        return "#9E9E9E";
      default:
        return "#1650A7";
    }
  };

  // Função para cor da prioridade
  const getPriorityColor = (p: OccurrencePriority) => {
    switch (p) {
      case "Alta":
        return "#D32F2F";
      case "Critica":
        return "#B71C1C";
      case "Media":
        return "#1976D2";
      default:
        return "#757575";
    }
  };

  const getPriorityBg = (p: OccurrencePriority) => {
    switch (p) {
      case "Alta":
        return "#FFEBEE";
      case "Critica":
        return "#FFEBEE";
      case "Media":
        return "#E3F2FD";
      default:
        return "#F5F5F5";
    }
  };

  // Formatação de data simples
  const formattedDate = new Date(date).toLocaleDateString("pt-BR");

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.headerRow}>
        {/* Indicador de Status */}
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(status) },
          ]}
        />

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title || `Ocorrência #${id}`}
          </Text>
          <Text style={styles.type}>{type}</Text>
        </View>

        {/* Badge de Prioridade */}
        <View
          style={[styles.badge, { backgroundColor: getPriorityBg(priority) }]}
        >
          <Text
            style={[styles.badgeText, { color: getPriorityColor(priority) }]}
          >
            {priority}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.id}>#{id}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // Sombras
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  type: {
    fontSize: 14,
    color: "#666",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  id: {
    fontSize: 12,
    color: "#1650A7",
    fontWeight: "bold",
  },
});
