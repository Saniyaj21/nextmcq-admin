'use client';

import { useState } from 'react';
import { useSettings, useUpdateSetting } from '@/hooks/use-settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { AppConfig } from '@/types';

export default function SettingsPage() {
  const [category, setCategory] = useState('');
  const { data: settings, isLoading } = useSettings(category || undefined);
  const updateSetting = useUpdateSetting();
  const [editValues, setEditValues] = useState<Record<string, string>>({});

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
        onSuccess: () => { toast.success(`${setting.key} updated`); setEditValues((v) => { const n = { ...v }; delete n[setting.key]; return n; }); },
        onError: () => toast.error('Failed to update setting'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Group settings by category
  const grouped: Record<string, AppConfig[]> = {};
  for (const s of settings ?? []) {
    const cat = s.category || 'system';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  }

  // Only show tabs that have settings
  const availableCategories = Object.keys(grouped);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {availableCategories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">{cat}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {(settings?.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No settings found. Run the seed script to populate defaults.
          </CardContent>
        </Card>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <Card key={cat}>
          <CardHeader className="py-3 px-4">
            <CardTitle className="capitalize text-base">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="divide-y">
              {items.map((setting) => {
                const displayValue = editValues[setting.key] ?? (typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value ?? ''));
                const isNumeric = typeof setting.value === 'number';
                const isDirty = editValues[setting.key] !== undefined;
                return (
                  <div key={setting.key} className="flex items-center gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{setting.key}</p>
                      {setting.description && (
                        <p className="text-xs text-muted-foreground leading-tight">{setting.description}</p>
                      )}
                    </div>
                    <Input
                      className={isNumeric ? 'w-24 h-8 text-sm' : 'w-48 h-8 text-sm'}
                      value={displayValue}
                      onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                    />
                    <Button
                      size="sm"
                      variant={isDirty ? 'default' : 'outline'}
                      className="h-8 px-3 text-xs"
                      onClick={() => handleSave(setting)}
                      disabled={!isDirty || updateSetting.isPending}
                    >
                      Save
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
