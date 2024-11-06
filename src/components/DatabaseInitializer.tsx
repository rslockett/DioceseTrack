'use client';

import { useEffect } from 'react';
import { migrateData } from '@/lib/db/migrations';

export function DatabaseInitializer() {
  useEffect(() => {
    migrateData();
  }, []);

  return null;
} 