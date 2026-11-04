import { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventoryService';

export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryService.getAll().then((res) => setInventory(res.data || [])).finally(() => setLoading(false));
  }, []);

  return { inventory, loading };
}
