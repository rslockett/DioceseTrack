import React from 'react';
import { Card } from '@/components/ui/card';
import { Edit } from 'lucide-react';

const ClergyCard = ({ clergy, onEdit }) => {
  return (
    <Card>
      {/* ... other card content ... */}
      <button
        onClick={() => onEdit(clergy)}
        className="p-2 text-gray-600 hover:text-blue-600"
      >
        <Edit className="h-4 w-4" />
      </button>
    </Card>
  );
};

export default ClergyCard; 