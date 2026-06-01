// ── Backend response types ────────────────────────────────────

export interface ApiResponse<T> {
  success:   boolean;
  message:   string;
  data:      T;
  timestamp: string;
}

export interface ComplaintSubmitResponse {
  complaintId:     string;
  trackingId:      string;
  aiCategory:      string;
  aiSeverity:      number;
  aiSeverityLabel: string;
  aiDepartment:    string;
  aiDepartmentGu:  string;
  aiLetterEn:      string;
  aiLetterGu:      string;
  aiSummary:       string;
  aiConfidence:    number;
  wardId:          number;
  wardName:        string;
  photoUrl:        string;
  priorityScore:   number;
  status:          string;
  createdAt:       string;
  smsStatus:       string;
}

export interface AiAnalyseResponse {
  category:      string;
  severity:      number;
  severityLabel: string;
  department:    string;
  departmentGu:  string;
  summary:       string;
  urgency:       string;
  letterEn:      string;
  letterGu:      string;
  confidence:    number;
}

export interface MapPin {
  complaintId: string;
  latitude:    number;
  longitude:   number;
  severity:    number;
  category:    string;
  status:      string;
  upvotes:     number;
  escalated:   boolean;
}

export interface ComplaintSummary {
  complaintId:   string;
  trackingId:    string;
  aiCategory:    string;
  aiSeverity:    number;
  severityLabel: string;
  status:        string;
  wardName:      string;
  photoUrl:      string;
  upvotes:       number;
  commentCount:  number;
  latitude:      number;
  longitude:     number;
  createdAt:     string;
}

export interface TimelineEntry {
  stage: string;
  note:  string | null;
  actor: string | null;
  at:    string;
}

export interface ComplaintDetail {
  complaintId:   string;
  trackingId:    string;
  aiCategory:    string;
  aiSeverity:    number;
  severityLabel: string;
  aiDepartment:  string;
  aiDepartmentGu:string;
  aiLetterEn:    string;
  aiLetterGu:    string;
  aiSummary:     string;
  description:   string;
  status:        string;
  wardName:      string;
  photoUrl:      string;
  upvotes:       number;
  commentCount:  number;
  escalated:     boolean;
  timeline:      TimelineEntry[];
  comments:      Comment[];
  createdAt:     string;
  updatedAt:     string;
}

export interface PublicStats {
  totalResolved:     number;
  totalComplaints:   number;
  activeComplaints:  number;
  resolvedThisMonth: number;
  avgResolutionDays: number;
  totalWards:        number;
}

export interface OfficerComplaint {
  complaintId:   string;
  trackingId:    string;
  citizenName:   string;
  citizenPhone:  string;
  aiCategory:    string;
  aiSeverity:    number;
  severityLabel: string;
  priorityScore: number;
  status:        string;
  upvotes:       number;
  description:   string;
  photoUrl:      string;
  latitude:      number;
  longitude:     number;
  escalated:     boolean;
  createdAt:     string;
  updatedAt:     string;
}

export interface WardStats {
  total:         number;
  critical:      number;
  inProgress:    number;
  resolvedToday: number;
}

export interface AdminStats {
  totalComplaints:       number;
  resolvedToday:         number;
  criticalActive:        number;
  escalatedActive:       number;
  avgResolutionDays:     number;
  totalCitizens:         number;
  wardWithMostComplaints:string;
  deptWithMostBacklog:   string;
}

export interface HealthScore {
  score:        number;
  label:        string;
  trend:        string;
  components: {
    resolutionRate:   number;
    avgResponseHours: number;
    criticalBacklog:  number;
    wardCoverage:     number;
  };
  calculatedAt: string;
}