// Wind Load (TCVN 2737:2023 / ASCE 7-22) and Seismic Response Spectrum Engine

export interface WindCalcInput {
  location: string;
  windZone: 'I' | 'II' | 'III' | 'IV' | 'V';
  terrainCategory: 'A' | 'B' | 'C';
  buildingHeight_m: number;
  buildingWidthX_m: number;
  buildingLengthY_m: number;
  importanceFactor: number;
}

export interface StoryWindForce {
  story: string;
  elevation_m: number;
  height_m: number;
  kz_coeff: number;
  qk_pressure_daN_m2: number;
  fx_wind_kN: number;
  fy_wind_kN: number;
}

export class WindSeismicEngine {
  static calculateTCVN2737Wind(input: WindCalcInput): {
    w0_daN_m2: number;
    gamma_f: number;
    storyWindForces: StoryWindForce[];
    totalBaseShearWindX_kN: number;
    totalBaseShearWindY_kN: number;
  } {
    // Basic pressure W0 daN/m2 (TCVN 2737:2023)
    const zoneMap: Record<string, number> = {
      I: 65,
      II: 95,
      III: 125,
      IV: 155,
      V: 185,
    };
    const w0 = zoneMap[input.windZone] || 95;
    const gamma_f = 2.1; // Safety factor for ULS conversion in TCVN 2737:2023

    // Generate story-by-story wind pressures
    const numStories = Math.max(1, Math.round(input.buildingHeight_m / 3.4));
    const storyWindForces: StoryWindForce[] = [];

    let totalVx = 0;
    let totalVy = 0;

    for (let i = 1; i <= numStories; i++) {
      const elev = i * 3.4;
      // Terrain coefficient k(z)
      let kz = 1.0;
      if (input.terrainCategory === 'A') {
        kz = 0.57 * Math.pow(Math.max(elev, 2) / 10, 0.24);
      } else if (input.terrainCategory === 'B') {
        kz = 0.42 * Math.pow(Math.max(elev, 5) / 10, 0.32);
      } else {
        // C - dense urban
        kz = 0.28 * Math.pow(Math.max(elev, 10) / 10, 0.40);
      }

      const aerodynamic_c = 0.8 + 0.5; // Windward + Leeward = 1.3
      const qk = w0 * kz * aerodynamic_c * input.importanceFactor; // daN/m2
      const qk_kN_m2 = (qk * 9.81) / 1000;

      const storyAreaX = input.buildingWidthX_m * 3.4;
      const storyAreaY = input.buildingLengthY_m * 3.4;

      const fx = qk_kN_m2 * storyAreaY * gamma_f;
      const fy = qk_kN_m2 * storyAreaX * gamma_f;

      totalVx += fx;
      totalVy += fy;

      storyWindForces.push({
        story: `Story ${i}`,
        elevation_m: elev,
        height_m: 3.4,
        kz_coeff: Number(kz.toFixed(3)),
        qk_pressure_daN_m2: Number(qk.toFixed(1)),
        fx_wind_kN: Number(fx.toFixed(1)),
        fy_wind_kN: Number(fy.toFixed(1)),
      });
    }

    return {
      w0_daN_m2: w0,
      gamma_f,
      storyWindForces,
      totalBaseShearWindX_kN: Math.round(totalVx),
      totalBaseShearWindY_kN: Math.round(totalVy),
    };
  }

  static getResponseSpectrum(soilType: 'A' | 'B' | 'C' | 'D' | 'E', pga_g: number, q_factor: number): { period_s: number; sa_g: number }[] {
    const points: { period_s: number; sa_g: number }[] = [];
    const S = soilType === 'A' ? 1.0 : soilType === 'B' ? 1.2 : soilType === 'C' ? 1.5 : 1.8;
    const tb = 0.15;
    const tc = 0.5;
    const td = 2.0;

    for (let t = 0.05; t <= 4.0; t += 0.05) {
      let sa = 0;
      if (t <= tb) {
        sa = pga_g * S * (1 + (t / tb) * (2.5 / q_factor - 1));
      } else if (t <= tc) {
        sa = pga_g * S * (2.5 / q_factor);
      } else if (t <= td) {
        sa = pga_g * S * (2.5 / q_factor) * (tc / t);
      } else {
        sa = pga_g * S * (2.5 / q_factor) * ((tc * td) / (t * t));
      }
      points.push({
        period_s: Number(t.toFixed(2)),
        sa_g: Number(sa.toFixed(4)),
      });
    }
    return points;
  }
}
