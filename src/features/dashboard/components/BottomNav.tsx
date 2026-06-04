/**
 * BottomNav — the fixed bottom tab bar (Home / Services / News / Account).
 *
 * The active tab is crimson; inactive tabs are warm gray. Bottom padding uses
 * the safe-area inset in place of the design's iOS home-indicator spacing.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '@/core/components';
import { BrandColors, Fonts } from '@/core/theme';
import { Strings } from '@/l10n/strings';

export type TabId = 'home' | 'services' | 'news' | 'emergency' | 'account';

interface NavItem {
  id: TabId;
  icon: IconName;
  label: string;
}

const ITEMS: NavItem[] = [
  { id: 'home', icon: 'home', label: Strings.nav.home },
  { id: 'services', icon: 'services', label: Strings.nav.services },
  { id: 'news', icon: 'news', label: Strings.nav.news },
  { id: 'emergency', icon: 'emergency', label: Strings.nav.emergency },
  { id: 'account', icon: 'account', label: Strings.nav.account },
];

const INACTIVE = '#A39B8E';

interface BottomNavProps {
  active: TabId;
  onChange?: (id: TabId) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.row}>
        {ITEMS.map((it) => {
          const on = active === it.id;
          const color = on ? BrandColors.crimson : INACTIVE;
          return (
            <Pressable
              key={it.id}
              onPress={() => onChange?.(it.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={it.label}
              style={styles.tab}
            >
              <Icon name={it.icon} size={24} color={color} strokeWidth={on ? 2 : 1.7} />
              <Text
                style={[
                  styles.label,
                  { color, fontFamily: on ? Fonts.bodyBold : Fonts.bodySemiBold },
                ]}
              >
                {it.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: BrandColors.warmGray,
    // soft top shadow: 0 -4px 20px rgba(91,72,46,0.05)
    shadowColor: '#5B482E',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
    paddingHorizontal: 6,
    minWidth: 56,
  },
  label: {
    fontSize: 11,
  },
});
