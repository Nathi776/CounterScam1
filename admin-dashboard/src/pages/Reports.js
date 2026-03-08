import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Skeleton,
} from "@mui/material";
import AppShell from "../components/AppShell";
import { getReports } from "../api/api";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <AppShell
      title="Reported Scams"
      onRefresh={loadReports}
      onLogout={logout}
      currentView="reports"
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4">Reported Scams</Typography>
        <Typography sx={{ opacity: 0.7, mt: 0.5 }}>
          User-submitted scam links and messages.
        </Typography>
      </Box>

      {loading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={100} />
          <Skeleton variant="rounded" height={100} />
          <Skeleton variant="rounded" height={100} />
        </Stack>
      ) : reports.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography sx={{ opacity: 0.7 }}>No reports yet.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {reports.map((report) => (
            <Paper key={report.id} sx={{ p: 2.5, borderRadius: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Chip
                  label={report.content_type}
                  size="small"
                  color={report.content_type === "url" ? "warning" : "info"}
                  sx={{ textTransform: "uppercase", fontWeight: 800 }}
                />
                <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
                  {report.created_at
                    ? new Date(report.created_at).toLocaleString()
                    : "-"}
                </Typography>
              </Box>

              <Typography
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontSize: 14,
                }}
              >
                {report.content}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </AppShell>
  );
}