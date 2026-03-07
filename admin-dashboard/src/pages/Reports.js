import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
} from "@mui/material";
import { getReports } from "../api/api";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await getReports();
        setReports(data);
      } catch (err) {
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  if (loading) {
    return <Typography>Loading reports...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Reported Scams
      </Typography>

      {reports.length === 0 ? (
        <Typography>No reports yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {reports.map((report) => (
            <Card key={report.id} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip
                    label={report.content_type}
                    color={report.content_type === "url" ? "warning" : "info"}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {report.reported_at || "N/A"}
                  </Typography>
                </Stack>

                <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {report.content}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}