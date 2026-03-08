import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Chip,
  Box,
  Stack,
  Divider,
} from "@mui/material";

export default function ScamIntelligencePanel({ intelligence, loading }) {
  if (loading) {
    return (
      <Typography sx={{ opacity: 0.7 }}>
        Loading scam intelligence...
      </Typography>
    );
  }

  const summary = intelligence?.summary || {};
  const topDomains = intelligence?.top_domains || [];
  const topKeywords = intelligence?.top_keywords || [];
  const latestReports = intelligence?.latest_reports || [];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 800 }}>
        Scam Intelligence
      </Typography>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, borderRadius: 4 }}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>
              Report Summary
            </Typography>

            <Stack spacing={1}>
              <Chip label={`Total reports: ${summary.total_reports || 0}`} />
              <Chip label={`URL reports: ${summary.url_reports || 0}`} color="warning" />
              <Chip label={`Message reports: ${summary.message_reports || 0}`} color="info" />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, borderRadius: 4 }}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>
              Top Reported Domains
            </Typography>

            {topDomains.length === 0 ? (
              <Typography sx={{ opacity: 0.7 }}>No domain intelligence yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {topDomains.map((d, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>{d.domain}</Typography>
                    <Chip label={`${d.count}`} size="small" />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, borderRadius: 4 }}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>
              Top Scam Keywords
            </Typography>

            {topKeywords.length === 0 ? (
              <Typography sx={{ opacity: 0.7 }}>No keyword intelligence yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {topKeywords.map((k, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>{k.keyword}</Typography>
                    <Chip label={`${k.count}`} size="small" />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 3, p: 2.5, borderRadius: 4 }}>
        <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
          Latest Threat Reports
        </Typography>
        <Typography sx={{ fontSize: 12, opacity: 0.7, mb: 2 }}>
          Most recent user-submitted scam reports
        </Typography>

        {latestReports.length === 0 ? (
          <Typography sx={{ opacity: 0.7 }}>No threat reports yet.</Typography>
        ) : (
          <Stack spacing={1.5}>
            {latestReports.map((r) => (
              <Box key={r.id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip
                      label={r.content_type}
                      size="small"
                      color={r.content_type === "url" ? "warning" : "info"}
                    />
                    <Chip
                      label={r.status || "pending"}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={r.content}
                >
                  {r.content}
                </Typography>

                <Divider sx={{ mt: 1.5 }} />
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}