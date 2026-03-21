import React, { useEffect, useMemo, useState } from "react";
import { getReports } from "../api/api";
import AppShell from "../components/AppShell";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Skeleton,
  Stack,
} from "@mui/material";

function StatCard({ title, value, color = "default" }) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 4 }}>
      <Typography sx={{ fontSize: 12, opacity: 0.7 }}>{title}</Typography>
      <Typography sx={{ fontSize: 28, fontWeight: 900, mt: 0.5 }}>
        {value}
      </Typography>
      <Chip label={title} size="small" color={color} sx={{ mt: 1.5 }} />
    </Paper>
  );
}

export default function Overview({ setView }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
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
    loadData();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const pendingReports = useMemo(
    () => reports.filter((r) => r.status === "pending"),
    [reports]
  );

  const confirmedReports = useMemo(
    () => reports.filter((r) => r.status === "confirmed"),
    [reports]
  );

  const safeReports = useMemo(
    () => reports.filter((r) => r.status === "safe"),
    [reports]
  );

  const recentThreats = useMemo(
    () =>
      confirmedReports
        .slice()
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5),
    [confirmedReports]
  );

  return (
    <AppShell
      title="Overview"
      onRefresh={loadData}
      onLogout={logout}
      currentView="overview"
      setView={setView}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Admin Overview
        </Typography>
        <Typography sx={{ opacity: 0.7, mt: 0.5 }}>
          Focus on incoming reports, moderation, and growing your verified scam data.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
          gap: 2.5,
          mb: 3,
        }}
      >
        {loading ? (
          <>
            <Skeleton variant="rounded" height={110} />
            <Skeleton variant="rounded" height={110} />
            <Skeleton variant="rounded" height={110} />
            <Skeleton variant="rounded" height={110} />
          </>
        ) : (
          <>
            <StatCard title="Pending Reports" value={pendingReports.length} color="warning" />
            <StatCard title="Confirmed Scams" value={confirmedReports.length} color="error" />
            <StatCard title="Marked Safe" value={safeReports.length} color="success" />
            <StatCard title="Total Reports" value={reports.length} color="primary" />
          </>
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 7fr) minmax(320px, 5fr)" },
          gap: 2.5,
        }}
      >
        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              mb: 2,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                Pending Reports Queue
              </Typography>
              <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
                These reports still need admin review.
              </Typography>
            </Box>

            <Button variant="contained" onClick={() => setView("reports")}>
              Open Reports
            </Button>
          </Box>

          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={64} />
              <Skeleton variant="rounded" height={64} />
              <Skeleton variant="rounded" height={64} />
            </Stack>
          ) : pendingReports.length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>
              No pending reports right now.
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1.2 }}>
              {pendingReports.slice(0, 6).map((r) => (
                <Paper
                  key={r.id}
                  sx={{
                    p: 1.8,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                      mb: 0.8,
                    }}
                  >
                    <Chip
                      label={(r.content_type || "unknown").toUpperCase()}
                      size="small"
                      color={r.content_type === "url" ? "warning" : "info"}
                    />
                    <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
                      {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      wordBreak: "break-word",
                    }}
                  >
                    {r.content}
                  </Typography>

                  <Chip
                    label={r.status || "pending"}
                    size="small"
                    sx={{ mt: 1.2, textTransform: "capitalize" }}
                  />
                </Paper>
              ))}
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              mb: 2,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                Recently Added Threats
              </Typography>
              <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
                Confirmed scam entries already accepted by the admin.
              </Typography>
            </Box>

            <Button variant="outlined" onClick={() => setView("training")}>
              Open Training Data
            </Button>
          </Box>

          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
            </Stack>
          ) : recentThreats.length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>
              No confirmed threats have been added yet.
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1.2 }}>
              {recentThreats.map((r) => (
                <Paper
                  key={r.id}
                  sx={{
                    p: 1.6,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                      mb: 0.8,
                    }}
                  >
                    <Chip
                      label={(r.content_type || "unknown").toUpperCase()}
                      size="small"
                      color={r.content_type === "url" ? "warning" : "info"}
                    />
                    <Chip label="confirmed" size="small" color="error" />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 13,
                      wordBreak: "break-word",
                    }}
                  >
                    {r.content}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </AppShell>
  );
}