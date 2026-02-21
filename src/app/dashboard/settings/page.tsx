'use client';

import { useState, useMemo, useRef } from 'react';
import { useSettings, useUpdateSetting } from '@/hooks/use-settings';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Settings,
  Trophy,
  Shield,
  Smartphone,
  Save,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Zap,
  Users,
  GraduationCap,
  Swords,
  BarChart3,
  Target,
  DollarSign,
  Timer,
  Lock,
  FileText,
  TrendingUp,
} from 'lucide-react';
import type { AppConfig } from '@/types';
import type { LucideIcon } from 'lucide-react';

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

// Format setting key to a readable label
function formatSettingLabel(key: string): string {
  const parts = key.split('.');
  const name = parts[parts.length - 1];
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Lucide icons for sub-groups
const GROUP_ICONS: Record<string, LucideIcon> = {
  'rewards.question_correct': CheckCircle2,
  'rewards.speed_bonus': Zap,
  'rewards.referral': Users,
  'rewards.teacher': GraduationCap,
  'rewards.battle': Swords,
  'ranking.monthly': BarChart3,
  level_system: TrendingUp,
  'ranking.score': Target,
  revenue_share: DollarSign,
  limits: Lock,
  'limits.test_time': Timer,
};

// Category config
const CATEGORY_CONFIG: Record<string, { icon: LucideIcon; label: string; description: string }> = {
  rewards: { icon: Trophy, label: 'Rewards', description: 'Configure coins, XP, and bonus rewards' },
  system: { icon: Settings, label: 'System', description: 'General system configuration' },
  limits: { icon: Shield, label: 'Limits', description: 'Test limits and constraints' },
  app: { icon: Smartphone, label: 'App', description: 'Application-specific settings' },
};

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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
          toast.success(`Updated "${formatSettingLabel(setting.key)}"`);
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

  const handleSaveAll = () => {
    const dirtyKeys = Object.keys(editValues);
    if (dirtyKeys.length === 0) return;
    for (const s of settings ?? []) {
      if (editValues[s.key] !== undefined) {
        handleSave(s);
      }
    }
  };

  // Group settings: category -> sub-group -> settings[]
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

  // Set initial active category
  if (activeCategory === null && availableCategories.length > 0) {
    setActiveCategory(availableCategories[0]);
  }

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-56 mt-1" />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage rewards, limits, and system configuration
            </p>
          </div>
        </div>
        {dirtyCount > 0 && (
          <Button size="sm" onClick={handleSaveAll} disabled={updateSetting.isPending}>
            <Save className="h-4 w-4 mr-1.5" />
            Save {dirtyCount} {dirtyCount === 1 ? 'change' : 'changes'}
          </Button>
        )}
      </div>

      {/* Category Navigation */}
      <div className="flex gap-2 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-3 -mx-1 px-1">
        {availableCategories.map((cat) => {
          const config = CATEGORY_CONFIG[cat] || { icon: FileText, label: cat, description: '' };
          const Icon = config.icon;
          const isActive = activeCategory === cat;
          const catDirtyCount = Object.values(groupedByCategory[cat] || {})
            .flat()
            .filter((s) => editValues[s.key] !== undefined).length;

          return (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`
                relative flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all
                ${isActive
                  ? 'border-primary bg-primary/5 text-primary shadow-sm'
                  : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="capitalize">{config.label}</span>
              {catDirtyCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {catDirtyCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {settings?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No settings found. Run the seed script to populate defaults.
          </CardContent>
        </Card>
      )}

      {/* Settings Sections */}
      <div className="space-y-8">
        {Object.entries(groupedByCategory).map(([cat, subGroups]) => {
          const config = CATEGORY_CONFIG[cat] || { icon: FileText, label: cat, description: '' };
          const CatIcon = config.icon;

          return (
            <div
              key={cat}
              ref={(el) => { sectionRefs.current[cat] = el; }}
              className="scroll-mt-20"
            >
              {/* Category Header */}
              <div className="flex items-center gap-2.5 mb-4">
                <CatIcon className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold capitalize">{config.label}</h2>
                <span className="text-xs text-muted-foreground">
                  {config.description}
                </span>
              </div>

              {/* Sub-group Cards */}
              <div className="space-y-3">
                {Object.entries(subGroups).map(([groupKey, items]) => {
                  const groupDirtyCount = items.filter(
                    (s) => editValues[s.key] !== undefined
                  ).length;

                  return (
                    <SettingsGroup
                      key={groupKey}
                      groupKey={groupKey}
                      items={items}
                      editValues={editValues}
                      setEditValues={setEditValues}
                      onSave={handleSave}
                      dirtyCount={groupDirtyCount}
                      isPending={updateSetting.isPending}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Collapsible settings group
function SettingsGroup({
  groupKey,
  items,
  editValues,
  setEditValues,
  onSave,
  dirtyCount,
  isPending,
}: {
  groupKey: string;
  items: AppConfig[];
  editValues: Record<string, string>;
  setEditValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSave: (setting: AppConfig) => void;
  dirtyCount: number;
  isPending: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const Icon = GROUP_ICONS[groupKey] || FileText;
  const title = formatGroupTitle(groupKey);

  return (
    <Card className={`transition-all ${dirtyCount > 0 ? 'ring-1 ring-primary/30 shadow-sm' : ''}`}>
      {/* Group Header - clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-muted/30 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <span className="text-sm font-semibold">{title}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? 'setting' : 'settings'}
            </span>
          </div>
          {dirtyCount > 0 && (
            <Badge variant="default" className="ml-1 h-5 px-1.5 text-[10px]">
              {dirtyCount} unsaved
            </Badge>
          )}
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Settings Fields */}
      {expanded && (
        <CardContent className="px-5 pb-4 pt-0">
          <Separator className="mb-4" />
          <div className="space-y-4">
            {items.map((setting, index) => {
              const displayValue =
                editValues[setting.key] ??
                (typeof setting.value === 'object'
                  ? JSON.stringify(setting.value)
                  : String(setting.value ?? ''));
              const isDirty = editValues[setting.key] !== undefined;
              const isNumeric = typeof setting.value === 'number';

              return (
                <div key={setting.key}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="flex items-start gap-4">
                    {/* Label & Key */}
                    <div className="flex-1 min-w-0 pt-1.5">
                      <div className="text-sm font-medium">
                        {setting.description || formatSettingLabel(setting.key)}
                      </div>
                      <code className="text-[11px] text-muted-foreground/70 font-mono">
                        {setting.key}
                      </code>
                    </div>

                    {/* Input & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Input
                        className={`h-9 text-sm ${isNumeric ? 'w-28 text-right tabular-nums' : 'w-48'} ${isDirty ? 'border-primary/50 bg-primary/5' : ''}`}
                        type={isNumeric ? 'number' : 'text'}
                        value={displayValue}
                        onChange={(e) =>
                          setEditValues({ ...editValues, [setting.key]: e.target.value })
                        }
                      />
                      {isDirty && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              setEditValues((v) => {
                                const n = { ...v };
                                delete n[setting.key];
                                return n;
                              })
                            }
                            title="Reset"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => onSave(setting)}
                            disabled={isPending}
                            title="Save"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
