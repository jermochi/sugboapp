/**
 * OnboardingSlide — one full-width page in the walkthrough pager.
 *
 * Follows the onboarding layout: a left-aligned text block (eyebrow, title with
 * an accent-tinted emphasis word, body) up top, then a {@link PhoneMockup}
 * previewing the destination screen that fills the rest and bleeds off the
 * bottom. The shared warm-gold wash is painted once by the parent screen.
 */

import { BrandColors, Fonts } from '@/core/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { OnboardingSlide as Slide } from '../data';
import { PhoneMockup } from './PhoneMockup';

interface OnboardingSlideProps {
  slide: Slide;
  width: number;
}

/** Split a title around its emphasis word so that word can be tinted. */
function renderTitle(title: string, emphasis: string | undefined, accent: string) {
  if (!emphasis || !title.includes(emphasis)) {
    return <Text style={styles.title}>{title}</Text>;
  }
  const [before, after] = title.split(emphasis);
  return (
    <Text style={styles.title}>
      {before}
      <Text style={[styles.title, { color: accent }]}>{emphasis}</Text>
      {after}
    </Text>
  );
}

export function OnboardingSlide({ slide, width }: OnboardingSlideProps) {
  // Device width: a generous fraction of the page so the phone reads large and
  // bleeds, clamped to leave a little side margin on narrow screens.
  const deviceWidth = Math.min(Math.round(width * 0.72), width - 48);

  return (
    <View style={[styles.page, { width }]}>
      <View style={styles.textArea}>
        {slide.eyebrow ? <Text style={styles.eyebrow}>{slide.eyebrow}</Text> : null}
        {renderTitle(slide.title, slide.emphasis, slide.accent)}
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.phoneArea}>
        <PhoneMockup image={slide.image} width={deviceWidth} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    // Fixed width (the viewport) so the horizontal pager snaps one slide at a
    // time. Avoid `flex: 1` here — on react-native-web it sets flexBasis:0 and
    // collapses the page to its content width, stacking every slide together.
    height: '100%',
    paddingHorizontal: 28,
    paddingTop: 8,
  },
  textArea: {
    alignItems: 'flex-start',
  },
  eyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: BrandColors.gold,
    marginBottom: 10,
  },
  title: {
    fontFamily: Fonts.headingBlack,
    fontSize: 30,
    lineHeight: 37,
    letterSpacing: -0.5,
    color: BrandColors.garnet,
    textAlign: 'left',
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: BrandColors.charcoal,
    textAlign: 'left',
    marginTop: 12,
    opacity: 0.78,
  },
  phoneArea: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 30,
  },
});
