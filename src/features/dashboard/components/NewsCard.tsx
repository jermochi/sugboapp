/**
 * NewsCard — a Featured-News card: gradient "wash" banner (image placeholder)
 * with an uppercase tag pill, then a garnet title, excerpt, and dated footer.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/core/components';
import { BrandColors, Fonts } from '@/core/theme';
import { RadialGlow } from './RadialGlow';
import type { NewsItem } from '../data';

/** Fixed card width from the design (centered in the viewport with side peeks). */
export const CARD_WIDTH = 327;

interface NewsCardProps {
  item: NewsItem;
  onPress?: () => void;
}

export function NewsCard({ item, onPress }: NewsCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      style={styles.card}
    >
      <View style={styles.clip}>
        <View style={styles.banner}>
          <LinearGradient
            colors={item.wash}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <RadialGlow
            size={220}
            color="#ffffff"
            innerOpacity={0.32}
            edge={0.6}
            style={{ right: -40, top: -90 }}
          />
          <View style={styles.tagPill}>
            <Text style={styles.tagText}>{item.tag.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.caption}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.excerpt}>{item.excerpt}</Text>
          <View style={styles.footer}>
            <Icon name="clock" size={12} color={BrandColors.muted} strokeWidth={1.8} />
            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 18,
    backgroundColor: '#fff',
    // resting: 0 2px 10px rgba(91,72,46,0.06)
    shadowColor: '#5B482E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  clip: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    backgroundColor: '#fff',
  },
  banner: {
    height: 104,
    overflow: 'hidden',
  },
  tagPill: {
    position: 'absolute',
    top: 11,
    left: 13,
    backgroundColor: 'rgba(38,6,6,0.42)',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
  },
  tagText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 9.5,
    letterSpacing: 0.7,
    color: '#fff',
  },
  caption: {
    paddingTop: 12,
    paddingHorizontal: 15,
    paddingBottom: 14,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    lineHeight: 19,
    color: BrandColors.garnet,
  },
  excerpt: {
    fontFamily: Fonts.body,
    fontSize: 12.5,
    lineHeight: 17.5,
    color: '#6b6358',
    marginTop: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  date: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: BrandColors.muted,
  },
});
