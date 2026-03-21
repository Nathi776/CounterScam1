import React, { useEffect, useMemo, useState } from "react";
import { getStats, getAnalytics } from "../api/api";
import AppShell from "../components/AppShell";

import {
  Box,
  Paper,
  Typography,
  Chip,
  Skeleton,
} from "@mui/material";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

export default function Analytics({ setView }) {
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        getStats(),
        getAnalytics(),
      ]);

      setStats(statsRes || {});
      setAnalytics(analyticsRes || {});
    } catch (err) {
      console.error(err);
      setStats({});
      setAnalytics({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const urlChart = useMemo(() => {
    const urlTop = analytics?.url_reason_top || [];
    return {
      labels: urlTop.map((t) => t.reason),
      datasets: [
        {
          label: "Flagged URLs",
          data: urlTop.map((t) => t.count),
        },
      ],
    };
  }, [analytics]);

  const messageChart = useMemo(() => {
    const msgTop = analytics?.message_reason_top || [];
    return {
      labels: msgTop.map((t) => t.reason),
      datasets: [
        {
          label: "Flagged Messages",
          data: msgTop.map((t) => t.count),
        },
      ],
    };
  }, [analytics]);

  const pieData = useMemo(
    () => ({
      labels: ["Flagged URLs", "Flagged Messages", "Reports"],
      datasets: [
        {
          data: [
            stats?.flagged_urls || 0,
            stats?.flagged_messages || 0,
            stats?.total_reports || 0,
          ],
        },
      ],
    }),
    [stats]
  );

  return (
    <AppShell
      title="Analytics"
      onRefresh={loadData}
      onLogout={logout}
      currentView="analytics"
      setView={setView}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Analytics
        </Typography>
        <Typography sx={{ opacity: 0.7, mt: 0.5 }}>
          Monitor detection patterns, scam trends, and reporting activity.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Chip label={`Flagged URLs: ${stats?.flagged_urls || 0}`} color="warning" />
        <Chip label={`Flagged Messages: ${stats?.flagged_messages || 0}`} color="info" />
        <Chip label={`Reports: ${stats?.total_reports || 0}`} color="primary" />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "repeat(2, 1fr)" },
          gap: 2.5,
        }}
      >
        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
            URL Detection Reasons
          </Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.7, mb: 2 }}>
            Breakdown of why URLs are being flagged
          </Typography>

          {loading ? (
            <Skeleton variant="rounded" height={320} />
          ) : (analytics?.url_reason_top || []).length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>No flagged URL reasons yet.</Typography>
          ) : (
            <Bar
              data={urlChart}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          )}
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
            Message Detection Reasons
          </Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.7, mb: 2 }}>
            Breakdown of why messages are being flagged
          </Typography>

          {loading ? (
            <Skeleton variant="rounded" height={320} />
          ) : (analytics?.message_reason_top || []).length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>No flagged message reasons yet.</Typography>
          ) : (
            <Bar
              data={messageChart}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          )}
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
            Detection Distribution
          </Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.7, mb: 2 }}>
            High-level distribution of detection activity
          </Typography>

          {loading ? (
            <Skeleton variant="rounded" height={320} />
          ) : (
            <Pie
              data={pieData}
              options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          )}
        </Paper>
      </Box>
    </AppShell>
  );
}