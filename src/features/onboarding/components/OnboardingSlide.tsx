/**
 * OnboardingSlide — one full-width page in the walkthrough pager.
 *
 * Lays out the {@link SlideVisual} hero over a text block (eyebrow, title with
 * an accent-tinted emphasis word, body). The shared warm-gold wash and Sinulog
 * texture are painted once by the parent screen behind every page.
 */

import { BrandColors, Fonts } from '@/core/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { OnboardingSlide as Slide } from '../data';
import { SlideVisual } from './SlideVisual';

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
  return (
    <View style={[styles.page, { width }]}>
      <View style={styles.visualArea}>
        <SlideVisual
          kind={slide.visual}
          icon={slide.icon}
          flow={slide.flow}
          accent={slide.accent}
        />
      </View>

      <View style={styles.textArea}>
        {slide.eyebrow ? <Text style={styles.eyebrow}>{slide.eyebrow}</Text> : null}
        {renderTitle(slide.title, slide.emphasis, slide.accent)}
        <Text style={styles.body}>{slide.body}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  visualArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  eyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: BrandColors.gold,
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.headingBlack,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: BrandColors.garnet,
    textAlign: 'center',
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: BrandColors.charcoal,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 320,
  },
});
