import React, { useEffect, useState } from "react";
import { getRecentChecks } from "../api/api";
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
  IconButton,
  Tooltip,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const verdictChip = (verdict) => {
  const v = (verdict || "").toLowerCase();
  if (v === "phishing") return { label: "phishing", color: "error" };
  if (v === "suspicious") return { label: "suspicious", color: "warning" };
  return { label: v || "safe", color: "success" };
};

export default function RecentChecks({ setView }) {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const recentRes = await getRecentChecks();

      const recentUrls = (recentRes?.urls || []).map((u, i) => ({
        id: `url-${i}`,
        type: "url",
        verdict: u.flagged === "True" ? "phishing" : "safe",
        value: u.url,
        reason: u.reason || "-",
        created_at: u.checked_at,
      }));

      const recentMessages = (recentRes?.messages || []).map((m, i) => ({
        id: `msg-${i}`,
        type: "message",
        verdict: m.flagged === "True" ? "phishing" : "safe",
        value: m.message,
        reason: m.reason || "-",
        created_at: m.checked_at,
      }));

      const mergedRecent = [...recentUrls, ...recentMessages].sort((a, b) => {
        const ad = new Date(a.created_at || 0).getTime();
        const bd = new Date(b.created_at || 0).getTime();
        return bd - ad;
      });

      setRecent(mergedRecent);
    } catch (err) {
      console.error(err);
      setRecent([]);
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

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <AppShell
      title="Recent Checks"
      onRefresh={loadData}
      onLogout={logout}
      currentView="recent"
      setView={setView}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Recent Checks
        </Typography>
        <Typography sx={{ opacity: 0.7, mt: 0.5 }}>
          Review the latest URL and message scans processed by CounterScam.
        </Typography>
      </Box>

      <Paper sx={{ p: 2.5, borderRadius: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
            Scan Activity
          </Typography>

          <Chip
            label={`${recent.length} items`}
            variant="outlined"
            sx={{ borderColor: "rgba(255,255,255,0.14)" }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "grid", gap: 1 }}>
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
          </Box>
        ) : recent.length === 0 ? (
          <Typography sx={{ opacity: 0.7 }}>
            No checks yet. Run a few scans from the app to populate this page.
          </Typography>
        ) : (
          <TableContainer sx={{ borderRadius: 3 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={170}>Time</TableCell>
                  <TableCell width={110}>Type</TableCell>
                  <TableCell width={140}>Verdict</TableCell>
                  <TableCell width={240}>Reason</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell width={56} align="right"></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {recent.map((r) => {
                  const vc = verdictChip(r.verdict);
                  return (
                    <TableRow key={r.id} hover>
                      <TableCell sx={{ fontSize: 12, opacity: 0.75 }}>
                        {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                      </TableCell>

                      <TableCell sx={{ textTransform: "uppercase", fontSize: 11, opacity: 0.8 }}>
                        {r.type || "url"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={vc.label}
                          color={vc.color}
                          size="small"
                          sx={{ fontWeight: 900, textTransform: "capitalize" }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          maxWidth: 240,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: 13,
                        }}
                        title={r.reason || "-"}
                      >
                        {r.reason || "-"}
                      </TableCell>

                      <TableCell
                        sx={{
                          maxWidth: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: 13,
                        }}
                        title={r.value || ""}
                      >
                        {r.value || "-"}
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Copy">
                          <IconButton size="small" onClick={() => copyText(r.value || "")}>
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </AppShell>
  );
}