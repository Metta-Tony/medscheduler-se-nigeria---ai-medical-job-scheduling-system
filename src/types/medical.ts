export type MedicalCadre =
  | 'Consultant'
  | 'Senior Registrar'
  | 'Registrar'
  | 'Medical Officer'
  | 'House Officer'
  | 'Chief Nursing Officer'
  | 'Senior Nursing Officer'
  | 'Nursing Officer'
  | 'Medical Lab Scientist'
  | 'Clinical Pharmacist';

export type DepartmentId =
  | 'accident_emergency'
  | 'obstetrics_gynaecology'
  | 'surgical_theater'
  | 'internal_medicine_icu'
  | 'paediatrics_cher'
  | 'general_outpatient';

export type ShiftType = 'Morning' | 'Afternoon' | 'Call_Night' | 'Standby' | 'Post_Call_Rest' | 'Off_Duty' | 'Annual_Leave';

export type HospitalId = 'unth_enugu' | 'nauth_nnewi' | 'fmc_umuahia' | 'aefutha_abakaliki' | 'esut_parklane';

export interface Hospital {
  id: HospitalId;
  name: string;
  shortName: string;
  state: 'Enugu' | 'Anambra' | 'Abia' | 'Ebonyi' | 'Imo';
  location: string;
  tier: 'Federal University Teaching Hospital' | 'Federal Medical Centre' | 'State University Teaching Hospital';
  bedCapacity: number;
  cmacName: string;
  cmdName: string;
  specialtyFocus: string;
}

export interface MedicalStaff {
  id: string;
  name: string;
  cadre: MedicalCadre;
  departmentId: DepartmentId;
  hospitalId: HospitalId;
  qualifications: string[];
  mcnNumber: string; // Medical and Dental Council of Nigeria or NMCN license
  phone: string;
  email: string;
  avatarUrl: string;
  residence: 'Doctors Quarters (On-Campus)' | 'Off-Campus (Enugu Urban)' | 'Off-Campus (Nnewi)' | 'Off-Campus (Umuahia)' | 'Off-Campus (Abakaliki)';
  weeklyMaxHours: number;
  currentWeeklyHours: number;
  fatigueScore: number; // 0-100 (high = dangerously fatigued)
  consecutiveCallNights: number;
  lastCallDate?: string;
  specialSkills: string[];
  isActive: boolean;
}

export interface ShiftSlot {
  id: string;
  date: string; // YYYY-MM-DD
  departmentId: DepartmentId;
  hospitalId: HospitalId;
  shiftType: ShiftType;
  startTime: string; // e.g., "08:00"
  endTime: string;   // e.g., "14:00"
  staffId: string;
  roleDescription: string;
  isAiGenerated: boolean;
  isOverridden?: boolean;
  seniorSupervisorId?: string; // Consultant or Senior Registrar overseeing
  status: 'Scheduled' | 'In_Progress' | 'Completed' | 'Swapped' | 'Emergency_Reassigned';
  notes?: string;
}

export interface Department {
  id: DepartmentId;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  minStaffPerShift: {
    Morning: number;
    Afternoon: number;
    Call_Night: number;
  };
  requiredCadres: MedicalCadre[];
}

export interface SwapRequest {
  id: string;
  requesterStaffId: string;
  targetStaffId: string;
  requesterShiftId: string;
  targetShiftId: string;
  dateRequested: string;
  reason: string;
  status: 'Pending_AI_Review' | 'AI_Approved' | 'AI_Rejected' | 'Manual_Approved';
  aiAnalysis?: {
    approved: boolean;
    reasoning: string;
    fatigueImpact: string;
    supervisionCompliant: boolean;
  };
}

export interface EmergencyIncident {
  id: string;
  hospitalId: HospitalId;
  departmentId: DepartmentId;
  timestamp: string;
  title: string;
  severity: 'Critical' | 'High' | 'Moderate';
  description: string;
  affectedShiftId?: string;
  affectedStaffName?: string;
  recommendedAction: string;
  aiSuggestedReassignments: {
    originalStaffId?: string;
    replacementStaffId: string;
    replacementStaffName: string;
    replacementCadre: MedicalCadre;
    targetShiftType: ShiftType;
    rationale: string;
    fatigueRiskAfter: number;
    distanceOrQuarters: string;
  }[];
  status: 'Active' | 'Resolved';
}

export interface ScheduleGenerationParams {
  hospitalId: HospitalId;
  departmentId?: DepartmentId | 'all';
  startDate: string;
  endDate: string;
  strictPostCallRest: boolean;
  maxConsecutiveNightCalls: number;
  enforceSeniorSupervision: boolean;
  considerQuartersProximity: boolean; // prioritize on-campus doctors for night shifts
  mitigatePowerFuelLogistics: boolean;
}

export interface AiOptimizationResult {
  schedule: ShiftSlot[];
  metrics: {
    totalShifts: number;
    coverageRate: number; // percentage
    fatigueViolationCount: number;
    postCallRestComplianceRate: number;
    seniorityRatio: number;
  };
  aiExplanations: string[];
  recommendations: string[];
}
