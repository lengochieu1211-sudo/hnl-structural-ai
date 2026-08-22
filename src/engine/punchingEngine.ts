// Punching Shear Calculation Engine with SAFE vs Independent Double-Check

export interface PunchingInput {
  columnLabel: string;
  story: string;
  colWidth_mm: number;
  colHeight_mm: number;
  slabThickness_mm: number;
  cover_mm: number;
  axialPunchingForce_kN: number; // Vu or N
  unbalancedMoment_kNm?: number;
  columnLocation: 'Interior' | 'Edge' | 'Corner';
  concreteGrade: string; // e.g. B30 (Rbt = 1.05 MPa, fc' = 30 MPa)
  safeCalculatedRatio: number; // Ratio imported directly from SAFE .FDB model
}

export interface PunchingOutput {
  columnLabel: string;
  effectiveDepth_d_mm: number;
  criticalPerimeter_b0_mm: number;
  concreteShearCapacity_kN: number;
  independentRatio: number;
  safeRatio: number;
  variancePercentage: number;
  doubleCheckStatus: 'PASS_MATCH' | 'CHECK_REQUIRED' | 'FAIL_OVERSTRESSED';
  recommendation: string;
  equationsTrace: { title: string; latex: string; val: string }[];
}

export class PunchingEngine {
  static checkPunchingShear(input: PunchingInput): PunchingOutput {
    const d = input.slabThickness_mm - input.cover_mm - 12; // avg effective depth
    const c1 = input.colWidth_mm;
    const c2 = input.colHeight_mm;

    // Critical perimeter b0 at d/2 from column face according to code
    let b0 = 0;
    if (input.columnLocation === 'Interior') {
      b0 = 2 * (c1 + d) + 2 * (c2 + d);
    } else if (input.columnLocation === 'Edge') {
      b0 = 2 * (c1 + d / 2) + (c2 + d);
    } else {
      // Corner
      b0 = (c1 + d / 2) + (c2 + d / 2);
    }

    // Concrete tensile capacity TCVN 5574:2018: V_c = Rbt * b0 * d
    // (Or ACI 318: V_c = 0.33 * sqrt(fc') * b0 * d)
    const Rbt_MPa = 1.05; // B30
    const concreteShearCapacity_kN = (Rbt_MPa * b0 * d) / 1000;

    // Magnification factor for unbalanced moment transfer
    const beta = input.unbalancedMoment_kNm ? 1.15 : 1.05;
    const appliedShear_kN = input.axialPunchingForce_kN * beta;

    const independentRatio = Number((appliedShear_kN / Math.max(concreteShearCapacity_kN, 1)).toFixed(2));
    const safeRatio = input.safeCalculatedRatio;

    const diff = Math.abs(independentRatio - safeRatio);
    const variancePercentage = Number(((diff / Math.max(safeRatio, 0.1)) * 100).toFixed(1));

    let doubleCheckStatus: PunchingOutput['doubleCheckStatus'] = 'PASS_MATCH';
    let recommendation = 'Đạt khả năng chống chọc thủng theo cả SAFE và Tính toán độc lập.';

    if (independentRatio > 1.0 || safeRatio > 1.0) {
      doubleCheckStatus = 'FAIL_OVERSTRESSED';
      recommendation = 'Không đạt khả năng chống chọc thủng! Cần tăng chiều dày sàn (drop panel mũ cột) hoặc bố trí thanh neo chống chọc thủng (stud rails/thép đai).';
    } else if (variancePercentage > 15.0) {
      doubleCheckStatus = 'CHECK_REQUIRED';
      recommendation = `CẢNH BÁO LỆCH KẾT QUẢ (${variancePercentage}%): Kiểm tra lại định nghĩa chu vi nguy hiểm (mở lỗ thông tầng cạnh cột hoặc hệ số beta truyền mô men trong SAFE).`;
    }

    return {
      columnLabel: input.columnLabel,
      effectiveDepth_d_mm: d,
      criticalPerimeter_b0_mm: Math.round(b0),
      concreteShearCapacity_kN: Math.round(concreteShearCapacity_kN),
      independentRatio,
      safeRatio,
      variancePercentage,
      doubleCheckStatus,
      recommendation,
      equationsTrace: [
        {
          title: 'Chiều cao làm việc bình quân',
          latex: 'd = h_{slab} - cover - d_{bar}',
          val: `${d} mm`,
        },
        {
          title: 'Chu vi tiết diện nguy hiểm tại d/2',
          latex: 'b_0 = 2(c_1 + d) + 2(c_2 + d)',
          val: `${Math.round(b0)} mm`,
        },
        {
          title: 'Sức chịu chọc thủng của bê tông',
          latex: 'F_{punch,cap} = R_{bt} \\cdot b_0 \\cdot d',
          val: `${Math.round(concreteShearCapacity_kN)} kN`,
        },
        {
          title: 'Tỉ số kiểm tra độc lập',
          latex: 'Ratio_{indep} = \\frac{\\beta \\cdot V_u}{F_{punch,cap}}',
          val: `${independentRatio} (SAFE Ratio: ${safeRatio})`,
        },
      ],
    };
  }
}
