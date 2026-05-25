import { lazy, type ComponentType } from 'react';
import type { TemplateProps } from './templateUtils';

export interface TemplateInfo {
  key: string;
  label: string;
  description: string;
  component: ComponentType<TemplateProps>;
}

export interface ProfessionTemplates {
  professionKey: string;
  templates: TemplateInfo[];
}

// --- Developer ---
const TerminalTemplate = lazy(() => import('./developer/TerminalTemplate'));
const DevBlueprintTemplate = lazy(() => import('./developer/BlueprintTemplate'));
const StartupTemplate = lazy(() => import('./developer/StartupTemplate'));

// --- Designer ---
const CanvasTemplate = lazy(() => import('./designer/CanvasTemplate'));
const StudioTemplate = lazy(() => import('./designer/StudioTemplate'));
const MinimalInkTemplate = lazy(() => import('./designer/MinimalInkTemplate'));

// --- Photographer ---
const FrameTemplate = lazy(() => import('./photographer/FrameTemplate'));
const FilmTemplate = lazy(() => import('./photographer/FilmTemplate'));
const CleanShotTemplate = lazy(() => import('./photographer/CleanShotTemplate'));

// --- Architect ---
const ArchBlueprintTemplate = lazy(() => import('./architect/BlueprintTemplate'));
const RenderTemplate = lazy(() => import('./architect/RenderTemplate'));
const ConcreteTemplate = lazy(() => import('./architect/ConcreteTemplate'));

// --- Writer ---
const ManuscriptTemplate = lazy(() => import('./writer/ManuscriptTemplate'));
const BylineTemplate = lazy(() => import('./writer/BylineTemplate'));
const DigitalTemplate = lazy(() => import('./writer/DigitalTemplate'));

// --- Contractor ---
const RunningBillTemplate = lazy(() => import('./contractor/RunningBillTemplate'));
const WorkOrderTemplate = lazy(() => import('./contractor/WorkOrderTemplate'));
const SiteBillTemplate = lazy(() => import('./contractor/SiteBillTemplate'));

// --- CA ---
const LedgerTemplate = lazy(() => import('./ca/LedgerTemplate'));
const AdvisoryTemplate = lazy(() => import('./ca/AdvisoryTemplate'));
const CleanBooksTemplate = lazy(() => import('./ca/CleanBooksTemplate'));

// --- Digital Marketer ---
const GrowthTemplate = lazy(() => import('./marketer/GrowthTemplate'));
const CampaignTemplate = lazy(() => import('./marketer/CampaignTemplate'));
const AgencyTemplate = lazy(() => import('./marketer/AgencyTemplate'));

export const ALL_TEMPLATES: TemplateInfo[] = [
  // Developer
  { key: 'concrete', label: 'Concrete', description: 'Grey tones, structured, no-nonsense', component: ConcreteTemplate },
  { key: 'manuscript', label: 'Manuscript', description: 'Serif font, editorial, literary', component: ManuscriptTemplate },
  { key: 'startup', label: 'Startup', description: 'Modern, blue accent, minimal YC-style', component: StartupTemplate },

  // Designer
  { key: 'canvas', label: 'Canvas', description: 'Full-bleed header, editorial layout', component: CanvasTemplate },
  { key: 'studio', label: 'Studio', description: 'Elegant serif, luxury brand aesthetic', component: StudioTemplate },
  { key: 'minimal-ink', label: 'Minimal Ink', description: 'Black & white, Swiss typographic', component: MinimalInkTemplate },

  // Photographer
  { key: 'frame', label: 'Frame', description: 'Warm cream, photo-frame border', component: FrameTemplate },
  { key: 'film', label: 'Film', description: 'Dark cinematic, gold accents', component: FilmTemplate },
  { key: 'clean-shot', label: 'Clean Shot', description: 'Crisp white, bold sans-serif', component: CleanShotTemplate },

  // Architect
  { key: 'arch-blueprint', label: 'Arch Blueprint', description: 'Grid background, navy + white', component: ArchBlueprintTemplate },
  { key: 'render', label: 'Render', description: 'Clean, wide margins, premium feel', component: RenderTemplate },
  { key: 'terminal', label: 'Terminal', description: 'Dark header, monospace, code-like structure', component: TerminalTemplate },

  // Writer
  { key: 'byline', label: 'Byline', description: 'Newspaper column, typographic hierarchy', component: BylineTemplate },
  { key: 'digital', label: 'Digital', description: 'Modern, rounded, content agency', component: DigitalTemplate },
  { key: 'blueprint', label: 'Dev Blueprint', description: 'Grid lines, technical spec document feel', component: DevBlueprintTemplate },

  // Contractor
  { key: 'running-bill', label: 'Running Bill', description: 'Table-heavy, formal RA bill', component: RunningBillTemplate },
  { key: 'work-order', label: 'Work Order', description: 'Official-looking, stamp area', component: WorkOrderTemplate },
  { key: 'site-bill', label: 'Site Bill', description: 'Large font, readable on-site', component: SiteBillTemplate },

  // CA
  { key: 'ledger', label: 'Ledger', description: 'Formal, double-ruled, ICAI-style', component: LedgerTemplate },
  { key: 'advisory', label: 'Advisory', description: 'Corporate consultant letterhead', component: AdvisoryTemplate },
  { key: 'clean-books', label: 'Clean Books', description: 'Minimal, modern, fresh look', component: CleanBooksTemplate },

  // Digital Marketer
  { key: 'growth', label: 'Growth', description: 'Bold, colorful, marketing deck', component: GrowthTemplate },
  { key: 'campaign', label: 'Campaign', description: 'Clean, structured, retainer layout', component: CampaignTemplate },
  { key: 'agency', label: 'Agency', description: 'Premium, dark accent header', component: AgencyTemplate },
];

export function getAllTemplates(): TemplateInfo[] {
  return ALL_TEMPLATES;
}

export function getDefaultTemplateKey(): string {
  return 'concrete';
}

export function resolveTemplate(templateKey: string): ComponentType<TemplateProps> {
  const found = ALL_TEMPLATES.find(t => t.key === templateKey);
  return found ? found.component : ALL_TEMPLATES[0].component;
}

