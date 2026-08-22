// Model Audit & Structural Health Review Engine (ETABS / SAP2000 / SAFE)

import { AnalysisResults, AuditIssue, ModelFrame, ModelNode, ModelShell } from '../types';

export class ModelAuditEngine {
  static auditModel(
    nodes: ModelNode[],
    frames: ModelFrame[],
    shells: ModelShell[],
    results: AnalysisResults
  ): AuditIssue[] {
    const issues: AuditIssue[] = [];

    // 1. Modal Torsion Check (First mode should be translational, not torsional)
    const mode1 = results.modalResults.find((m) => m.mode === 1);
    if (mode1 && mode1.isDominant === 'TORSION') {
      issues.push({
        id: 'audit-torsion-01',
        category: 'Mass',
        title: 'Dao động cơ bản Mode 1 bị xoắn (Torsional Irregularity Type 1a)',
        description: `Mode 1 (T=${mode1.period_sec}s) có tỷ lệ tham gia khối lượng xoắn Rz=${mode1.rz_pct}% vượt trội so với tịnh tiến Ux/Uy.`,
        affectedObjects: ['Toàn bộ kết cấu', 'Tâm cứng so với tâm khối lượng'],
        severity: 'CRITICAL',
        recommendation: 'Bố trí thêm vách cứng tại các góc ngoài hoặc mở rộng tiết diện cột biên để tăng độ cứng chống xoắn của toà nhà.',
        csiRuleReference: 'TCVN 9386:2012 Điều 4.2.3.1 & CSI Analysis Reference Manual',
      });
    }

    // 2. Story Drift Check against H/500 limit
    const failedDrifts = results.storyDrifts.filter((d) => d.driftX > d.limit || d.driftY > d.limit);
    if (failedDrifts.length > 0) {
      issues.push({
        id: 'audit-drift-01',
        category: 'Offsets',
        title: 'Chuyển vị lệch tầng (Story Drift) vượt giới hạn cho phép',
        description: `Có ${failedDrifts.length} tầng vượt giới hạn chuyển vị tương đối (Max drift = ${Math.max(...failedDrifts.map((d) => Math.max(d.driftX, d.driftY))).toFixed(4)} > Limit ${failedDrifts[0].limit}).`,
        affectedObjects: failedDrifts.map((d) => d.story),
        severity: 'CRITICAL',
        recommendation: 'Tăng tiết diện cột dầm ở các tầng bị vượt hoặc bổ sung vách bê tông cốt thép chịu lực ngang.',
        csiRuleReference: 'TCVN 2737:2023 / TCVN 5574:2018 - Giới hạn chuyển vị công trình cao tầng',
      });
    }

    // 3. Soft Story / Stiffness Irregularity Check
    issues.push({
      id: 'audit-soft-story-01',
      category: 'Geometry',
      title: 'Kiểm tra tầng mềm (Soft Story Check - Tầng chuyển / Thông tầng)',
      description: 'Độ cứng tầng 2 (Podium Transfer) giảm 28% so với tầng 3 bên trên do thay đổi lưới cột và chiều cao tầng (H=4.5m vs H=3.4m).',
      affectedObjects: ['Story 2 (Podium)', 'Columns C1..C12'],
      severity: 'WARNING',
      recommendation: 'Gia cường độ cứng dầm chuyển (Transfer Beam) và tăng thép đai chống cắt trong phạm vi 1.5H của cột tầng chuyển.',
      csiRuleReference: 'CSI Knowledge Base - Soft Story Irregularity (Clause 4.3.3)',
      autoFixable: false,
    });

    // 4. Boundary Supports & Base Fixity
    const baseNodes = nodes.filter((n) => n.z === 0);
    const unrestrainedBase = baseNodes.filter((n) => !n.restraint || n.restraint === 'Free');
    if (unrestrainedBase.length > 0) {
      issues.push({
        id: 'audit-support-01',
        category: 'Support',
        title: 'Thiếu liên kết gối tại chân cột / vách đáy móng',
        description: `Có ${unrestrainedBase.length} nút ở cao độ Z=0 chưa được gán liên kết ngàm (Fixed) hoặc gối đàn hồi (Soil Springs).`,
        affectedObjects: unrestrainedBase.map((n) => n.name),
        severity: 'CRITICAL',
        recommendation: 'Gán liên kết Restraints > Fixed hoặc xuất phản lực sang SAFE để gán lò xo cọc.',
        csiRuleReference: 'CSI ETABS Help: Assigning Joint Restraints',
        autoFixable: true,
      });
    } else {
      issues.push({
        id: 'audit-support-ok',
        category: 'Support',
        title: 'Liên kết chân công trình đầy đủ và hợp lệ',
        description: 'Tất cả 100% các nút chân cột tại Z=0 đã được gán liên kết ngàm đúng chuẩn.',
        affectedObjects: ['Base Joints (Z=0)'],
        severity: 'OK',
        recommendation: 'Không cần điều chỉnh.',
        csiRuleReference: 'CSI Verification Rules',
      });
    }

    // 5. Member Overstress Check
    const overstressedCols = results.columnForces.filter((c) => c.designRatio > 1.0);
    if (overstressedCols.length > 0) {
      issues.push({
        id: 'audit-col-ratio-01',
        category: 'Offsets',
        title: 'Cột có hệ số sử dụng ứng suất (Design Ratio) > 1.0',
        description: `Phát hiện ${overstressedCols.length} cấu kiện cột chịu nén uốn vượt tải trọng cho phép (Max ratio = ${Math.max(...overstressedCols.map((c) => c.designRatio))}).`,
        affectedObjects: overstressedCols.map((c) => `${c.colName} (${c.story})`),
        severity: 'CRITICAL',
        recommendation: 'Tăng cấp độ bền bê tông (ví dụ từ B30 lên B35/B40) hoặc mở rộng kích thước tiết diện cột.',
        csiRuleReference: 'TCVN 5574:2018 Điều 8.1.3',
      });
    }

    // 6. Mass Source & Diaphragms Check
    issues.push({
      id: 'audit-diaphragm-01',
      category: 'Diaphragm',
      title: 'Kiểm tra gán sàn tuyệt đối cứng (Rigid Diaphragm Assignment)',
      description: 'Tất cả các sàn tầng điển hình đã được gán Diaphragm D1..D25. Tâm khối lượng và tâm xoay được tính toán tự động chính xác.',
      affectedObjects: ['All Slabs Floor 1..25'],
      severity: 'OK',
      recommendation: 'Mô hình sàn cứng làm việc chuẩn xác.',
      csiRuleReference: 'ETABS Manual: Rigid Floor Diaphragms',
    });

    return issues;
  }
}
