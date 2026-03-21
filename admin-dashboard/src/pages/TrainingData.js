import React, { useEffect, useMemo, useState } from "react";
import { getReports } from "../api/api";
import AppShell from "../components/AppShell";
import {
  Box,
  Paper,
  Typography,
  Chip, 
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Skeleton,
} from "@mui/material";

export default function TrainingData({ setView }) {
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

  const confirmedThreats = useMemo(
    () =>
      reports.filter((r) => r.status === "confirmed").sort((a, b) => {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }),
    [reports]
  );

  return (
    <AppShell
      title="Training Data"
      onRefresh={loadData}
      onLogout={logout}
      currentView="training"
      setView={setView}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Training Data
        </Typography>
        <Typography sx={{ opacity: 0.7, mt: 0.5 }}>
          Confirmed scam reports that can strengthen your threat database and future ML training.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Chip label={`Confirmed Entries: ${confirmedThreats.length}`} color="error" />
        <Chip
          label={`URLs: ${confirmedThreats.filter((r) => r.content_type === "url").length}`}
          color="warning"
        />
        <Chip
          label={`Messages: ${confirmedThreats.filter((r) => r.content_type === "message").length}`}
          color="info"
        />
      </Box>

      <Paper sx={{ p: 2.5, borderRadius: 4 }}>
        <Typography sx={{ fontWeight: 900, fontSize: 18, mb: 2 }}>
          Confirmed Scam Entries
        </Typography>

        {loading ? (
          <Box sx={{ display: "grid", gap: 1 }}>
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
          </Box>
        ) : confirmedThreats.length === 0 ? (
          <Typography sx={{ opacity: 0.7 }}>
            No confirmed scam entries yet.
          </Typography>
        ) : (
          <TableContainer sx={{ borderRadius: 3 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={120}>Type</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell width={140}>Label</TableCell>
                  <TableCell width={180}>Date Added</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {confirmedThreats.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Chip
                        label={(r.content_type || "unknown").toUpperCase()}
                        size="small"
                        color={r.content_type === "url" ? "warning" : "info"}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={r.content}
                    >
                      {r.content}
                    </TableCell>

                    <TableCell>
                      <Chip label="Scam" size="small" color="error" />
                    </TableCell>

                    <TableCell sx={{ fontSize: 12, opacity: 0.75 }}>
                      {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </AppShell>
  );
}