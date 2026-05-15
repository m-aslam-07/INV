export interface ProfessionData {
  key: string;
  label: string;
  icon: string;
  items: Array<{ description: string; quantity: number; unit: string; rate: number }>;
}

export const PROFESSIONS: ProfessionData[] = [
  {
    key: 'developer',
    label: 'Developer',
    icon: 'Code2',
    items: [
      { description: 'Frontend development', quantity: 1, unit: 'project', rate: 25000 },
      { description: 'API integration', quantity: 1, unit: 'project', rate: 15000 },
      { description: 'Code review', quantity: 2, unit: 'hr', rate: 2000 },
    ],
  },
  {
    key: 'designer',
    label: 'Designer',
    icon: 'Palette',
    items: [
      { description: 'UI/UX Design', quantity: 1, unit: 'project', rate: 30000 },
      { description: 'Brand identity', quantity: 1, unit: 'project', rate: 18000 },
      { description: 'Revision rounds', quantity: 2, unit: 'round', rate: 3000 },
    ],
  },
  {
    key: 'photographer',
    label: 'Photographer',
    icon: 'Camera',
    items: [
      { description: 'Photography session', quantity: 1, unit: 'session', rate: 20000 },
      { description: 'Photo editing', quantity: 50, unit: 'photo', rate: 100 },
      { description: 'Rush delivery', quantity: 1, unit: 'flat', rate: 5000 },
    ],
  },
  {
    key: 'architect',
    label: 'Architect',
    icon: 'Building2',
    items: [
      { description: 'Design consultation', quantity: 1, unit: 'project', rate: 40000 },
      { description: 'Site visit', quantity: 3, unit: 'visit', rate: 2000 },
      { description: '2D floor plan', quantity: 1, unit: 'set', rate: 15000 },
    ],
  },
  {
    key: 'writer',
    label: 'Writer',
    icon: 'PenTool',
    items: [
      { description: 'Blog articles', quantity: 4, unit: 'article', rate: 3000 },
      { description: 'SEO optimization', quantity: 1, unit: 'project', rate: 5000 },
      { description: 'Revision', quantity: 2, unit: 'round', rate: 500 },
    ],
  },
  {
    key: 'marketer',
    label: 'Digital Marketer',
    icon: 'TrendingUp',
    items: [
      { description: 'Social media management', quantity: 1, unit: 'month', rate: 15000 },
      { description: 'Ad campaign setup', quantity: 1, unit: 'project', rate: 10000 },
      { description: 'Monthly report', quantity: 1, unit: 'report', rate: 2000 },
    ],
  },
  {
    key: 'tutor',
    label: 'Tutor',
    icon: 'GraduationCap',
    items: [
      { description: 'Online sessions', quantity: 8, unit: 'session', rate: 1500 },
      { description: 'Study material', quantity: 1, unit: 'set', rate: 2000 },
      { description: 'Assessment', quantity: 2, unit: 'test', rate: 500 },
    ],
  },
  {
    key: 'doctor',
    label: 'Doctor',
    icon: 'Stethoscope',
    items: [
      { description: 'Consultation', quantity: 1, unit: 'visit', rate: 1000 },
      { description: 'Follow-up', quantity: 2, unit: 'visit', rate: 500 },
    ],
  },
  {
    key: 'contractor',
    label: 'Contractor',
    icon: 'Hammer',
    items: [
      { description: 'Labour charges', quantity: 10, unit: 'day', rate: 1500 },
      { description: 'Materials', quantity: 1, unit: 'lumpsum', rate: 25000 },
      { description: 'Site supervision', quantity: 5, unit: 'day', rate: 500 },
    ],
  },
  {
    key: 'ca',
    label: 'CA',
    icon: 'Calculator',
    items: [
      { description: 'GST filing', quantity: 1, unit: 'quarter', rate: 5000 },
      { description: 'ITR filing', quantity: 1, unit: 'year', rate: 3000 },
      { description: 'Bookkeeping', quantity: 1, unit: 'month', rate: 4000 },
    ],
  },
];
