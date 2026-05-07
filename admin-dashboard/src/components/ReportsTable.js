import React from "react";
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Stack,
  Card,
  CardContent,
} from "@mui/material";

const statusChip = (status) => {
  const s = (status || "pending").toLowerCase();

  if (s === "confirmed") return { label: "Confirmed Scam", color: "error" };
  if (s === "safe") return { label: "Marked Safe", color: "success" };
  return { label: "Pending", color: "warning" };
};

export default function ReportsTable({
  reports,
  onConfirm,
  onMarkSafe,
  onDelete,
}) {
  if (!reports || reports.length === 0) {
    return (
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography sx={{ opacity: 0.7 }}>
            No reports submitted yet.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 4 }}>
      <CardContent>
        <Typography sx={{ fontWeight: 900, mb: 2 }}>
          User Scam Reports
        </Typography>

        <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={180}>Time</TableCell>
            <TableCell width={120}>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Content</TableCell>
            <TableCell width={260}>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {reports.map((r) => {
            const sc = statusChip(r.status);

            return (
              <TableRow key={r.id}>
                <TableCell sx={{ fontSize: 12 }}>
                  {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                </TableCell>

                <TableCell>
                  <Chip
                    label={r.content_type}
                    size="small"
                    color={r.content_type === "url" ? "warning" : "info"}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={sc.label}
                    size="small"
                    color={sc.color}
                  />
                </TableCell>

                <TableCell
                  sx={{
                    maxWidth: 420,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={r.content}
                >
                  {r.content}
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => onConfirm(r.id)}
                    >
                      Confirm
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => onMarkSafe(r.id)}
                    >
                      Safe
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => onDelete(r.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </CardContent>
    </Card>
  );
}