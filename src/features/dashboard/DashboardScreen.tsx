/**
 * DashboardScreen — the "Meet Giya" home screen.
 *
 * Port of the design handoff's `DashboardV2Alt`: a soft-gold header (warm wash +
 * Sinulog star texture + zoomed Giya mascot) leading with search and an "Ask
 * Giya" CTA, over a white content sheet (service quick-link grid, Featured News
 * carousel, feedback survey), with a fixed bottom tab bar.
 *
 * Owned by M2 (Dashboard + Onboarding).
 */

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { navigateTo, Routes } from '@/core/routing';
import { resetOnboarding } from '@/features/onboarding/storage';
import { ShowMeAround, TourSpot, TourTargets, useAutoTour, useTourStore } from '@/core/tour';
import { BrandColors, Fonts } from '@/core/theme';
import { Strings } from '@/l10n/strings';

import { AskGiyaButton } from './components/AskGiyaButton';
import { BottomNav } from './components/BottomNav';
import type { TabId } from './components/BottomNav';
import { NewsCarousel } from './components/NewsCarousel';
import { RadialGlow } from './components/RadialGlow';
import { SearchBar } from './components/SearchBar';
import { ServiceGridTile } from './components/ServiceGridTile';
import { StarMotif } from './components/StarMotif';
import { SurveyCta } from './components/SurveyCta';
import { NEWS_V2, SERVICES_V2, type ServiceQuickLink } from './data';

const T = Strings.dashboard;

const MASCOT = require('../../../assets/images/giya-full.png');

/** Section header: a gold bar + title, reused across the sheet. */
function SectionHeading({
  title,
  style,
}: {
  title: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeading, style]}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

/** Split the quick-links into rows of four for the grid. */
function chunk(list: ServiceQuickLink[], size: number): ServiceQuickLink[][] {
  const rows: ServiceQuickLink[][] = [];
  for (let i = 0; i < list.length; i += size) rows.push(list.slice(i, i + size));
  return rows;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  // First-open guided tour of the home screen (replayable via ShowMeAround).
  useAutoTour('dashboard');
  const resetTours = useTourStore((s) => s.resetTours);

  // Opens the visual shell for the Sugbo AI / Giya conversation.
  const handleAsk = () => {
    navigateTo(Routes.GIYA_CHAT);
  };

  const handleService = (service: ServiceQuickLink) => {
    if (service.route) navigateTo(service.route);
    // TODO: deep-link the remaining quick-links once their screens exist.
  };

  const handleSurvey = () => {
    // TODO: open the feedback survey.
  };

  // TEMP (dev): clear the onboarding flag and replay the walkthrough. Remove
  // before release — see resetOnboarding in features/onboarding/storage.
  const handleResetOnboarding = async () => {
    await resetOnboarding();
    resetTours();
    navigateTo(Routes.ONBOARDING);
  };

  const handleTabChange = (tab: TabId) => {
    if (tab === 'emergency') {
      navigateTo(Routes.EMERGENCY);
    }
  };

  const rows = chunk(SERVICES_V2, 4);

  return (
    <View style={styles.root}>
      {/* Status bar sits on the warm wash. */}
      <View style={[styles.statusArea, { height: insets.top }]} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Warm header wash + Sinulog star texture (scrolls with content). */}
        <View style={styles.wash} pointerEvents="none">
          <LinearGradient
            colors={['#F6E6C9', '#FBF1DD', '#FBF8F3']}
            locations={[0, 0.6, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <StarMotif size={150} color="#DAA520" style={{ right: -26, top: -22, opacity: 0.32 }} />
          <StarMotif size={92} color="#DAA520" style={{ right: 78, top: 96, opacity: 0.16 }} />
          <StarMotif size={64} color="#C0392B" style={{ left: 150, top: 6, opacity: 0.12 }} />
          <StarMotif size={110} color="#DAA520" style={{ left: -34, top: 150, opacity: 0.14 }} />
          <RadialGlow
            size={184}
            color="#ffffff"
            innerOpacity={0.7}
            edge={0.68}
            style={{ left: 8, top: 66 }}
          />
        </View>

        {/* Header content */}
        <View style={styles.header}>
          <View style={styles.searchRow}>
            <TourSpot id={TourTargets.dashSearch} style={styles.searchSpot}>
              <SearchBar placeholder={T.searchPlaceholder} onPress={handleAsk} />
            </TourSpot>
            <ShowMeAround tourId="dashboard" />
          </View>

          {/* Meet Giya — mascot floats free at left; sheet below paints over its lower body. */}
          <TourSpot id={TourTargets.dashAskGiya}>
            <View style={styles.giyaRow}>
              <View style={styles.mascotCol}>
                <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
              </View>
              <View style={styles.giyaText}>
                <Text style={styles.giyaTitle}>{T.giyaTitle}</Text>
                <Text style={styles.giyaSubtitle}>{T.giyaSubtitle}</Text>
                <AskGiyaButton label={T.askGiya} onPress={handleAsk} />
              </View>
            </View>
          </TourSpot>
        </View>

        {/* Content sheet — layered above the mascot. */}
        <View style={styles.sheet}>
          <SectionHeading title={T.servicesPrompt} style={styles.servicesHeading} />
          <TourSpot id={TourTargets.dashServices}>
            <View style={styles.grid}>
              {rows.map((row, r) => (
                <View key={r} style={styles.gridRow}>
                  {row.map((service) => (
                    <View key={service.label} style={styles.gridCell}>
                      <ServiceGridTile
                        icon={service.icon}
                        label={service.label}
                        onPress={() => handleService(service)}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </TourSpot>

          <SectionHeading title={T.featuredNews} style={styles.newsHeading} />
          <NewsCarousel items={NEWS_V2} />

          <SurveyCta title={T.surveyTitle} subtitle={T.surveySubtitle} onPress={handleSurvey} />

          {/* TEMP (dev only): replay the first-launch onboarding. Remove before release. */}
          <Pressable
            onPress={handleResetOnboarding}
            style={({ pressed }) => [styles.devReset, pressed && styles.devResetPressed]}
            accessibilityRole="button"
          >
            <Text style={styles.devResetText}>Reset onboarding (dev)</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNav active="home" onChange={handleTabChange} />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.paper,
  },
  statusArea: {
    backgroundColor: BrandColors.softGold,
    zIndex: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    position: 'relative',
  },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    overflow: 'hidden',
    zIndex: 0,
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 20,
    zIndex: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchSpot: {
    flex: 1,
  },
  giyaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 10,
  },
  mascotCol: {
    position: 'relative',
    width: 112,
    alignSelf: 'stretch',
  },
  mascot: {
    position: 'absolute',
    width: 212,
    height: 192,
    left: -72,
    top: -6,
    zIndex: 0,
    // drop-shadow(0 8px 11px rgba(91,72,46,0.18)) — iOS silhouette shadow.
    shadowColor: '#5B482E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 11,
  },
  giyaText: {
    flex: 1,
    minWidth: 0,
    zIndex: 2,
  },
  giyaTitle: {
    fontFamily: Fonts.headingBlack,
    fontSize: 27,
    lineHeight: 28,
    letterSpacing: -0.5,
    color: BrandColors.garnet,
    marginTop: 18,
    marginLeft: 40,
  },
  giyaSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 13.5,
    lineHeight: 19,
    color: BrandColors.charcoal,
    marginBottom: 5,
    marginLeft: 40,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 26,
    marginTop: 10,
    minHeight: 360,
    zIndex: 5,
    // 0 -6px 24px rgba(91,72,46,0.07)
    shadowColor: '#5B482E',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 8,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  servicesHeading: {
    marginBottom: 16,
  },
  newsHeading: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: BrandColors.gold,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: BrandColors.charcoal,
  },
  grid: {
    gap: 20,
  },
  gridRow: {
    flexDirection: 'row',
    columnGap: 8,
  },
  gridCell: {
    flex: 1,
  },
  // TEMP (dev only) — remove with handleResetOnboarding before release.
  devReset: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    backgroundColor: BrandColors.paper,
  },
  devResetPressed: {
    opacity: 0.7,
  },
  devResetText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: BrandColors.muted,
  },
});
