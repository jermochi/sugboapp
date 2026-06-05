/**
 * EmergencyScreen - offline emergency hotline directory.
 * Owned by M5 (Emergency Services).
 */

import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/core/components';
import type { Contact, HotlineCategory } from '@/core/models';
import { BrandColors, BorderRadius, Fonts, Spacing } from '@/core/theme';
import { navigateTo, Routes } from '@/core/routing';
import { ShowMeAround, TourSpot, TourTargets, useAutoTour } from '@/core/tour';
import { BottomNav, type TabId } from '@/features/dashboard/components/BottomNav';

import { emergencyHotlineData } from './data';

const ALERT = '#F0442D';
const INK = '#16161D';
const MUTED = '#73706B';
const SURFACE = '#FFFFFF';
const SOFT = '#F7F7F8';

function dial(number: string) {
  const dialable = number.replace(/[^\d+]/g, '');
  Linking.openURL(`tel:${dialable}`);
}

function matchesContact(contact: Contact, query: string) {
  const haystack = `${contact.name} ${contact.label ?? ''} ${contact.number}`.toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function categoryIcon(categoryId: string) {
  if (categoryId === 'medical') return 'medical';
  if (categoryId === 'fire') return 'emergency';
  return 'hotline';
}

function categoryColor(categoryId: string) {
  if (categoryId === 'medical') return '#38BFC5';
  if (categoryId === 'fire') return ALERT;
  return BrandColors.progress;
}

export default function EmergencyScreen() {
  const [query, setQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<HotlineCategory | null>(null);
  const categories = emergencyHotlineData.categories;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCategories = React.useMemo(() => {
    if (!normalizedQuery) return categories;

    return categories
      .map((category) => ({
        ...category,
        contacts: category.contacts.filter((contact) => matchesContact(contact, normalizedQuery)),
      }))
      .filter((category) => category.contacts.length > 0 || category.name.toLowerCase().includes(normalizedQuery));
  }, [categories, normalizedQuery]);

  const cdrmmo = categories.find((category) => category.id === 'cdrmmo');

  // Walk the user through the hotline directory on first open.
  useAutoTour('emergency');

  const handleTabChange = (tab: TabId) => {
    if (tab === 'home') navigateTo(Routes.DASHBOARD);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Emergency</Text>
            <ShowMeAround tourId="emergency" />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Emergency alerts"
              style={({ pressed }) => [styles.alertButton, pressed && styles.pressed]}
            >
              <Icon name="emergency" size={25} color={INK} strokeWidth={1.8} />
            </Pressable>
          </View>

          <TourSpot id={TourTargets.emerSearch}>
            <View style={styles.searchBox}>
              <Icon name="search" size={24} color="#A5A5A9" strokeWidth={2} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search..."
                placeholderTextColor="#A5A5A9"
                style={styles.searchInput}
                accessibilityLabel="Search emergency hotlines"
              />
            </View>
          </TourSpot>

          {emergencyHotlineData.primary ? (
            <TourSpot id={TourTargets.emerSlide}>
              <EmergencySlider contact={emergencyHotlineData.primary} />
            </TourSpot>
          ) : null}

          {cdrmmo ? <ComcenCard category={cdrmmo} /> : null}

          <TourSpot id={TourTargets.emerCategories} style={styles.categoryGrid}>
            {filteredCategories
              .filter((category) => category.id !== 'cdrmmo')
              .map((category) => (
                <CategoryTile
                  key={category.id}
                  category={category}
                  onPress={() => setActiveCategory(category)}
                />
              ))}
          </TourSpot>
        </ScrollView>
      </SafeAreaView>

      <BottomNav active="emergency" onChange={handleTabChange} />

      <CategorySheet
        category={activeCategory}
        visible={Boolean(activeCategory)}
        onClose={() => setActiveCategory(null)}
      />
    </View>
  );
}

function EmergencySlider({ contact }: { contact: Contact }) {
  const translateX = React.useRef(new Animated.Value(0)).current;
  const maxSlide = 210;

  const reset = React.useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      speed: 18,
      bounciness: 5,
    }).start();
  }, [translateX]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8,
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(Math.min(Math.max(gesture.dx, 0), maxSlide));
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > maxSlide * 0.72) {
            dial(contact.number);
          }
          reset();
        },
        onPanResponderTerminate: reset,
      }),
    [contact.number, reset, translateX],
  );

  return (
    <View style={styles.emergencyCard}>
      <View style={styles.emergencyTitleRow}>
        <Icon name="emergency" size={30} color={ALERT} strokeWidth={2.2} />
        <Text style={styles.emergencyTitle}>
          For Emergencies, Call {contact.number} {contact.label ? `(${contact.label})` : ''}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Call ${contact.number}`}
        onPress={() => dial(contact.number)}
        style={({ pressed }) => [styles.sliderTrack, pressed && styles.pressed]}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.sliderThumb, { transform: [{ translateX }] }]}
        >
          <Icon name="hotline" size={30} color={SURFACE} strokeWidth={2.4} />
        </Animated.View>
        <Text style={styles.sliderLabel}>Slide to Call</Text>
        <Icon name="chevron" size={30} color={ALERT} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

function ComcenCard({ category }: { category: HotlineCategory }) {
  return (
    <View style={styles.comcenCard}>
      <Text style={styles.sectionTitle}>{category.name} Hotlines</Text>
      <Text style={styles.sectionCopy}>
        The City Disaster Risk Reduction and Management Office is available for urgent assistance.
      </Text>

      <View style={styles.contactStack}>
        {category.contacts.map((contact) => (
          <NumberRow key={`${contact.label}-${contact.number}`} contact={contact} showLabel />
        ))}
      </View>
    </View>
  );
}

function CategoryTile({
  category,
  onPress,
}: {
  category: HotlineCategory;
  onPress: () => void;
}) {
  const tone = categoryColor(category.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${category.name} hotlines`}
      onPress={onPress}
      style={({ pressed }) => [styles.categoryTile, pressed && styles.pressed]}
    >
      <Icon name={categoryIcon(category.id)} size={34} color={tone} strokeWidth={2.1} />
      <Text style={styles.categoryName}>{category.name}</Text>
    </Pressable>
  );
}

function CategorySheet({
  category,
  visible,
  onClose,
}: {
  category: HotlineCategory | null;
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{category?.name}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close hotline category"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Text style={styles.closeGlyph}>x</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            {category?.contacts.map((contact) => (
              <ContactGroup key={`${contact.name}-${contact.label ?? ''}-${contact.number}`} contact={contact} />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ContactGroup({ contact }: { contact: Contact }) {
  return (
    <View style={styles.contactGroup}>
      <Text style={styles.contactName}>{contact.name}</Text>
      {contact.label ? <Text style={styles.contactMeta}>{contact.label}</Text> : null}
      <NumberRow contact={contact} />
    </View>
  );
}

function NumberRow({ contact, showLabel = false }: { contact: Contact; showLabel?: boolean }) {
  return (
    <View style={styles.numberRow}>
      <Text style={styles.numberText} selectable>
        {showLabel && contact.label ? <Text style={styles.numberLabel}>{contact.label}: </Text> : null}
        {contact.number}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Call ${contact.number}`}
        onPress={() => dial(contact.number)}
        style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
      >
        <Icon name="hotline" size={22} color={ALERT} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SURFACE,
  },
  safe: {
    flex: 1,
    backgroundColor: SURFACE,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  headerRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.headingBlack,
    fontSize: 24,
    lineHeight: 30,
    color: INK,
  },
  alertButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E2E4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURFACE,
  },
  searchBox: {
    minHeight: 54,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#DFDFE3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: SURFACE,
  },
  searchInput: {
    flex: 1,
    minHeight: 36,
    padding: 0,
    color: INK,
    fontFamily: Fonts.body,
    fontSize: 16,
  },
  emergencyCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
    backgroundColor: '#FFF8F6',
    borderWidth: 1,
    borderColor: '#FFE2DC',
  },
  emergencyTitleRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emergencyTitle: {
    flex: 1,
    fontFamily: Fonts.headingBlack,
    fontSize: 18,
    lineHeight: 24,
    color: INK,
  },
  sliderTrack: {
    minHeight: 64,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: ALERT,
    backgroundColor: '#FFF0EC',
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderThumb: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: ALERT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  sliderLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.body,
    fontSize: 16,
    color: INK,
  },
  comcenCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: SOFT,
  },
  sectionTitle: {
    fontFamily: Fonts.headingBlack,
    fontSize: 20,
    lineHeight: 26,
    color: INK,
  },
  sectionCopy: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: INK,
  },
  contactStack: {
    gap: Spacing.md,
  },
  numberRow: {
    minHeight: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: SURFACE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
  },
  numberText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: INK,
  },
  numberLabel: {
    fontFamily: Fonts.bodyBold,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F6F8',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryTile: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 88,
    borderRadius: BorderRadius.lg,
    backgroundColor: SOFT,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  categoryName: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: INK,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  sheet: {
    maxHeight: '82%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#F8F8FA',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  sheetHandle: {
    width: 68,
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: INK,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetHeader: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  sheetTitle: {
    flex: 1,
    fontFamily: Fonts.headingBlack,
    fontSize: 22,
    lineHeight: 28,
    color: INK,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: {
    fontFamily: Fonts.body,
    fontSize: 30,
    lineHeight: 36,
    color: INK,
  },
  sheetContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  contactGroup: {
    gap: Spacing.sm,
  },
  contactName: {
    fontFamily: Fonts.headingBlack,
    fontSize: 18,
    lineHeight: 24,
    color: INK,
  },
  contactMeta: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
  pressed: {
    opacity: 0.72,
  },
});
