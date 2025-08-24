import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { useTheme } from '../../hooks/useTheme';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  const { theme } = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Title title={title} />
      <Card.Content>
        {children}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
});

export default FormSection;