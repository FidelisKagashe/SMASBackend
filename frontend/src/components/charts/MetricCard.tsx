import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import CurrencyText from '../common/CurrencyText';

interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  isCurrency?: boolean;
  subtitle?: string;
  onPress?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  isCurrency = false,
  subtitle,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <Card 
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <MaterialIcons name={icon as any} size={32} color={color} />
        <View style={styles.textContainer}>
          {isCurrency ? (
            <CurrencyText
              amount={value}
              style={[styles.value, { color: theme.colors.text }]}
            />
          ) : (
            <Text style={[styles.value, { color: theme.colors.text }]}>
              {value.toLocaleString()}
            </Text>
          )}
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    elevation: 2,
    borderRadius: 12,
    margin: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 12,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 10,
    marginTop: 2,
  },
});

export default MetricCard;