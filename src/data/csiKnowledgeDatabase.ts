// CSI Knowledge Base & OAPI Reference Database for ETABS, SAP2000, and SAFE

export interface CSIErrorKnowledge {
  errorCode: string;
  title: string;
  symptom: string;
  software: 'ETABS' | 'SAP2000' | 'SAFE' | 'ALL';
  cause: string;
  rootCause: string;
  csiDocReference: string;
  solution: string;
  stepByStepSolution: string[];
}

export interface CSIApiReference {
  id: string;
  title: string;
  category: string;
  software: string[];
  description: string;
  csharpCode: string;
  pythonCode: string;
  vbaCode: string;
}

export const CSI_ERROR_SOLUTIONS: CSIErrorKnowledge[] = [
  {
    errorCode: 'ERR_NUMERICAL_INSTABILITY_01',
    title: 'Numerical Instability at Joint (DOF UZ / ROTY)',
    symptom: 'Warning: Numerical instability or zero stiffness detected at Joint 142 (DOF UZ / ROTY)',
    software: 'ETABS',
    cause: 'Node is connected to frame elements with moment releases at both ends or floating without diaphragm constraint.',
    rootCause: 'Node is connected to frame elements with moment releases at both ends, or node is floating without diaphragm constraint or boundary support.',
    csiDocReference: 'CSI Analysis Reference Manual v21 - Chapter 12: Equation Solvers & Instabilities',
    solution: 'Kiểm tra giải phóng liên kết M22/M33 ở các dầm nối vào nút và gán Diaphragm D1 cho sàn.',
    stepByStepSolution: [
      'Locate joint using Edit > Select > Labels > Joint 142.',
      'Check if moment releases (M22/M33) are assigned to all framing members framing into this joint, leaving it free to spin in torsion.',
      'Check if a rigid or semi-rigid diaphragm is assigned at that floor level.',
      'Verify if element is connected to an unmeshed shell edge (missing Auto-Mesh constraint).',
    ],
  },
  {
    errorCode: 'ERR_NEGATIVE_EIGENVALUE',
    title: 'Negative Eigenvalue in Ritz/Modal Analysis',
    symptom: 'Solver Log: Negative eigenvalues found during Ritz / Eigen modal analysis (Negative stiffness matrix)',
    software: 'ALL',
    cause: 'P-Delta geometric stiffness exceeds elastic stiffness (structure buckled under gravity loads or unstable mechanism).',
    rootCause: 'P-Delta geometric stiffness kg exceeds elastic stiffness ke (structure has buckled under gravity loads or bad modifier/unstable mechanism).',
    csiDocReference: 'CSI Analysis Reference Manual - Chapter 14: P-Delta and Geometric Nonlinearity',
    solution: 'Kiểm tra hệ số tải trọng trong P-Delta Combination (1.0 DL + 0.25 LL) và stiffness modifier.',
    stepByStepSolution: [
      'Check gravity load scale factors in P-Delta Load Combination (e.g. 1.0 DL + 0.25 LL).',
      'Check if any column or brace section has f22/f11 stiffness modifiers set near zero (0.0001).',
      'Run standard linear static analysis first to verify no massive displacement under DL/LL alone.',
    ],
  },
  {
    errorCode: 'ERR_DIAPHRAGM_DISCONNECTED',
    title: 'Story Drift Output Erratic / Zero',
    symptom: 'Story drift output displays 0.000 or erratic story shear values',
    software: 'ETABS',
    cause: 'Floor slabs are modelled as membrane or shells without an explicit Diaphragm Assignment.',
    rootCause: 'Floor slabs are modelled as membrane or shells without an explicit Diaphragm Assignment (D1, D2) or Auto-line constraint is disabled.',
    csiDocReference: 'ETABS Design Manual: Diaphragms and Story Drift Verification',
    solution: 'Gán Diaphragm Rigid/Semi-rigid cho tất cả Area objects và bật Auto Line Constraint.',
    stepByStepSolution: [
      'Select all floor area objects on each level.',
      'Assign > Shell > Diaphragms > Choose Rigid (or Semi-Rigid if slab has significant re-entrant corners or transfer slabs).',
      'Enable "Auto Line Constraint" in Assign > Shell > Auto Line Constraint.',
    ],
  },
  {
    errorCode: 'ERR_PUNCHING_SHEAR_SAFE_NC',
    title: 'SAFE Punching Shear Not Checked (N/C)',
    symptom: 'SAFE Punching Shear Check returns "N/C" (Not Checked) or "> 2.0 (Fail)"',
    software: 'SAFE',
    cause: 'Column is located at slab edge/corner without proper perimeter definition or opening intersects perimeter.',
    rootCause: 'Column is located at slab edge/corner without proper perimeter definition, or opening intersects the critical shear perimeter at d/2.',
    csiDocReference: 'SAFE Punching Shear Design Manual (TCVN 5574 / ACI 318 / EC2)',
    solution: 'Thiết lập chu vi tính toán d/2 (Edge/Corner), tăng chiều dày đài móng hoặc bổ sung thép đai chống chọc thủng.',
    stepByStepSolution: [
      'Right click column to inspect Critical Perimeter definition (Edge / Corner / Interior).',
      'Ensure effective depth d = slab thickness - cover - rebar diameter is properly assigned.',
      'If ratio > 1.0, increase slab/mat thickness locally (drop panel) or provide punching shear stud rails / shear links in SAFE design strips.',
    ],
  },
];

export const CSI_OAPI_REFERENCES: CSIApiReference[] = [
  {
    id: 'oapi-connect',
    title: 'Attach to Running CSI Instance',
    category: 'Connection & Setup',
    software: ['ETABS', 'SAP2000', 'SAFE'],
    description: 'Kết nối an toàn vào phiên bản ETABS/SAP2000/SAFE đang mở trên máy tính qua COM Interop.',
    csharpCode: `// C# .NET 8 Native COM Interop
using CSiProgram;
cOAPI myETABS = (cOAPI)System.Runtime.InteropServices.Marshal.GetActiveObject("CSI.ETABS.API.ETABSObject");
cSapModel mySapModel = myETABS.SapModel;
// Check if model is unlocked
bool isLocked = mySapModel.GetModelIsLocked();
Console.WriteLine($"Attached to ETABS. Model locked: {isLocked}");`,
    pythonCode: `# Python comtypes OAPI Bridge
import comtypes.client
try:
    etabs = comtypes.client.GetActiveObject("CSI.ETABS.API.ETABSObject")
    sapModel = etabs.SapModel
    ret = sapModel.SetPresentUnits(6) # 6 = kN_m_C
    print(f"Connected to ETABS: {sapModel.GetModelFilename(True)}")
except Exception as e:
    print(f"Error connecting: {e}")`,
    vbaCode: `' Excel VBA Macro Connection
Dim myETABS As ETABSv1.cOAPI
Dim mySapModel As ETABSv1.cSapModel
Set myETABS = GetObject(, "CSI.ETABS.API.ETABSObject")
Set mySapModel = myETABS.SapModel
Call mySapModel.SetPresentUnits(6) ' kN, m, C`,
  },
  {
    id: 'oapi-joint-react',
    title: 'Extract Column Reactions for Foundation',
    category: 'Results Extraction',
    software: ['ETABS', 'SAP2000'],
    description: 'Lấy toàn bộ phản lực chân cột (Fz, Vx, Vy, Mx, My) từ tổ hợp bao ULS để truyền sang tính toán móng cọc.',
    csharpCode: `// Extract Support Reactions for Pile Foundation
int numResults = 0;
string[] obj = null, elm = null, loadCase = null, stepType = null;
double[] stepNum = null, f1 = null, f2 = null, f3 = null, m1 = null, m2 = null, m3 = null;
mySapModel.Results.Setup.DeselectAllCasesAndCombosForOutput();
mySapModel.Results.Setup.SetComboSelectedForOutput("COMB_ULS_ENVELOPE", true);
mySapModel.Results.JointReact("ALL", eItemTypeElm.Element, ref numResults, ref obj, ref elm, ref loadCase, ref stepType, ref stepNum, ref f1, ref f2, ref f3, ref m1, ref m2, ref m3);`,
    pythonCode: `# Python Extract Reactions
sapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
sapModel.Results.Setup.SetComboSelectedForOutput("COMB_ULS_ENVELOPE", True)
ret = sapModel.Results.JointReact("ALL", 0)
# ret returns tuple: (numResults, obj, elm, loadCase, stepType, stepNum, f1, f2, f3, m1, m2, m3)`,
    vbaCode: `' Excel VBA Extract Reactions
Call mySapModel.Results.Setup.DeselectAllCasesAndCombosForOutput
Call mySapModel.Results.Setup.SetComboSelectedForOutput("COMB_ULS_ENVELOPE", True)
Call mySapModel.Results.JointReact("ALL", 0, numResults, obj, elm, loadCase, stepType, stepNum, f1, f2, f3, m1, m2, m3)`,
  },
  {
    id: 'oapi-drift',
    title: 'Extract Story Drifts & Modal Results',
    category: 'Model Integrity & Audit',
    software: ['ETABS'],
    description: 'Trích xuất chuyển vị lệch tầng (Story Drift) và chu kỳ dao động riêng kiểm tra giới hạn H/500 và chống xoắn Mode 1.',
    csharpCode: `int numResults = 0;
string[] story = null, loadCase = null, stepType = null, label = null;
double[] stepNum = null, drift = null, disp = null;
mySapModel.Results.StoryDrift(ref numResults, ref story, ref loadCase, ref stepType, ref stepNum, ref drift, ref label);`,
    pythonCode: `# Python Extract Story Drift
ret = sapModel.Results.StoryDrift()
# returns (numResults, story, loadCase, stepType, stepNum, drift, label)`,
    vbaCode: `Call mySapModel.Results.StoryDrift(numResults, story, loadCase, stepType, stepNum, drift, label)`,
  },
  {
    id: 'oapi-safe-springs',
    title: 'Assign Pile Spring Stiffness (kz) to SAFE Mat',
    category: 'SAFE Foundation Design',
    software: ['SAFE'],
    description: 'Gán độ cứng lò xo đất nền & cọc Kz = P / Settlement vào các điểm cọc trên đài móng SAFE.',
    csharpCode: `// Assign Point Spring to SAFE Foundation
double[] k = new double[] { 0, 0, 183375, 0, 0, 0 }; // Kz = 183,375 kN/m
mySapModel.PointObj.SetSpring("P1", k, false, eItemType.Objects);`,
    pythonCode: `# Python Assign Springs to SAFE
k_springs = [0.0, 0.0, 183375.0, 0.0, 0.0, 0.0]
sapModel.PointObj.SetSpring("P1", k_springs, False, 0)`,
    vbaCode: `Dim k(5) As Double
k(2) = 183375# ' Kz in kN/m
Call mySapModel.PointObj.SetSpring("P1", k, False, 0)`,
  },
];
