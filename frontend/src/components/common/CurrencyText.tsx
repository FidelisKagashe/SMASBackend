import React from 'react';
import { Text, TextProps } from 'react-native-paper';

interface CurrencyTextProps extends TextProps {
  amount: number;
  currency?: string;
  locale?: string;
}

const CurrencyText: React.FC<CurrencyTextProps> = ({ 
  amount, 
  currency = 'USD',
  locale = 'en-US',
  style,
  ...props 
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  };

  return (
    <Text style={style} {...props}>
      {formatCurrency(amount)}
    </Text>
  );
};

export default CurrencyText;