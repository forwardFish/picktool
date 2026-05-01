export const TAXONOMY = [
  {
    code: 'concept_gap',
    displayName: 'Concept gap',
    description: 'The student is missing the underlying concept, not just the procedure.',
  },
  {
    code: 'procedure_gap',
    displayName: 'Procedure gap',
    description: 'The student knows the concept but loses the correct step order.',
  },
  {
    code: 'calculation_slip',
    displayName: 'Calculation slip',
    description: 'The setup is mostly correct, but arithmetic execution slips.',
  },
  {
    code: 'reading_issue',
    displayName: 'Reading issue',
    description: 'The student appears to misread the prompt, units, or symbols.',
  },
  {
    code: 'notation_error',
    displayName: 'Notation error',
    description: 'The student uses inconsistent signs, symbols, or formatting.',
  },
  {
    code: 'strategy_error',
    displayName: 'Strategy error',
    description: 'The student chooses an inefficient or mismatched solving strategy.',
  },
  {
    code: 'careless_slip',
    displayName: 'Careless slip',
    description: 'The student likely knew the path but rushed a final detail.',
  },
  {
    code: 'incomplete_reasoning',
    displayName: 'Incomplete reasoning',
    description: 'The student started correctly but stopped before finishing the explanation.',
  },
] as const;

export const PRIMARY_TAXONOMY_CONFIDENCE_FLOOR = 0.62;

export const taxonomyCodeSet = new Set(TAXONOMY.map((item) => item.code));

export function getTaxonomyByCode(code: string) {
  return TAXONOMY.find((item) => item.code === code) || null;
}

export function shouldUsePrimaryTaxonomyLabel(labelConfidence: number) {
  return labelConfidence >= PRIMARY_TAXONOMY_CONFIDENCE_FLOOR;
}