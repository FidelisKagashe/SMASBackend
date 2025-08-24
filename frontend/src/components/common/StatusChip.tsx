import React from 'react';
import { Chip } from 'react-native-paper';
import { useTheme } from '../../hooks/useTheme';

interface StatusChipProps {
  status: string;
  variant?: 'default' | 'payment' | 'stock' | 'order';
  size?: 'small' | 'medium';
}

const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  variant = 'default',
  size = 'medium' 
}) => {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (variant) {
      case 'payment':
        switch (status.toLowerCase()) {
          case 'paid': return theme.colors.success;
          case 'partial': return theme.colors.warning;
          case 'unpaid': return theme.colors.error;
          default: return theme.colors.textSecondary;
        }
      case 'stock':
        switch (status.toLowerCase()) {
          case 'in stock': return theme.colors.success;
          case 'low stock': return theme.colors.warning;
          case 'out of stock': return theme.colors.error;
          default: return theme.colors.textSecondary;
        }
      case 'order':
        switch (status.toLowerCase()) {
          case 'completed': return theme.colors.success;
          case 'pending': return theme.colors.warning;
          case 'cancelled': return theme.colors.error;
          default: return theme.colors.textSecondary;
        }
      default:
        switch (status.toLowerCase()) {
          case 'active': return theme.colors.success;
          case 'inactive': return theme.colors.error;
          case 'pending': return theme.colors.warning;
          default: return theme.colors.textSecondary;
        }
    }
  };

  return (
    <Chip
      style={{
        backgroundColor: getStatusColor(),
        height: size === 'small' ? 20 : 24,
        borderRadius: size === 'small' ? 10 : 12,
      }}
      textStyle={{
        color: 'white',
        fontSize: size === 'small' ? 8 : 10,
      }}
    >
      {status.toUpperCase()}
    </Chip>
  );
};

export default StatusChip;