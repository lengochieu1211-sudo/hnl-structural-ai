// Technical Standards & Code Database with Verifiable Clauses, Formulas, and Allowable Limits

export interface StandardClauseItem {
  clauseNumber: string;
  title: string;
  content: string;
  formula?: string;
}

export interface StandardDocument {
  code: string;
  title: string;
  year: string;
  jurisdiction: string;
  clauses: StandardClauseItem[];
}

export interface StandardClause {
  code: string;
  chapter: string;
  clause: string;
  title: string;
  description: string;
  formulaLatex?: string;
  variablesSummary?: string;
  applicableDomain: 'LOADS' | 'CONCRETE' | 'SEISMIC' | 'PILE' | 'WIND' | 'STEEL' | 'FOUNDATION';
  limits?: string;
}

export const ALL_SUPPORTED_STANDARDS: StandardDocument[] = [
  {
    code: 'TCVN 2737:2023',
    title: 'Tải trọng và Tác động - Tiêu chuẩn Thiết kế',
    year: '2023',
    jurisdiction: 'Việt Nam (Bộ Xây Dựng)',
    clauses: [
      {
        clauseNumber: 'Điều 10.2',
        title: 'Áp lực gió cơ bản W0 và hệ số độ cao k(z)',
        content:
          'Áp lực gió tiêu chuẩn xác định theo vùng áp lực (Vùng I đến V) và dạng địa hình (A, B, C). Hệ số tin cậy tải trọng gió γf = 2.1 tính từ vận tốc cơ sở 10 phút, chu kỳ lặp 50 năm.',
        formula: 'W_k(z) = W_0 · k(z) · c · G_w',
      },
      {
        clauseNumber: 'Điều 10.3',
        title: 'Hệ số khí động c cho nhà cao tầng',
        content:
          'Hệ số khí động c lấy c = +0.8 cho mặt đón gió và c = -0.5 cho mặt khuất gió. Tổng hệ số áp lực tổng thể là c_total = 1.3 đối với kết cấu dạng khối hộp chữ nhật.',
        formula: 'c_total = c_windward + c_leeward = 0.8 + 0.5 = 1.3',
      },
      {
        clauseNumber: 'Phụ lục E',
        title: 'Thành phần động của tải trọng gió',
        content:
          'Tính toán thành phần động của tải trọng gió đối với công trình có chu kỳ dao động riêng T1 > T_limit (T_limit = 0.25s đối với địa hình B).',
        formula: 'W_dyn = m · xi · Psi · W_st',
      },
    ],
  },
  {
    code: 'TCVN 10304:2014',
    title: 'Móng Cọc - Tiêu chuẩn Thiết kế',
    year: '2014',
    jurisdiction: 'Việt Nam (Bộ Xây Dựng)',
    clauses: [
      {
        clauseNumber: 'Điều 7.2.1',
        title: 'Sức chịu tải cực hạn của cọc đơn theo cơ lý đất nền',
        content:
          'Sức chịu tải cực hạn Qu bằng tổng sức kháng mũi Qp và ma sát thân Qs qua các lớp đất nền được chia nhỏ.',
        formula: 'Q_u = gamma_c · (gamma_c,R · q_b · A_b + u · sum(gamma_c,f · f_i · h_i))',
      },
      {
        clauseNumber: 'Điều 7.2.2',
        title: 'Sức chịu tải cọc theo chỉ số SPT Meyerhof',
        content:
          'Xác định sức kháng mũi dựa trên N_spt vùng mũi cọc và ma sát bên dựa trên N_spt từng lớp đất.',
        formula: 'Q_u = 300 · N_tip · A_p + sum((N_i / 2) · u · l_i) (kN)',
      },
      {
        clauseNumber: 'Điều 8.2',
        title: 'Thí nghiệm nén tĩnh hiện trường (Static Load Test)',
        content:
          'Xác định sức chịu tải cho phép [Rc] từ kết quả nén tĩnh hiện trường với hệ số an toàn Fs = 2.0 theo đường cong tải trọng - độ lún P-S.',
        formula: '[R_c] = P_ult / 2.0',
      },
    ],
  },
  {
    code: 'TCVN 5574:2018',
    title: 'Thiết kế Kết cấu Bê tông và Bê tông Cốt thép',
    year: '2018',
    jurisdiction: 'Việt Nam (Bộ Xây Dựng)',
    clauses: [
      {
        clauseNumber: 'Điều 8.1.2',
        title: 'Tính toán cấu kiện chịu uốn (Dầm BTCT)',
        content:
          'Tính toán diện tích cốt thép dọc As trong tiết diện chữ nhật theo sơ đồ ứng suất giới hạn hình chữ nhật của bê tông vùng nén.',
        formula: 'M_u <= R_b · b · x · (h_0 - 0.5x) + R_sc · A\'_s · (h_0 - a\')',
      },
      {
        clauseNumber: 'Điều 8.1.3',
        title: 'Tính toán cột chịu nén lệch tâm (P-M-M)',
        content:
          'Tính toán hiệu ứng uốn dọc theo độ mảnh (eta) và kiểm tra tương tác lực nén P và momen uốn M theo trạng thái giới hạn ULS.',
        formula: 'e = e_0 · eta + h/2 - a',
      },
      {
        clauseNumber: 'Điều 8.1.5',
        title: 'Kiểm tra chống chọc thủng (Punching Shear)',
        content:
          'Kiểm tra khả năng chịu lực chọc thủng của sàn không dầm và đài cọc không có cốt thép đai chịu cắt chọc thủng.',
        formula: 'F_punch <= R_bt · u_m · h_0',
      },
    ],
  },
  {
    code: 'TCVN 9386:2012',
    title: 'Thiết kế Công trình Chịu Động đất',
    year: '2012',
    jurisdiction: 'Việt Nam (Bộ Xây Dựng)',
    clauses: [
      {
        clauseNumber: 'Điều 3.2.2',
        title: 'Phổ phản ứng thiết kế đàn hồi Sa(T)',
        content:
          'Xác định phổ gia tốc thiết kế phụ thuộc vào đỉnh gia tốc nền ag, loại nền đất A/B/C/D/E và hệ số ứng xử q.',
        formula: 'S_d(T) = a_g · S · (2.5 / q) · (T_C / T)',
      },
      {
        clauseNumber: 'Điều 4.3.3',
        title: 'Tỷ lệ tham gia khối lượng dao động (Modal Participation)',
        content:
          'Tổng khối lượng tham gia dao động của các mode được xét phải đạt tối thiểu 90% tổng khối lượng công trình.',
        formula: 'sum(U_x) >= 90% && sum(U_y) >= 90%',
      },
    ],
  },
  {
    code: 'ACI 318-19',
    title: 'Building Code Requirements for Structural Concrete',
    year: '2019',
    jurisdiction: 'United States (American Concrete Institute)',
    clauses: [
      {
        clauseNumber: 'Section 22.6',
        title: 'Two-Way Shear & Punching Shear Strength',
        content:
          'Punching shear capacity v_c is computed as the minimum of three formulations considering aspect ratio and column location.',
        formula: 'v_c = min(2 + 4/beta, alpha_s*d/b_0 + 2, 4) * lambda * sqrt(f\'_c)',
      },
      {
        clauseNumber: 'Section 18.7',
        title: 'Columns of Special Moment Frames (P-M-M)',
        content:
          'Strength reduction factor phi = 0.65 to 0.90 based on net tensile strain in extreme tension reinforcement.',
        formula: 'phi * P_n >= P_u && phi * M_n >= M_u',
      },
    ],
  },
];

export const STANDARDS_DATABASE: StandardClause[] = [
  {
    code: 'TCVN 10304:2014',
    chapter: 'Chương 7 - Sức chịu tải của cọc đơn',
    clause: 'Điều 7.2.1 - Công thức (12)',
    title: 'Sức chịu tải cực hạn của cọc theo chỉ tiêu cơ lý đất nền',
    description: 'Sức chịu tải của cọc đơn theo cường độ đất nền xác định bằng tổng sức kháng mũi và tổng sức kháng ma sát thành cọc qua các lớp đất.',
    formulaLatex: 'Q_{u} = \\gamma_c \\cdot (\\gamma_{c,R} \\cdot q_b \\cdot A_b + u \\cdot \\sum \\gamma_{c,f} \\cdot f_i \\cdot h_i)',
    variablesSummary: 'gamma_c = 1.0; q_b = sức kháng đơn vị mũi (kPa); A_b = diện tích mũi; u = chu vi thân cọc; f_i = ma sát đơn vị lớp i.',
    applicableDomain: 'PILE',
    limits: 'Sức chịu tải tính toán: R_c = Q_u / gamma_k (gamma_k = 1.4 - 1.75)',
  },
  {
    code: 'TCVN 5574:2018',
    chapter: 'Chương 8 - Tính toán cấu kiện bê tông cốt thép',
    clause: 'Điều 8.1.2 - Độ bền tiết diện uốn dầm',
    title: 'Tính toán cốt thép dầm chịu uốn theo ULS',
    description: 'Tính toán diện tích cốt thép dọc As trong dầm tiết diện chữ nhật theo sơ đồ ứng suất giới hạn hình chữ nhật.',
    formulaLatex: 'M_u \\le R_b \\cdot b \\cdot x \\cdot (h_0 - 0.5x) + R_{sc} \\cdot A\'_s \\cdot (h_0 - a\')',
    variablesSummary: 'Rb = cường độ bê tông; b = bề rộng; h0 = chiều cao làm việc; x = chiều cao vùng nén; Rs = cường độ thép kéo.',
    applicableDomain: 'CONCRETE',
    limits: 'Hàm lượng thép mu_min = 0.1%, xi <= xi_R (0.55 - 0.60).',
  },
];
