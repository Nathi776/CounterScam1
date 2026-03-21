import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Stack,
} from "@mui/material";

function SummaryCard({ title, value, color = "default" }) {
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

export default function ScamIntelligencePanel({ intelligence, loading }) {
  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 4, mt: 3 }}>
        <Typography>Loading scam intelligence...</Typography>
      </Paper>
    );
  }

  const summary = intelligence?.summary || {};
  const topDomains = intelligence?.top_domains || [];
  const topKeywords = intelligence?.top_keywords || [];
  const latestReports = intelligence?.latest_reports || [];

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
        Scam Intelligence
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2.5,
        }}
      >
        <SummaryCard title="Total Reports" value={summary.total_reports || 0} />
        <SummaryCard title="URL Reports" value={summary.url_reports || 0} color="warning" />
        <SummaryCard title="Message Reports" value={summary.message_reports || 0} color="info" />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 2.5,
          mt: 2.5,
        }}
      >
        <Paper sx={{ p: 2.5, borderRadius: 4, height: "100%" }}>
          <Typography sx={{ fontWeight: 900, mb: 2 }}>
            Top Scam Domains
          </Typography>

          {topDomains.length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>No domain intelligence yet.</Typography>
          ) : (
            <Stack spacing={1.2}>
              {topDomains.map((d, i) => (
                <Box
                  key={`${d.domain}-${i}`}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1.2,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.03)",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, wordBreak: "break-word" }}>
                    {d.domain}
                  </Typography>
                  <Chip label={`${d.count} reports`} size="small" />
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 4, height: "100%" }}>
          <Typography sx={{ fontWeight: 900, mb: 2 }}>
            Top Scam Keywords
          </Typography>

          {topKeywords.length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>No keyword intelligence yet.</Typography>
          ) : (
            <Stack spacing={1.2}>
              {topKeywords.map((k, i) => (
                <Box
                  key={`${k.keyword}-${i}`}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1.2,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.03)",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, wordBreak: "break-word" }}>
                    {k.keyword}
                  </Typography>
                  <Chip label={`${k.count} hits`} size="small" />
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>

      <Paper sx={{ p: 2.5, borderRadius: 4, mt: 3 }}>
        <Typography sx={{ fontWeight: 900, mb: 2 }}>
          Latest Threat Feed
        </Typography>

        {latestReports.length === 0 ? (
          <Typography sx={{ opacity: 0.7 }}>No reports yet.</Typography>
        ) : (
          <Stack spacing={1.5}>
            {latestReports.map((r, index) => (
              <Box key={r.id || index}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    label={r.content_type}
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
                    wordBreak: "break-word",
                  }}
                >
                  {r.content}
                </Typography>

                {index !== latestReports.length - 1 && <Divider sx={{ mt: 1.5 }} />}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}