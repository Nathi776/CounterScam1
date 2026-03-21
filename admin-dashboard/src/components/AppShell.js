import React from "react";
import {
  Box,
  Drawer,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import StorageIcon from "@mui/icons-material/Storage";
import TimelineIcon from "@mui/icons-material/Timeline";
import LogoutIcon from "@mui/icons-material/Logout";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShieldIcon from "@mui/icons-material/Shield";

const drawerWidth = 260;

export default function AppShell({
  title,
  onRefresh,
  onLogout,
  children,
  currentView,
  setView,
}) {
  const nav = [
    { label: "Overview", icon: <DashboardIcon />, view: "overview" },
    { label: "Reports", icon: <ReportProblemIcon />, view: "reports" },
    { label: "Training Data", icon: <StorageIcon />, view: "training" },
    { label: "Analytics", icon: <TimelineIcon />, view: "analytics" },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: "background.paper",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShieldIcon sx={{ color: "primary.main" }} />
            <Box>
              <Typography sx={{ fontSize: 12, opacity: 0.7, lineHeight: 1 }}>
                CounterScam
              </Typography>
              <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                {title}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Logout">
              <IconButton onClick={onLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 1.5, pt: 1.5 }}>
          <List>
            {nav.map((n) => (
              <ListItemButton
                key={n.view}
                selected={currentView === n.view}
                onClick={() => setView && setView(n.view)}
                sx={{
                  borderRadius: 3,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "rgba(124,58,237,0.2)",
                  },
                  "&:hover": {
                    bgcolor: "rgba(124,58,237,0.12)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{n.icon}</ListItemIcon>
                <ListItemText primary={n.label} />
              </ListItemButton>
            ))}
          </List>

          <Box sx={{ mt: 2, p: 2, borderRadius: 4, bgcolor: "rgba(255,255,255,0.04)" }}>
            <Typography sx={{ fontWeight: 800, fontSize: 13 }}>Focus</Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.75, mt: 0.5 }}>
              {currentView === "overview" &&
                "Monitor pending reports and recent additions to the scam database."}
              {currentView === "reports" &&
                "Review user-submitted reports and decide whether they are scams or safe."}
              {currentView === "training" &&
                "Manage confirmed scam data used to strengthen your detection system."}
              {currentView === "analytics" &&
                "Track reporting trends and confirmed scam activity over time."}
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />
        <Box sx={{ px: 3, py: 3, maxWidth: 1200 }}>{children}</Box>
      </Box>
    </Box>
  );
}