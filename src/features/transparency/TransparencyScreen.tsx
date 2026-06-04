/**
 * TransparencyScreen - public transparency data browser.
 * Owned by M3 (Transparency).
 */

import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { AIHelperButton, ThemedText, ThemedView } from '@/core/components';
import { goBack as goBackRoute } from '@/core/routing';
import { BrandColors, BorderRadius, Spacing } from '@/core/theme';
import {
  budgetOverviews,
  procurementClassifications,
  transparencySections,
  type BudgetSector,
  type TransparencyAttachment,
  type TransparencyCategory,
  type TransparencyRecord,
  type TransparencySection,
  type ProcurementClassification,
} from './data';

type ViewMode = 'hub' | 'list' | 'detail';
type DateFilter = 'all' | string;
type BudgetChartSlice = Pick<BudgetSector, 'id' | 'label' | 'amount' | 'share'>;
type FilterState = {
  query: string;
  dateFilter: DateFilter;
  procurementFilter: ProcurementClassification | 'all';
};

const UI_COLORS = {
  text: BrandColors.charcoal,
  secondary: BrandColors.muted,
  tertiary: BrandColors.muted,
  link: BrandColors.crimson,
  border: BrandColors.warmGray,
  surface: BrandColors.white,
  softSurface: BrandColors.paper,
  chart: [
    BrandColors.crimson,
    BrandColors.gold,
    BrandColors.progress,
    BrandColors.garnet,
    BrandColors.review,
    BrandColors.pending,
    BrandColors.success,
  ],
} as const;

const SECTION_COLORS: Record<TransparencyCategory, string> = {
  'annual-budget': BrandColors.crimson,
  'financial-report': BrandColors.progress,
  procurement: BrandColors.gold,
};

const BUDGET_SECTOR_COLORS = [
  ...UI_COLORS.chart,
];

/** Validate a free-text route param against the known section ids. */
function asTransparencyCategory(value?: string): TransparencyCategory | null {
  return transparencySections.some((section) => section.id === value)
    ? (value as TransparencyCategory)
    : null;
}

export default function TransparencyScreen() {
  // Giya deep-links here with ?section=annual-budget to land straight on the
  // budget charts; absent/invalid, we open the hub as usual.
  const params = useLocalSearchParams<{ section?: string }>();
  const initialSection = asTransparencyCategory(params.section);

  const [mode, setMode] = React.useState<ViewMode>(initialSection ? 'list' : 'hub');
  const [activeSectionId, setActiveSectionId] =
    React.useState<TransparencyCategory>(initialSection ?? 'annual-budget');
  const [selectedRecordKey, setSelectedRecordKey] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState<DateFilter>('all');
  const [budgetYear, setBudgetYear] = React.useState<DateFilter>('all');
  const [procurementFilter, setProcurementFilter] =
    React.useState<ProcurementClassification | 'all'>('all');

  const activeSection =
    transparencySections.find((section) => section.id === activeSectionId) ??
    transparencySections[0];
  const tone = SECTION_COLORS[activeSection.id];
  const filteredRecords = React.useMemo(
    () => filterRecords(activeSection.records, query, procurementFilter, dateFilter),
    [activeSection.records, dateFilter, procurementFilter, query],
  );
  const selectedRecord =
    activeSection.records.find((record) => recordKey(record) === selectedRecordKey) ??
    filteredRecords[0] ??
    activeSection.records[0];

  const openSection = (section: TransparencySection) => {
    setActiveSectionId(section.id);
    setSelectedRecordKey('');
    setQuery('');
    setDateFilter('all');
    setBudgetYear('all');
    setProcurementFilter('all');
    setMode('list');
  };

  const openRecord = (record: TransparencyRecord) => {
    setSelectedRecordKey(recordKey(record));
    setMode('detail');
  };

  const goBack = () => {
    if (mode === 'hub') {
      goBackRoute();
      return;
    }

    if (mode === 'detail') {
      setMode('list');
      return;
    }

    if (mode === 'list') {
      setMode('hub');
    }
  };

  const clearFilters = () => {
    setQuery('');
    setDateFilter('all');
    setProcurementFilter('all');
  };
  const pageTitle =
    mode === 'hub'
      ? 'Transparency Tracker'
      : mode === 'list'
        ? activeSection.title
        : 'Record Details';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <PageHeader
            title={pageTitle}
            onBackPress={goBack}
          />

          {mode === 'hub' ? (
            <HubView onSectionPress={openSection} />
          ) : mode === 'list' ? (
            <ListView
              section={activeSection}
              records={filteredRecords}
              query={query}
              dateFilter={dateFilter}
              budgetYear={budgetYear}
              procurementFilter={procurementFilter}
              tone={tone}
              onQueryChange={setQuery}
              onDateFilterChange={setDateFilter}
              onBudgetYearChange={setBudgetYear}
              onProcurementFilterChange={setProcurementFilter}
              onClearFilters={clearFilters}
              onRecordPress={openRecord}
            />
          ) : selectedRecord ? (
            <DetailView record={selectedRecord} tone={tone} />
          ) : null}
        </ScrollView>
      </SafeAreaView>
      <AIHelperButton context={`transparency:${activeSection.id}`} />
    </ThemedView>
  );
}

function HubView({
  onSectionPress,
}: {
  onSectionPress: (section: TransparencySection) => void;
}) {
  const stats = React.useMemo(() => getTrackerStats(), []);

  return (
    <>
      <View style={styles.hubHero}>
        <ThemedText type="caption" color={UI_COLORS.secondary}>
          Transparency Tracker
        </ThemedText>
        <ThemedText type="title" color={UI_COLORS.text} style={styles.sectionHeading}>
          Public records
        </ThemedText>
        <ThemedText type="bodySmall" color={UI_COLORS.secondary}>
          Budget files, disclosure reports, and procurement documents in one place.
        </ThemedText>
      </View>

      <View style={styles.statsStrip}>
        <MetricPill label="Records" value={String(stats.records)} />
        <MetricPill label="Files" value={String(stats.attachments)} />
        <MetricPill label="Sources" value={String(transparencySections.length)} />
      </View>

      <View style={styles.hubGrid}>
        {transparencySections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            onPress={() => onSectionPress(section)}
          />
        ))}
      </View>
    </>
  );
}

function ListView({
  section,
  records,
  query,
  dateFilter,
  budgetYear,
  procurementFilter,
  tone,
  onQueryChange,
  onDateFilterChange,
  onBudgetYearChange,
  onProcurementFilterChange,
  onClearFilters,
  onRecordPress,
}: {
  section: TransparencySection;
  records: TransparencyRecord[];
  query: string;
  dateFilter: DateFilter;
  budgetYear: DateFilter;
  procurementFilter: ProcurementClassification | 'all';
  tone: string;
  onQueryChange: (query: string) => void;
  onDateFilterChange: (date: DateFilter) => void;
  onBudgetYearChange: (date: DateFilter) => void;
  onProcurementFilterChange: (classification: ProcurementClassification | 'all') => void;
  onClearFilters: () => void;
  onRecordPress: (record: TransparencyRecord) => void;
}) {
  const dateOptions = React.useMemo(() => getDateOptions(section.records), [section.records]);
  const activeFilterCount = getActiveFilterCount({
    query,
    dateFilter,
    procurementFilter,
  });

  return (
    <>
{section.id === 'annual-budget' ? (
        <BudgetOverviewPanel
          selectedYear={budgetYear === 'all' ? undefined : budgetYear}
          tone={tone}
          onYearChange={onBudgetYearChange}
        />
      ) : null}

      <View style={styles.filterPanel}>
        <View style={styles.filterPanelTop}>
          <View>
            <ThemedText type="caption" color={UI_COLORS.secondary}>
              Showing
            </ThemedText>
            <ThemedText type="subtitle" color={UI_COLORS.text} style={styles.subtleHeading}>
              {records.length} of {section.records.length} records
            </ThemedText>
          </View>
          {activeFilterCount > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear filters"
              onPress={onClearFilters}
              style={({ pressed }) => [styles.clearFilterButton, pressed && styles.pressed]}
            >
              <ThemedText type="caption" color={tone}>
                Clear
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.searchBox}>
          <ThemedText type="caption" color={UI_COLORS.secondary}>
            Search
          </ThemedText>
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder={`Search ${section.title.toLowerCase()}...`}
            placeholderTextColor={UI_COLORS.tertiary}
            style={styles.searchInput}
          />
        </View>
      </View>

      {dateOptions.length > 0 && section.id !== 'annual-budget' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <ClassificationChip
              title="All dates"
              active={dateFilter === 'all'}
              tone={tone}
              onPress={() => onDateFilterChange('all')}
            />
            {dateOptions.map((date) => (
              <ClassificationChip
                key={date}
                title={date}
                active={dateFilter === date}
                tone={tone}
                onPress={() => onDateFilterChange(date)}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}

      {section.id === 'procurement' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <ClassificationChip
              title="All"
              active={procurementFilter === 'all'}
              tone={tone}
              onPress={() => onProcurementFilterChange('all')}
            />
            {procurementClassifications.map((classification) => (
              <ClassificationChip
                key={classification.id}
                title={classification.title}
                active={procurementFilter === classification.id}
                tone={tone}
                onPress={() => onProcurementFilterChange(classification.id)}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}

      <View style={styles.recordGrid}>
        {records.length > 0 ? (
          records.map((record) => (
            <RecordCard
              key={recordKey(record)}
              record={record}
              tone={tone}
              onPress={() => onRecordPress(record)}
            />
          ))
        ) : (
          <EmptyState
            title="No matching records"
            message="Try another search term, date, or procurement class."
            tone={tone}
            onClear={onClearFilters}
          />
        )}
      </View>

      {section.id === 'annual-budget' ? (
        <BudgetAllocationOverview selectedYear={budgetYear === 'all' ? undefined : budgetYear} />
      ) : null}
    </>
  );
}

function BudgetOverviewPanel({
  selectedYear,
  tone,
  onYearChange,
}: {
  selectedYear?: string;
  tone: string;
  onYearChange: (year: DateFilter) => void;
}) {
  const overviewYears = React.useMemo(
    () => budgetOverviews.map((overview) => overview.year).sort((a, b) => Number(b) - Number(a)),
    [],
  );
  const activeYear = selectedYear ?? overviewYears[0];
  const overview =
    budgetOverviews.find((item) => item.year === activeYear) ?? budgetOverviews[0];
  const totalAmount =
    overview.totalAmount ??
    overview.sectors.reduce((sum, sector) => sum + sector.amount, 0);
  const chartSectors = React.useMemo(
    () => groupBudgetChartSectors(overview.sectors),
    [overview.sectors],
  );
  const chartTotal = chartSectors.reduce((sum, sector) => sum + sector.amount, 0) || totalAmount;
  const hasBreakdown = totalAmount > 0 && overview.sectors.length > 0;

  return (
    <View style={styles.budgetPanel}>
      <View style={styles.budgetHeroTop}>
        <View style={styles.budgetCopy}>
          <ThemedText type="caption" color={UI_COLORS.secondary}>
            Proposed budget
          </ThemedText>
          <ThemedText type="subtitle" color={UI_COLORS.text} style={styles.subtleHeading}>
            {overview.title}
          </ThemedText>
          <ThemedText type="title" color={UI_COLORS.text} style={styles.budgetTotal}>
            {hasBreakdown ? formatCompactPeso(totalAmount) : 'Pending'}
          </ThemedText>
        </View>
        <View style={styles.budgetChartRow}>
          <View style={styles.budgetDonutCenter}>
            <DonutChart sectors={chartSectors} totalAmount={chartTotal} tone={tone} size={184} strokeWidth={28} />
          </View>
          <BudgetDonutLegend slices={chartSectors} />
        </View>
      </View>

      {overviewYears.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {overviewYears.map((year) => (
              <ClassificationChip
                key={year}
                title={year}
                active={activeYear === year}
                tone={tone}
                onPress={() => onYearChange(year)}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'Open source budget for ' + overview.title}
        onPress={() => openUrl(overview.sourceUrl)}
        style={({ pressed }) => [
          styles.sourcePillButton,
          { borderColor: tone },
          pressed && styles.pressed,
        ]}
      >
        <ThemedText type="caption" color={tone}>
          Open source
        </ThemedText>
      </Pressable>
    </View>
  );
}

function BudgetAllocationOverview({ selectedYear }: { selectedYear?: string }) {
  const overviewYears = React.useMemo(
    () => budgetOverviews.map((overview) => overview.year).sort((a, b) => Number(b) - Number(a)),
    [],
  );
  const activeYear = selectedYear ?? overviewYears[0];
  const overview =
    budgetOverviews.find((item) => item.year === activeYear) ?? budgetOverviews[0];

  if (overview.sectors.length === 0) {
    return null;
  }

  return (
    <View style={styles.allocationPanel}>
      <View style={styles.overviewHeader}>
        <ThemedText type="subtitle" color={UI_COLORS.text} style={styles.subtleHeading}>
          {overview.year} Allocation Overview
        </ThemedText>
        <ThemedText type="caption" color={UI_COLORS.secondary}>
          {overview.sectors.length} listed items
        </ThemedText>
      </View>

      <View style={styles.sectorList}>
        {overview.sectors.map((sector, index) => (
          <View key={sector.id} style={styles.sectorRow}>
            <View style={styles.sectorLabelRow}>
              <View
                style={[
                  styles.sectorDot,
                  { backgroundColor: BUDGET_SECTOR_COLORS[index % BUDGET_SECTOR_COLORS.length] },
                ]}
              />
              <ThemedText type="bodySmall" color={UI_COLORS.text} style={styles.sectorLabel}>
                {sector.label}
              </ThemedText>
            </View>
            <ThemedText type="caption" color={UI_COLORS.secondary} style={styles.sectorAmount}>
              {formatCompactPeso(sector.amount)} - {formatShare(sector.share)}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

function BudgetDonutLegend({ slices }: { slices: BudgetChartSlice[] }) {
  return (
    <View style={styles.budgetLegend}>
      {slices.map((slice, index) => (
        <View key={slice.id} style={styles.budgetLegendRow}>
          <View
            style={[
              styles.budgetLegendDot,
              { backgroundColor: BUDGET_SECTOR_COLORS[index % BUDGET_SECTOR_COLORS.length] },
            ]}
          />
          <ThemedText type="caption" color={UI_COLORS.text} numberOfLines={1} style={styles.budgetLegendLabel}>
            {slice.label}
          </ThemedText>
          <ThemedText type="caption" color={UI_COLORS.secondary} style={styles.budgetLegendValue}>
            {formatShare(slice.share)}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function DonutChart({
  sectors,
  totalAmount,
  tone,
  size = 116,
  strokeWidth = 16,
}: {
  sectors: BudgetChartSlice[];
  totalAmount: number;
  tone: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const hasBreakdown = totalAmount > 0 && sectors.length > 0;

  return (
    <View style={[styles.donutWrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={hasBreakdown ? '#E0E0E0' : UI_COLORS.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {hasBreakdown
          ? sectors.map((sector, index) => {
              const segment = (sector.amount / totalAmount) * circumference;
              const dashOffset = -offset;
              offset += segment;

              return (
                <Circle
                  key={`${sector.amount}-${index}`}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={BUDGET_SECTOR_COLORS[index % BUDGET_SECTOR_COLORS.length]}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${segment} ${circumference - segment}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  rotation="-90"
                  originX={size / 2}
                  originY={size / 2}
                />
              );
            })
          : null}
      </Svg>
      <View style={styles.donutCenter}>
        <ThemedText type="caption" color={UI_COLORS.secondary}>
          {hasBreakdown ? 'Listed' : 'No totals'}
        </ThemedText>
        <ThemedText type="caption" color={UI_COLORS.text}>
          {hasBreakdown ? `${sectors.length} items` : 'Yet'}
        </ThemedText>
      </View>
    </View>
  );
}

function DetailView({ record, tone }: { record: TransparencyRecord; tone: string }) {
  const primaryAttachment = record.attachments[0];
  const metadata = [
    record.publishedAt ? { label: 'Published', value: record.publishedAt } : null,
    record.classification ? { label: 'Class', value: classificationTitle(record.classification) } : null,
    { label: 'Files', value: String(record.attachments.length) },
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <>
      <View style={styles.detailHero}>
        <View style={styles.previewTop}>
          <View style={styles.previewBadge}>
            <ThemedText type="caption" color={UI_COLORS.secondary}>
              {record.attachments.length > 0 ? `${record.attachments.length} files` : 'Source'}
            </ThemedText>
          </View>
          {record.publishedAt ? (
            <ThemedText type="caption" color={UI_COLORS.secondary}>
              {record.publishedAt}
            </ThemedText>
          ) : null}
        </View>

        <ThemedText type="title" color={UI_COLORS.text} style={styles.detailTitle}>
          {record.title}
        </ThemedText>

        <ThemedText type="bodySmall" color={UI_COLORS.secondary}>
          {record.description ?? 'Open the original Cebu City posting for the full source record.'}
        </ThemedText>

        <View style={styles.metaGrid}>
          {metadata.map((item) => (
            <View key={item.label} style={styles.metaTile}>
              <ThemedText type="caption" color={UI_COLORS.secondary}>
                {item.label}
              </ThemedText>
              <ThemedText type="caption" color={UI_COLORS.text} numberOfLines={1}>
                {item.value}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {primaryAttachment ? (
        <View style={styles.previewAttachment}>
          <View style={styles.previewAttachmentCopy}>
            <ThemedText type="caption" color={UI_COLORS.secondary}>
              Preview
            </ThemedText>
            <ThemedText type="bodySmall" color={UI_COLORS.text}>
              {primaryAttachment.label}
            </ThemedText>
            <ThemedText type="caption" color={UI_COLORS.secondary}>
              Tap open to view this source file.
            </ThemedText>
          </View>
          <AttachmentButton attachment={primaryAttachment} tone={tone} />
        </View>
      ) : null}

      <View style={styles.sourceSummary}>
        <View style={styles.previewAttachmentCopy}>
          <ThemedText type="caption" color={UI_COLORS.secondary}>
            Official source
          </ThemedText>
          <ThemedText type="bodySmall" color={UI_COLORS.text} numberOfLines={2}>
            Cebu City Government posting
          </ThemedText>
          <ThemedText type="caption" color={UI_COLORS.secondary} numberOfLines={1}>
            {record.sourceUrl}
          </ThemedText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open original source for ${record.title}`}
          onPress={() => openUrl(record.sourceUrl)}
          style={({ pressed }) => [
            styles.openAttachmentButton,
            { borderColor: tone },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="caption" color={tone}>
            Open
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.attachmentPanel}>
        <View style={styles.panelTitleRow}>
          <ThemedText type="subtitle" color={UI_COLORS.text} style={styles.subtleHeading}>
            Attachments
          </ThemedText>
          <View style={styles.previewBadge}>
            <ThemedText type="caption" color={UI_COLORS.secondary}>
              {record.attachments.length}
            </ThemedText>
          </View>
        </View>
        {record.attachments.length > 0 ? (
          record.attachments.map((attachment, index) => (
            <AttachmentRow
              key={`${attachment.url}-${index}`}
              attachment={attachment}
              tone={tone}
            />
          ))
        ) : (
          <View style={styles.emptyAttachments}>
            <ThemedText type="bodySmall" color={UI_COLORS.secondary}>
              No separate files found in the scrape. Use the original posting as the source.
            </ThemedText>
          </View>
        )}
      </View>

    </>
  );
}

function PageHeader({
  title,
  onBackPress,
}: {
  title: string;
  onBackPress: () => void;
}) {
  return (
    <View style={styles.pageHeader}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBackPress}
        style={({ pressed }) => [styles.pageBackButton, pressed && styles.pressed]}
      >
          <ThemedText type="title" color={UI_COLORS.text} style={styles.backGlyph}>
            {'‹'}
          </ThemedText>
      </Pressable>
      <ThemedText type="title" color={UI_COLORS.text} numberOfLines={1} style={styles.pageTitle}>
        {title}
      </ThemedText>
    </View>
  );
}

function SectionCard({
  section,
  onPress,
}: {
  section: TransparencySection;
  onPress: () => void;
}) {
  const tone = SECTION_COLORS[section.id];
  const sectionStats = sectionSummary(section);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={section.title}
      onPress={onPress}
      style={({ pressed }) => [styles.sectionCard, pressed && styles.pressed]}
    >
      <View style={styles.sectionIcon}>
        <ThemedText type="button" color={UI_COLORS.text}>
          {sectionStats.records}
        </ThemedText>
      </View>
      <View style={styles.cardCopy}>
        <ThemedText type="subtitle" color={UI_COLORS.text} style={styles.subtleHeading}>
          {section.title}
        </ThemedText>
        <ThemedText type="caption" color={UI_COLORS.secondary}>
          {section.eyebrow}
        </ThemedText>
        <ThemedText type="bodySmall" color={UI_COLORS.secondary}>
          {section.description}
        </ThemedText>
        <View style={styles.cardMetaRow}>
          <ThemedText type="caption" color={UI_COLORS.secondary}>
            {sectionStats.attachments} files
          </ThemedText>
          <ThemedText type="caption" color={UI_COLORS.secondary}>
            {sectionStats.years} years
          </ThemedText>
        </View>
      </View>
        <ThemedText type="caption" color={tone}>
        Browse
      </ThemedText>
    </Pressable>
  );
}

function RecordCard({
  record,
  tone,
  onPress,
}: {
  record: TransparencyRecord;
  tone: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={record.title}
      onPress={onPress}
      style={({ pressed }) => [styles.recordCard, pressed && styles.pressed]}
    >
      <View style={styles.recordCardTop}>
        <View style={styles.previewBadge}>
          <ThemedText type="caption" color={UI_COLORS.secondary}>
            {record.classification
              ? classificationTitle(record.classification)
              : record.attachments.length > 0
                ? `${record.attachments.length} files`
                : 'Source'}
          </ThemedText>
        </View>
        {record.publishedAt ? (
          <ThemedText type="caption" color={UI_COLORS.secondary}>
            {record.publishedAt}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText type="subtitle" color={UI_COLORS.text} numberOfLines={3} style={styles.subtleHeading}>
        {record.title}
      </ThemedText>
      <ThemedText type="bodySmall" color={UI_COLORS.secondary} numberOfLines={3}>
        {record.description ?? 'Preview attachments and source links for this record.'}
      </ThemedText>
      <View style={styles.recordActionRow}>
        <ThemedText type="caption" color={UI_COLORS.secondary}>
          {record.attachments.length > 0 ? `${record.attachments.length} attachments` : 'Source only'}
        </ThemedText>
        <ThemedText type="caption" color={tone}>
          View
        </ThemedText>
      </View>
    </Pressable>
  );
}

function ClassificationChip({
  title,
  active,
  tone,
  onPress,
}: {
  title: string;
  active: boolean;
  tone: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.classificationChip,
        active && { backgroundColor: tone, borderColor: tone },
        pressed && styles.pressed,
      ]}
    >
      <ThemedText type="caption" color={active ? UI_COLORS.surface : UI_COLORS.text}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

function AttachmentRow({
  attachment,
  tone,
}: {
  attachment: TransparencyAttachment;
  tone: string;
}) {
  return (
    <View style={styles.attachmentRow}>
      <View style={[styles.fileTypeBadge, { backgroundColor: `${tone}16` }]}>
        <ThemedText type="caption" color={tone}>
          {attachment.fileType.toUpperCase()}
        </ThemedText>
      </View>
      <View style={styles.attachmentCopy}>
        <ThemedText type="bodySmall" color={UI_COLORS.text} numberOfLines={2}>
          {attachment.label}
        </ThemedText>
        <ThemedText type="caption" color={UI_COLORS.secondary} numberOfLines={1}>
          {attachment.url}
        </ThemedText>
      </View>
      <AttachmentButton attachment={attachment} tone={tone} />
    </View>
  );
}

function AttachmentButton({
  attachment,
  tone,
}: {
  attachment: TransparencyAttachment;
  tone: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${attachment.label}`}
      onPress={() => openUrl(attachment.url)}
      style={({ pressed }) => [
        styles.openAttachmentButton,
        { borderColor: tone },
        pressed && styles.pressed,
      ]}
    >
      <ThemedText type="caption" color={tone}>
        Open
      </ThemedText>
    </Pressable>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricPill}>
      <ThemedText type="title" color={UI_COLORS.text} style={styles.metricValue}>
        {value}
      </ThemedText>
      <ThemedText type="caption" color={UI_COLORS.secondary}>
        {label}
      </ThemedText>
    </View>
  );
}

function EmptyState({
  title,
  message,
  tone,
  onClear,
}: {
  title: string;
  message: string;
  tone: string;
  onClear: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <ThemedText type="button" color={UI_COLORS.secondary}>
          0
        </ThemedText>
      </View>
      <ThemedText type="subtitle" color={UI_COLORS.text} style={styles.subtleHeading}>
        {title}
      </ThemedText>
      <ThemedText type="bodySmall" color={UI_COLORS.secondary}>
        {message}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Clear all filters"
        onPress={onClear}
        style={({ pressed }) => [
          styles.emptyAction,
          { borderColor: tone },
          pressed && styles.pressed,
        ]}
      >
        <ThemedText type="caption" color={tone}>
          Clear filters
        </ThemedText>
      </Pressable>
    </View>
  );
}

function filterRecords(
  records: TransparencyRecord[],
  query: string,
  procurementFilter: ProcurementClassification | 'all',
  dateFilter: DateFilter,
) {
  const normalizedQuery = query.trim().toLowerCase();
  const classificationFiltered =
    procurementFilter === 'all'
      ? records
      : records.filter((record) => record.classification === procurementFilter);
  const dateFiltered =
    dateFilter === 'all'
      ? classificationFiltered
      : classificationFiltered.filter((record) => recordYear(record) === dateFilter);

  if (!normalizedQuery) {
    return dateFiltered;
  }

  return dateFiltered.filter((record) =>
    [record.title, record.description, record.publishedAt]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalizedQuery)),
  );
}

function getActiveFilterCount(filters: FilterState) {
  return [
    filters.query.trim() ? 'query' : null,
    filters.dateFilter !== 'all' ? 'date' : null,
    filters.procurementFilter !== 'all' ? 'procurement' : null,
  ].filter(Boolean).length;
}

function getTrackerStats() {
  return transparencySections.reduce(
    (stats, section) => ({
      records: stats.records + section.records.length,
      attachments:
        stats.attachments +
        section.records.reduce((total, record) => total + record.attachments.length, 0),
    }),
    { records: 0, attachments: 0 },
  );
}

function sectionSummary(section: TransparencySection) {
  const years = new Set(section.records.map(recordYear).filter(Boolean));
  return {
    records: section.records.length,
    attachments: section.records.reduce((total, record) => total + record.attachments.length, 0),
    years: years.size,
  };
}

function getDateOptions(records: TransparencyRecord[]) {
  return [...new Set(records.map(recordYear).filter((year): year is string => Boolean(year)))]
    .sort((a, b) => Number(b) - Number(a));
}

function recordYear(record: TransparencyRecord) {
  if (record.year) {
    return String(record.year);
  }

  const publishedYear = record.publishedAt?.match(/\b(20\d{2})\b/)?.[1];
  if (publishedYear) {
    return publishedYear;
  }

  return record.title.match(/\b(20\d{2})\b/)?.[1];
}

function classificationTitle(classification: ProcurementClassification) {
  return (
    procurementClassifications.find((item) => item.id === classification)?.title ??
    'Procurement'
  );
}

function formatPeso(value: number) {
  return `PHP ${new Intl.NumberFormat('en-PH', {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function formatCompactPeso(value: number) {
  return `PHP ${new Intl.NumberFormat('en-PH', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)}`;
}

function groupBudgetChartSectors(sectors: BudgetSector[]): BudgetChartSlice[] {
  const maxVisibleSlices = 5;

  if (sectors.length <= maxVisibleSlices) {
    return sectors;
  }

  const sorted = [...sectors].sort((a, b) => b.amount - a.amount);
  const visible = sorted.slice(0, maxVisibleSlices - 1);
  const hidden = sorted.slice(maxVisibleSlices - 1);
  const othersAmount = hidden.reduce((sum, sector) => sum + sector.amount, 0);
  const othersShare = hidden.reduce((sum, sector) => sum + (sector.share ?? 0), 0);

  return [
    ...visible,
    {
      id: 'others',
      label: 'Others',
      amount: othersAmount,
      share: othersShare,
    },
  ];
}

function formatShare(value?: number) {
  if (value === undefined) {
    return '0%';
  }

  return `${new Intl.NumberFormat('en-PH', {
    maximumFractionDigits: value < 1 ? 2 : 0,
  }).format(value)}%`;
}

function recordKey(record: TransparencyRecord) {
  return `${record.id}-${record.sourceUrl}`;
}

async function openUrl(url: string) {
  await WebBrowser.openBrowserAsync(url);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.surface,
  },
  safe: {
    flex: 1,
    backgroundColor: UI_COLORS.surface,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.huge,
    gap: Spacing.md,
    backgroundColor: UI_COLORS.surface,
  },
  header: {
    gap: Spacing.sm,
  },
  sectionHeading: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  subtleHeading: {
    fontWeight: '700',
  },
  hubHero: {
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  pageHeader: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pageBackButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 34,
    lineHeight: 38,
  },
  pageTitle: {
    flex: 1,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  hubGrid: {
    gap: Spacing.md,
  },
  statsStrip: {
    minHeight: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: UI_COLORS.softSurface,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricPill: {
    flex: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: UI_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  metricValue: {
    fontSize: 22,
    lineHeight: 28,
  },
  sectionCard: {
    minHeight: 116,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },
  sectionIcon: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: UI_COLORS.softSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  cardMetaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  filterPanel: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: UI_COLORS.softSurface,
  },
  filterPanelTop: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  clearFilterButton: {
    minHeight: 38,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI_COLORS.surface,
  },
  budgetPanel: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },
  budgetPanelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  budgetHeroTop: {
    minHeight: 278,
    alignItems: 'stretch',
    gap: Spacing.md,
  },
  budgetChartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  budgetDonutCenter: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  budgetTotal: {
    fontSize: 34,
    lineHeight: 40,
  },
  budgetLegend: {
    width: 132,
    flexShrink: 1,
    gap: 3,
  },
  budgetLegendRow: {
    minHeight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  budgetLegendDot: {
    width: 7,
    height: 7,
    borderRadius: BorderRadius.full,
  },
  budgetLegendLabel: {
    flex: 1,
    fontSize: 10,
    lineHeight: 13,
  },
  budgetLegendValue: {
    fontSize: 10,
    lineHeight: 13,
  },
  donutWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  budgetStatsRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  budgetStat: {
    flex: 1,
    gap: Spacing.xs,
  },
  sourcePillButton: {
    minHeight: 42,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allocationPanel: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },
  overviewHeader: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  sectorList: {
    gap: Spacing.md,
  },
  sectorRow: {
    minHeight: 48,
    alignItems: 'stretch',
    gap: Spacing.xs,
  },
  sectorLabelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  sectorLabel: {
    flex: 1,
    fontWeight: '600',
  },
  sectorAmount: {
    paddingLeft: 22,
  },
  sectorDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    marginTop: 5,
  },
  expensePanel: {
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: UI_COLORS.border,
    paddingTop: Spacing.md,
  },
  expenseRow: {
    minHeight: 72,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: UI_COLORS.softSurface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  expenseCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  expenseAmount: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  searchBox: {
    minHeight: 54,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    backgroundColor: UI_COLORS.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  searchInput: {
    minHeight: 30,
    color: UI_COLORS.text,
    padding: 0,
    fontSize: 15,
  },
  recordGrid: {
    gap: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  classificationChip: {
    minHeight: 42,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
  },
  recordCard: {
    minHeight: 148,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    gap: Spacing.md,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },
  recordCardTop: {
    minHeight: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  recordActionRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  detailHero: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },
  detailTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  previewTop: {
    minHeight: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  previewBadge: {
    minHeight: 30,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  previewAttachment: {
    minHeight: 88,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  sourceSummary: {
    minHeight: 88,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    backgroundColor: UI_COLORS.softSurface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  previewAttachmentCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  attachmentPanel: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
  },
  panelTitleRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  emptyAttachments: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    backgroundColor: UI_COLORS.softSurface,
  },
  emptyState: {
    minHeight: 220,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    backgroundColor: UI_COLORS.softSurface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAction: {
    minHeight: 42,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI_COLORS.surface,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metaTile: {
    flex: 1,
    minHeight: 52,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    backgroundColor: UI_COLORS.softSurface,
    gap: 2,
  },
  attachmentRow: {
    minHeight: 72,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: UI_COLORS.softSurface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  fileTypeBadge: {
    width: 52,
    minHeight: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  openAttachmentButton: {
    minHeight: 40,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});


