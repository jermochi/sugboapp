import annualBudgets from '@/../assets/data/transparency/annual-budgets.json';
import financialReports from '@/../assets/data/transparency/financial-reports.json';
import procurements from '@/../assets/data/transparency/procurements.json';

export type TransparencyCategory = 'annual-budget' | 'financial-report' | 'procurement';
export type ProcurementClassification =
  | 'cebu-city-barangays'
  | 'cebu-city-sk-federation'
  | 'committee-on-awards'
  | 'goods-and-services'
  | 'infrastructures';

export interface TransparencyAttachment {
  label: string;
  url: string;
  fileType: 'pdf' | 'doc' | 'xls' | 'image' | 'page';
}

export interface TransparencyRecord {
  id: string;
  title: string;
  category: TransparencyCategory;
  year?: number;
  publishedAt?: string;
  description?: string;
  sourceUrl: string;
  attachments: TransparencyAttachment[];
  classification?: ProcurementClassification;
}

export interface TransparencySection {
  id: TransparencyCategory;
  title: string;
  eyebrow: string;
  description: string;
  records: TransparencyRecord[];
}

function normalize(records: TransparencyRecord[]): TransparencyRecord[] {
  return records.map((record) => ({
    ...record,
    attachments: record.attachments ?? [],
    description: cleanDescription(record.description),
    classification:
      record.category === 'procurement'
        ? record.classification ?? classifyProcurement(record)
        : record.classification,
  }));
}

export const procurementClassifications: {
  id: ProcurementClassification;
  title: string;
}[] = [
  { id: 'cebu-city-barangays', title: 'Cebu City Barangays' },
  { id: 'cebu-city-sk-federation', title: 'Cebu City SK Federation' },
  { id: 'committee-on-awards', title: 'Committee on Awards' },
  { id: 'goods-and-services', title: 'Goods and Services' },
  { id: 'infrastructures', title: 'Infrastructures' },
];

function classifyProcurement(record: TransparencyRecord): ProcurementClassification {
  const haystack = `${record.title} ${record.description ?? ''} ${record.sourceUrl}`.toLowerCase();

  if (haystack.includes('barangay') || haystack.includes('brgy')) {
    return 'cebu-city-barangays';
  }

  if (haystack.includes('sk federation') || haystack.includes('sangguniang kabataan')) {
    return 'cebu-city-sk-federation';
  }

  if (
    haystack.includes('auction') ||
    haystack.includes('unserviceable') ||
    haystack.includes('committee-on-awards') ||
    haystack.includes('notice of sale')
  ) {
    return 'committee-on-awards';
  }

  if (
    haystack.includes('construction') ||
    haystack.includes('road') ||
    haystack.includes('drainage') ||
    haystack.includes('rehabilitation') ||
    haystack.includes('retaining wall') ||
    haystack.includes('concreting') ||
    haystack.includes('building') ||
    haystack.includes('infrastructure')
  ) {
    return 'infrastructures';
  }

  return 'goods-and-services';
}

function cleanDescription(description?: string) {
  if (!description) {
    return undefined;
  }

  if (
    description.includes('Toggle Accessibility Statement') ||
    description.includes('WCAG 2.0')
  ) {
    return undefined;
  }

  return description;
}

export const transparencySections: TransparencySection[] = [
  {
    id: 'annual-budget',
    title: 'Annual Budget',
    eyebrow: 'City annual appropriations',
    description: 'Review annual and supplemental budget documents published by Cebu City.',
    records: normalize(annualBudgets as TransparencyRecord[]),
  },
  {
    id: 'financial-report',
    title: 'Financial Reports',
    eyebrow: 'Full disclosure data',
    description: 'Quarterly disclosures, utilization reports, manpower complements, and advisories.',
    records: normalize(financialReports as TransparencyRecord[]),
  },
  {
    id: 'procurement',
    title: 'Bids and Projects',
    eyebrow: 'Procurements',
    description: 'Bid notices, awards, purchase orders, project postings, and procurement updates.',
    records: normalize(procurements as TransparencyRecord[]),
  },
];

export const transparencyRecords = transparencySections.flatMap((section) => section.records);
