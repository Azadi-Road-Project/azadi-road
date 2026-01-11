// Main memorial data aggregator
// Imports all yearly memorial data and combines them

import { memorials2009 } from './memorials-2009.js';
import { memorials2025 } from './memorials-2025.js';
import { memorials2026 } from './memorials-2026.js';
import { memorials2022 } from './memorials-2022.js';

// Combine all memorials from different years
export const memorials = [
  ...memorials2009,
  ...memorials2022,
  ...memorials2025,
  ...memorials2026
];
