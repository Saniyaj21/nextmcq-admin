'use client';

import { useState, useMemo, useRef } from 'react';
import { useSettings, useUpdateSetting } from '@/hooks/use-settings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { AppConfig } from '@/types';

// Derive sub-group key from setting key (first 2 dot-segments, or first 1 if only 2 total)
function getSubGroupKey(key: string): string {
  const parts = key.split('.');
  if (parts.length <= 2) return parts[0];
  return parts.slice(0, 2).join('.');
}

// Convert sub-group key to human-readable title
function formatGroupTitle(groupKey: string): string {
  const parts = groupKey.split('.');
  const name = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Icons for sub-groups
const GROUP_ICONS: Record<string, string> = {
  'rewards.question_correct': '✅',
  'rewards.speed_bonus': '⚡',
  'rewards.referral': '🤝',
  'rewards.teacher': '👨‍🏫',
  'rewards.battle': '⚔️',
  'ranking.monthly': '📊',
  level_system: '📈',
  'ranking.score': '🎯',
  revenue_share: '💰',
  limits: '🔒',
  'limits.test_time': '⏱️',
};

// Category icons
const CATEGORY_ICONS: Record<string, string> = {
  rewards: '🏆',
  system: '⚙️',
  limits: '🔒',
  app: '📱',
};

export default function SettingsPage() {
  // Always fetch ALL settings (no category filter)
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleSave = (setting: AppConfig) => {
    const rawValue = editValues[setting.key];
    if (rawValue === undefined) return;

    let parsedValue: unknown = rawValue;
    try {
      parsedValue = JSON.parse(rawValue);
    } catch {
      // Keep as string
    }

    updateSetting.mutate(
      { key: setting.key, value: parsedValue },
      {
        onSuccess: () => {
          toast.success('Updated successfully');
          setEditValues((v) => {
            const n = { ...v };
            delete n[setting.key];
            return n;
          });
        },
        onError: () => toast.error('Failed to update setting'),
      }
    );
  };

  const handleSaveGroup = (items: AppConfig[]) => {
    const dirtyItems = items.filter((s) => editValues[s.key] !== undefined);
    dirtyItems.forEach((s) => handleSave(s));
  };

  // Group settings: category → sub-group → settings[]
  const groupedByCategory = useMemo(() => {
    const result: Record<string, Record<string, AppConfig[]>> = {};
    for (const s of settings ?? []) {
      const cat = s.category || 'system';
      if (!result[cat]) result[cat] = {};
      const subGroup = getSubGroupKey(s.key);
      if (!result[cat][subGroup]) result[cat][subGroup] = [];
      result[cat][subGroup].push(s);
    }
    return result;
  }, [settings]);

  const availableCategories = Object.keys(groupedByCategory);
  const dirtyCount = Object.keys(editValues).length;

  const scrollToCategory = (cat: string) => {
    sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage rewards, limits, and system configuration
          </p>
        </div>
        {dirtyCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {dirtyCount} unsaved {dirtyCount === 1 ? 'change' : 'changes'}
          </Badge>
        )}
      </div>

      {/* Quick-nav buttons — always visible, scroll to section */}
      <div className="flex flex-wrap gap-2 sticky top-0 z-10 bg-background py-3 border-b">
        {availableCategories.map((cat) => (
          <Button
            key={cat}
            variant="outline"
            size="sm"
            className="capitalize"
            onClick={() => scrollToCategory(cat)}
          >
            <span className="mr-1.5">{CATEGORY_ICONS[cat] || ''}</span>
            {cat}
          </Button>
        ))}
      </div>

      {(settings?.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No settings found. Run the seed script to populate defaults.
          </CardContent>
        </Card>
      )}

      {/* All categories always visible */}
      {Object.entries(groupedByCategory).map(([cat, subGroups]) => (
        <div
          key={cat}
          ref={(el) => { sectionRefs.current[cat] = el; }}
          className="space-y-4 scroll-mt-16"
        >
          <h2 className="text-lg font-semibold capitalize flex items-center gap-2">
            <span>{CATEGORY_ICONS[cat] || ''}</span>
            {cat}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(subGroups).map(([groupKey, items]) => {
              const groupDirtyCount = items.filter(
                (s) => editValues[s.key] !== undefined
              ).length;

              return (
                <SettingsCard
                  key={groupKey}
                  groupKey={groupKey}
                  items={items}
                  editValues={editValues}
                  setEditValues={setEditValues}
                  onSaveGroup={handleSaveGroup}
                  dirtyCount={groupDirtyCount}
                  isPending={updateSetting.isPending}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Individual settings card component
function SettingsCard({
  groupKey,
  items,
  editValues,
  setEditValues,
  onSaveGroup,
  dirtyCount,
  isPending,
}: {
  groupKey: string;
  items: AppConfig[];
  editValues: Record<string, string>;
  setEditValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSaveGroup: (items: AppConfig[]) => void;
  dirtyCount: number;
  isPending: boolean;
}) {
  const icon = GROUP_ICONS[groupKey] || '📋';
  const title = formatGroupTitle(groupKey);

  return (
    <Card className={dirtyCount > 0 ? 'ring-2 ring-primary/20' : ''}>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            {title}
          </CardTitle>
          {dirtyCount > 0 && (
            <Button
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => onSaveGroup(items)}
              disabled={isPending}
            >
              Save {dirtyCount > 1 ? `(${dirtyCount})` : ''}
            </Button>
          )}
        </div>
        <CardDescription>{items.length} settings</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          {items.map((setting) => {
            const displayValue =
              editValues[setting.key] ??
              (typeof setting.value === 'object'
                ? JSON.stringify(setting.value)
                : String(setting.value ?? ''));
            const isDirty = editValues[setting.key] !== undefined;
            const isNumeric = typeof setting.value === 'number';

            return (
              <div key={setting.key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {setting.description || setting.key}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    className={`h-9 text-sm ${isNumeric ? 'max-w-[120px]' : ''}`}
                    type={isNumeric ? 'number' : 'text'}
                    value={displayValue}
                    onChange={(e) =>
                      setEditValues({ ...editValues, [setting.key]: e.target.value })
                    }
                  />
                  {isDirty && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setEditValues((v) => {
                          const n = { ...v };
                          delete n[setting.key];
                          return n;
                        })
                      }
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
