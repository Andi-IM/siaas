import { LayoutDashboard, Users, BookOpen, FileSpreadsheet, Settings } from "lucide-react";

export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/siswa", label: "Peserta Didik", icon: Users, exact: false },
  { href: "/kurikulum", label: "Kurikulum", icon: BookOpen, exact: false },
  { href: "/rekap", label: "Rekap Data", icon: FileSpreadsheet, exact: false },
  { href: "#", label: "Pengaturan", icon: Settings, exact: false },
];

export type NavItem = typeof navItems[number];
