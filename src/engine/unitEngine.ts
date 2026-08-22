// Strict Deterministic Unit Conversion Engine for Structural Engineering

export type ForceUnit = 'N' | 'kN' | 'MN' | 'kgf' | 'tonf' | 'kip' | 'lbf';
export type LengthUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft';
export type StressUnit = 'Pa' | 'kPa' | 'MPa' | 'GPa' | 'kgf_cm2' | 'psi' | 'ksi';
export type MomentUnit = 'Nm' | 'kNm' | 'MNm' | 'kgfm' | 'tonfm' | 'kipft' | 'kipin';

export class UnitEngine {
  // Base SI: Force in kN, Length in m, Stress in kPa, Moment in kNm

  static convertForce(value: number, from: ForceUnit, to: ForceUnit): number {
    // Convert to kN
    let valueIn_kN = value;
    switch (from) {
      case 'N': valueIn_kN = value / 1000; break;
      case 'kN': valueIn_kN = value; break;
      case 'MN': valueIn_kN = value * 1000; break;
      case 'kgf': valueIn_kN = value * 0.00980665; break;
      case 'tonf': valueIn_kN = value * 9.80665; break;
      case 'kip': valueIn_kN = value * 4.44822; break;
      case 'lbf': valueIn_kN = value * 0.00444822; break;
    }

    // Convert from kN to target
    switch (to) {
      case 'N': return valueIn_kN * 1000;
      case 'kN': return valueIn_kN;
      case 'MN': return valueIn_kN / 1000;
      case 'kgf': return valueIn_kN / 0.00980665;
      case 'tonf': return valueIn_kN / 9.80665;
      case 'kip': return valueIn_kN / 4.44822;
      case 'lbf': return valueIn_kN / 0.00444822;
    }
  }

  static convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
    // Convert to meters
    let valueIn_m = value;
    switch (from) {
      case 'mm': valueIn_m = value / 1000; break;
      case 'cm': valueIn_m = value / 100; break;
      case 'm': valueIn_m = value; break;
      case 'in': valueIn_m = value * 0.0254; break;
      case 'ft': valueIn_m = value * 0.3048; break;
    }

    // Convert from meters to target
    switch (to) {
      case 'mm': return valueIn_m * 1000;
      case 'cm': return valueIn_m * 100;
      case 'm': return valueIn_m;
      case 'in': return valueIn_m / 0.0254;
      case 'ft': return valueIn_m / 0.3048;
    }
  }

  static convertStress(value: number, from: StressUnit, to: StressUnit): number {
    // Convert to MPa
    let valueIn_MPa = value;
    switch (from) {
      case 'Pa': valueIn_MPa = value / 1e6; break;
      case 'kPa': valueIn_MPa = value / 1000; break;
      case 'MPa': valueIn_MPa = value; break;
      case 'GPa': valueIn_MPa = value * 1000; break;
      case 'kgf_cm2': valueIn_MPa = value * 0.0980665; break;
      case 'psi': valueIn_MPa = value * 0.00689476; break;
      case 'ksi': valueIn_MPa = value * 6.89476; break;
    }

    switch (to) {
      case 'Pa': return valueIn_MPa * 1e6;
      case 'kPa': return valueIn_MPa * 1000;
      case 'MPa': return valueIn_MPa;
      case 'GPa': return valueIn_MPa / 1000;
      case 'kgf_cm2': return valueIn_MPa / 0.0980665;
      case 'psi': return valueIn_MPa / 0.00689476;
      case 'ksi': return valueIn_MPa / 6.89476;
    }
  }

  // Pressure conversion for Press-in pile Jack: Pressure (bar/MPa/kgf_cm2) * Jack Area (cm2) -> Force (kN/ton)
  static calculateJackForce(pressure_bar: number, jackArea_cm2: number): { force_kN: number; force_ton: number } {
    const pressure_MPa = pressure_bar * 0.1;
    const force_N = (pressure_MPa * 1e6) * (jackArea_cm2 * 1e-4);
    const force_kN = force_N / 1000;
    const force_ton = force_kN / 9.80665;
    return {
      force_kN: Math.round(force_kN * 100) / 100,
      force_ton: Math.round(force_ton * 100) / 100,
    };
  }
}
