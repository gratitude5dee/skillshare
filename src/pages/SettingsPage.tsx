import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Settings, Key, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your account details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user?.email || 'Not available'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Status</label>
              <div className="mt-1">
                <Badge variant="default">Active</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <p className="text-sm">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'Not available'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Theme</label>
              <div className="mt-1">
                <Badge variant="outline">System Default</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Auto-refresh Tasks</label>
              <div className="mt-1">
                <Badge variant="secondary">Enabled (30s)</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notifications</label>
              <div className="mt-1">
                <Badge variant="secondary">Task Completions</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>Manage your API connections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Manus AI API</label>
              <div className="mt-1">
                <Badge variant="default">Connected</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Usage Limits</label>
              <p className="text-sm text-muted-foreground">Managed by Manus AI platform</p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Manage your data and history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Task History</label>
              <p className="text-sm text-muted-foreground">Tasks are automatically managed</p>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" disabled>
                Export Task History
              </Button>
              <p className="text-xs text-muted-foreground">
                Export feature coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;