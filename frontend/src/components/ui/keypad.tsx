'use client';

import { Button } from '@/components/ui/button';
import { Delete, RotateCcw } from 'lucide-react';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  className?: string;
}

export function Keypad({ onKeyPress, onBackspace, onClear, className = '' }: KeypadProps) {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'backspace']
  ];

  const handleKeyClick = (key: string) => {
    if (key === 'backspace') {
      onBackspace();
    } else if (key === 'clear') {
      onClear();
    } else {
      onKeyPress(key);
    }
  };

  const getKeyContent = (key: string) => {
    switch (key) {
      case 'backspace':
        return <Delete className="h-5 w-5" />;
      case 'clear':
        return <RotateCcw className="h-5 w-5" />;
      default:
        return key;
    }
  };

  const getKeyVariant = (key: string) => {
    if (key === 'clear') return 'destructive';
    if (key === 'backspace') return 'secondary';
    return 'default';
  };

  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      {keys.flat().map((key, index) => (
        <Button
          key={index}
          variant={getKeyVariant(key)}
          size="lg"
          className="h-14 text-lg font-semibold touch-manipulation"
          onClick={() => handleKeyClick(key)}
          type="button"
        >
          {getKeyContent(key)}
        </Button>
      ))}
    </div>
  );
}
