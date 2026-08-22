// HNL PILE AI - Types & Data Models for Advanced Foundation & Pile Engineering

export type VerificationStatus = 'VERIFIED' | 'NEEDS_CONFIRMATION' | 'NOT_VERIFIED';

export type PileCategory =
  | 'PHC'
  | 'PC'
  | 'Nodular'
  | 'SquareRC'
  | 'PrestressedSquare'
  | 'Bored'
  | 'Micropile'
  | 'Steel'
  | 'Sheet';

export type InstallationMethod = 'Pressing' | 'Driving' | 'Pre-Boring' | 'Hyper-MEGA';

export interface ManufacturerProductSource {
  id: string;
  manufacturer: string; // e.g. 'Phan Vu Group', 'Amacao', 'Minh Duc', 'Fecon', 'Generic / Custom'
  product: string; // e.g. 'Cọc ống bê tông ly tâm ứng lực trước PHC'
  productCode: string; // e.g. 'PHC-D600A'
  category: PileCategory;
  class: 'Class A' | 'Class B' | 'Class C';
  sourceUrl: string;
  documentName: string; // e.g. 'Phan Vu Technical Datasheet 2026.pdf'
  revision: string; // e.g. 'Rev 3.2'
  publicationDate: string; // e.g. '2025-11-10'
  standard: string; // e.g. 'TCVN 7888:2014', 'JIS A 5373'
  lastVerifiedDate: string; // e.g. '2026-08-20'
  verificationStatus: VerificationStatus;
  geometry: {
    outerDiameter_mm?: number;
    wallThickness_mm?: number;
    innerDiameter_mm?: number;
    width_mm?: number;
    height_mm?: number;
    concreteGrade: string; // e.g. 'B60' / 'B80'
    fck_MPa: number;
    fcu_cube_MPa: number; // e.g. 80 MPa
    pcBarDiameter_mm?: number;
    pcBarQuantity?: number;
    spiralWire_mm?: string; // e.g. 'D5a100'
    endPlateThickness_mm?: number; // e.g. 18 mm
    endPlateWidth_mm?: number; // e.g. 100 mm
    unitWeight_kg_m: number;
    structuralAxialCapacity_kN: number; // Vật liệu cọc
    crackingMoment_kNm: number;
    ultimateMoment_kNm: number;
    allowableHorizontal_kN: number;
    standardLengths_m: number[];
  };
}

export interface SmartPileObject {
  pileId: string; // e.g. 'P001', 'PC01-P01'
  pileType: PileCategory;
  manufacturer: string;
  productCode: string; // e.g. 'PHC-D600A'
  shape: 'Circular' | 'Square' | 'Nodular' | 'Octagonal';
  diameterOrWidth_mm: number;
  wallThickness_mm: number;
  length_m: number; // Total length
  segmentLengths_m: number[]; // e.g. [12, 9]
  concreteStrength: string;
  prestressType: string;
  class: 'Class A' | 'Class B' | 'Class C';
  pileHeadLevel_m: number;
  pileToeLevel_m: number;
  cutOffLevel_m: number;
  embedmentInCap_mm: number;
  designCapacities: {
    structuralAxial_kN: number; // Sức chịu tải vật liệu cọc (Catalog)
    geotechnicalBearing_kN: number; // Sức chịu tải đất nền [Rc] (TCVN 10304)
    workingLoad_kN: number; // Tải trọng thiết kế đầu cọc P_tt
    jackingForceMin_kN: number; // P_ep,min = 1.5 * P_tt
    jackingForceMax_kN: number; // P_ep,max = 2.0 * P_tt
  };
  installationMethod: InstallationMethod;
  standard: string;
  drawingRef: string;
  source: string;
  coordinates: {
    x: number;
    y: number;
    gridRelation?: string;
    capId?: string;
    ucs_x?: number;
    ucs_y?: number;
  };
  asBuiltData?: {
    asBuiltX: number;
    asBuiltY: number;
    deltaX_mm: number;
    deltaY_mm: number;
    totalOffset_mm: number;
    levelDiff_mm: number;
    pressingForce_kN: number;
    status: 'WITHIN_TOLERANCE' | 'NEAR_LIMIT' | 'OUT_OF_TOLERANCE';
  };
  status: VerificationStatus;
  needsUpdateFlags?: {
    drawing: boolean;
    schedule: boolean;
    boq: boolean;
    details: boolean;
  };
}

export interface ProjectPilePreset {
  projectId: string;
  manufacturer: string;
  pileType: PileCategory;
  defaultProductCode: string;
  projectStandard: string;
  geotechnicalStandard: string;
  installationMethod: InstallationMethod;
  cutOffRule: string; // e.g. "Top of pile embedded 100mm into cap, dowels 8-D20 L=1200mm"
  hasNewerStandardAvailable?: boolean;
  newerStandardNote?: string;
  hasStandardConflict?: boolean;
  standardConflictNote?: string;
}

export interface PileJointDetail {
  jointType: 'Welded End Plate' | 'Lock Pin' | 'Bolted Sleeve';
  plateThickness_mm: number;
  weldSize_mm: number;
  weldElectrode: string;
  referenceDrawing: string;
  standard: string;
  verificationStatus: VerificationStatus;
}

export interface PileHeadDetail {
  cutOffLevel_m: number;
  embeddedLength_mm: number;
  dowelRebar: string;
  groutingConcrete: string;
  pileCapConnection: 'Rigid Anchor' | 'Hinged Anchor';
  referenceDrawing: string;
}

export interface PileAuditResult {
  issueId: string;
  code: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  affectedPiles: string[];
  recommendation: string;
}
