'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, AlertCircle, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'Vibrafit',
    platformEmail: 'support@vibrafit.com',
    maintenanceMode: false,
    allowNewSignups: true,
    allowTrainerSignups: true,
    allowGymSignups: true,
    maxUsersPerGym: 500,
    subscriptionDurationDays: 30,
    maxPostCharacters: 500,
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    analyticsEnabled: true,
    dataBackupEnabled: true,
    backupFrequency: 'daily',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          System Settings
        </h1>
        <p className="text-muted-foreground mt-2">Configure platform-wide settings and preferences</p>
      </div>

      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          Settings saved successfully!
        </div>
      )}

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Platform Name</label>
            <Input
              value={settings.platformName}
              onChange={(e) => handleSettingChange('platformName', e.target.value)}
              placeholder="Platform name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Support Email</label>
            <Input
              type="email"
              value={settings.platformEmail}
              onChange={(e) => handleSettingChange('platformEmail', e.target.value)}
              placeholder="support@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Users Per Gym</label>
            <Input
              type="number"
              value={settings.maxUsersPerGym}
              onChange={(e) => handleSettingChange('maxUsersPerGym', parseInt(e.target.value))}
              placeholder="500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Subscription Duration (days)</label>
            <Input
              type="number"
              value={settings.subscriptionDurationDays}
              onChange={(e) => handleSettingChange('subscriptionDurationDays', parseInt(e.target.value))}
              placeholder="30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Post Characters</label>
            <Input
              type="number"
              value={settings.maxPostCharacters}
              onChange={(e) => handleSettingChange('maxPostCharacters', parseInt(e.target.value))}
              placeholder="500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>Control who can access the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            label="Maintenance Mode"
            description="Disable all user access except admins"
            value={settings.maintenanceMode}
            onChange={(value) => handleSettingChange('maintenanceMode', value)}
            warning
          />
          <SettingToggle
            label="Allow New User Signups"
            description="Allow new users to create accounts"
            value={settings.allowNewSignups}
            onChange={(value) => handleSettingChange('allowNewSignups', value)}
          />
          <SettingToggle
            label="Allow Trainer Signups"
            description="Allow new trainers to register"
            value={settings.allowTrainerSignups}
            onChange={(value) => handleSettingChange('allowTrainerSignups', value)}
          />
          <SettingToggle
            label="Allow Gym Signups"
            description="Allow new gyms to register"
            value={settings.allowGymSignups}
            onChange={(value) => handleSettingChange('allowGymSignups', value)}
          />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            label="Email Notifications"
            description="Send email notifications to users"
            value={settings.emailNotificationsEnabled}
            onChange={(value) => handleSettingChange('emailNotificationsEnabled', value)}
          />
          <SettingToggle
            label="Push Notifications"
            description="Send push notifications to mobile users"
            value={settings.pushNotificationsEnabled}
            onChange={(value) => handleSettingChange('pushNotificationsEnabled', value)}
          />
        </CardContent>
      </Card>

      {/* Data & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Analytics</CardTitle>
          <CardDescription>Configure data collection and backup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            label="Analytics"
            description="Enable platform analytics tracking"
            value={settings.analyticsEnabled}
            onChange={(value) => handleSettingChange('analyticsEnabled', value)}
          />
          <SettingToggle
            label="Automated Backups"
            description="Enable automatic data backups"
            value={settings.dataBackupEnabled}
            onChange={(value) => handleSettingChange('dataBackupEnabled', value)}
          />
          {settings.dataBackupEnabled && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Backup Frequency</label>
              <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Security and account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Session Timeout (minutes)</label>
            <Input type="number" placeholder="30" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password Min Length</label>
            <Input type="number" placeholder="8" />
          </div>
          <Button variant="outline" size="sm">Require 2FA for Admins</Button>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
          <CardDescription>Configure API access and rate limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API Rate Limit (requests/hour)</label>
            <Input type="number" placeholder="1000" />
          </div>
          <Button variant="outline" size="sm">Regenerate API Keys</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
          <CardDescription>Destructive actions - proceed with caution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-semibold">Warning!</p>
              <p className="mt-1">These actions cannot be undone. Please proceed carefully.</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Button variant="outline" className="text-red-600 hover:bg-red-100">
              Clear All Caches
            </Button>
            <Button variant="outline" className="text-red-600 hover:bg-red-100">
              Reset Analytics Data
            </Button>
            <Button variant="outline" className="text-red-600 hover:bg-red-100">
              Delete Inactive Users
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2 sticky bottom-0 bg-background p-4 border-t border-border rounded-lg">
        <Button className="gap-2" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
        <Button variant="outline">Reset to Defaults</Button>
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  value,
  onChange,
  warning = false,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  warning?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg border ${warning ? 'border-orange-200 bg-orange-50/50' : 'border-border'} flex items-center justify-between`}>
      <div>
        <p className={`font-medium text-sm ${warning ? 'text-orange-900' : ''}`}>{label}</p>
        <p className={`text-xs ${warning ? 'text-orange-800' : 'text-muted-foreground'} mt-1`}>{description}</p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
