import { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    notificationService.getAll().then((res) => setNotifications(res.data || [])).catch(() => setNotifications([]));
  }, []);
  return { notifications };
}
