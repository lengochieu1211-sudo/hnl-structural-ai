// Core Type Definitions for Structural Engineering AI Workstation

export type SoftwareType = 'ETABS' | 'SAP2000' | 'SAFE';

export type AnalysisStatus = 'UNLOCKED' | 'RUNNING' | 'ANALYSIS_COMPLETE' | 'ERROR';
export type DesignStatus = 'NOT_RUN' | 'DESIGNING' | 'DESIGN_AVAILABLE' | 'FAILURES_DETECTED';

export type UnitSystem = 'Metric_kN_m' | 'Metric_ton_m' | 'SI_N_mm' | 'US_kip_in';

export interface CSIConnection {
  name: string;
  type: SoftwareType;
  version: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'STANDBY';
  activeModel: string;
  filePath: string;
  units: string;
  analysisStatus: AnalysisStatus;
  designStatus: DesignStatus;
  jointsCount: number;
  framesCount: number;
  shellsCount: number;
  lastSyncTime: string;
}

export interface MaterialData {
  id: string;
  name: string;
  type: 'Concrete' | 'Rebar' | 'Steel' | 'Masonry' | 'Custom';
  standard: string; // e.g. TCVN 5574:2018 (B30), ACI 318 (fc'=30MPa), ASTM A615 (Gr60)
  grade: string;
  fc_MPa?: number;
  fy_MPa?: number;
  fyu_MPa?: number;
  E_MPa: number;
  G_MPa?: number;
  poisson: number;
  density_kg_m3: number;
  thermal_coeff: number;
  designValues: {
    Rb_MPa?: number; // Concrete compression design strength (TCVN)
    Rbt_MPa?: number; // Concrete tension design strength (TCVN)
    Rs_MPa?: number; // Rebar design yield strength (TCVN)
    Rsc_MPa?: number;
    Rsw_MPa?: number; // Stirrup design strength
  };
}

export interface SectionData {
  id: string;
  name: string;
  type: 'Beam' | 'Column' | 'Brace' | 'Slab' | 'Wall' | 'Pier' | 'Spandrel' | 'PileCap' | 'Link';
  materialId: string;
  shape: 'Rectangular' | 'Circular' | 'Tee' | 'I-Shape' | 'Box' | 'Custom';
  dimensions: {
    b_mm?: number;
    h_mm?: number;
    d_mm?: number; // diameter
    t_mm?: number; // thickness for slab/wall
    tf_mm?: number;
    tw_mm?: number;
    bf_mm?: number;
  };
  rebarCover_mm: number;
  calculatedProps?: {
    area_cm2: number;
    ixx_cm4: number;
    iyy_cm4: number;
    j_cm4: number;
    weight_kg_m: number;
  };
}

export interface GridDefinition {
  id: string;
  name: string;
  xInput: string; // e.g., "3600x5 + 4200x3"
  yInput: string; // e.g., "6000x4 + 7500x2"
  xSpacings: number[];
  ySpacings: number[];
  xCoordinates: number[];
  yCoordinates: number[];
}

export interface StoryData {
  id: string;
  name: string;
  elevation_m: number;
  height_m: number;
  isSimilarTo?: string;
  isMasterStory: boolean;
  type: 'Basement' | 'Typical' | 'Podium' | 'Roof' | 'Technical' | 'Top';
}

export interface ModelNode {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  story: string;
  restraint?: string; // 'Fixed', 'Pinned', 'Spring', 'Free'
}

export interface ModelFrame {
  id: string;
  name: string;
  type: 'Beam' | 'Column' | 'Brace';
  nodeI: string;
  nodeJ: string;
  sectionId: string;
  story: string;
  length_m: number;
  releases?: { m33I?: boolean; m33J?: boolean; m22I?: boolean; m22J?: boolean };
}

export interface ModelShell {
  id: string;
  name: string;
  type: 'Slab' | 'Wall';
  nodes: string[];
  sectionId: string;
  story: string;
  thickness_mm: number;
  pierSpandrelLabel?: string;
}

export type SeverityLevel = 'CRITICAL' | 'WARNING' | 'REVIEW' | 'OK';

export interface AuditIssue {
  id: string;
  category: 'Connectivity' | 'Geometry' | 'Support' | 'Diaphragm' | 'Mass' | 'Loads' | 'Mesh' | 'Offsets' | 'Releases';
  title: string;
  description: string;
  affectedObjects: string[];
  severity: SeverityLevel;
  recommendation: string;
  csiRuleReference: string;
  autoFixable?: boolean;
}

export interface LoadCase {
  id: string;
  name: string;
  type: 'DEAD' | 'SDL' | 'LIVE' | 'WALL' | 'MEP' | 'CEILING' | 'WIND_X' | 'WIND_Y' | 'SPEC_X' | 'SPEC_Y' | 'TEMP';
  category: 'Permanent' | 'Variable' | 'Seismic' | 'Wind' | 'Accidental';
  factor: number;
  standardClause?: string;
}

export interface LoadCombination {
  id: string;
  name: string;
  type: 'ULS' | 'SLS' | 'WIND' | 'SEISMIC' | 'ENVELOPE';
  factors: { [loadCaseName: string]: number };
  description: string;
  standard: string; // TCVN 2737:2023, ACI 318-19, ASCE 7-22
}

export interface AnalysisResults {
  storyDrifts: {
    story: string;
    loadComb: string;
    driftX: number;
    driftY: number;
    limit: number;
    status: 'PASS' | 'FAIL' | 'WARNING';
  }[];
  modalResults: {
    mode: number;
    period_sec: number;
    frequency_hz: number;
    ux_pct: number;
    uy_pct: number;
    rz_pct: number;
    sum_ux_pct: number;
    sum_uy_pct: number;
    isDominant: 'TORSION' | 'TRANS_X' | 'TRANS_Y' | 'OTHER';
  }[];
  baseShear: {
    loadCase: string;
    vx_kN: number;
    vy_kN: number;
    fz_kN: number;
    mx_kNm: number;
    my_kNm: number;
  }[];
  columnReactions: {
    nodeId: string;
    colName: string;
    x: number;
    y: number;
    comb: string;
    fz_kN: number; // axial (compression positive)
    vx_kN: number;
    vy_kN: number;
    mx_kNm: number;
    my_kNm: number;
    mz_kNm: number;
  }[];
  beamForces: {
    beamId: string;
    beamName: string;
    story: string;
    comb: string;
    m3_max_kNm: number;
    m3_min_kNm: number;
    v2_max_kN: number;
    torsion_kNm: number;
  }[];
  columnForces: {
    colId: string;
    colName: string;
    story: string;
    comb: string;
    p_max_kN: number;
    m2_kNm: number;
    m3_kNm: number;
    v2_kN: number;
    v3_kN: number;
    designRatio: number;
  }[];
}

export interface SoilLayer {
  layerNumber: number;
  name: string;
  description: string;
  topDepth_m: number;
  bottomDepth_m: number;
  thickness_m: number;
  soilType: 'Fill' | 'Clay_Soft' | 'Clay_Stiff' | 'Clay_Hard' | 'Sand_Loose' | 'Sand_Medium' | 'Sand_Dense' | 'WeatheredRock' | 'Rock';
  gamma_kN_m3: number; // Unit weight
  c_kPa: number; // Cohesion
  phi_deg: number; // Friction angle
  spt_N: number; // SPT N-value
  qc_MPa?: number; // CPT cone resistance
  fs_kPa?: number; // CPT sleeve friction
  cu_kPa?: number; // Undrained shear strength
  e_MPa: number; // Deformation modulus
  poisson: number;
  groundwaterDepth_m: number;
  // Specific TCVN 10304 parameters
  Il_consistency?: number; // Chỉ số sệt I_L đối với đất dính
  e_voidRatio?: number; // Hệ số rỗng e
}

export interface BoreholeData {
  id: string;
  code: string; // e.g., BH01, BH02
  x_coord: number;
  y_coord: number;
  groundElevation_m: number;
  waterTableDepth_m: number;
  totalDepth_m: number;
  dateSurvey: string;
  layers: SoilLayer[];
}

export interface PhanVuPileProduct {
  id: string;
  category: 'PHC' | 'PC' | 'PrestressedSquare' | 'Nodular' | 'PreBored' | 'Barrette';
  code: string; // e.g. PHC-D500A, PHC-D600B, NOD-D500
  outerDiameter_mm: number;
  wallThickness_mm: number;
  innerDiameter_mm?: number;
  concreteGrade: string; // e.g. B60 / B80
  fck_MPa: number;
  fcu_cube_MPa: number; // 80 MPa
  concreteArea_cm2: number;
  steelArea_cm2: number;
  unitWeight_kg_m: number;
  structuralAxialCapacity_kN: number; // Sức chịu tải nén vật liệu cọc theo TCVN & PVG
  crackingMoment_kNm: number; // Momen kháng nứt Mcr
  ultimateMoment_kNm: number; // Momen giới hạn Mu
  allowableHorizontal_kN: number; // Lực ngang cho phép H
  standardLengths_m: number[]; // e.g. [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  catalogVersion: string;
  officialSourceUrl: string;
  specialFeatures?: string; // e.g. "Gân tăng ma sát thân cọc 35%", "Mối nối hàn/khóa côn"
}

export interface CalculationStep {
  stepName: string;
  formulaLatex: string;
  variables: { name: string; symbol: string; value: number | string; unit: string }[];
  intermediateValue?: string;
  resultValue: number | string;
  unit: string;
  standardClause: string;
  status?: 'PASS' | 'FAIL' | 'INFO';
  explanation?: string;
}

export interface PileCapacitySummary {
  pileType: string;
  pileDiameter_mm: number;
  pileLength_m: number;
  tipDepth_m: number;
  boreholeId: string;
  // Geotechnical capacities by multiple methods
  q_soil_tcvn10304_kN: number;
  q_soil_spt_meyerhof_kN: number;
  q_soil_spt_aoki_kN: number;
  q_soil_cpt_schmertmann_kN: number;
  q_soil_cpt_philipponnat_kN: number;
  q_static_test_predicted_kN: number;
  q_pda_capwap_kN?: number;
  q_structural_material_kN: number;
  q_design_allowable_kN: number;
  // Component details
  q_tip_kN: number;
  q_shaft_total_kN: number;
  layerFrictions: {
    layerNo: number;
    soilName: string;
    thickness_m: number;
    unitFriction_kPa: number;
    perimeter_m: number;
    friction_kN: number;
  }[];
  detailedSteps: CalculationStep[];
  methodComparison: {
    methodName: string;
    q_allowable_kN: number;
    variancePercentage: number;
    reliability: 'VERIFIED' | 'HIGH' | 'MEDIUM';
  }[];
}

export interface PileGroupDesign {
  id: string;
  capId: string;
  columnId: string;
  story: string;
  appliedForces: {
    fz_kN: number; // Compression N
    vx_kN: number;
    vy_kN: number;
    mx_kNm: number;
    my_kNm: number;
    mz_kNm: number;
  };
  pileProductId: string;
  pileDiameter_mm: number;
  numberOfPiles: number;
  spacing_mm: number;
  edgeDistance_mm: number;
  capDimensions: {
    lengthX_mm: number;
    lengthY_mm: number;
    thickness_mm: number;
  };
  piles: {
    pileNo: number;
    x_mm: number;
    y_mm: number;
    axialLoad_kN: number;
    maxCapacity_kN: number;
    ratio: number;
    status: 'PASS' | 'FAIL';
  }[];
  nMax_kN: number;
  nMin_kN: number;
  nAllowable_kN: number;
  punchingCheck: {
    colPunchingRatio: number;
    pilePunchingRatio: number;
    shearCheckRatio: number;
    status: 'PASS' | 'FAIL';
  };
  capReinforcement: {
    bottomMeshX: string; // e.g. "D22a150"
    bottomMeshY: string;
    topMeshX: string;
    topMeshY: string;
  };
}

export interface StandardProfile {
  id: string;
  name: string;
  loadingCode: string; // e.g. TCVN 2737:2023
  concreteCode: string; // e.g. TCVN 5574:2018
  seismicCode: string; // e.g. TCVN 9386:2012
  pileCode: string; // e.g. TCVN 10304:2014
  windCode: string; // e.g. TCVN 2737:2023
  steelCode: string; // e.g. TCVN 5575:2012
  units: string;
  active: boolean;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: 'CSI_MANUAL' | 'TCVN_STANDARD' | 'PHAN_VU_CATALOG' | 'COMPANY_GUIDELINE' | 'RESEARCH_PAPER' | 'PROJECT_BOD';
  source: string;
  clauseOrSection?: string;
  version: string;
  content: string;
  tags: string[];
}

export interface ProjectWorkspace {
  id: string;
  name: string;
  projectCode: string;
  location: string;
  engineerName: string;
  checkerName: string;
  description: string;
  lastModified: string;
  currentStandardProfile: StandardProfile;
  materials: MaterialData[];
  sections: SectionData[];
  grids: GridDefinition;
  stories: StoryData[];
  nodes: ModelNode[];
  frames: ModelFrame[];
  shells: ModelShell[];
  loadCases: LoadCase[];
  loadCombinations: LoadCombination[];
  auditIssues: AuditIssue[];
  analysisResults: AnalysisResults;
  boreholes: BoreholeData[];
  selectedBoreholeId: string;
  pileDesigns: PileCapacitySummary[];
  pileGroups: PileGroupDesign[];
  writeModeEnabled: boolean;
  historyRevisions: {
    timestamp: string;
    author: string;
    description: string;
    changesSummary: string;
  }[];
}
