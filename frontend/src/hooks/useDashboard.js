import { useState, useEffect } from "react";
import { mockStats, mockRecentActivities, mockHealthChecks } from "../mock/dashboard";

export default function useDashboard() {
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(mockStats);
      setActivities(mockRecentActivities);
      setHealthChecks(mockHealthChecks);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return {
    stats,
    activities,
    healthChecks,
    loading,
  };
}
