import React, { useEffect, useMemo, useState } from "react";
import {
  getStats,
  getRecentChecks,
  getAnalytics,
  getReports,
  getIntelligence,
} from "../api/api";
import AppShell from "../components/AppShell";
import ScamIntelligencePanel from "../components/ScamIntelligencePanel";

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
  Divider,
  Stack,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";

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

function StatCard({ title, value, hint }) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 4, height: "100%" }}>
      <Typography sx={{ fontSize: 12, opacity: 0.7 }}>{title}</Typography>
      <Typography sx={{ fontSize: 28, fontWeight: 900, mt: 0.75 }}>{value}</Typography>
      {hint ? (
        <Typography sx={{ fontSize: 12, opacity: 0.65, mt: 0.75 }}>{hint}</Typography>
      ) : null}
    </Paper>
  );
}

const verdictChip = (verdict) => {
  const v = (verdict || "").toLowerCase();
  if (v === "phishing") return { label: "phishing", color: "error" };
  if (v === "suspicious") return { label: "suspicious", color: "warning" };
  return { label: v || "safe", color: "success" };
};

export default function Dashboard({ setView }) {
  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [intelligence, setIntelligence] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, recentRes, analyticsRes, reportsRes, intelligenceRes] = await Promise.all([
        getStats(),
        getRecentChecks(),
        getAnalytics(),
        getReports(),
        getIntelligence(),
      ]);

      setStats(statsRes || {});
      setIntelligence(intelligenceRes || {});

      const recentUrls = (recentRes?.urls || []).map((u, i) => ({
        id: `url-${i}`,
        type: "url",
        verdict: u.flagged === "True" ? "phishing" : "safe",
        risk_score: "-",
        value: u.url,
        reason: u.reason || "-",
        created_at: u.checked_at,
      }));

      const recentMessages = (recentRes?.messages || []).map((m, i) => ({
        id: `msg-${i}`,
        type: "message",
        verdict: m.flagged === "True" ? "phishing" : "safe",
        risk_score: "-",
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
      setAnalytics(analyticsRes || {});
      setReports(Array.isArray(reportsRes) ? reportsRes.slice(0, 5) : []);
    } catch (err) {
      console.error(err);
      setStats({});
      setRecent([]);
      setAnalytics({});
      setReports([]);
      setIntelligence({});
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

  const attackTrend = useMemo(() => {
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

  const pieData = useMemo(() => ({
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
  }), [stats]);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const totalChecks = (stats?.total_urls || 0) + (stats?.total_messages || 0);
  const totalFlagged = (stats?.flagged_urls || 0) + (stats?.flagged_messages || 0);
  const flagRate = totalChecks ? `${Math.round((totalFlagged / totalChecks) * 100)}%` : "0%";

  return (
    <AppShell
      title="Admin Dashboard"
      onRefresh={loadData}
      onLogout={logout}
      currentView="overview"
      setView={setView}
    >
      <Box id="overview" sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Security Overview
        </Typography>
        <Typography sx={{ opacity: 0.7, mt: 0.5 }}>
          Live activity from URL scans, message scans, and scam reports.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
          gap: 2.5,
        }}
      >
        {loading ? <Skeleton variant="rounded" height={110} /> : <StatCard title="Total Scans" value={totalChecks} />}
        {loading ? <Skeleton variant="rounded" height={110} /> : <StatCard title="Flagged Detections" value={totalFlagged} />}
        {loading ? <Skeleton variant="rounded" height={110} /> : <StatCard title="Total Reports" value={stats.total_reports || 0} />}
        {loading ? (
          <Skeleton variant="rounded" height={110} />
        ) : (
          <StatCard title="Flag Rate" value={flagRate} hint="flagged / total scans" />
        )}
      </Box>

      <Box
        id="analytics"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 7fr) minmax(320px, 5fr)" },
          gap: 2.5,
          mt: 2.5,
        }}
      >
        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
            Top URL flag reasons
          </Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.7, mb: 2 }}>
            Most common reasons suspicious URLs are being flagged
          </Typography>

          {loading ? (
            <Skeleton variant="rounded" height={280} />
          ) : (analytics?.url_reason_top || []).length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>
              No flagged URL reasons yet.
            </Typography>
          ) : (
            <Bar
              data={attackTrend}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: "rgba(255,255,255,0.06)" } },
                },
              }}
            />
          )}
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
            Detection distribution
          </Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.7, mb: 2 }}>
            URLs, messages, and reports at a glance
          </Typography>

          {loading ? (
            <Skeleton variant="rounded" height={280} />
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

      <Paper id="recent" sx={{ mt: 3, p: 2.5, borderRadius: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
              Recent scans
            </Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
              Latest URL and message checks
            </Typography>
          </Box>

          <Chip
            label={`${recent.length} items`}
            variant="outlined"
            sx={{ borderColor: "rgba(255,255,255,0.14)" }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {loading ? (
          <Box sx={{ display: "grid", gap: 1 }}>
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
          </Box>
        ) : recent.length === 0 ? (
          <Typography sx={{ opacity: 0.7 }}>
            No checks yet. Run a few scans from the app to populate this table.
          </Typography>
        ) : (
          <TableContainer sx={{ borderRadius: 3 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={160}>Time</TableCell>
                  <TableCell width={110}>Type</TableCell>
                  <TableCell width={140}>Verdict</TableCell>
                  <TableCell width={220}>Reason</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell width={56} align="right"></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {recent.map((r) => {
                  const vc = verdictChip(r.verdict);
                  return (
                    <TableRow
                      key={r.id}
                      hover
                      sx={{
                        "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                      }}
                    >
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
                          maxWidth: 220,
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
                          maxWidth: 420,
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: 2.5,
          mt: 2.5,
        }}
      >
        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
            Latest user reports
          </Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.7, mb: 2 }}>
            Recently reported scam links and messages
          </Typography>

          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={58} />
              <Skeleton variant="rounded" height={58} />
              <Skeleton variant="rounded" height={58} />
            </Stack>
          ) : reports.length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>No scam reports yet.</Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1 }}>
              {reports.map((r) => (
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
                      mb: 0.8,
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Chip
                      label={r.content_type}
                      size="small"
                      color={r.content_type === "url" ? "warning" : "info"}
                      sx={{ textTransform: "uppercase", fontWeight: 800 }}
                    />
                    <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
                      {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={r.content}
                  >
                    {r.content}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
            Top message reasons
          </Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.7, mb: 2 }}>
            Most common reasons suspicious messages are being flagged
          </Typography>

          {loading ? (
            <Box sx={{ display: "grid", gap: 1 }}>
              <Skeleton variant="rounded" height={34} />
              <Skeleton variant="rounded" height={34} />
              <Skeleton variant="rounded" height={34} />
            </Box>
          ) : (analytics?.message_reason_top || []).length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>
              No flagged message reasons yet.
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1 }}>
              {analytics.message_reason_top.map((d, i) => (
                <Paper
                  key={`${d.reason}-${i}`}
                  sx={{
                    p: 1.6,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.03)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 800 }}>{d.reason}</Typography>
                  <Chip label={`${d.count} hits`} size="small" />
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      <Box id="reports" sx={{ mt: 4 }}>
        <ScamIntelligencePanel intelligence={intelligence} loading={loading} />
      </Box>
    </AppShell>
  );
}
