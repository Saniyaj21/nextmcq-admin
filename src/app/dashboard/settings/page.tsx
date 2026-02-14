'use client';

import { useState } from 'react';
import { useSettings, useUpdateSetting } from '@/hooks/use-settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="app">App</TabsTrigger>
        </TabsList>
      </Tabs>

      {(settings?.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No settings found. Settings are created when you update a value.
          </CardContent>
        </Card>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle className="capitalize">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((setting) => (
              <div key={setting.key} className="flex items-end gap-4">
                <div className="flex-1">
                  <Label>{setting.key}</Label>
                  {setting.description && (
                    <p className="text-xs text-muted-foreground mb-1">{setting.description}</p>
                  )}
                  <Input
                    value={editValues[setting.key] ?? (typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value ?? ''))}
                    onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSave(setting)}
                  disabled={editValues[setting.key] === undefined || updateSetting.isPending}
                >
                  Save
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
