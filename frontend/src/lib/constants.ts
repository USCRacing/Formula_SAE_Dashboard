export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api";

export const ROLES = [
  "DAQ",
  "Chief",
  "suspension",
  "electronic",
  "drivetrain",
  "driver",
  "chassis",
  "aero",
  "ergo",
  "powertrain",
] as const;

export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

export const ROUTES = {
  login: "/login",
  dashboard: "/",
  forms: "/forms",
  admin: "/admin",
  adminUsers: "/admin/users",
  adminAudit: "/admin/audit",
  adminLdx: "/admin/ldx",
  adminSensors: "/admin/sensors",
  adminModem: "/admin/modem",
  telemetry: "/telemetry",
} as const;
