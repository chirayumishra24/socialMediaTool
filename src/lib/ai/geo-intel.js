/**
 * SkilizeeAI — Geo-Intelligence Module
 * Location-aware content adaptation.
 */

import { generateJSON } from "./ai-client";

const REGIONS = {
  IN: { name: "India", lang: "en", timezone: "IST", culture: "Indian" },
  US: { name: "United States", lang: "en", timezone: "EST/PST", culture: "American" },
  GB: { name: "United Kingdom", lang: "en", timezone: "GMT", culture: "British" },
  GLOBAL: { name: "Global", lang: "en", timezone: "UTC", culture: "International" },
};

export function getRegionInfo(code = "IN") {
  return REGIONS[code] || REGIONS.GLOBAL;
}

export async function adaptForRegion(content, fromRegion, toRegion) {
  const from = getRegionInfo(fromRegion);
  const to = getRegionInfo(toRegion);

  if (fromRegion === toRegion) return content;

  const prompt = `Adapt this content from ${from.name} audience to ${to.name} audience.

ORIGINAL CONTENT:
"""
${content.substring(0, 2000)}
"""

Adapt:
1. Cultural references → ${to.culture} equivalents
2. Currency/units → ${to.name} standards
3. Slang/idioms → ${to.culture} English
4. Examples → relevant to ${to.name}
5. Timezone references → ${to.timezone}

Return JSON: { "adaptedContent": "full adapted text", "changes": ["list of changes made"] }`;

  return generateJSON(prompt, "flash");
}

export { REGIONS };
