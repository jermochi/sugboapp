/**
 * TransparencyScreen - public transparency data browser.
 * Owned by M3 (Transparency).
 */

import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AIHelperButton, ThemedText, ThemedView } from '@/core/components';
import { BrandColors, BorderRadius, Spacing } from '@/core/theme';
import {
  procurementClassifications,
  transparencySections,
  type TransparencyAttachment,
  type TransparencyCategory,
  type TransparencyRecord,
  type TransparencySection,
  type ProcurementClassification,
} from './data';

type ViewMode = 'hub' | 'list' | 'detail';

const SECTION_COLORS: Record<TransparencyCategory, string> = {
  'annual-budget': BrandColors.crimson,
  'financial-report': BrandColors.progress,
  procurement: BrandColors.gold,
};

export default function TransparencyScreen() {
  const [mode, setMode] = React.useState<ViewMode>('hub');
  const [activeSectionId, setActiveSectionId] =
    React.useState<TransparencyCategory>('annual-budget');
  const [selectedRecordKey, setSelectedRecordKey] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [procurementFilter, setProcurementFilter] =
    React.useState<ProcurementClassification | 'all'>('all');

  const activeSection =
    transparencySections.find((section) => section.id === activeSectionId) ??
    transparencySections[0];
  const tone = SECTION_COLORS[activeSection.id];
  const filteredRecords = React.useMemo(
    () => filterRecords(activeSection.records, query, procurementFilter),
    [activeSection.records, procurementFilter, query],
  );
  const selectedRecord =
    activeSection.records.find((record, index) => recordKey(record, index) === selectedRecordKey) ??
    filteredRecords[0] ??
    activeSection.records[0];

  const openSection = (section: TransparencySection) => {
    setActiveSectionId(section.id);
    setSelectedRecordKey('');
    setQuery('');
    setProcurementFilter('all');
    setMode('list');
  };

  const openRecord = (record: TransparencyRecord, index: number) => {
    setSelectedRecordKey(recordKey(record, index));
    setMode('detail');
  };

  const goBack = () => {
    if (mode === 'detail') {
      setMode('list');
      return;
    }

    if (mode === 'list') {
      setMode('hub');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {mode !== 'hub' ? (
            <BackButton
              label={mode === 'detail' ? activeSection.title : 'Transparency Tracker'}
              onPress={goBack}
            />
          ) : null}

          {mode === 'hub' ? (
            <HubView onSectionPress={openSection} />
          ) : mode === 'list' ? (
            <ListView
              section={activeSection}
              records={filteredRecords}
              query={query}
              procurementFilter={procurementFilter}
              tone={tone}
              onQueryChange={setQuery}
              onProcurementFilterChange={setProcurementFilter}
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
  return (
    <>
      <View style={styles.header}>
        <ThemedText type="caption" color={BrandColors.crimson}>
          Transparency Tracker
        </ThemedText>
        <ThemedText type="hero" color={BrandColors.garnet}>
          Public records, easier to read.
        </ThemedText>
        <ThemedText type="bodySmall" color={BrandColors.muted}>
          Browse Cebu City annual budgets, full disclosure reports, and procurement postings.
        </ThemedText>
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
  procurementFilter,
  tone,
  onQueryChange,
  onProcurementFilterChange,
  onRecordPress,
}: {
  section: TransparencySection;
  records: TransparencyRecord[];
  query: string;
  procurementFilter: ProcurementClassification | 'all';
  tone: string;
  onQueryChange: (query: string) => void;
  onProcurementFilterChange: (classification: ProcurementClassification | 'all') => void;
  onRecordPress: (record: TransparencyRecord, index: number) => void;
}) {
  return (
    <>
      <View style={styles.header}>
        <ThemedText type="caption" color={tone}>
          {section.eyebrow}
        </ThemedText>
        <ThemedText type="hero" color={BrandColors.garnet}>
          {section.title}
        </ThemedText>
        <ThemedText type="bodySmall" color={BrandColors.muted}>
          {section.description}
        </ThemedText>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <ThemedText type="caption" color={BrandColors.muted}>
            Search
          </ThemedText>
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder={`Search ${section.title.toLowerCase()}...`}
            placeholderTextColor={BrandColors.muted}
            style={styles.searchInput}
          />
        </View>
        <View style={styles.countBadge}>
          <ThemedText type="caption" color={tone}>
            {records.length} items
          </ThemedText>
        </View>
      </View>

      {section.id === 'procurement' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.classificationRow}>
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
        {records.map((record, index) => (
          <RecordCard
            key={recordKey(record, index)}
            record={record}
            tone={tone}
            onPress={() => onRecordPress(record, index)}
          />
        ))}
      </View>
    </>
  );
}

function DetailView({ record, tone }: { record: TransparencyRecord; tone: string }) {
  const primaryAttachment = record.attachments[0];

  return (
    <>
      <View style={styles.detailHero}>
        <View style={styles.previewTop}>
          <View style={[styles.previewBadge, { backgroundColor: `${tone}18` }]}>
            <ThemedText type="caption" color={tone}>
              {record.attachments.length > 0 ? `${record.attachments.length} files` : 'Source'}
            </ThemedText>
          </View>
          {record.publishedAt ? (
            <ThemedText type="caption" color={BrandColors.muted}>
              {record.publishedAt}
            </ThemedText>
          ) : null}
        </View>

        <ThemedText type="hero" color={BrandColors.garnet}>
          {record.title}
        </ThemedText>

        <ThemedText type="bodySmall" color={BrandColors.muted}>
          {record.description ?? 'Open the original Cebu City posting for the full source record.'}
        </ThemedText>
      </View>

      {primaryAttachment ? (
        <View style={styles.previewAttachment}>
          <View style={styles.previewAttachmentCopy}>
            <ThemedText type="caption" color={tone}>
              Preview
            </ThemedText>
            <ThemedText type="bodySmall" color={BrandColors.charcoal}>
              {primaryAttachment.label}
            </ThemedText>
            <ThemedText type="caption" color={BrandColors.muted}>
              Tap open to view this source file.
            </ThemedText>
          </View>
          <AttachmentButton attachment={primaryAttachment} tone={tone} />
        </View>
      ) : null}

      <View style={styles.attachmentPanel}>
        <ThemedText type="subtitle" color={BrandColors.charcoal}>
          Attachments
        </ThemedText>
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
            <ThemedText type="bodySmall" color={BrandColors.muted}>
              No separate files found in the scrape. Use the original posting as the source.
            </ThemedText>
          </View>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open original source for ${record.title}`}
        onPress={() => openUrl(record.sourceUrl)}
        style={({ pressed }) => [
          styles.sourceButton,
          { backgroundColor: tone },
          pressed && styles.pressed,
        ]}
      >
        <ThemedText type="button" color={BrandColors.white}>
          Open Original
        </ThemedText>
      </Pressable>
    </>
  );
}

function BackButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Back to ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
    >
      <ThemedText type="caption" color={BrandColors.crimson}>
        Back
      </ThemedText>
      <ThemedText type="caption" color={BrandColors.muted} numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={section.title}
      onPress={onPress}
      style={({ pressed }) => [styles.sectionCard, pressed && styles.pressed]}
    >
      <View style={[styles.sectionIcon, { backgroundColor: `${tone}18` }]}>
        <ThemedText type="button" color={tone}>
          {section.records.length}
        </ThemedText>
      </View>
      <View style={styles.cardCopy}>
        <ThemedText type="subtitle" color={BrandColors.charcoal}>
          {section.title}
        </ThemedText>
        <ThemedText type="caption" color={tone}>
          {section.eyebrow}
        </ThemedText>
        <ThemedText type="bodySmall" color={BrandColors.muted}>
          {section.description}
        </ThemedText>
      </View>
      <ThemedText type="caption" color={tone}>
        Open
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
        <View style={[styles.previewBadge, { backgroundColor: `${tone}18` }]}>
          <ThemedText type="caption" color={tone}>
            {record.classification
              ? classificationTitle(record.classification)
              : record.attachments.length > 0
                ? `${record.attachments.length} files`
                : 'Source'}
          </ThemedText>
        </View>
        {record.publishedAt ? (
          <ThemedText type="caption" color={BrandColors.muted}>
            {record.publishedAt}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText type="subtitle" color={BrandColors.charcoal} numberOfLines={3}>
        {record.title}
      </ThemedText>
      <ThemedText type="bodySmall" color={BrandColors.muted} numberOfLines={3}>
        {record.description ?? 'Preview attachments and source links for this record.'}
      </ThemedText>
      <ThemedText type="caption" color={tone}>
        View details
      </ThemedText>
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
      <ThemedText type="caption" color={active ? BrandColors.white : BrandColors.charcoal}>
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
        <ThemedText type="bodySmall" color={BrandColors.charcoal} numberOfLines={2}>
          {attachment.label}
        </ThemedText>
        <ThemedText type="caption" color={BrandColors.muted} numberOfLines={1}>
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

function filterRecords(
  records: TransparencyRecord[],
  query: string,
  procurementFilter: ProcurementClassification | 'all',
) {
  const normalizedQuery = query.trim().toLowerCase();
  const classificationFiltered =
    procurementFilter === 'all'
      ? records
      : records.filter((record) => record.classification === procurementFilter);

  if (!normalizedQuery) {
    return classificationFiltered;
  }

  return classificationFiltered.filter((record) =>
    [record.title, record.description, record.publishedAt]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalizedQuery)),
  );
}

function classificationTitle(classification: ProcurementClassification) {
  return (
    procurementClassifications.find((item) => item.id === classification)?.title ??
    'Procurement'
  );
}

function recordKey(record: TransparencyRecord, index: number) {
  return `${record.id}-${record.sourceUrl}-${index}`;
}

async function openUrl(url: string) {
  await WebBrowser.openBrowserAsync(url);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.paper,
  },
  safe: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.sm,
  },
  backButton: {
    minHeight: 44,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
  },
  hubGrid: {
    gap: Spacing.md,
  },
  sectionCard: {
    minHeight: 146,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    boxShadow: '0 8px 24px rgba(42, 42, 42, 0.08)',
  },
  sectionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  toolbar: {
    gap: Spacing.md,
  },
  searchBox: {
    minHeight: 54,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    backgroundColor: BrandColors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  searchInput: {
    minHeight: 30,
    color: BrandColors.charcoal,
    padding: 0,
    fontSize: 15,
  },
  countBadge: {
    alignSelf: 'flex-start',
    minHeight: 32,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
  },
  recordGrid: {
    gap: Spacing.md,
  },
  classificationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  classificationChip: {
    minHeight: 42,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
  },
  recordCard: {
    minHeight: 160,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    gap: Spacing.md,
    boxShadow: '0 8px 24px rgba(42, 42, 42, 0.08)',
  },
  recordCardTop: {
    minHeight: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  detailHero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    boxShadow: '0 8px 24px rgba(42, 42, 42, 0.08)',
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
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  previewAttachmentCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  attachmentPanel: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
  },
  emptyAttachments: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    backgroundColor: BrandColors.paper,
  },
  attachmentRow: {
    minHeight: 72,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: BrandColors.paper,
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
  sourceButton: {
    minHeight: 50,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
