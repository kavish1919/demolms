'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings,
  CreditCard,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Lock,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SettingsPage() {
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  const toggleApiKey = (key: string) => {
    setShowApiKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Settings"
        subtitle="Manage your LMS configuration and integrations"
      />

      <div className="p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure your website's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input id="siteName" defaultValue="Codevocado LMS" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input id="siteUrl" defaultValue="https://www.codevocado.in" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" type="email" defaultValue="contact@codevocado.in" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportPhone">Support Phone</Label>
                    <Input id="supportPhone" defaultValue="+91 9876543210" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    defaultValue="Premium Learning Management System by Codevocado. Master technology skills with expert-led courses."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    defaultValue="123, Tech Park, Electronic City, Bangalore - 560100"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="gradient-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings (PhonePe) */}
          <TabsContent value="payments">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  PhonePe Payment Gateway
                </CardTitle>
                <CardDescription>
                  Configure PhonePe payment gateway credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Make sure to use sandbox credentials for testing. Switch to production credentials when going live.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label>Environment</Label>
                    <p className="text-sm text-muted-foreground">Switch between sandbox and production</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Sandbox</span>
                    <Switch />
                    <span className="text-sm text-muted-foreground">Production</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="merchantId">Merchant ID</Label>
                    <div className="relative">
                      <Input
                        id="merchantId"
                        type={showApiKeys.merchantId ? 'text' : 'password'}
                        placeholder="Enter Merchant ID"
                      />
                      <button
                        type="button"
                        onClick={() => toggleApiKey('merchantId')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKeys.merchantId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saltKey">Salt Key</Label>
                    <div className="relative">
                      <Input
                        id="saltKey"
                        type={showApiKeys.saltKey ? 'text' : 'password'}
                        placeholder="Enter Salt Key"
                      />
                      <button
                        type="button"
                        onClick={() => toggleApiKey('saltKey')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKeys.saltKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saltIndex">Salt Index</Label>
                    <Input id="saltIndex" placeholder="Enter Salt Index (e.g., 1)" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="callbackUrl">Callback URL</Label>
                    <Input
                      id="callbackUrl"
                      placeholder="https://yoursite.com/api/payments/callback"
                      defaultValue="https://www.codevocado.in/api/payments/callback"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium">Payment Status Mapping</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Success Status</Label>
                      <Input defaultValue="PAYMENT_SUCCESS" />
                    </div>
                    <div className="space-y-2">
                      <Label>Pending Status</Label>
                      <Input defaultValue="PAYMENT_PENDING" />
                    </div>
                    <div className="space-y-2">
                      <Label>Failed Status</Label>
                      <Input defaultValue="PAYMENT_ERROR" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline">Test Connection</Button>
                  <Button className="gradient-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              {/* SMS Settings */}
              <Card className="glass-card border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        SMS Notifications
                      </CardTitle>
                      <CardDescription>Configure SMS gateway for notifications</CardDescription>
                    </div>
                    <Switch />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>SMS Provider</Label>
                      <Input placeholder="e.g., MSG91, Twilio" />
                    </div>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="relative">
                        <Input
                          type={showApiKeys.smsApi ? 'text' : 'password'}
                          placeholder="Enter API Key"
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKey('smsApi')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showApiKeys.smsApi ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Sender ID</Label>
                      <Input placeholder="e.g., CDVCDO" />
                    </div>
                    <div className="space-y-2">
                      <Label>Template ID</Label>
                      <Input placeholder="DLT Template ID" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Settings */}
              <Card className="glass-card border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        WhatsApp Notifications
                      </CardTitle>
                      <CardDescription>Configure WhatsApp Business API</CardDescription>
                    </div>
                    <Switch />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>WhatsApp Business Phone</Label>
                      <Input placeholder="+91 9876543210" />
                    </div>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="relative">
                        <Input
                          type={showApiKeys.whatsappApi ? 'text' : 'password'}
                          placeholder="Enter API Key"
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKey('whatsappApi')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showApiKeys.whatsappApi ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Instance ID</Label>
                      <Input placeholder="WhatsApp Instance ID" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Settings */}
              <Card className="glass-card border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Notifications (SMTP)
                      </CardTitle>
                      <CardDescription>Configure email server settings</CardDescription>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>SMTP Host</Label>
                      <Input placeholder="smtp.gmail.com" defaultValue="smtp.gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Port</Label>
                      <Input placeholder="587" defaultValue="587" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Username</Label>
                      <Input placeholder="your-email@gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Password</Label>
                      <div className="relative">
                        <Input
                          type={showApiKeys.smtpPassword ? 'text' : 'password'}
                          placeholder="App Password"
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKey('smtpPassword')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showApiKeys.smtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>From Name</Label>
                      <Input placeholder="Codevocado LMS" defaultValue="Codevocado LMS" />
                    </div>
                    <div className="space-y-2">
                      <Label>From Email</Label>
                      <Input placeholder="noreply@codevocado.in" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <Button variant="outline">Send Test Email</Button>
                    <Button className="gradient-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure authentication and security options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label>Google OAuth Login</Label>
                    <p className="text-sm text-muted-foreground">Allow users to sign in with Google</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Google OAuth Credentials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Client ID</Label>
                      <Input placeholder="Google OAuth Client ID" />
                    </div>
                    <div className="space-y-2">
                      <Label>Client Secret</Label>
                      <div className="relative">
                        <Input
                          type={showApiKeys.googleSecret ? 'text' : 'password'}
                          placeholder="Google OAuth Client Secret"
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKey('googleSecret')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showApiKeys.googleSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input className="w-20" type="number" defaultValue="30" />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label>Max Login Attempts</Label>
                    <p className="text-sm text-muted-foreground">Lock account after failed attempts</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input className="w-20" type="number" defaultValue="5" />
                    <span className="text-sm text-muted-foreground">attempts</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gradient-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
