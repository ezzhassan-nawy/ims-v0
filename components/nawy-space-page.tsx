"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Satellite,
  Camera,
  Building2,
  Layers,
  MapPin,
  BarChart3,
  FileDown,
  FileSpreadsheet,
  FileText,
  Columns3,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Ruler,
  Activity,
  Globe,
  Zap,
  ScanSearch,
  GripVertical,
  Group,
  Edit,
  Trash2,
  Plus,
  Check,
  CalendarRange,
  Copy,
  Download,
  Maximize2,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type ImageQuality = "Medium" | "High" | "Very High" | "Super High" | "Ultra High"
type ImageType = "New" | "Archived"

interface DeveloperInfo {
  id: string
  name: string
  initials: string
  color: string
}

interface SatelliteImage {
  id: string
  developer: DeveloperInfo
  areaId: string
  areaName: string
  subAreaName: string
  projectId: string
  projectName: string
  phaseId: string
  phaseName: string
  quality: ImageQuality
  resolutionM: number
  totalAreaKm2: number
  areaCapturedKm2: number
  costUsd: number
  costEgp: number
  systemRequested: string
  requestedAt: string
  capturedAt: string
  type: ImageType
  satellite: string
  createdAt: string
  updatedAt: string
  metadata: {
    cloudCoverPct: number
    incidenceAngle: number
    sunElevation: number
    sunAzimuth: number
    processingLevel: string
    bandsAvailable: string[]
    bboxMinLat: number
    bboxMaxLat: number
    bboxMinLng: number
    bboxMaxLng: number
  }
}

// ─── Cost rate helper ─────────────────────────────────────────────────────────

function getCostRatePerKm2(system: string): number {
  if (system === "Sentinel-2") return 0
  if (system === "SPOT-7") return 2.5
  if (system === "Pleiades-1A" || system === "Pleiades-1B") return 20
  if (system === "WorldView-2") return 28
  if (system === "WorldView-3") return 35
  return 0
}

function calcCosts(totalArea: number, system: string, multiplier: number): { areaCapturedKm2: number; costUsd: number; costEgp: number } {
  const areaCapturedKm2 = parseFloat((totalArea * multiplier).toFixed(3))
  const costUsd = parseFloat((areaCapturedKm2 * getCostRatePerKm2(system)).toFixed(2))
  const costEgp = parseFloat((costUsd * 50).toFixed(2))
  return { areaCapturedKm2, costUsd, costEgp }
}

// ─── Zoom height helper ────────────────────────────────────────────────────────

// GSD derived from satellite constellation name, not ingestion system
function getZoomHeight(satellite: string): string {
  if (satellite.includes("WorldView Legion") || satellite.includes("WorldView-3")) return "0.25 – 0.31 m"
  if (satellite.includes("WorldView-2"))  return "0.46 – 0.52 m"
  if (satellite.includes("Pleiades"))     return "0.50 – 0.75 m"
  if (satellite.includes("SPOT"))         return "1.5 – 2.0 m"
  if (satellite.includes("Sentinel") || satellite.includes("Copernicus")) return "10.0 m"
  return "—"
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SATELLITE_IMAGES: SatelliteImage[] = [
  {
    id: "SAT-2025-001",
    developer: { id: "DV-001", name: "Palm Hills Developments", initials: "PH", color: "#0d6e4f" },
    areaId: "AR-006", areaName: "6th of October", subAreaName: "Golf District",
    projectId: "PJ-0124", projectName: "Palm Hills October",
    phaseId: "PH-0124-02", phaseName: "Phase 2",
    quality: "Very High", resolutionM: 1,
    totalAreaKm2: 3.24,
    ...calcCosts(3.24, "Pleiades-1A", 1.07),
    systemRequested: "IMS",
    requestedAt: "2025-04-10 09:00", capturedAt: "2025-04-15 11:23",
    type: "New", satellite: "Pleiades NEO", createdAt: "2025-04-15 14:32", updatedAt: "2025-04-16 16:40",
    metadata: { cloudCoverPct: 2.1, incidenceAngle: 8.4, sunElevation: 61.2, sunAzimuth: 154.3, processingLevel: "Ortho", bandsAvailable: ["RGB", "NIR"], bboxMinLat: 29.88, bboxMaxLat: 29.93, bboxMinLng: 30.94, bboxMaxLng: 31.01 },
  },
  {
    id: "SAT-2025-002",
    developer: { id: "DV-002", name: "Emaar Misr", initials: "EM", color: "#b45309" },
    areaId: "AR-014", areaName: "Sahel", subAreaName: "Sidi Abdel Rahman",
    projectId: "PJ-0055", projectName: "Marassi",
    phaseId: "PH-0055-05", phaseName: "Phase 5",
    quality: "Ultra High", resolutionM: 0.25,
    totalAreaKm2: 7.82,
    ...calcCosts(7.82, "WorldView-3", 1.09),
    systemRequested: "E-realty",
    requestedAt: "2025-03-28 08:30", capturedAt: "2025-04-02 10:14",
    type: "New", satellite: "WorldView Legion", createdAt: "2025-04-02 09:15", updatedAt: "2025-04-03 10:22",
    metadata: { cloudCoverPct: 0.0, incidenceAngle: 5.1, sunElevation: 68.4, sunAzimuth: 162.7, processingLevel: "Pan-sharpened Ortho", bandsAvailable: ["RGB", "NIR", "SWIR", "Pan"], bboxMinLat: 30.96, bboxMaxLat: 31.03, bboxMinLng: 28.42, bboxMaxLng: 28.51 },
  },
  {
    id: "SAT-2025-003",
    developer: { id: "DV-003", name: "SODIC", initials: "SD", color: "#1d4ed8" },
    areaId: "AR-006", areaName: "6th of October", subAreaName: "Golf District",
    projectId: "PJ-0088", projectName: "Allegria",
    phaseId: "PH-0088-01", phaseName: "Phase 1",
    quality: "High", resolutionM: 3,
    totalAreaKm2: 2.15,
    ...calcCosts(2.15, "SPOT-7", 1.06),
    systemRequested: "Listing",
    requestedAt: "2024-11-05 10:00", capturedAt: "2024-11-18 09:55",
    type: "Archived", satellite: "SPOT-7", createdAt: "2024-11-18 11:48", updatedAt: "2024-11-19 13:05",
    metadata: { cloudCoverPct: 5.4, incidenceAngle: 14.2, sunElevation: 52.8, sunAzimuth: 170.1, processingLevel: "Ortho Ready", bandsAvailable: ["RGB", "NIR"], bboxMinLat: 29.94, bboxMaxLat: 29.98, bboxMinLng: 30.87, bboxMaxLng: 30.93 },
  },
  {
    id: "SAT-2025-004",
    developer: { id: "DV-004", name: "Hyde Park Developments", initials: "HP", color: "#7c3aed" },
    areaId: "AR-001", areaName: "New Cairo", subAreaName: "5th Settlement",
    projectId: "PJ-0201", projectName: "Hyde Park Estate",
    phaseId: "PH-0201-03", phaseName: "Phase 3",
    quality: "Very High", resolutionM: 1,
    totalAreaKm2: 5.41,
    ...calcCosts(5.41, "Pleiades-1B", 1.08),
    systemRequested: "IMS",
    requestedAt: "2025-03-14 11:00", capturedAt: "2025-03-18 13:02",
    type: "New", satellite: "Pleiades NEO", createdAt: "2025-03-18 16:05", updatedAt: "2025-03-19 17:33",
    metadata: { cloudCoverPct: 1.2, incidenceAngle: 7.8, sunElevation: 63.5, sunAzimuth: 149.2, processingLevel: "Ortho", bandsAvailable: ["RGB", "NIR"], bboxMinLat: 30.01, bboxMaxLat: 30.08, bboxMinLng: 31.44, bboxMaxLng: 31.52 },
  },
  {
    id: "SAT-2025-005",
    developer: { id: "DV-005", name: "Mountain View", initials: "MV", color: "#059669" },
    areaId: "AR-001", areaName: "New Cairo", subAreaName: "5th Settlement",
    projectId: "PJ-0312", projectName: "Mountain View iCity",
    phaseId: "PH-0312-04", phaseName: "Phase 4",
    quality: "Super High", resolutionM: 0.5,
    totalAreaKm2: 4.28,
    ...calcCosts(4.28, "WorldView-2", 1.10),
    systemRequested: "E-realty",
    requestedAt: "2025-02-20 07:00", capturedAt: "2025-02-24 08:41",
    type: "New", satellite: "WorldView-2", createdAt: "2025-02-24 08:27", updatedAt: "2025-02-25 09:58",
    metadata: { cloudCoverPct: 3.7, incidenceAngle: 11.9, sunElevation: 57.4, sunAzimuth: 158.8, processingLevel: "Pan-sharpened Ortho", bandsAvailable: ["RGB", "NIR", "SWIR", "Pan"], bboxMinLat: 30.04, bboxMaxLat: 30.10, bboxMinLng: 31.55, bboxMaxLng: 31.62 },
  },
  {
    id: "SAT-2025-006",
    developer: { id: "DV-006", name: "Ora Developers", initials: "OR", color: "#be185d" },
    areaId: "AR-014", areaName: "Sahel", subAreaName: "Sidi Abdel Rahman",
    projectId: "PJ-0441", projectName: "Silversands",
    phaseId: "PH-0441-02", phaseName: "Phase 2",
    quality: "Ultra High", resolutionM: 0.25,
    totalAreaKm2: 2.93,
    ...calcCosts(2.93, "WorldView-3", 1.06),
    systemRequested: "Listing",
    requestedAt: "2025-04-01 06:00", capturedAt: "2025-04-04 07:55",
    type: "New", satellite: "WorldView Legion", createdAt: "2025-04-04 13:51", updatedAt: "2025-04-05 15:14",
    metadata: { cloudCoverPct: 0.0, incidenceAngle: 4.3, sunElevation: 70.1, sunAzimuth: 165.4, processingLevel: "Pan-sharpened Ortho", bandsAvailable: ["RGB", "NIR", "SWIR", "Pan", "Coastal"], bboxMinLat: 31.12, bboxMaxLat: 31.17, bboxMinLng: 27.68, bboxMaxLng: 27.74 },
  },
  {
    id: "SAT-2025-007",
    developer: { id: "DV-007", name: "Tatweer Misr", initials: "TM", color: "#0284c7" },
    areaId: "AR-014", areaName: "Sahel", subAreaName: "Sidi Abdel Rahman",
    projectId: "PJ-0522", projectName: "Fouka Bay",
    phaseId: "PH-0522-01", phaseName: "Phase 1",
    quality: "Very High", resolutionM: 1,
    totalAreaKm2: 1.87,
    ...calcCosts(1.87, "Pleiades-1A", 1.08),
    systemRequested: "IMS",
    requestedAt: "2025-03-05 08:00", capturedAt: "2025-03-09 11:28",
    type: "New", satellite: "Sentinel-2", createdAt: "2025-03-09 10:33", updatedAt: "2025-03-10 11:47",
    metadata: { cloudCoverPct: 1.8, incidenceAngle: 9.2, sunElevation: 60.8, sunAzimuth: 160.0, processingLevel: "Ortho", bandsAvailable: ["RGB", "NIR"], bboxMinLat: 31.06, bboxMaxLat: 31.10, bboxMinLng: 28.91, bboxMaxLng: 28.96 },
  },
  {
    id: "SAT-2025-008",
    developer: { id: "DV-006", name: "Ora Developers", initials: "OR", color: "#be185d" },
    areaId: "AR-009", areaName: "Sheikh Zayed", subAreaName: "Beverly Hills",
    projectId: "PJ-0610", projectName: "ZED",
    phaseId: "PH-0610-03", phaseName: "Phase 3",
    quality: "High", resolutionM: 3,
    totalAreaKm2: 3.62,
    ...calcCosts(3.62, "SPOT-7", 1.05),
    systemRequested: "E-realty",
    requestedAt: "2025-01-18 09:00", capturedAt: "2025-01-28 10:11",
    type: "New", satellite: "SPOT-7", createdAt: "2025-01-28 15:19", updatedAt: "2025-01-29 16:52",
    metadata: { cloudCoverPct: 8.2, incidenceAngle: 18.4, sunElevation: 43.1, sunAzimuth: 175.6, processingLevel: "Ortho Ready", bandsAvailable: ["RGB", "NIR"], bboxMinLat: 30.02, bboxMaxLat: 30.08, bboxMinLng: 30.96, bboxMaxLng: 31.04 },
  },
  {
    id: "SAT-2025-009",
    developer: { id: "DV-003", name: "SODIC", initials: "SD", color: "#1d4ed8" },
    areaId: "AR-001", areaName: "New Cairo", subAreaName: "5th Settlement",
    projectId: "PJ-0711", projectName: "Villette",
    phaseId: "PH-0711-02", phaseName: "Phase 2",
    quality: "Very High", resolutionM: 1,
    totalAreaKm2: 6.14,
    ...calcCosts(6.14, "Pleiades-1B", 1.09),
    systemRequested: "Listing",
    requestedAt: "2024-10-12 10:30", capturedAt: "2024-10-17 12:05",
    type: "Archived", satellite: "Pleiades NEO", createdAt: "2024-10-17 07:42", updatedAt: "2024-10-18 08:19",
    metadata: { cloudCoverPct: 4.1, incidenceAngle: 10.7, sunElevation: 55.9, sunAzimuth: 153.8, processingLevel: "Ortho", bandsAvailable: ["RGB", "NIR"], bboxMinLat: 30.06, bboxMaxLat: 30.13, bboxMinLng: 31.49, bboxMaxLng: 31.58 },
  },
  {
    id: "SAT-2025-010",
    developer: { id: "DV-001", name: "Palm Hills Developments", initials: "PH", color: "#0d6e4f" },
    areaId: "AR-001", areaName: "New Cairo", subAreaName: "5th Settlement",
    projectId: "PJ-0802", projectName: "Palm Hills New Cairo",
    phaseId: "PH-0802-01", phaseName: "Phase 1",
    quality: "Super High", resolutionM: 0.5,
    totalAreaKm2: 4.77,
    ...calcCosts(4.77, "WorldView-2", 1.07),
    systemRequested: "IMS",
    requestedAt: "2025-04-08 07:00", capturedAt: "2025-04-12 09:33",
    type: "New", satellite: "WorldView-2", createdAt: "2025-04-12 12:58", updatedAt: "2025-04-13 14:26",
    metadata: { cloudCoverPct: 0.6, incidenceAngle: 6.2, sunElevation: 64.7, sunAzimuth: 151.4, processingLevel: "Pan-sharpened Ortho", bandsAvailable: ["RGB", "NIR", "Pan"], bboxMinLat: 30.08, bboxMaxLat: 30.15, bboxMinLng: 31.40, bboxMaxLng: 31.48 },
  },
  {
    id: "SAT-2024-011",
    developer: { id: "DV-007", name: "Tatweer Misr", initials: "TM", color: "#0284c7" },
    areaId: "AR-018", areaName: "Ain Sokhna", subAreaName: "Galala City",
    projectId: "PJ-0901", projectName: "Telal El Sokhna",
    phaseId: "PH-0901-04", phaseName: "Phase 4",
    quality: "Very High", resolutionM: 1,
    totalAreaKm2: 3.09,
    ...calcCosts(3.09, "Pleiades-1A", 1.10),
    systemRequested: "E-realty",
    requestedAt: "2024-07-22 06:00", capturedAt: "2024-07-27 08:14",
    type: "Archived", satellite: "Sentinel-1", createdAt: "2024-07-27 17:11", updatedAt: "2024-07-28 18:03",
    metadata: { cloudCoverPct: 0.0, incidenceAngle: 8.8, sunElevation: 70.3, sunAzimuth: 145.6, processingLevel: "Ortho", bandsAvailable: ["RGB", "NIR"], bboxMinLat: 29.62, bboxMaxLat: 29.67, bboxMinLng: 32.31, bboxMaxLng: 32.38 },
  },
  {
    id: "SAT-2024-012",
    developer: { id: "DV-006", name: "Ora Developers", initials: "OR", color: "#be185d" },
    areaId: "AR-006", areaName: "6th of October", subAreaName: "Golf District",
    projectId: "PJ-1002", projectName: "Badya",
    phaseId: "PH-1002-02", phaseName: "Phase 2",
    quality: "Super High", resolutionM: 0.5,
    totalAreaKm2: 8.34,
    ...calcCosts(8.34, "WorldView-2", 1.08),
    systemRequested: "Listing",
    requestedAt: "2024-08-10 07:00", capturedAt: "2024-08-14 10:22",
    type: "Archived", satellite: "Copernicus-3", createdAt: "2024-08-14 09:46", updatedAt: "2024-08-15 10:51",
    metadata: { cloudCoverPct: 2.9, incidenceAngle: 13.1, sunElevation: 67.8, sunAzimuth: 148.2, processingLevel: "Pan-sharpened Ortho", bandsAvailable: ["RGB", "NIR", "SWIR", "Pan"], bboxMinLat: 30.11, bboxMaxLat: 30.21, bboxMinLng: 30.71, bboxMaxLng: 30.82 },
  },
  {
    id: "SAT-2024-013",
    developer: { id: "DV-008", name: "MNHD", initials: "MN", color: "#9d174d" },
    areaId: "AR-001", areaName: "New Cairo", subAreaName: "5th Settlement",
    projectId: "PJ-1105", projectName: "Sarai",
    phaseId: "PH-1105-03", phaseName: "Phase 3",
    quality: "High", resolutionM: 3,
    totalAreaKm2: 5.22,
    ...calcCosts(5.22, "SPOT-7", 1.06),
    systemRequested: "IMS",
    requestedAt: "2024-05-30 09:00", capturedAt: "2024-06-10 11:40",
    type: "Archived", satellite: "SPOT-7", createdAt: "2024-06-10 14:03", updatedAt: "2024-06-11 15:38",
    metadata: { cloudCoverPct: 6.8, incidenceAngle: 16.4, sunElevation: 72.1, sunAzimuth: 142.3, processingLevel: "Ortho Ready", bandsAvailable: ["RGB", "NIR"], bboxMinLat: 30.12, bboxMaxLat: 30.19, bboxMinLng: 31.58, bboxMaxLng: 31.67 },
  },
  {
    id: "SAT-2024-014",
    developer: { id: "DV-009", name: "La Vista Developments", initials: "LV", color: "#92400e" },
    areaId: "AR-018", areaName: "Ain Sokhna", subAreaName: "Galala City",
    projectId: "PJ-1204", projectName: "La Vista Gardens",
    phaseId: "PH-1204-01", phaseName: "Phase 1",
    quality: "Medium", resolutionM: 10,
    totalAreaKm2: 1.43,
    ...calcCosts(1.43, "Sentinel-2", 1.12),
    systemRequested: "E-realty",
    requestedAt: "2024-03-01 00:00", capturedAt: "2024-03-06 09:22",
    type: "Archived", satellite: "Sentinel-2", createdAt: "2024-03-06 11:22", updatedAt: "2024-03-07 12:44",
    metadata: { cloudCoverPct: 11.4, incidenceAngle: 22.7, sunElevation: 48.3, sunAzimuth: 168.9, processingLevel: "L2A Surface Reflectance", bandsAvailable: ["RGB", "NIR", "SWIR", "Red Edge"], bboxMinLat: 29.58, bboxMaxLat: 29.61, bboxMinLng: 32.40, bboxMaxLng: 32.44 },
  },
  {
    id: "SAT-2025-015",
    developer: { id: "DV-010", name: "Hassan Allam Properties", initials: "HA", color: "#15803d" },
    areaId: "AR-001", areaName: "New Cairo", subAreaName: "5th Settlement",
    projectId: "PJ-1310", projectName: "The Lake",
    phaseId: "PH-1310-01", phaseName: "Phase 1",
    quality: "Ultra High", resolutionM: 0.25,
    totalAreaKm2: 2.41,
    ...calcCosts(2.41, "WorldView-3", 1.06),
    systemRequested: "Listing",
    requestedAt: "2025-04-14 06:00", capturedAt: "2025-04-17 08:50",
    type: "New", satellite: "WorldView Legion", createdAt: "2025-04-17 16:37", updatedAt: "2025-04-18 17:09",
    metadata: { cloudCoverPct: 0.0, incidenceAngle: 3.9, sunElevation: 66.2, sunAzimuth: 152.1, processingLevel: "Pan-sharpened Ortho", bandsAvailable: ["RGB", "NIR", "SWIR", "Pan", "Coastal", "Yellow"], bboxMinLat: 30.02, bboxMaxLat: 30.06, bboxMinLng: 31.36, bboxMaxLng: 31.41 },
  },
  {
    id: "SAT-2025-016",
    developer: { id: "DV-002", name: "Emaar Misr", initials: "EM", color: "#b45309" },
    areaId: "AR-001", areaName: "New Cairo", subAreaName: "5th Settlement",
    projectId: "PJ-1408", projectName: "Uptown Cairo",
    phaseId: "PH-1408-06", phaseName: "Phase 6",
    quality: "Very High", resolutionM: 1,
    totalAreaKm2: 7.15,
    ...calcCosts(7.15, "Pleiades-1A", 1.07),
    systemRequested: "IMS",
    requestedAt: "2025-03-22 09:00", capturedAt: "2025-03-25 12:18",
    type: "New", satellite: "Pleiades NEO", createdAt: "2025-03-25 08:54", updatedAt: "2025-03-26 09:31",
    metadata: { cloudCoverPct: 3.3, incidenceAngle: 10.2, sunElevation: 60.4, sunAzimuth: 156.7, processingLevel: "Ortho", bandsAvailable: ["RGB", "NIR"], bboxMinLat: 29.96, bboxMaxLat: 30.04, bboxMinLng: 31.43, bboxMaxLng: 31.52 },
  },
  {
    id: "SAT-2025-017",
    developer: { id: "DV-006", name: "Ora Developers", initials: "OR", color: "#be185d" },
    areaId: "AR-014", areaName: "Sahel", subAreaName: "Sidi Abdel Rahman",
    projectId: "PJ-1510", projectName: "Riviera",
    phaseId: "PH-1510-01", phaseName: "Phase 1",
    quality: "Ultra High", resolutionM: 0.25,
    totalAreaKm2: 4.67,
    ...calcCosts(4.67, "WorldView-3", 1.09),
    systemRequested: "E-realty",
    requestedAt: "2025-04-06 05:30", capturedAt: "2025-04-09 07:44",
    type: "New", satellite: "WorldView Legion", createdAt: "2025-04-09 13:08", updatedAt: "2025-04-10 14:50",
    metadata: { cloudCoverPct: 0.0, incidenceAngle: 4.7, sunElevation: 69.8, sunAzimuth: 163.3, processingLevel: "Pan-sharpened Ortho", bandsAvailable: ["RGB", "NIR", "SWIR", "Pan"], bboxMinLat: 31.18, bboxMaxLat: 31.24, bboxMinLng: 27.41, bboxMaxLng: 27.48 },
  },
  {
    id: "SAT-2025-018",
    developer: { id: "DV-003", name: "SODIC", initials: "SD", color: "#1d4ed8" },
    areaId: "AR-001", areaName: "New Cairo", subAreaName: "5th Settlement",
    projectId: "PJ-1612", projectName: "Eastown",
    phaseId: "PH-1612-05", phaseName: "Phase 5",
    quality: "High", resolutionM: 3,
    totalAreaKm2: 3.88,
    ...calcCosts(3.88, "SPOT-7", 1.08),
    systemRequested: "Listing",
    requestedAt: "2025-02-10 08:00", capturedAt: "2025-02-22 10:30",
    type: "New", satellite: "Sentinel-1", createdAt: "2025-02-22 10:19", updatedAt: "2025-02-23 11:08",
    metadata: { cloudCoverPct: 7.1, incidenceAngle: 15.8, sunElevation: 50.6, sunAzimuth: 172.4, processingLevel: "Ortho Ready", bandsAvailable: ["RGB", "NIR"], bboxMinLat: 30.07, bboxMaxLat: 30.12, bboxMinLng: 31.46, bboxMaxLng: 31.53 },
  },
  {
    id: "SAT-2025-019",
    developer: { id: "DV-001", name: "Palm Hills Developments", initials: "PH", color: "#0d6e4f" },
    areaId: "AR-006", areaName: "6th of October", subAreaName: "Golf District",
    projectId: "PJ-1711", projectName: "O West",
    phaseId: "PH-1711-03", phaseName: "Phase 3",
    quality: "Very High", resolutionM: 1,
    totalAreaKm2: 6.23,
    ...calcCosts(6.23, "Pleiades-1B", 1.06),
    systemRequested: "IMS",
    requestedAt: "2025-04-03 10:00", capturedAt: "2025-04-07 12:48",
    type: "New", satellite: "Pleiades NEO", createdAt: "2025-04-07 15:44", updatedAt: "2025-04-08 16:21",
    metadata: { cloudCoverPct: 1.4, incidenceAngle: 8.0, sunElevation: 62.9, sunAzimuth: 155.8, processingLevel: "Ortho", bandsAvailable: ["RGB", "NIR"], bboxMinLat: 29.99, bboxMaxLat: 30.06, bboxMinLng: 30.76, bboxMaxLng: 30.84 },
  },
  {
    id: "SAT-2024-020",
    developer: { id: "DV-005", name: "Mountain View", initials: "MV", color: "#059669" },
    areaId: "AR-006", areaName: "6th of October", subAreaName: "Golf District",
    projectId: "PJ-1808", projectName: "Mountain View October",
    phaseId: "PH-1808-02", phaseName: "Phase 2",
    quality: "Super High", resolutionM: 0.5,
    totalAreaKm2: 2.64,
    ...calcCosts(2.64, "WorldView-2", 1.10),
    systemRequested: "E-realty",
    requestedAt: "2024-09-14 07:00", capturedAt: "2024-09-18 09:05",
    type: "Archived", satellite: "WorldView-2", createdAt: "2024-09-18 12:31", updatedAt: "2024-09-19 13:55",
    metadata: { cloudCoverPct: 4.8, incidenceAngle: 12.6, sunElevation: 65.4, sunAzimuth: 147.9, processingLevel: "Pan-sharpened Ortho", bandsAvailable: ["RGB", "NIR", "Pan"], bboxMinLat: 30.06, bboxMaxLat: 30.11, bboxMinLng: 30.69, bboxMaxLng: 30.76 },
  },
]

// ─── Constants ─────────────────────────────────────────────────────────────────

const QUALITY_ORDER: ImageQuality[] = ["Medium", "High", "Very High", "Super High", "Ultra High"]

const QUALITY_RESOLUTION: Record<ImageQuality, string> = {
  "Medium":     "10 m",
  "High":       "3 m",
  "Very High":  "1 m",
  "Super High": "0.5 m",
  "Ultra High": "0.25 m",
}

const ALL_COLUMNS = [
  { id: "image",        label: "Image",            alwaysVisible: true },
  { id: "developer",    label: "Developer",         alwaysVisible: true },
  { id: "area",         label: "Area",              alwaysVisible: false },
  { id: "project",      label: "Project",           alwaysVisible: false },
  { id: "phase",        label: "Phase",             alwaysVisible: false },
  { id: "quality",      label: "Quality",           alwaysVisible: false },
  { id: "zoomHeight",   label: "GSD Range",         alwaysVisible: false },
  { id: "projectArea",  label: "Project Area",      alwaysVisible: false },
  { id: "areaCaptured", label: "Area Captured",     alwaysVisible: false },
  { id: "system",       label: "System Requested",  alwaysVisible: false },
  { id: "costUsd",      label: "Cost (USD)",        alwaysVisible: false },
  { id: "costEgp",      label: "Cost (EGP)",        alwaysVisible: false },
  { id: "requested",    label: "Requested",         alwaysVisible: false },
  { id: "captured",     label: "Captured",          alwaysVisible: false },
  { id: "type",         label: "Type",              alwaysVisible: false },
  { id: "satellite",    label: "Satellite",         alwaysVisible: false },
  { id: "createdAt",    label: "Created At",        alwaysVisible: false },
  { id: "updatedAt",    label: "Updated At",        alwaysVisible: false },
]

// ─── Helper: area conversions ──────────────────────────────────────────────────

function convertArea(km2: number) {
  return {
    km2:      km2.toFixed(2),
    m2:       (km2 * 1_000_000).toLocaleString(),
    feddans:  (km2 * 238.095).toFixed(1),
    acres:    (km2 * 247.105).toFixed(1),
    hectares: (km2 * 100).toFixed(1),
  }
}

// ─── Helper Components ─────────────────────────────────────────────────────────

function SatThumbnail({ image, size = "sm" }: { image: SatelliteImage; size?: "sm" | "lg" }) {
  const isCoastal = image.areaName.includes("Sahel") || image.areaName.includes("Sokhna")
  const isUrban   = image.areaName.includes("Cairo") || image.areaName.includes("October") || image.areaName.includes("Zayed")
  const palette   = isCoastal
    ? { bg: "#1a4e6e", a: "#28728a", b: "#e8d9a0", c: "#2e8c66", d: "#4a9cb8" }
    : isUrban
    ? { bg: "#484858", a: "#8a9a88", b: "#c8c8b8", c: "#6a7868", d: "#9a9a8a" }
    : { bg: "#2e5e3e", a: "#4e8a5e", b: "#d8cc8e", c: "#5a9a6a", d: "#7ab888" }

  const h = image.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)

  if (size === "lg") {
    return (
      <div className="w-full h-52 rounded-lg overflow-hidden relative" style={{ backgroundColor: palette.bg }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(${h % 360}deg, ${palette.a}88 0%, ${palette.b}66 35%, ${palette.c}88 65%, ${palette.d}44 100%)` }} />
        <div className="absolute" style={{ top: '0', left: '0', width: `${40 + (h % 20)}%`, height: `${35 + (h % 25)}%`, backgroundColor: palette.a, opacity: 0.75 }} />
        <div className="absolute" style={{ top: '0', right: '0', width: `${30 + (h % 25)}%`, height: `${45 + (h % 20)}%`, backgroundColor: palette.b, opacity: 0.6 }} />
        <div className="absolute" style={{ bottom: '0', left: '0', right: '0', height: `${25 + (h % 15)}%`, backgroundColor: palette.c, opacity: 0.65 }} />
        <div className="absolute" style={{ top: `${25 + (h % 20)}%`, left: `${20 + (h % 15)}%`, width: `${30 + (h % 20)}%`, height: `${25 + (h % 20)}%`, backgroundColor: palette.d, opacity: 0.5 }} />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-8 h-8 opacity-40">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
            <div className="absolute inset-1 rounded-full border border-white" />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
          {image.id}
        </div>
        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
          {QUALITY_RESOLUTION[image.quality]}
        </div>
      </div>
    )
  }

  return (
    <div className="w-9 h-9 rounded flex-shrink-0 overflow-hidden relative" style={{ backgroundColor: palette.bg }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(${h % 360}deg, ${palette.a} 0%, ${palette.b}aa 50%, ${palette.c} 100%)` }} />
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)', backgroundSize: '9px 9px' }} />
    </div>
  )
}

function DeveloperAvatar({ dev }: { dev: DeveloperInfo }) {
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: dev.color }}>
      {dev.initials}
    </div>
  )
}

function QualityBadge({ quality }: { quality: ImageQuality }) {
  const styles: Record<ImageQuality, string> = {
    "Medium":     "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300",
    "High":       "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    "Very High":  "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400",
    "Super High": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
    "Ultra High": "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
  }
  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant="outline" className={cn("text-[11px] font-medium px-1.5 py-0", styles[quality])}>
        {quality}
      </Badge>
      {/* resolution label removed — shown in GSD Range column instead */}
    </div>
  )
}

function TypeBadge({ type }: { type: ImageType }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-medium",
        type === "New"
          ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
          : "bg-muted text-muted-foreground",
      )}
    >
      {type}
    </Badge>
  )
}

function SystemBadge({ system }: { system: string }) {
  let cls = "bg-slate-100 text-slate-700 border-slate-200"
  if (system === "IMS")      cls = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
  else if (system === "E-realty") cls = "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400"
  else if (system === "Listing")  cls = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"

  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium px-1.5 py-0 whitespace-nowrap", cls)}>
      {system}
    </Badge>
  )
}

function AreaTag({ areaName }: { areaName: string }) {
  let cls = "bg-slate-50 text-slate-700 border-slate-200"
  if (areaName === "New Cairo") cls = "bg-blue-50 text-blue-700 border-blue-200"
  else if (areaName === "6th of October") cls = "bg-orange-50 text-orange-700 border-orange-200"
  else if (areaName === "Sahel") cls = "bg-teal-50 text-teal-700 border-teal-200"
  else if (areaName === "Ain Sokhna") cls = "bg-amber-50 text-amber-700 border-amber-200"
  else if (areaName === "Sheikh Zayed") cls = "bg-purple-50 text-purple-700 border-purple-200"

  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium px-1.5 py-0 whitespace-nowrap", cls)}>
      {areaName}
    </Badge>
  )
}

// ─── Sort / Group helpers ──────────────────────────────────────────────────────

type MultiSortConfig = { column: string; direction: "asc" | "desc" }

function SortIcon({ col, configs }: { col: string; configs: MultiSortConfig[] }) {
  const cfg = configs.find((c) => c.column === col)
  if (!cfg) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />
  if (cfg.direction === "asc") return <ArrowUp className="h-3 w-3 ml-1" />
  return <ArrowDown className="h-3 w-3 ml-1" />
}

const IMAGE_SORT_COLS = [
  { id: "id",              label: "Image ID" },
  { id: "developer",       label: "Developer" },
  { id: "areaName",        label: "Area" },
  { id: "projectName",     label: "Project" },
  { id: "phaseName",       label: "Phase" },
  { id: "quality",         label: "Quality" },
  { id: "totalAreaKm2",    label: "Project Area" },
  { id: "areaCapturedKm2", label: "Area Captured" },
  { id: "costUsd",         label: "Cost (USD)" },
  { id: "zoomHeight",      label: "GSD Range" },
  { id: "systemRequested", label: "System Requested" },
  { id: "requestedAt",     label: "Requested" },
  { id: "capturedAt",      label: "Captured" },
  { id: "type",            label: "Type" },
  { id: "createdAt",       label: "Created At" },
]

const IMAGE_GROUP_COLS = [
  { id: "developer",       label: "Developer" },
  { id: "areaName",        label: "Area" },
  { id: "projectName",     label: "Project" },
  { id: "phaseName",       label: "Phase" },
  { id: "quality",         label: "Quality" },
  { id: "type",            label: "Type" },
  { id: "systemRequested", label: "System Requested" },
]

function getGroupValue(row: SatelliteImage, col: string): string {
  switch (col) {
    case "developer":       return row.developer.name
    case "areaName":        return row.areaName
    case "projectName":     return row.projectName
    case "phaseName":       return row.phaseName
    case "quality":         return row.quality
    case "type":            return row.type
    case "systemRequested": return row.systemRequested
    default:                return ""
  }
}

function sortRows(rows: SatelliteImage[], configs: MultiSortConfig[]): SatelliteImage[] {
  if (configs.length === 0) return rows
  return [...rows].sort((a, b) => {
    for (const cfg of configs) {
      let va: string | number = "", vb: string | number = ""
      switch (cfg.column) {
        case "id":              va = a.id;                              vb = b.id; break
        case "developer":       va = a.developer.name;                  vb = b.developer.name; break
        case "areaName":        va = a.areaName;                        vb = b.areaName; break
        case "projectName":     va = a.projectName;                     vb = b.projectName; break
        case "phaseName":       va = a.phaseName;                       vb = b.phaseName; break
        case "quality":         va = QUALITY_ORDER.indexOf(a.quality);  vb = QUALITY_ORDER.indexOf(b.quality); break
        case "totalAreaKm2":    va = a.totalAreaKm2;                    vb = b.totalAreaKm2; break
        case "areaCapturedKm2": va = a.areaCapturedKm2;                 vb = b.areaCapturedKm2; break
        case "costUsd":         va = a.costUsd;                         vb = b.costUsd; break
        case "zoomHeight":      va = a.resolutionM;                     vb = b.resolutionM; break
        case "systemRequested": va = a.systemRequested;                 vb = b.systemRequested; break
        case "requestedAt":     va = a.requestedAt;                     vb = b.requestedAt; break
        case "capturedAt":      va = a.capturedAt;                      vb = b.capturedAt; break
        case "type":            va = a.type;                            vb = b.type; break
        case "createdAt":       va = a.createdAt;                       vb = b.createdAt; break
      }
      const r = typeof va === "number" ? va - (vb as number) : String(va).localeCompare(String(vb))
      if (r !== 0) return cfg.direction === "desc" ? -r : r
    }
    return 0
  })
}

// ─── Date/time formatter ──────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function formatDateTime(str: string): string {
  if (!str) return "—"
  const [datePart, timePart] = str.split(" ")
  const [y, m, d] = datePart.split("-").map(Number)
  if (!timePart || timePart === "00:00") return `${String(d).padStart(2,"0")} ${MONTHS[m-1]} ${y}`
  const [hr, mn] = timePart.split(":").map(Number)
  const period = hr >= 12 ? "PM" : "AM"
  const h = hr % 12 === 0 ? 12 : hr % 12
  return `${String(d).padStart(2,"0")} ${MONTHS[m-1]} ${y}, ${h}:${String(mn).padStart(2,"0")} ${period}`
}

// ─── Satellite badge ──────────────────────────────────────────────────────────

const SATELLITE_BADGE_COLORS: Record<string, string> = {
  "Sentinel-1":       "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400",
  "Sentinel-2":       "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  "Copernicus-3":     "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400",
  "Pleiades NEO":     "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400",
  "Pleiades-1":       "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
  "WorldView Legion": "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400",
  "WorldView-2":      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  "WorldView-3":      "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400",
  "SPOT-7":           "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
}

function SatelliteBadge({ satellite }: { satellite: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-medium px-1.5 py-0", SATELLITE_BADGE_COLORS[satellite] ?? "bg-muted text-muted-foreground")}
    >
      {satellite}
    </Badge>
  )
}

// ─── Multi-select filter dropdown ─────────────────────────────────────────────

function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  className,
}: {
  label: string
  options: string[]
  selected: Set<string>
  onChange: (s: Set<string>) => void
  className?: string
}) {
  const hasVal = selected.size > 0
  const displayLabel = selected.size === 0
    ? label
    : selected.size === 1
    ? [...selected][0]
    : `${label} · ${selected.size}`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={hasVal ? "default" : "outline"}
          size="sm"
          className={cn("h-8 text-xs justify-between min-w-0 px-2.5", className)}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className="h-3 w-3 ml-1 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start" sideOffset={4}>
        <div className="space-y-0.5 max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isChecked = selected.has(opt)
            return (
              <button
                key={opt}
                onClick={() => {
                  const next = new Set(selected)
                  isChecked ? next.delete(opt) : next.add(opt)
                  onChange(next)
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-left",
                  isChecked ? "bg-primary/10 text-primary" : "hover:bg-muted",
                )}
              >
                <div className={cn(
                  "h-3.5 w-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
                  isChecked ? "bg-primary border-primary" : "border-border",
                )}>
                  {isChecked && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                </div>
                <span className="truncate">{opt}</span>
              </button>
            )
          })}
        </div>
        {selected.size > 0 && (
          <div className="border-t border-border mt-1.5 pt-1.5">
            <button
              onClick={() => onChange(new Set())}
              className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1 rounded-md hover:bg-muted transition-colors"
            >
              Clear selection
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── Date range filter (popover, matches all-properties-page style) ───────────

function DateRangeFilter({
  label,
  dateFrom,
  dateTo,
  onChangeFrom,
  onChangeTo,
  className,
}: {
  label: string
  dateFrom: string
  dateTo: string
  onChangeFrom: (v: string) => void
  onChangeTo: (v: string) => void
  className?: string
}) {
  const hasVal = !!(dateFrom || dateTo)
  const display = hasVal
    ? [dateFrom && formatDateTime(dateFrom), dateTo && formatDateTime(dateTo)].filter(Boolean).join(" → ")
    : label

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={hasVal ? "default" : "outline"}
          size="sm"
          className={cn("h-8 text-xs justify-between min-w-0 px-2.5", className)}
        >
          <CalendarRange className="h-3 w-3 mr-1.5 shrink-0 opacity-70" />
          <span className="truncate flex-1 text-left">{display}</span>
          <ChevronDown className="h-3 w-3 ml-1 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-3" align="start" sideOffset={4}>
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground">{label} Range</p>
          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground">From</label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={dateFrom}
              onChange={(e) => onChangeFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground">To</label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={dateTo}
              onChange={(e) => onChangeTo(e.target.value)}
            />
          </div>
          {hasVal && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => { onChangeFrom(""); onChangeTo("") }}
            >
              <X className="h-3 w-3 mr-1" />Clear dates
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Copy-on-hover ID ─────────────────────────────────────────────────────────

function CopyId({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(value).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <span className={cn("inline-flex items-center gap-1 group/cid font-mono text-xs text-muted-foreground", className)}>
      {value}
      <button
        onClick={copy}
        className="opacity-0 group-hover/cid:opacity-100 transition-opacity shrink-0"
      >
        {copied
          ? <Check className="h-2.5 w-2.5 text-green-500" />
          : <Copy  className="h-2.5 w-2.5 text-muted-foreground hover:text-foreground" />}
      </button>
    </span>
  )
}

// ─── Capture: projects, cost model, recency window ───────────────────────────

interface CaptureProject {
  id: string
  name: string
  developer: string
  areaName: string
  subAreaName: string
  areaKm2: number
  polygonUploaded: boolean
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number }
}

// Quality → satellite + per-km² rate (USD)
const QUALITY_CAPTURE: Record<ImageQuality, { satellite: string; rate: number }> = {
  "Ultra High": { satellite: "WorldView-3",  rate: 35 },
  "Super High": { satellite: "WorldView-2",  rate: 28 },
  "Very High":  { satellite: "Pleiades NEO", rate: 20 },
  "High":       { satellite: "SPOT-7",        rate: 2.5 },
  "Medium":     { satellite: "Sentinel-2",    rate: 0 },
}

// Resolution-range labels shown in the capture dialog (no satellite names)
const CAPTURE_QUALITY_LABEL: Record<ImageQuality, string> = {
  "Ultra High": "Ultra-high (0.3–0.4 m)",
  "Super High": "Super-high (0.5–0.6 m)",
  "Very High":  "Very high (0.7–0.8 m)",
  "High":       "High (1–1.5 m)",
  "Medium":     "Medium (3–10 m)",
}
const CAPTURE_QUALITIES: ImageQuality[] = ["Ultra High", "Super High", "Very High", "High"]

// Derive projects from captured images (these have polygons), plus a few without
const CAPTURE_PROJECTS: CaptureProject[] = (() => {
  const seen = new Map<string, CaptureProject>()
  for (const img of SATELLITE_IMAGES) {
    if (!seen.has(img.projectId)) {
      seen.set(img.projectId, {
        id: img.projectId, name: img.projectName, developer: img.developer.name,
        areaName: img.areaName, subAreaName: img.subAreaName, areaKm2: img.totalAreaKm2,
        polygonUploaded: true,
        bbox: { minLat: img.metadata.bboxMinLat, maxLat: img.metadata.bboxMaxLat, minLng: img.metadata.bboxMinLng, maxLng: img.metadata.bboxMaxLng },
      })
    }
  }
  const arr = Array.from(seen.values())
  arr.push({ id: "PJ-2100", name: "Cairo Gate", developer: "Emaar Misr", areaName: "Sheikh Zayed", subAreaName: "Beverly Hills", areaKm2: 3.50, polygonUploaded: false, bbox: { minLat: 30.02, maxLat: 30.06, minLng: 31.00, maxLng: 31.05 } })
  arr.push({ id: "PJ-2205", name: "SODIC West Phase 7", developer: "SODIC", areaName: "6th of October", subAreaName: "Golf District", areaKm2: 4.10, polygonUploaded: false, bbox: { minLat: 29.95, maxLat: 29.99, minLng: 30.90, maxLng: 30.96 } })
  return arr.sort((a, b) => a.name.localeCompare(b.name))
})()

// Reference "now" = latest capture in dataset, used for the 30-day recency window
const DATASET_NOW = (() => {
  const ts = SATELLITE_IMAGES.map((r) => new Date(r.capturedAt.split(" ")[0]).getTime())
  return Math.max(...ts)
})()

function qualityRank(q: ImageQuality) { return QUALITY_ORDER.indexOf(q) }

// ─── Capture New dialog ───────────────────────────────────────────────────────

function CaptureDialog({
  open, onClose, onView,
}: {
  open: boolean
  onClose: () => void
  onView: (img: SatelliteImage) => void
}) {
  const [projectId, setProjectId]   = useState<string>("")
  const [quality, setQuality]       = useState<ImageQuality>("Very High")
  const [captureType, setCaptureType] = useState<ImageType>("New")

  const project = CAPTURE_PROJECTS.find((p) => p.id === projectId) ?? null
  const canCapture = !!project?.polygonUploaded

  // Cost model — capturing area & cost are RANGES (actual tasking footprint varies)
  const rate = QUALITY_CAPTURE[quality].rate
  const projectAreaKm2 = project?.areaKm2 ?? 0
  const capLow  = project ? +(project.areaKm2 * 1.05).toFixed(2) : 0
  const capHigh = project ? +(project.areaKm2 * 1.18).toFixed(2) : 0
  const usdLow  = +(capLow * rate).toFixed(2)
  const usdHigh = +(capHigh * rate).toFixed(2)
  const egpLow  = Math.round(usdLow * 50)
  const egpHigh = Math.round(usdHigh * 50)
  const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Previously captured (same project, same-or-higher quality, last 30 days)
  const recent = project
    ? SATELLITE_IMAGES.filter((r) =>
        r.projectId === project.id &&
        qualityRank(r.quality) >= qualityRank(quality) &&
        new Date(r.capturedAt.split(" ")[0]).getTime() >= DATASET_NOW - 30 * 864e5,
      )
    : []

  // Map palette
  const isCoastal = project ? (project.areaName.includes("Sahel") || project.areaName.includes("Sokhna")) : false
  const isUrban   = project ? (project.areaName.includes("Cairo") || project.areaName.includes("October") || project.areaName.includes("Zayed")) : false
  const pal = isCoastal
    ? { bg:"#1a4e6e", a:"#28728a", b:"#e8d9a0", c:"#2e8c66" }
    : isUrban
    ? { bg:"#484858", a:"#8a9a88", b:"#c8c8b8", c:"#6a7868" }
    : { bg:"#2e5e3e", a:"#4e8a5e", b:"#d8cc8e", c:"#5a9a6a" }
  const ph = project ? project.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) : 0

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-[1080px] w-[94vw] max-h-[94vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-4 w-4" />Capture New Image
          </DialogTitle>
          <DialogDescription>Request a new satellite capture for an off-plan project.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">

          {/* ── Project dropdown ── */}
          <div className="space-y-1.5">
            <Label className="text-xs">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="h-9 text-sm w-full"><SelectValue placeholder="Select a project…" /></SelectTrigger>
              <SelectContent>
                {CAPTURE_PROJECTS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      {p.name}
                      <span className="text-muted-foreground text-xs">· {p.developer}</span>
                      {!p.polygonUploaded && <span className="text-red-500 text-[10px]">no polygon</span>}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {project && !project.polygonUploaded && (
              <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 mt-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">
                  This project has no boundary polygons uploaded. Upload a polygon before requesting a capture.
                </p>
              </div>
            )}
          </div>

          {/* ── Map (always visible) ── */}
          <div className="relative h-[300px] rounded-lg overflow-hidden border border-border">
            {project ? (
              <>
                <div className="absolute inset-0" style={{ backgroundColor: pal.bg }}>
                  <div className="absolute inset-0" style={{ background:`linear-gradient(${ph%360}deg,${pal.a}88 0%,${pal.b}55 40%,${pal.c}88 100%)` }}/>
                  <div className="absolute" style={{ top:"10%", left:"8%", width:`${40+(ph%15)}%`, height:`${34+(ph%18)}%`, backgroundColor:pal.a, opacity:0.7 }}/>
                  <div className="absolute" style={{ bottom:"12%", right:"10%", width:`${30+(ph%18)}%`, height:`${40+(ph%14)}%`, backgroundColor:pal.b, opacity:0.5 }}/>
                  <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)", backgroundSize:"40px 40px" }}/>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={cn("border-2 relative", project.polygonUploaded ? "border-primary bg-primary/10" : "border-dashed border-red-400 bg-red-400/10")} style={{ width:"50%", height:"54%" }}>
                    <span className={cn("absolute -top-5 left-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/90", project.polygonUploaded ? "text-primary" : "text-red-500")}>
                      {project.polygonUploaded ? "Capture bounds" : "No polygon"}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 z-10 bg-black/60 text-white text-[11px] font-mono px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
                  <span className="font-semibold">{project.name}</span> · {project.areaName}
                </div>
              </>
            ) : (
              /* Generic Mapbox-style basemap when no project chosen */
              <>
                <div className="absolute inset-0" style={{ backgroundColor:"#e8e6e1" }}>
                  <div className="absolute rounded-lg" style={{ top:"14%", left:"8%", width:"24%", height:"28%", backgroundColor:"#cfe3c0" }}/>
                  <div className="absolute rounded-lg" style={{ bottom:"16%", right:"12%", width:"28%", height:"30%", backgroundColor:"#cfe3c0" }}/>
                  <div className="absolute" style={{ top:"0", right:"0", width:"28%", height:"22%", backgroundColor:"#a9d4e5" }}/>
                  <svg className="absolute inset-0 w-full h-full" style={{pointerEvents:"none"}}>
                    <line x1="0" y1="46%" x2="100%" y2="49%" stroke="#fff" strokeWidth="7"/>
                    <line x1="0" y1="46%" x2="100%" y2="49%" stroke="#f4c542" strokeWidth="2.5"/>
                    <line x1="40%" y1="0" x2="43%" y2="100%" stroke="#fff" strokeWidth="6"/>
                    <line x1="40%" y1="0" x2="43%" y2="100%" stroke="#f4c542" strokeWidth="2"/>
                    <line x1="70%" y1="0" x2="72%" y2="100%" stroke="#fff" strokeWidth="4"/>
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-white/90 rounded-lg px-3 py-2 shadow text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />Select a project to locate it on the map
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Image Settings: Quality + Type ── */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Image Settings</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Quality</Label>
                <Select value={quality} onValueChange={(v) => setQuality(v as ImageQuality)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAPTURE_QUALITIES.map((q) => (
                      <SelectItem key={q} value={q}>{CAPTURE_QUALITY_LABEL[q]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Capture Type</Label>
                <div className="flex gap-2">
                  {(["New","Archived"] as ImageType[]).map((t) => (
                    <button key={t} onClick={() => setCaptureType(t)}
                      className={cn("flex-1 h-9 rounded-md border text-sm font-medium transition-colors",
                        captureType === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}
                    >{t === "New" ? "New Capture" : "Archived"}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Areas & Costs (cost = range) ── */}
          {project && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Area & Estimated Cost</p>
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Project Area</p>
                  <p className="text-sm font-semibold tabular-nums">{projectAreaKm2.toFixed(2)} km²</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Capturing Area</p>
                  <p className="text-sm font-semibold tabular-nums">{capLow.toFixed(2)} – {capHigh.toFixed(2)} km²</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Cost (USD)</p>
                  <p className="text-sm font-semibold tabular-nums">{rate === 0 ? "Free" : `${usd(usdLow)} – ${usd(usdHigh)}`}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Cost (EGP)</p>
                  <p className="text-sm font-semibold tabular-nums">{rate === 0 ? "Free" : `${egpLow.toLocaleString("en-US")} – ${egpHigh.toLocaleString("en-US")}`}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Bounding box ── */}
          {project && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />Bounding Box
              </p>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-2.5 font-mono text-xs grid grid-cols-2 gap-x-8 gap-y-1">
                <div><span className="text-muted-foreground">Min Lat </span><span className="font-semibold">{project.bbox.minLat.toFixed(4)}°</span></div>
                <div><span className="text-muted-foreground">Max Lat </span><span className="font-semibold">{project.bbox.maxLat.toFixed(4)}°</span></div>
                <div><span className="text-muted-foreground">Min Lng </span><span className="font-semibold">{project.bbox.minLng.toFixed(4)}°</span></div>
                <div><span className="text-muted-foreground">Max Lng </span><span className="font-semibold">{project.bbox.maxLng.toFixed(4)}°</span></div>
              </div>
            </div>
          )}

        {/* ── Previously captured (last 30 days) ── */}
        {recent.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/40 p-3 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                This project was captured at <span className="font-semibold">{quality}</span> quality or higher within the last 30 days.
                Review the existing {recent.length} capture{recent.length > 1 ? "s" : ""} before requesting a new one.
              </p>
            </div>
            <div className="rounded-md border border-amber-200 dark:border-amber-900/40 overflow-hidden bg-card">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-2.5 py-1.5 font-medium text-muted-foreground">Image</th>
                    <th className="text-left px-2.5 py-1.5 font-medium text-muted-foreground">Quality</th>
                    <th className="text-left px-2.5 py-1.5 font-medium text-muted-foreground">Captured</th>
                    <th className="text-left px-2.5 py-1.5 font-medium text-muted-foreground">Type</th>
                    <th className="px-2.5 py-1.5 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-t border-border hover:bg-muted/40 cursor-pointer" onClick={() => { onClose(); onView(r) }}>
                      <td className="px-2.5 py-1.5 font-mono">{r.id}</td>
                      <td className="px-2.5 py-1.5"><QualityBadge quality={r.quality} /></td>
                      <td className="px-2.5 py-1.5 text-muted-foreground whitespace-nowrap">{formatDateTime(r.capturedAt)}</td>
                      <td className="px-2.5 py-1.5"><TypeBadge type={r.type} /></td>
                      <td className="px-2.5 py-1.5"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!canCapture} onClick={onClose}>
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            Request Capture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Images Tab ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

function ImagesTab() {
  // ── Filter state ──
  const [search, setSearch]                     = useState("")
  const [developerFilter, setDeveloper]         = useState<Set<string>>(new Set())
  const [qualityFilter, setQuality]             = useState<Set<string>>(new Set())
  const [typeFilter, setType]                   = useState<Set<string>>(new Set())
  const [projectFilter, setProject]             = useState<Set<string>>(new Set())
  const [areaFilter, setArea]                   = useState<Set<string>>(new Set())
  const [systemFilter, setSystem]               = useState<Set<string>>(new Set())
  const [satelliteFilter, setSatellite]         = useState<Set<string>>(new Set())
  const [requestedFrom, setRequestedFrom]       = useState("")
  const [requestedTo, setRequestedTo]           = useState("")
  // ── Sort state ──
  const [sortConfigs, setSortConfigs]     = useState<MultiSortConfig[]>([])
  const [draggedSortIdx, setDraggedSortIdx] = useState<number | null>(null)
  const [showSortPopover, setShowSortPopover] = useState(false)
  // ── Group state ──
  const [groupByColumn, setGroupByColumn] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  // ── Selection state ──
  const [selectedRows, setSelectedRows]   = useState<Set<string>>(new Set())
  const [lastSelectedIdx, setLastSelectedIdx] = useState<number | null>(null)
  // ── UI state ──
  const [page, setPage]                   = useState(1)
  const [detailRow, setDetailRow]         = useState<SatelliteImage | null>(null)
  const [showMap, setShowMap]             = useState(false)
  const [archiveTarget, setArchiveTarget] = useState<SatelliteImage | "bulk" | null>(null)
  const [showCapture, setShowCapture]     = useState(false)
  const [visibleCols, setVisibleCols]     = useState<Set<string>>(new Set(ALL_COLUMNS.map((c) => c.id)))

  const uniqueDevelopers = useMemo(
    () => Array.from(new Set(SATELLITE_IMAGES.map((i) => i.developer.name))).sort(),
    [],
  )
  const uniqueProjects = useMemo(
    () => Array.from(new Set(SATELLITE_IMAGES.map((i) => i.projectName))).sort(),
    [],
  )
  const uniqueAreas = useMemo(
    () => Array.from(new Set(SATELLITE_IMAGES.map((i) => i.areaName))).sort(),
    [],
  )
  const uniqueSystems = useMemo(
    () => Array.from(new Set(SATELLITE_IMAGES.map((i) => i.systemRequested))).sort(),
    [],
  )
  const uniqueSatellites = useMemo(
    () => Array.from(new Set(SATELLITE_IMAGES.map((i) => i.satellite))).sort(),
    [],
  )

  const filtered = useMemo(() => {
    let rows = [...SATELLITE_IMAGES]
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter((r) => r.id.toLowerCase().includes(q))
    }
    if (developerFilter.size > 0)  rows = rows.filter((r) => developerFilter.has(r.developer.name))
    if (qualityFilter.size > 0)    rows = rows.filter((r) => qualityFilter.has(r.quality))
    if (typeFilter.size > 0)       rows = rows.filter((r) => typeFilter.has(r.type))
    if (projectFilter.size > 0)    rows = rows.filter((r) => projectFilter.has(r.projectName))
    if (areaFilter.size > 0)       rows = rows.filter((r) => areaFilter.has(r.areaName))
    if (systemFilter.size > 0)     rows = rows.filter((r) => systemFilter.has(r.systemRequested))
    if (satelliteFilter.size > 0)  rows = rows.filter((r) => satelliteFilter.has(r.satellite))
    if (requestedFrom) rows = rows.filter((r) => r.requestedAt.split(" ")[0] >= requestedFrom)
    if (requestedTo)   rows = rows.filter((r) => r.requestedAt.split(" ")[0] <= requestedTo)
    return sortRows(rows, sortConfigs)
  }, [search, developerFilter, qualityFilter, typeFilter, projectFilter, areaFilter, systemFilter, satelliteFilter, requestedFrom, requestedTo, sortConfigs])

  // ── Analysis card totals ──
  const totalAreaCaptured = useMemo(() => filtered.reduce((s, r) => s + r.areaCapturedKm2, 0), [filtered])
  const totalProjectArea  = useMemo(() => filtered.reduce((s, r) => s + r.totalAreaKm2, 0), [filtered])
  const totalCostUsd      = useMemo(() => filtered.reduce((s, r) => s + r.costUsd, 0), [filtered])

  // Last-month / last-quarter costs — computed from all images relative to the latest date in dataset
  const { costLastMonth, costLastQuarter } = useMemo(() => {
    const allDates = SATELLITE_IMAGES.map((r) => new Date(r.requestedAt.split(" ")[0]))
    const maxDate  = new Date(Math.max(...allDates.map((d) => d.getTime())))
    const monthAgo   = new Date(maxDate); monthAgo.setDate(monthAgo.getDate() - 30)
    const quarterAgo = new Date(maxDate); quarterAgo.setDate(quarterAgo.getDate() - 90)
    const inLastMonth   = SATELLITE_IMAGES.filter((r) => { const d = new Date(r.requestedAt.split(" ")[0]); return d >= monthAgo   && d <= maxDate })
    const inLastQuarter = SATELLITE_IMAGES.filter((r) => { const d = new Date(r.requestedAt.split(" ")[0]); return d >= quarterAgo && d <= maxDate })
    return {
      costLastMonth:   inLastMonth.reduce((s, r)   => s + r.costUsd, 0),
      costLastQuarter: inLastQuarter.reduce((s, r) => s + r.costUsd, 0),
    }
  }, [])

  // ── Grouped rows (when group-by is active, skip pagination) ──
  const groupedRows = useMemo(() => {
    if (!groupByColumn) return null
    const map = new Map<string, SatelliteImage[]>()
    for (const row of filtered) {
      const key = getGroupValue(row, groupByColumn)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(row)
    }
    return map
  }, [filtered, groupByColumn])

  const groupKeys = groupedRows ? Array.from(groupedRows.keys()) : []

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows   = groupByColumn ? [] : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const allDisplayRows = groupByColumn ? filtered : pageRows

  const hasFilter = !!(
    search ||
    developerFilter.size > 0 || qualityFilter.size > 0 || typeFilter.size > 0 ||
    projectFilter.size > 0 || areaFilter.size > 0 || systemFilter.size > 0 ||
    satelliteFilter.size > 0 || requestedFrom || requestedTo
  )

  const clearFilters = () => {
    setSearch("")
    setDeveloper(new Set()); setQuality(new Set()); setType(new Set())
    setProject(new Set()); setArea(new Set()); setSystem(new Set()); setSatellite(new Set())
    setRequestedFrom(""); setRequestedTo(""); setPage(1)
  }

  const vis = (id: string) => visibleCols.has(id)

  const toggleCol = (id: string) => {
    setVisibleCols((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Sort ──
  const toggleColumnSort = (col: string) => {
    setSortConfigs((prev) => {
      const ex = prev.find((s) => s.column === col)
      if (!ex) return [{ column: col, direction: "asc" }]
      if (ex.direction === "asc") return [{ column: col, direction: "desc" }]
      return []
    })
  }
  const handleSortDragStart = (i: number) => setDraggedSortIdx(i)
  const handleSortDragOver  = (e: React.DragEvent, target: number) => {
    e.preventDefault()
    if (draggedSortIdx === null || draggedSortIdx === target) return
    setSortConfigs((prev) => {
      const next = [...prev]
      const [moved] = next.splice(draggedSortIdx, 1)
      next.splice(target, 0, moved)
      setDraggedSortIdx(target)
      return next
    })
  }
  const handleSortDragEnd = () => setDraggedSortIdx(null)

  // ── Selection ──
  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? new Set(allDisplayRows.map((r) => r.id)) : new Set())
  }
  const handleSelectRow = (id: string, idx: number, shiftKey: boolean) => {
    const next = new Set(selectedRows)
    if (shiftKey && lastSelectedIdx !== null) {
      const [s, e] = [Math.min(lastSelectedIdx, idx), Math.max(lastSelectedIdx, idx)]
      for (let i = s; i <= e; i++) { const r = allDisplayRows[i]; if (r) next.add(r.id) }
    } else {
      next.has(id) ? next.delete(id) : next.add(id)
      setLastSelectedIdx(idx)
    }
    setSelectedRows(next)
  }

  // ── Row renderer ──
  const renderRow = (row: SatelliteImage, flatIdx: number, _localIdx: number) => {
    const isSel = selectedRows.has(row.id)
    const stickyLeftBg = isSel
      ? "bg-blue-50 dark:bg-blue-950/30 group-hover:bg-blue-100"
      : "bg-card group-hover:bg-muted/50"
    const stickyRightBg = isSel
      ? "bg-blue-50 dark:bg-blue-950/30 group-hover:bg-blue-100"
      : "bg-card group-hover:bg-muted/50"

    return (
      <tr
        key={row.id}
        className={cn(
          "border-b border-border cursor-pointer transition-colors group",
          isSel ? "bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50" : "hover:bg-muted/50",
        )}
        onClick={() => setDetailRow(row)}
      >
        {/* Checkbox — sticky left */}
        <td
          className={cn("border-r border-border px-3 py-2.5 sticky left-0 z-10", stickyLeftBg)}
          onClick={(e) => { e.stopPropagation(); handleSelectRow(row.id, flatIdx, e.shiftKey) }}
        >
          <Checkbox checked={isSel} onCheckedChange={() => {}} />
        </td>

        {/* Image — thumbnail + copyable ID, no system caption */}
        <td className="border-r border-border px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <SatThumbnail image={row} size="sm" />
            <CopyId value={row.id} className="font-semibold text-foreground text-xs" />
          </div>
        </td>

        {/* Developer — clickable name + copyable ID */}
        <td className="border-r border-border px-3 py-2.5">
          <div className="flex items-center gap-2">
            <DeveloperAvatar dev={row.developer} />
            <div className="min-w-0">
              <a
                href={`/developers/${row.developer.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-foreground truncate max-w-[160px] block hover:text-primary hover:underline underline-offset-2 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {row.developer.name}
              </a>
              <CopyId value={row.developer.id} />
            </div>
          </div>
        </td>

        {vis("area") && (
          <td className="border-r border-border px-3 py-2.5"><AreaTag areaName={row.areaName} /></td>
        )}
        {vis("project") && (
          <td className="border-r border-border px-3 py-2.5">
            <a
              href={`/projects/${row.projectId}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-foreground truncate max-w-[160px] block hover:text-primary hover:underline underline-offset-2 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {row.projectName}
            </a>
            <CopyId value={row.projectId} />
          </td>
        )}
        {vis("phase") && (
          <td className="border-r border-border px-3 py-2.5">
            <a
              href={`/phases/${row.phaseId}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-foreground block hover:text-primary hover:underline underline-offset-2 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {row.phaseName}
            </a>
            <CopyId value={row.phaseId} />
          </td>
        )}
        {vis("quality") && (
          <td className="border-r border-border px-3 py-2.5"><QualityBadge quality={row.quality} /></td>
        )}
        {vis("zoomHeight") && (
          <td className="border-r border-border px-3 py-2.5 text-xs font-mono text-foreground whitespace-nowrap">
            {getZoomHeight(row.satellite)}
          </td>
        )}
        {vis("projectArea") && (
          <td className="border-r border-border px-3 py-2.5">
            <span className="text-sm font-semibold tabular-nums">{row.totalAreaKm2.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground ml-1">km²</span>
          </td>
        )}
        {vis("areaCaptured") && (
          <td className="border-r border-border px-3 py-2.5">
            <span className="text-sm font-semibold tabular-nums">{row.areaCapturedKm2.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground ml-1">km²</span>
          </td>
        )}
        {vis("system") && (
          <td className="border-r border-border px-3 py-2.5"><SystemBadge system={row.systemRequested} /></td>
        )}
        {vis("costUsd") && (
          <td className="border-r border-border px-3 py-2.5">
            <span className="text-sm font-semibold tabular-nums">
              {row.costUsd === 0 ? "Free" : `$${row.costUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </td>
        )}
        {vis("costEgp") && (
          <td className="border-r border-border px-3 py-2.5">
            <span className="text-sm font-semibold tabular-nums">
              {row.costEgp === 0 ? "Free" : `EGP ${row.costEgp.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </td>
        )}
        {vis("requested") && (
          <td className="border-r border-border px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(row.requestedAt)}</td>
        )}
        {vis("captured") && (
          <td className="border-r border-border px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(row.capturedAt)}</td>
        )}
        {vis("type") && (
          <td className="border-r border-border px-3 py-2.5"><TypeBadge type={row.type} /></td>
        )}
        {vis("satellite") && (
          <td className="border-r border-border px-3 py-2.5"><SatelliteBadge satellite={row.satellite} /></td>
        )}
        {vis("createdAt") && (
          <td className="border-r border-border px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
        )}
        {vis("updatedAt") && (
          <td className="border-r border-border px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(row.updatedAt)}</td>
        )}

        {/* Sticky action — fixed right, three-dot dropdown */}
        <td className={cn(
          "px-3 py-2.5 sticky right-0 z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.12)]",
          stickyRightBg,
        )} onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDetailRow(row)}>
                <Eye className="h-4 w-4 mr-2" />View
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setArchiveTarget(row)}>
                <Trash2 className="h-4 w-4 mr-2" />Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
    )
  }

  // Column header
  const colTh = (label: string, col: string, extraClass = "") => (
    <th
      className={cn("bg-muted border-r border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap", extraClass)}
      onClick={() => toggleColumnSort(col)}
    >
      <span className="flex items-center hover:text-foreground transition-colors">
        {label}
        <SortIcon col={col} configs={sortConfigs} />
      </span>
    </th>
  )

  return (
    <div className="space-y-3">

      {/* ── Analysis cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Images</p>
          <p className="text-2xl font-semibold tabular-nums">{filtered.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">total images</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Total Area Captured</p>
          <p className="text-2xl font-semibold tabular-nums">{totalAreaCaptured.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">km²</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Total Project Areas</p>
          <p className="text-2xl font-semibold tabular-nums">{totalProjectArea.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">km²</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
          <p className="text-2xl font-semibold tabular-nums">
            {totalCostUsd === 0
              ? "$0.00"
              : `$${totalCostUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            ~EGP {(totalCostUsd * 50).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Cost Last Month</p>
          <p className="text-2xl font-semibold tabular-nums">
            {costLastMonth === 0
              ? "$0.00"
              : `$${costLastMonth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            ~EGP {(costLastMonth * 50).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Cost Last Quarter</p>
          <p className="text-2xl font-semibold tabular-nums">
            {costLastQuarter === 0
              ? "$0.00"
              : `$${costLastQuarter.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            ~EGP {(costLastQuarter * 50).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* ── Filter card ── */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-2.5">

        {/* Filters — all on one line, wraps to second line if needed */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative shrink-0 w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              className="h-8 pl-8 pr-7 w-full text-sm"
              placeholder="Search by Image ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
            {search && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => { setSearch(""); setPage(1) }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <MultiSelectFilter label="Developer"    options={uniqueDevelopers} selected={developerFilter} onChange={(s) => { setDeveloper(s); setPage(1) }} className="w-32" />
          <MultiSelectFilter label="Project"      options={uniqueProjects}   selected={projectFilter}   onChange={(s) => { setProject(s);  setPage(1) }} className="w-28" />
          <MultiSelectFilter label="Area"         options={uniqueAreas}      selected={areaFilter}      onChange={(s) => { setArea(s);     setPage(1) }} className="w-24" />
          <MultiSelectFilter label="System"       options={uniqueSystems}    selected={systemFilter}    onChange={(s) => { setSystem(s);   setPage(1) }} className="w-28" />
          <MultiSelectFilter label="Satellite"    options={uniqueSatellites} selected={satelliteFilter} onChange={(s) => { setSatellite(s); setPage(1) }} className="w-28" />
          <MultiSelectFilter label="Quality"      options={QUALITY_ORDER}    selected={qualityFilter}   onChange={(s) => { setQuality(s);  setPage(1) }} className="w-24" />
          <MultiSelectFilter label="Type"         options={["New","Archived"]} selected={typeFilter}    onChange={(s) => { setType(s);     setPage(1) }} className="w-20" />
          <DateRangeFilter
            label="Date"
            dateFrom={requestedFrom}
            dateTo={requestedTo}
            onChangeFrom={(v) => { setRequestedFrom(v); setPage(1) }}
            onChangeTo={(v)   => { setRequestedTo(v);   setPage(1) }}
            className="w-40"
          />
        </div>

        {/* Row 3: Clear All left | Sort + Group + Columns right */}
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
          <div className="flex items-center gap-2">
            {hasFilter && (
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground" onClick={clearFilters}>
                <X className="h-3.5 w-3.5 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort popover */}
            <Popover open={showSortPopover} onOpenChange={setShowSortPopover}>
              <PopoverTrigger asChild>
                <Button variant={sortConfigs.length > 0 ? "default" : "outline"} size="sm" className="h-8">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
                  Sort
                  {sortConfigs.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">{sortConfigs.length}</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[420px] p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Sort by multiple columns</h4>
                    {sortConfigs.length > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSortConfigs([])}>Clear all</Button>
                    )}
                  </div>
                  {sortConfigs.length > 0 && (
                    <p className="text-xs text-muted-foreground -mt-2">Drag to reorder priority.</p>
                  )}
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {sortConfigs.map((cfg, i) => (
                      <div
                        key={i}
                        draggable
                        onDragStart={() => handleSortDragStart(i)}
                        onDragOver={(e) => handleSortDragOver(e, i)}
                        onDragEnd={handleSortDragEnd}
                        className={cn("flex items-center gap-2 p-2.5 bg-secondary/40 rounded-lg cursor-default", draggedSortIdx === i && "opacity-40")}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                        <span className="text-xs text-muted-foreground w-14 shrink-0">{i === 0 ? "Sort by" : "Then by"}</span>
                        <Select value={cfg.column} onValueChange={(v) => setSortConfigs((prev) => prev.map((c, idx) => idx === i ? { ...c, column: v } : c))}>
                          <SelectTrigger className="flex-1 h-7 text-xs"><SelectValue placeholder="Column" /></SelectTrigger>
                          <SelectContent>
                            {IMAGE_SORT_COLS.map((c) => <SelectItem key={c.id} value={c.id} className="text-xs">{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={cfg.direction} onValueChange={(v) => setSortConfigs((prev) => prev.map((c, idx) => idx === i ? { ...c, direction: v as "asc" | "desc" } : c))}>
                          <SelectTrigger className="w-[100px] h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asc" className="text-xs">Ascending</SelectItem>
                            <SelectItem value="desc" className="text-xs">Descending</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setSortConfigs((prev) => prev.filter((_, idx) => idx !== i))}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    {sortConfigs.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-3">No sort applied. Add a level below.</p>
                    )}
                  </div>
                  <Button
                    variant="outline" size="sm" className="w-full h-8"
                    disabled={sortConfigs.length >= 5}
                    onClick={() => setSortConfigs((prev) => [...prev, { column: IMAGE_SORT_COLS[0].id, direction: "asc" }])}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Add sort level
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Group dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={groupByColumn ? "default" : "outline"} size="sm" className="h-8">
                  <Group className="h-3.5 w-3.5 mr-1.5" />
                  Group
                  {groupByColumn && (
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">
                      {IMAGE_GROUP_COLS.find((c) => c.id === groupByColumn)?.label ?? groupByColumn}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setGroupByColumn(null); setCollapsedGroups(new Set()) }}>No Grouping</DropdownMenuItem>
                <DropdownMenuSeparator />
                {IMAGE_GROUP_COLS.map((opt) => (
                  <DropdownMenuItem key={opt.id} onClick={() => { setGroupByColumn(opt.id); setCollapsedGroups(new Set()) }}>
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Columns */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Columns3 className="h-3.5 w-3.5 mr-1.5" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {ALL_COLUMNS.filter((c) => !c.alwaysVisible).map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    checked={vis(c.id)}
                    onCheckedChange={() => toggleCol(c.id)}
                  >
                    {c.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── Table card ── */}
      <div
        className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
        style={{ height: "calc(100vh - 380px)", minHeight: 480 }}
      >
        {/* Table header bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-foreground">Satellite Images</span>
            <Badge className="bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100 font-medium text-xs px-2">
              {filtered.length.toLocaleString()}
            </Badge>
            {hasFilter && (
              <>
                <div className="w-px h-4 bg-border" />
                <span className="text-xs text-amber-600 font-medium">Filtered</span>
              </>
            )}
            {groupByColumn && groupKeys.length > 0 && (
              <>
                <div className="w-px h-4 bg-border" />
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2"
                  onClick={() => setCollapsedGroups(new Set(groupKeys))}>Collapse All</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2"
                  onClick={() => setCollapsedGroups(new Set())}>Expand All</Button>
              </>
            )}
          </div>
          <Button size="sm" className="h-8" onClick={() => setShowCapture(true)}>
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            Capture New
          </Button>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-20">
              <tr>
                {/* Sticky left — checkbox */}
                <th className="bg-muted border-r border-border px-3 py-2 w-10 sticky left-0 z-30">
                  <Checkbox
                    checked={allDisplayRows.length > 0 && allDisplayRows.every((r) => selectedRows.has(r.id))}
                    onCheckedChange={(c) => handleSelectAll(!!c)}
                  />
                </th>
                {colTh("Image",         "id",              "min-w-[180px]")}
                {colTh("Developer",     "developer",       "min-w-[200px]")}
                {vis("area")         && colTh("Area",           "areaName",        "min-w-[130px]")}
                {vis("project")      && colTh("Project",        "projectName",     "min-w-[160px]")}
                {vis("phase")        && <th className="bg-muted border-r border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground min-w-[140px] whitespace-nowrap">Phase</th>}
                {vis("quality")      && colTh("Quality",        "quality",         "min-w-[110px]")}
                {vis("zoomHeight")   && colTh("GSD Range",      "zoomHeight",      "min-w-[120px]")}
                {vis("projectArea")  && colTh("Project Area",   "totalAreaKm2",    "min-w-[120px]")}
                {vis("areaCaptured") && colTh("Area Captured",  "areaCapturedKm2", "min-w-[130px]")}
                {vis("system")       && colTh("System",         "systemRequested", "min-w-[140px]")}
                {vis("costUsd")      && colTh("Cost (USD)",     "costUsd",         "min-w-[110px]")}
                {vis("costEgp")      && colTh("Cost (EGP)",     "costEgp",         "min-w-[120px]")}
                {vis("requested")    && colTh("Requested",      "requestedAt",     "min-w-[160px]")}
                {vis("captured")     && colTh("Captured",       "capturedAt",      "min-w-[160px]")}
                {vis("type")         && colTh("Type",           "type",            "min-w-[90px]")}
                {vis("satellite")    && colTh("Satellite",      "satellite",       "min-w-[130px]")}
                {vis("createdAt")    && <th className="bg-muted border-r border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground min-w-[150px] whitespace-nowrap">Created At</th>}
                {vis("updatedAt")    && <th className="bg-muted border-r border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground min-w-[150px] whitespace-nowrap">Updated At</th>}
                {/* Sticky right — action */}
                <th className="bg-muted px-3 py-2 w-10 sticky right-0 z-30 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.18)]" />
              </tr>
            </thead>
            <tbody>
              {groupedRows
                ? Array.from(groupedRows.entries()).map(([key, groupItems]) => {
                    const isCollapsed = collapsedGroups.has(key)
                    const groupLabel = IMAGE_GROUP_COLS.find((c) => c.id === groupByColumn)?.label ?? groupByColumn
                    return (
                      <>
                        <tr
                          key={`grp-${key}`}
                          className="bg-muted/60 border-b border-border cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => setCollapsedGroups((prev) => {
                            const next = new Set(prev)
                            next.has(key) ? next.delete(key) : next.add(key)
                            return next
                          })}
                        >
                          <td colSpan={100} className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <ChevronRight className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", !isCollapsed && "rotate-90")} />
                              <span className="text-xs font-semibold text-foreground">{key}</span>
                              <span className="text-[10px] text-muted-foreground">— {groupLabel}</span>
                              <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">{groupItems.length}</Badge>
                            </div>
                          </td>
                        </tr>
                        {!isCollapsed && groupItems.map((row, idx) => renderRow(row, filtered.indexOf(row), idx))}
                      </>
                    )
                  })
                : pageRows.map((row, idx) => renderRow(row, idx, idx))
              }
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-sm text-muted-foreground gap-2">
              <ScanSearch className="h-8 w-8 mb-1 opacity-30" />
              No images match the current filters.
              {hasFilter && (
                <Button variant="link" size="sm" className="h-6" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── Pagination footer ── */}
        <div className="flex shrink-0 items-center justify-between border-t border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <FileDown className="h-3.5 w-3.5 mr-1.5" />
                  Export
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem><FileText className="h-4 w-4 mr-2" />CSV</DropdownMenuItem>
                <DropdownMenuItem><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><FileDown className="h-4 w-4 mr-2" />PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-xs text-muted-foreground">
              {filtered.length === 0
                ? "No results"
                : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} images`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="icon" className="h-7 w-7"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…")
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ell-${i}`} className="text-xs text-muted-foreground px-1">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="icon"
                    className="h-7 w-7 text-xs"
                    onClick={() => setPage(p as number)}
                  >
                    {p}
                  </Button>
                ),
              )}
            <Button
              variant="outline" size="icon" className="h-7 w-7"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Bulk actions bar ── */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0 bg-zinc-900 text-white rounded-xl shadow-2xl overflow-hidden text-sm select-none">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span className="font-semibold tabular-nums">{selectedRows.size} selected</span>
            <button
              className="text-zinc-400 hover:text-white transition-colors text-xs font-medium"
              onClick={() => handleSelectAll(true)}
            >
              Select all
            </button>
          </div>
          <div className="w-px h-8 bg-zinc-700" />
          <button className="flex items-center gap-1.5 px-4 py-2.5 hover:bg-zinc-800 transition-colors">
            <Camera className="h-3.5 w-3.5 text-zinc-400" />
            Re-Capture
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2.5 hover:bg-zinc-800 transition-colors text-red-400 hover:text-red-300"
            onClick={() => setArchiveTarget("bulk")}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Archive
          </button>
          <div className="w-px h-8 bg-zinc-700" />
          <button
            className="px-3 py-2.5 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            onClick={() => setSelectedRows(new Set())}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Detail Sheet ── */}
      <Sheet open={!!detailRow} onOpenChange={(o) => !o && setDetailRow(null)}>
        <SheetContent className="w-[620px] sm:max-w-[620px] flex flex-col p-0">
          {detailRow && (() => {
            const selected = detailRow
            const area = convertArea(selected.totalAreaKm2)
            return (
              <>
                {/* ── Header ── */}
                <SheetHeader className="px-6 py-4 border-b border-border shrink-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CopyId value={selected.id} className="font-semibold text-foreground text-xs" />
                    <QualityBadge quality={selected.quality} />
                    <TypeBadge type={selected.type} />
                  </div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <SheetTitle className="text-base font-semibold leading-snug">
                      {selected.projectName} — {selected.phaseName}
                    </SheetTitle>
                    <CopyId value={selected.projectId} />
                  </div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{selected.developer.name}</p>
                    <CopyId value={selected.developer.id} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selected.areaName}{selected.subAreaName ? ` — ${selected.subAreaName}` : ""}
                  </p>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                  {/* Image with floating action buttons (bottom-right) */}
                  <div className="relative">
                    <SatThumbnail image={selected} size="lg" />
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                      <button className="h-8 w-8 rounded-md bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition-colors" title="Full Screen">
                        <Maximize2 className="h-4 w-4" />
                      </button>
                      <button className="h-8 w-8 rounded-md bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition-colors" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                      <button onClick={() => setShowMap(true)} className="h-8 w-8 rounded-md bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition-colors" title="View on Map">
                        <Globe className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Separator />

                  {/* Image Details — tags + timestamps */}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Image Details</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1.5">Satellite</p>
                        <SatelliteBadge satellite={selected.satellite} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1.5">System</p>
                        <SystemBadge system={selected.systemRequested} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1.5">Quality</p>
                        <QualityBadge quality={selected.quality} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1.5">Type</p>
                        <TypeBadge type={selected.type} />
                      </div>
                      {[
                        { label: "GSD Range",    value: getZoomHeight(selected.satellite) },
                        { label: "Requested At", value: formatDateTime(selected.requestedAt) },
                        { label: "Captured At",  value: formatDateTime(selected.capturedAt) },
                        { label: "Created At",   value: formatDateTime(selected.createdAt) },
                        { label: "Updated At",   value: formatDateTime(selected.updatedAt) },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                          <p className="text-sm font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Imaging Cost */}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Imaging Cost</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Area Captured</p>
                        <p className="text-sm font-semibold tabular-nums">{selected.areaCapturedKm2.toFixed(3)} km²</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Cost (USD)</p>
                        <p className="text-sm font-semibold tabular-nums">
                          {selected.costUsd === 0
                            ? "Free"
                            : `$${selected.costUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Cost (EGP)</p>
                        <p className="text-sm font-semibold tabular-nums">
                          {selected.costEgp === 0
                            ? "—"
                            : `EGP ${selected.costEgp.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Project Area */}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Ruler className="h-3.5 w-3.5" />Project Area
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Sq. Kilometres", value: `${area.km2} km²` },
                        { label: "Sq. Metres",     value: `${area.m2} m²` },
                        { label: "Feddans",        value: `${area.feddans} fed` },
                        { label: "Acres",          value: `${area.acres} ac` },
                        { label: "Hectares",       value: `${area.hectares} ha` },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                          <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                          <p className="text-sm font-semibold tabular-nums">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Imaging Metadata */}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" />Imaging Metadata
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {[
                        { label: "Cloud Cover",      value: `${selected.metadata.cloudCoverPct}%` },
                        { label: "Incidence Angle",  value: `${selected.metadata.incidenceAngle}°` },
                        { label: "Sun Elevation",    value: `${selected.metadata.sunElevation}°` },
                        { label: "Sun Azimuth",      value: `${selected.metadata.sunAzimuth}°` },
                        { label: "Processing Level", value: selected.metadata.processingLevel },
                        { label: "Available Bands",  value: selected.metadata.bandsAvailable.join(", ") },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                          <p className="text-sm font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Bounding Box */}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />Bounding Box
                    </p>
                    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 font-mono text-xs">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div><span className="text-muted-foreground">Min Lat  </span><span className="font-semibold">{selected.metadata.bboxMinLat.toFixed(4)}°</span></div>
                        <div><span className="text-muted-foreground">Max Lat  </span><span className="font-semibold">{selected.metadata.bboxMaxLat.toFixed(4)}°</span></div>
                        <div><span className="text-muted-foreground">Min Lng  </span><span className="font-semibold">{selected.metadata.bboxMinLng.toFixed(4)}°</span></div>
                        <div><span className="text-muted-foreground">Max Lng  </span><span className="font-semibold">{selected.metadata.bboxMaxLng.toFixed(4)}°</span></div>
                      </div>
                      <p className="mt-2 text-muted-foreground text-[10px]">WGS84 / EPSG:4326</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Developer & Project — 4 fields in one row, ID below each */}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Developer & Project</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Developer</p>
                        <p className="text-sm font-medium text-foreground truncate">{selected.developer.name}</p>
                        <CopyId value={selected.developer.id} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Area</p>
                        <p className="text-sm font-medium text-foreground">{selected.areaName}</p>
                        <CopyId value={selected.areaId} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Project</p>
                        <p className="text-sm font-medium text-foreground truncate">{selected.projectName}</p>
                        <CopyId value={selected.projectId} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Phase</p>
                        <p className="text-sm font-medium text-foreground">{selected.phaseName}</p>
                        <CopyId value={selected.phaseId} />
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* ── View on Map dialog ── */}
      {detailRow && showMap && (() => {
        const img = detailRow
        const isCoastal = img.areaName.includes("Sahel") || img.areaName.includes("Sokhna")
        const isUrban   = img.areaName.includes("Cairo") || img.areaName.includes("October") || img.areaName.includes("Zayed")
        const pal = isCoastal
          ? { bg:"#1a4e6e", a:"#28728a", b:"#e8d9a0", c:"#2e8c66", d:"#4a9cb8" }
          : isUrban
          ? { bg:"#484858", a:"#8a9a88", b:"#c8c8b8", c:"#6a7868", d:"#9a9a8a" }
          : { bg:"#2e5e3e", a:"#4e8a5e", b:"#d8cc8e", c:"#5a9a6a", d:"#7ab888" }
        const h = img.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
        // Deterministic "Mapbox tile date" — older than capture (basemaps lag reality)
        const mbMonth = (h % 12) + 1
        const mbYear  = 2021 + (h % 3)
        const mapboxTileDate = `${String(mbMonth).padStart(2, "0")} ${mbYear}`

        type Base = "Masterplan" | "Nawy Space" | "Mapbox"
        function MapView() {
          const [base, setBase] = useState<Base>("Nawy Space")
          const [showPolygon, setShowPolygon] = useState(true)

          // bottom-right date label depends on active base
          const dateLabel =
            base === "Nawy Space" ? formatDateTime(img.capturedAt)
            : base === "Mapbox"   ? mapboxTileDate
            : null

          return (
            <div className="relative h-[78vh] overflow-hidden rounded-xl">
              {/* ── Base: Nawy Space (our satellite capture) ── */}
              {base === "Nawy Space" && (
                <div className="absolute inset-0" style={{backgroundColor:pal.bg}}>
                  <div className="absolute inset-0" style={{background:`linear-gradient(${h%360}deg,${pal.a}88 0%,${pal.b}55 35%,${pal.c}88 65%,${pal.d}44 100%)`}}/>
                  <div className="absolute" style={{top:"8%",left:"8%",width:`${38+(h%15)}%`,height:`${32+(h%20)}%`,backgroundColor:pal.a,opacity:0.7}}/>
                  <div className="absolute" style={{top:"8%",right:"8%",width:`${28+(h%20)}%`,height:`${42+(h%15)}%`,backgroundColor:pal.b,opacity:0.55}}/>
                  <div className="absolute" style={{bottom:"12%",left:"12%",right:"12%",height:`${24+(h%15)}%`,backgroundColor:pal.c,opacity:0.6}}/>
                  <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage:"linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)",backgroundSize:"56px 56px"}}/>
                  <svg className="absolute inset-0 w-full h-full opacity-20" style={{pointerEvents:"none"}}>
                    <line x1="0" y1="44%" x2="100%" y2="47%" stroke="white" strokeWidth="2"/>
                    <line x1="36%" y1="0" x2="39%" y2="100%" stroke="white" strokeWidth="2"/>
                    <line x1="64%" y1="0" x2="66%" y2="100%" stroke="white" strokeWidth="1"/>
                    <line x1="0" y1="70%" x2="100%" y2="68%" stroke="white" strokeWidth="1"/>
                  </svg>
                </div>
              )}

              {/* ── Base: Mapbox (street basemap look) ── */}
              {base === "Mapbox" && (
                <div className="absolute inset-0" style={{backgroundColor:"#e8e6e1"}}>
                  {/* green parks */}
                  <div className="absolute rounded-lg" style={{top:"10%",left:"6%",width:"22%",height:"26%",backgroundColor:"#cfe3c0"}}/>
                  <div className="absolute rounded-lg" style={{bottom:"14%",right:"10%",width:"26%",height:"30%",backgroundColor:"#cfe3c0"}}/>
                  {/* water */}
                  <div className="absolute" style={{top:"0",right:"0",width:"30%",height:"22%",backgroundColor:"#a9d4e5"}}/>
                  {/* road network */}
                  <svg className="absolute inset-0 w-full h-full" style={{pointerEvents:"none"}}>
                    <line x1="0" y1="46%" x2="100%" y2="49%" stroke="#fff" strokeWidth="8"/>
                    <line x1="0" y1="46%" x2="100%" y2="49%" stroke="#f4c542" strokeWidth="3"/>
                    <line x1="38%" y1="0" x2="41%" y2="100%" stroke="#fff" strokeWidth="7"/>
                    <line x1="38%" y1="0" x2="41%" y2="100%" stroke="#f4c542" strokeWidth="2.5"/>
                    <line x1="66%" y1="0" x2="68%" y2="100%" stroke="#fff" strokeWidth="5"/>
                    <line x1="0" y1="72%" x2="100%" y2="70%" stroke="#fff" strokeWidth="5"/>
                    <line x1="0" y1="22%" x2="100%" y2="24%" stroke="#fff" strokeWidth="4"/>
                  </svg>
                  <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:"linear-gradient(rgba(0,0,0,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.4) 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>
                </div>
              )}

              {/* ── Base: Masterplan (vector plan) ── */}
              {base === "Masterplan" && (
                <div className="absolute inset-0 bg-slate-50">
                  <div className="absolute inset-0 opacity-[0.07]" style={{backgroundImage:"linear-gradient(rgba(0,0,0,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.4) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="70%" height="80%" viewBox="0 0 100 100" className="opacity-90">
                      <rect width="100" height="100" fill="#eef4fb" stroke="#3b82f6" strokeWidth="0.6"/>
                      <rect x="6" y="6" width="38" height="40" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="0.5"/>
                      <rect x="56" y="6" width="38" height="40" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="0.5"/>
                      <rect x="6" y="56" width="40" height="38" fill="#c7f9cc" stroke="#22c55e" strokeWidth="0.5"/>
                      <rect x="56" y="56" width="38" height="38" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="0.5"/>
                      <circle cx="50" cy="50" r="7" fill="#fde68a" stroke="#f59e0b" strokeWidth="0.5"/>
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeWidth="1"/>
                      <line x1="50" y1="0" x2="50" y2="100" stroke="#94a3b8" strokeWidth="1"/>
                    </svg>
                  </div>
                </div>
              )}

              {/* ── Polygon (boundary) overlay ── */}
              {showPolygon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-red-500 bg-red-500/10 relative" style={{width:"54%",height:"60%"}}>
                    <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-red-500"/>
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-red-500"/>
                    <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-red-500"/>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-red-500"/>
                    <span className="absolute -top-6 left-0 text-[11px] font-medium text-red-600 bg-white/90 px-1.5 py-0.5 rounded">{img.projectName}</span>
                  </div>
                </div>
              )}

              {/* ── Controls top-right ── */}
              <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
                {/* Base layer single-select */}
                <div className="flex items-center gap-1 bg-white/95 rounded-lg px-1.5 py-1 shadow-lg backdrop-blur-sm">
                  {(["Masterplan","Nawy Space","Mapbox"] as Base[]).map((b) => (
                    <button key={b} onClick={() => setBase(b)}
                      className={cn("px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                        base === b ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
                    >{b}</button>
                  ))}
                </div>
                {/* Polygon toggle (independent) — under the base switcher, blue when active */}
                <button
                  onClick={() => setShowPolygon((v) => !v)}
                  className={cn("flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg font-medium shadow-lg backdrop-blur-sm transition-colors",
                    showPolygon ? "bg-primary text-primary-foreground" : "bg-white/95 text-muted-foreground hover:bg-white")}
                >
                  <MapPin className="h-3.5 w-3.5" />Polygon
                </button>
              </div>

              {/* ── Info badge bottom-left ── */}
              <div className="absolute bottom-3 left-3 z-20 bg-black/65 text-white text-[11px] font-mono px-2.5 py-2 rounded-lg backdrop-blur-sm space-y-0.5">
                <div className="font-semibold">{base === "Mapbox" ? img.projectName : `${img.id} · ${img.projectName}`}</div>
                <div className="text-white/70">{img.metadata.bboxMinLat.toFixed(4)}°N {img.metadata.bboxMinLng.toFixed(4)}°E → {img.metadata.bboxMaxLat.toFixed(4)}°N {img.metadata.bboxMaxLng.toFixed(4)}°E</div>
                {dateLabel && (
                  <div className="flex items-center gap-1.5 pt-1 mt-1 border-t border-white/20">
                    <CalendarRange className="h-3 w-3 text-white/60" />
                    <span>{base === "Mapbox" ? `Imagery © Mapbox · ${dateLabel}` : `Captured ${dateLabel}`}</span>
                  </div>
                )}
              </div>
            </div>
          )
        }
        return (
          <Dialog open={showMap} onOpenChange={(o)=>!o&&setShowMap(false)}>
            <DialogContent className="max-w-5xl w-[92vw] p-0 overflow-hidden rounded-xl">
              <DialogTitle className="sr-only">{img.projectName} — Map View</DialogTitle>
              <MapView />
            </DialogContent>
          </Dialog>
        )
      })()}

      {/* ── Capture New dialog ── */}
      <CaptureDialog
        open={showCapture}
        onClose={() => setShowCapture(false)}
        onView={(img) => setDetailRow(img)}
      />

      {/* ── Archive confirmation ── */}
      <AlertDialog open={!!archiveTarget} onOpenChange={(o) => !o && setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500" />
              Archive {archiveTarget === "bulk" ? `${selectedRows.size} image${selectedRows.size > 1 ? "s" : ""}` : "image"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {archiveTarget === "bulk"
                ? `This will move ${selectedRows.size} selected image${selectedRows.size > 1 ? "s" : ""} to the archive. Archived images are hidden from the active list but can be restored.`
                : archiveTarget && archiveTarget !== "bulk"
                ? `This will move ${archiveTarget.id} (${archiveTarget.projectName}) to the archive. It can be restored later.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (archiveTarget === "bulk") setSelectedRows(new Set())
                setArchiveTarget(null)
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Construction Analysis Tab ─────────────────────────────────────────────────

function ConstructionAnalysisTab() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-2">
        <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <h2 className="text-base font-semibold text-foreground">Construction Update Analysis</h2>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        Quarterly construction progress analysis comparing satellite captures against the finalized masterplan.
        Measures progress for construction, landscapes, and waterfronts.
      </p>
      <Badge variant="outline" className="text-xs text-muted-foreground mt-2">Coming Soon</Badge>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function NawySpacePage() {
  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="space-y-4 p-4">

        <div className="px-1 pt-1">
          <p className="text-xs text-muted-foreground mb-1">Market Updates</p>
          <h1 className="text-2xl font-semibold text-foreground">Nawy Space</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sentinel satellite imagery for off-plan real estate projects — track construction progress and compare against final masterplans on a quarterly basis.
          </p>
        </div>

        <Tabs defaultValue="images" className="space-y-4">
          <TabsList className="bg-card">
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="analysis">Construction Update Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="images">
            <ImagesTab />
          </TabsContent>
          <TabsContent value="analysis">
            <ConstructionAnalysisTab />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}
