import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building,
  Clock,
  Gauge,
  ArrowRightLeft,
  Terminal,
  ShieldAlert,
  Users,
  FileCheck2,
  ChevronRight,
  ChevronDown,
  Layers,
  Zap,
  Printer,
  Compass,
} from 'lucide-react';
import { HOSPITALS } from '../data/mockData';
import { HospitalId } from '../types/medical';

interface AboutProceduresProps {
  selectedHospitalId: HospitalId;
  onNavigateTab: (tab: any) => void;
}

interface ProcedureStep {
  stepNumber: number;
  title: string;
  phase: string;
  actor: string;
  leadTime: string;
  summary: string;
  inputs: string[];
  substeps: {
    title: string;
    description: string;
    technicalDetails: string;
  }[];
  validationCriteria: string[];
  systemActionTarget: string;
}

export const AboutProcedures: React.FC<AboutProceduresProps> = ({
  selectedHospitalId,
  onNavigateTab,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [expandedSubstep, setExpandedSubstep] = useState<number | null>(null);

  const currentHospital = HOSPITALS.find((h) => h.id === selectedHospitalId) || HOSPITALS[0];

  const procedureSteps: ProcedureStep[] = [
    {
      stepNumber: 1,
      title: 'Workforce Enrollment, Credential Ingestion & Facility Profiling',
      phase: 'Phase I: Data Modeling & Clinician Onboarding',
      actor: 'Director of Clinical Services (CMAC) / Hospital Administrator',
      leadTime: 'Pre-Scheduling Baseline (Monthly / Bi-Annual Update)',
      summary:
        'Captures and validates clinician credentials, licensing with the Medical and Dental Council of Nigeria (MDCN) or Nursing and Midwifery Council of Nigeria (NMCN), cadre seniority, and residential proximity to hospital quarters.',
      inputs: [
        'MDCN / NMCN registration numbers and active practicing licenses',
        'Cadre classifications (Consultant, Senior Registrar, Registrar, House Officer, Nursing Officer)',
        'Residential status: On-Campus Doctors Quarters vs. Off-Campus urban transit',
        'Departmental staffing quotas (Accident & Emergency, O&G, Theater, ICU, Paediatrics, GOPD)',
      ],
      substeps: [
        {
          title: '1.1 Practitioner Identity & Specialty Verification',
          description:
            'Each doctor, specialist, and nursing officer is registered with their verified academic qualifications (e.g., MBBS, FWACS, FMCOG, BNSc) and MDCN registration number.',
          technicalDetails:
            'Stored in normalized clinical staff registries with boolean active flags, max permissible weekly hours (48h default for medical officers, 54h for resident doctors), and baseline fatigue scores.',
        },
        {
          title: '1.2 Residential Quarters & Transit Classification',
          description:
            'Clinicians are geolocated according to residence (On-Campus Quarters such as UNTH Ituku-Ozalla Resident Quarters or NAUTH Nnewi Doctors Lodge vs. Off-Campus transit).',
          technicalDetails:
            'Ensures the AI optimizer can assign rapid-response emergency night call duties to on-campus doctors to mitigate nighttime travel security and fuel constraints.',
        },
        {
          title: '1.3 Departmental Shift Demand Profiling',
          description:
            'Minimum staffing quotas are established per 24-hour cycle: Morning Shift (08:00 - 14:00), Afternoon Shift (14:00 - 20:00), and Night Call Duty (20:00 - 08:00).',
          technicalDetails:
            'Enforces required cadre blends (e.g., Accident & Emergency requires at least 1 Consultant/Senior Reg, 1 Registrar, 1 House Officer, and 2 Trauma Nurses per call slot).',
        },
      ],
      validationCriteria: [
        'All assigned personnel have active, unexpired MDCN/NMCN practicing numbers.',
        'Emergency and high-acuity departments (A&E, ICU, Labor Ward) meet or exceed baseline minimum clinician counts.',
      ],
      systemActionTarget: 'staff',
    },
    {
      stepNumber: 2,
      title: 'Algorithmic Constraint Formulation & Regulatory Policy Definition',
      phase: 'Phase II: Rule Formulation & Safety Boundaries',
      actor: 'Medical Advisory Committee (MDCAN / NARD Policy Standards)',
      leadTime: 'Pre-Execution Configuration (Adjustable per Roster Cycle)',
      summary:
        'Establishes binding mathematical and legal boundaries for shift allocations, hard-coding fatigue mitigation policies and Southeast Nigerian logistical contingencies.',
      inputs: [
        'Nigerian Association of Resident Doctors (NARD) Maximum Duty Hours Guidelines',
        'Mandatory Post-Call Rest (24 hours uninterrupted off-duty after night call)',
        'Senior-to-Junior clinical oversight ratios',
        'State sanitation days (last Saturday monthly in SE Nigeria) & hospital generator schedules',
      ],
      substeps: [
        {
          title: '2.1 Post-Call Mandatory Rest (PCMR) Enforcement',
          description:
            'Strict adherence to the 24-hour post-call rest rule: No resident doctor or house officer completing a 12-hour or 24-hour call can be assigned a morning or elective clinic the following day.',
          technicalDetails:
            'The engine automatically inserts a synthetic "Post_Call_Rest" slot locking the clinician out of the candidate pool for 24 hours post-call.',
        },
        {
          title: '2.2 Consecutive Night Call Ceiling',
          description:
            'Prohibits any medical practitioner from undertaking back-to-back 12-hour night calls or more than 2 calls in a 7-day period.',
          technicalDetails:
            'Linear constraint evaluation penalizes candidate assignments with an exponential fatigue multiplier if consecutive night count is >= 1.',
        },
        {
          title: '2.3 Senior Supervision Hierarchy Matrix',
          description:
            'Mandates that every call team featuring House Officers or junior Registrars must have a named Senior Registrar or Consultant on call.',
          technicalDetails:
            'The scheduling engine verifies the presence of at least one Part II fellow or Consultant in the active department shift cohort before committing the allocation.',
        },
      ],
      validationCriteria: [
        'Zero post-call rest violations across all resident doctor shifts.',
        'Seniority supervision ratio >= 1.2 : 1 across critical care units.',
      ],
      systemActionTarget: 'generator',
    },
    {
      stepNumber: 3,
      title: 'AI Optimization & Heuristic Shift Matrix Generation',
      phase: 'Phase III: AI Roster Synthesis & Constraint Satisfaction',
      actor: 'Gemini AI Optimization Engine & Heuristic Solver',
      leadTime: 'Execution: 2 to 5 seconds per multi-week schedule',
      summary:
        'Executes dual-layer roster generation combining Gemini AI natural language clinical reasoning with algorithmic constraint-satisfaction solvers to produce 100% conflict-free duty schedules.',
      inputs: [
        'Date range (7-day or 14-day operational windows)',
        'Active clinician pool with cumulative hour logs and availability matrices',
        'Departmental vacancy demands across Morning, Afternoon, and Night shifts',
        'Regional disruption parameters (Sanitation Saturday, fuel logistics)',
      ],
      substeps: [
        {
          title: '3.1 Dual-Engine Scheduling Protocol',
          description:
            'The system calls Gemini 3.8 Flash via server-side proxy routes to formulate clinical balancing justifications, while simultaneously running deterministic constraint satisfaction heuristics.',
          technicalDetails:
            'Computes candidate suitability scores based on cumulative weekly hours, past call density, on-campus quarters status, and special competencies (e.g., ATLS, ALS, POCUS).',
        },
        {
          title: '3.2 Automated Conflict Resolution & Overlap Neutralization',
          description:
            'Eliminates double-booking of doctors across simultaneous departments (e.g., preventing a surgeon from being booked in A&E trauma and Main Theater at the same time).',
          technicalDetails:
            'Maintains an active inverted index of (DoctorID, Date, TimeWindow) locking out double-duty assignments.',
        },
        {
          title: '3.3 Regional Logistics Optimization',
          description:
            'For Southeast Nigeria, the engine automatically prioritizes on-campus doctors for night shifts and schedules early handovers on Sanitation Saturdays before 07:00 AM vehicular restrictions.',
          technicalDetails:
            'Assigns morning handover shifts early and reserves off-campus doctors for daytime afternoon shifts when urban transit is reliable.',
        },
      ],
      validationCriteria: [
        '100% shift coverage rate across all critical hospital departments.',
        'Zero overlapping shifts for any individual clinician.',
      ],
      systemActionTarget: 'generator',
    },
    {
      stepNumber: 4,
      title: 'Real-Time Fatigue Telemetry & Burnout Prevention Audit',
      phase: 'Phase IV: Clinical Quality Assurance & Ergonomic Monitoring',
      actor: 'Clinical Fatigue Telemetry Radar',
      leadTime: 'Continuous 24/7 Automated Surveillance',
      summary:
        'Tracks clinician cognitive stamina and fatigue index in real-time, flagging personnel approaching burnout thresholds and initiating automated relief actions to prevent medical errors.',
      inputs: [
        'Active shift logs and cumulative weekly hours',
        'Consecutive night shift tallies',
        'Recorded call duty intensity (emergency admissions vs. elective duties)',
      ],
      substeps: [
        {
          title: '4.1 Fatigue Index Mathematical Formulation',
          description:
            'Calculates a dynamic Fatigue Score (0 - 100%) for each clinician based on total hours, night shift density, and recovery intervals.',
          technicalDetails:
            'Formula: Score = (WeeklyHours / 56 * 50) + (ConsecutiveNights * 25) + OvertimePenalty. Scores > 70% trigger immediate Critical Risk flags.',
        },
        {
          title: '4.2 Intraoperative Risk Prevention',
          description:
            'Surgeons and anaesthetists exceeding safe thresholds (>70%) are highlighted with warning badges to prevent dangerous intraoperative surgical errors.',
          technicalDetails:
            'Visual radar displays categorized tiers: Safe Fleet (<40%), Moderate Monitor (40-69%), and Critical Burnout Risk (>=70%).',
        },
        {
          title: '4.3 One-Click AI Fatigue Relief Action',
          description:
            'Clinical coordinators can trigger an AI relief action with a single click, instantly substituting a fatigued doctor with a well-rested colleague of identical cadre.',
          technicalDetails:
            'Searches the registry for off-duty or standby personnel with fatigue index < 45% and updates the live roster matrix.',
        },
      ],
      validationCriteria: [
        'Average hospital fatigue maintained under 45%.',
        'Zero clinicians scheduled for complex surgeries with fatigue > 75%.',
      ],
      systemActionTarget: 'fatigue',
    },
    {
      stepNumber: 5,
      title: 'Code Red Emergency Reallocation & Dynamic Clinical Surge Triage',
      phase: 'Phase V: Acute Incident Handling & Contingency Rebalancing',
      actor: 'Emergency Reallocation Center & AI Rapid Dispatcher',
      leadTime: 'Instant (Under 10 Seconds During Acute Crisis)',
      summary:
        'Dynamically rebalances shifts when unexpected clinical emergencies, mass casualties on Southeast Nigerian expressways, sudden doctor illnesses (malaria/typhoid), or infectious disease outbreaks occur.',
      inputs: [
        'Incident severity rating (Critical, High, Moderate)',
        'Incoming casualty count / affected department (A&E, Labor Ward, Theater, Isolation Ward)',
        'Absent or overwhelmed clinician profile',
        'Available standby and off-duty personnel pool',
      ],
      substeps: [
        {
          title: '5.1 Regional Emergency Incident Ingestion',
          description:
            'Simulates or receives real incident alerts (e.g., 18-seater bus collision on Enugu-Port Harcourt Expressway near Ozalla, or Lassa Fever isolation protocol at AE-FUTHA Abakaliki).',
          technicalDetails:
            'Incident objects store timestamp, affected department, severity, and current on-duty personnel shortfall.',
        },
        {
          title: '5.2 AI Candidate Scoring & Proximity Matching',
          description:
            'Gemini AI evaluates the entire off-duty roster to recommend the top 2-3 most suitable replacements based on fatigue score, specialized skill sets, and quarters location.',
          technicalDetails:
            'Heuristic: Doctors in On-Campus Quarters receive priority weighting for emergency call-backs because transit time is < 5 minutes on foot.',
        },
        {
          title: '5.3 Immediate Shift Reassignment Execution',
          description:
            'Hospital administrators review the AI match rationale and click "Execute Reassignment", which updates the live shift slot with status "Emergency_Reassigned".',
          technicalDetails:
            'Updates the active timetable immediately and marks the incident as "Resolved" in the clinical incident log.',
        },
      ],
      validationCriteria: [
        'Replacement clinician mobilized within 15 minutes of Code Red broadcast.',
        'Zero disruption to emergency theater or casualty resuscitation coverage.',
      ],
      systemActionTarget: 'emergency',
    },
    {
      stepNumber: 6,
      title: 'AI Peer-to-Peer Duty Swap Verification & Dispute Prevention',
      phase: 'Phase VI: Clinician Shift Exchange & Mutual Trading',
      actor: 'Shift Swap Desk & AI Regulatory Assessor',
      leadTime: 'Asynchronous (Submitted by Clinicians 24-48 Hours Prior)',
      summary:
        'Enables resident doctors, medical officers, and nurses to propose mutual shift trades with real-time AI regulatory checks for cadre equivalence and fatigue impact.',
      inputs: [
        'Requester clinician and proposed surrender shift',
        'Target colleague and proposed assumption shift',
        'Documented personal or clinical reason (e.g., postgraduate exams, family leave)',
      ],
      substeps: [
        {
          title: '6.1 Cadre Parity Verification',
          description:
            'Ensures clinical equivalence: House Officers can only swap with House Officers, Registrars with Registrars. Senior Registrars may cover junior shifts if needed, but not vice versa.',
          technicalDetails:
            'AI cross-checks the medical cadres against the departmental role requirements before issuing preliminary clearance.',
        },
        {
          title: '6.2 Fatigue Projection Modeling',
          description:
            'Simulates post-swap fatigue levels for both doctors. If the trade would cause either practitioner to exceed 54 hours or violate consecutive call rules, the trade is flagged or rejected.',
          technicalDetails:
            'Calculates delta fatigue score. Trades increasing fatigue into the danger zone (>70%) require explicit CMAC manual waivers.',
        },
        {
          title: '6.3 Automated Roster Synchronization',
          description:
            'Upon AI approval and administrative confirmation, the staff IDs on both shifts are swapped seamlessly in the central database.',
          technicalDetails:
            'Both shifts are marked with status "Swapped" and documented in the audit trail.',
        },
      ],
      validationCriteria: [
        'Both participants satisfy qualification parity.',
        'Zero supervision vacuums created by the trade.',
      ],
      systemActionTarget: 'swaps',
    },
    {
      stepNumber: 7,
      title: 'Natural Language Command Dispatch & Executive Directives',
      phase: 'Phase VII: Executive Directives & Voice/Text Command',
      actor: 'Chief Medical Director (CMD) / CMAC Natural Language Console',
      leadTime: 'Real-time conversational instruction parsing',
      summary:
        'Allows hospital leadership to issue directives in plain English or Nigerian clinical terminology, which Gemini AI translates into concrete roster modifications.',
      inputs: [
        'Unstructured text commands (e.g., "Assign Dr. Chidubem to oversee Tuesday trauma resuscitation and grant Dr. Obinna immediate post-call rest")',
        'Hospital context (UNTH, NAUTH, FMC, AE-FUTHA, ESUT Parklane)',
        'Active department and personnel registry',
      ],
      substeps: [
        {
          title: '7.1 Semantic Clinical Parsing',
          description:
            'Gemini parses the prompt to identify clinical intent (reassign, add standby, grant fatigue leave, swap shifts), target date, department, and named clinicians.',
          technicalDetails:
            'Extracts structured JSON containing action type, targetDate, departmentId, shiftType, and affectedStaffNames with confidence scoring.',
        },
        {
          title: '7.2 Safety Check & Execution',
          description:
            'The extracted directive is verified against MDCAN rules before being committed to the live duty roster.',
          technicalDetails:
            'Executes target shift adjustments and returns a formal administrative confirmation summary to the leadership console.',
        },
      ],
      validationCriteria: [
        'High semantic confidence (>= 90%) before executing roster modifications.',
        'Administrative audit log entry created for each executive directive.',
      ],
      systemActionTarget: 'dispatcher',
    },
    {
      stepNumber: 8,
      title: 'Multi-Tier Approval, Certification & Official Promulgation',
      phase: 'Phase VIII: Statutory Certification & Regulatory Promulgation',
      actor: 'CMD, CMAC, Departmental Heads & Medical Advisory Board',
      leadTime: 'Weekly cycle sign-off (Fridays at 12:00 PM WAT)',
      summary:
        'Produces the official Federal Republic of Nigeria stamped clinical duty roster complete with CMAC and CMD digital sign-off blocks, exportable to JSON and print-ready formats.',
      inputs: [
        'Validated week-long or month-long shift schedule',
        'Departmental head approval notes',
        'Official hospital seals and accreditation details',
      ],
      substeps: [
        {
          title: '8.1 Statutory Duty Roster Formatting',
          description:
            'Formats the roster according to Nigerian Federal Ministry of Health tertiary standards with hospital header, MDCN practicing numbers, and role mandates.',
          technicalDetails:
            'Includes clear visual differentiation for Night Calls, Post-Call Rest periods, and day shifts with timestamped version control.',
        },
        {
          title: '8.2 Digital Regulatory Sign-Off',
          description:
            'Includes formal certification blocks for the Chairman Medical Advisory Committee (CMAC) and Chief Medical Director (CMD).',
          technicalDetails:
            'Applies digital approval verification stamps indicating MDCAN 100% post-call rest compliance.',
        },
        {
          title: '8.3 Distribution & Export',
          description:
            'Rosters can be printed for clinical ward notice boards or exported as machine-readable JSON for integration into hospital EHR systems.',
          technicalDetails:
            'Integrated with standard browser printing with print-specific CSS stylesheets that strip UI chrome and render pristine legal/A4 documents.',
        },
      ],
      validationCriteria: [
        'Signed by CMAC and CMD representatives.',
        'Accessible on all ward stations (A&E, ICU, Theater, Labor Ward, SCBU).',
      ],
      systemActionTarget: 'audit',
    },
  ];

  const currentStep = procedureSteps[activeStepIndex];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/70 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <BookOpen className="w-4 h-4" />
              Standard Operating Procedures (SOP) & Technical Specification
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Computerized Medical Job Scheduling Process
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Step-by-step procedures for computerized medical workforce scheduling, clinical shift
              optimization, and dynamic emergency rebalancing using Artificial Intelligence technology,
              engineered for tertiary healthcare institutions across Southeast Nigeria.
            </p>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-xs shrink-0 space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Building className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-bold">{currentHospital.shortName}</span>
            </div>
            <p className="text-[11px] text-emerald-400">{currentHospital.state} State, Nigeria</p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span>MDCAN / NARD Guideline Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Architecture Flow Diagram */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            End-to-End Scheduling Workflow Architecture
          </h2>
          <span className="text-xs text-slate-400">8 Core Operational Phases</span>
        </div>

        {/* Stepper Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {procedureSteps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.stepNumber}
                onClick={() => {
                  setActiveStepIndex(idx);
                  setExpandedSubstep(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {step.stepNumber}
                  </span>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <h3
                  className={`text-[11px] font-bold line-clamp-2 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </h3>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Detailed Walkthrough */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full">
                Step {currentStep.stepNumber} of 8
              </span>
              <span className="text-xs font-semibold text-emerald-400">{currentStep.phase}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>
          </div>

          <button
            onClick={() => onNavigateTab(currentStep.systemActionTarget)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition self-start sm:self-auto shrink-0"
          >
            <span>Open in System Module</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Step Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              Primary System Actor
            </span>
            <p className="font-semibold text-white">{currentStep.actor}</p>
            <p className="text-slate-400 text-[11px]">
              Responsible for triggering, overseeing, or executing this phase.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              Execution Cadence & Lead Time
            </span>
            <p className="font-semibold text-white">{currentStep.leadTime}</p>
            <p className="text-slate-400 text-[11px]">Operational timing within the clinical hospital cycle.</p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-1 text-xs">Operational Executive Summary:</strong>
          {currentStep.summary}
        </div>

        {/* Inputs & Prerequisites */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Input Data & Prerequisites Required
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {currentStep.inputs.map((inp, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5 text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{inp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Substeps */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Step-by-Step Procedure Execution Guide
          </h3>
          <div className="space-y-3">
            {currentStep.substeps.map((sub, idx) => {
              const isExpanded = expandedSubstep === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedSubstep(isExpanded ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-white">{sub.title}</h4>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  <div className={`px-4 pb-4 space-y-2.5 text-xs text-slate-300 ${isExpanded ? 'block' : 'hidden'}`}>
                    <p>{sub.description}</p>
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300">
                      <strong className="text-slate-400 block mb-0.5">Algorithm & System Implementation:</strong>
                      {sub.technicalDetails}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Criteria */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Quality Control & Regulatory Acceptance Criteria
          </h3>
          <div className="space-y-2">
            {currentStep.validationCriteria.map((crit, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{crit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons between steps */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              setActiveStepIndex((prev) => Math.max(0, prev - 1));
              setExpandedSubstep(null);
            }}
            disabled={activeStepIndex === 0}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeStepIndex === 0
                ? 'text-slate-600 bg-slate-900 cursor-not-allowed'
                : 'text-slate-300 bg-slate-800 hover:bg-slate-700'
            }`}
          >
            ← Previous Procedure
          </button>

          <span className="text-xs text-slate-500 font-mono">
            {activeStepIndex + 1} / {procedureSteps.length}
          </span>

          <button
            onClick={() => {
              setActiveStepIndex((prev) => Math.min(procedureSteps.length - 1, prev + 1));
              setExpandedSubstep(null);
            }}
            disabled={activeStepIndex === procedureSteps.length - 1}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeStepIndex === procedureSteps.length - 1
                ? 'text-slate-600 bg-slate-900 cursor-not-allowed'
                : 'text-white bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            Next Procedure →
          </button>
        </div>
      </div>

      {/* Regional Nuances in Southeast Nigeria Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <Compass className="w-5 h-5 text-emerald-400" />
          Southeast Nigeria Regional Context & Clinical Nuances
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-emerald-400 text-xs">On-Campus Doctors Quarters</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              At facilities like UNTH Ituku-Ozalla, NAUTH Nnewi, and FMC Umuahia, night shift doctors
              are prioritized from on-campus residences to eliminate dangerous late-night transit along
              interstate highways and avoid urban security checkpoints.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-amber-400 text-xs">Sanitation Saturday Shifts</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              In Southeastern states (Enugu, Anambra, Abia, Ebonyi, Imo), environmental sanitation is
              observed on the last Saturday of the month with vehicular movement restricted from 07:00 to
              10:00 AM. Shift handovers are scheduled at 06:30 AM to guarantee smooth ward continuity.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-purple-400 text-xs">Generator Switchover & Power</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tertiary surgical theater complexes operate dedicated diesel generator schedules. The AI
              scheduling system aligns major elective and emergency operative shifts with guaranteed
              theater generator uptime windows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
