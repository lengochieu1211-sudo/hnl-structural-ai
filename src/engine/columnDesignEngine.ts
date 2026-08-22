// Column Design & P-M-M Interaction Diagram Verification Engine

export interface ColumnDesignInput {
  b_mm: number;
  h_mm: number;
  length_m: number;
  p_kN: number; // Axial force
  mx_kNm: number; // Moment major
  my_kNm: number; // Moment minor
  concreteGrade: string; // B35 (Rb=19.5 MPa)
  steelGrade: string; // CB500 (Rs=435 MPa)
}

export interface ColumnDesignOutput {
  totalAs_cm2: number;
  rebarConfig: string;
  mu_pct: number;
  slenderness_lambda: number;
  eta_bucklingCoeff: number;
  pmm_interaction_ratio: number;
  status: 'PASS' | 'FAIL';
  interactionPoints: { p_kN: number; m_kNm: number }[];
}

export class ColumnDesignEngine {
  static designColumn(input: ColumnDesignInput): ColumnDesignOutput {
    const b = input.b_mm / 10; // cm
    const h = input.h_mm / 10; // cm
    const L0 = input.length_m * 0.7 * 100; // effective length cm (pinned/sway frame)

    // Slenderness check
    const r = h / Math.sqrt(12); // radius of gyration
    const lambda = L0 / r;
    const eta = lambda > 14 ? 1.0 + (lambda - 14) * 0.015 : 1.0;

    const N_kN = Math.abs(input.p_kN);
    const M_kNm = Math.sqrt(Math.pow(input.mx_kNm, 2) + Math.pow(input.my_kNm, 2)) * eta;

    // Material props
    const Rb_MPa = 19.5;
    const Rs_MPa = 435.0;

    // Approximate symmetric rebar requirement (P-M-M interaction formula)
    const Ac_cm2 = b * h;
    const nu = (N_kN * 10) / (Rb_MPa * Ac_cm2); // axial ratio
    const mu = (M_kNm * 1e5) / (Rb_MPa * 10 * b * h * h); // moment ratio

    const calculated_mu_pct = Math.max(1.0, Math.min(4.0, (nu * 0.8 + mu * 2.2) * 1.5));
    const totalAs_cm2 = (calculated_mu_pct / 100) * Ac_cm2;

    // Generate P-M Interaction Diagram envelope
    const p0_pureCompression = (Rb_MPa * Ac_cm2 * 10 + Rs_MPa * totalAs_cm2 * 10) / 1000;
    const pBalance = p0_pureCompression * 0.45;
    const mMax = (0.2 * Rb_MPa * b * h * h * 100) / 1e5 + (totalAs_cm2 * Rs_MPa * 0.4 * h) / 100;

    const interactionPoints: { p_kN: number; m_kNm: number }[] = [
      { p_kN: Math.round(p0_pureCompression), m_kNm: 0 },
      { p_kN: Math.round(p0_pureCompression * 0.85), m_kNm: Math.round(mMax * 0.5) },
      { p_kN: Math.round(pBalance), m_kNm: Math.round(mMax) },
      { p_kN: Math.round(pBalance * 0.4), m_kNm: Math.round(mMax * 0.8) },
      { p_kN: 0, m_kNm: Math.round(mMax * 0.45) },
      { p_kN: Math.round(-totalAs_cm2 * Rs_MPa * 0.1), m_kNm: 0 }, // pure tension
    ];

    const pmm_interaction_ratio = Math.round(Math.min(1.4, Math.max(0.3, N_kN / (p0_pureCompression * 0.8) + M_kNm / mMax)) * 100) / 100;

    // Rebar arrangement suggestion
    const numBars = input.b_mm >= 600 || input.h_mm >= 600 ? 12 : 8;
    const barDia = totalAs_cm2 / numBars > 3.5 ? 25 : 20;

    return {
      totalAs_cm2: Number(totalAs_cm2.toFixed(2)),
      rebarConfig: `${numBars} D${barDia} (As=${(numBars * (Math.PI * barDia * barDia / 400)).toFixed(2)} cm²)`,
      mu_pct: Number(calculated_mu_pct.toFixed(2)),
      slenderness_lambda: Number(lambda.toFixed(1)),
      eta_bucklingCoeff: Number(eta.toFixed(3)),
      pmm_interaction_ratio,
      status: pmm_interaction_ratio <= 1.0 ? 'PASS' : 'FAIL',
      interactionPoints,
    };
  }
}
