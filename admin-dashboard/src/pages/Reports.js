import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import AppShell from "../components/AppShell";
import ReportsTable from "../components/ReportsTable";
import {
  getReports,
  confirmReport,
  markReportSafe,
  deleteReport,
} from "../api/api";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setReports([]);
      setToast({
        open: true,
        message: err.message || "Failed to load reports",
        severity: "error",
      });
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

  const handleConfirm = async (id) => {
    try {
      await confirmReport(id);
      await loadReports();
      setToast({ open: true, message: "Report confirmed as scam", severity: "success" });
    } catch (err) {
      setToast({ open: true, message: err.message || "Failed to confirm report", severity: "error" });
    }
  };

  const handleSafe = async (id) => {
    try {
      await markReportSafe(id);
      await loadReports();
      setToast({ open: true, message: "Report marked safe", severity: "success" });
    } catch (err) {
      setToast({ open: true, message: err.message || "Failed to update report", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReport(id);
      await loadReports();
      setToast({ open: true, message: "Report deleted", severity: "success" });
    } catch (err) {
      setToast({ open: true, message: err.message || "Failed to delete report", severity: "error" });
    }
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
          Review user-submitted scam links and messages.
        </Typography>
      </Box>

      {!loading && (
        <ReportsTable
          reports={reports}
          onConfirm={handleConfirm}
          onMarkSafe={handleSafe}
          onDelete={handleDelete}
        />
      )}

      {loading && (
        <Typography sx={{ opacity: 0.7 }}>Loading reports...</Typography>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast({ ...toast, open: false })}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </AppShell>
  );
}