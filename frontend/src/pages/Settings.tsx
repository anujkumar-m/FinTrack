import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Download, LogOut } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  const settingSections = [
    {
      title: 'Profile',
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Input id="currency" defaultValue="USD ($)" />
          </div>
        </div>
      ),
    },
    {
      title: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-4">
          {[
            { label: 'Bill reminders', description: 'Get notified before bills are due', defaultChecked: true },
            { label: 'Budget alerts', description: 'Alert when spending exceeds budget', defaultChecked: true },
            { label: 'Weekly summary', description: 'Receive weekly spending summary', defaultChecked: false },
            { label: 'Goal progress', description: 'Updates on savings goal progress', defaultChecked: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch defaultChecked={item.defaultChecked} />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Security',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Change Password</Label>
            <div className="grid gap-3 md:grid-cols-2">
              <Input type="password" placeholder="Current password" />
              <Input type="password" placeholder="New password" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Two-factor authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch />
          </div>
        </div>
      ),
    },
    {
      title: 'Data & Privacy',
      icon: Download,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Export Data</p>
              <p className="text-sm text-muted-foreground">Download all your financial data</p>
            </div>
            <Button variant="outline">Export CSV</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Export Report</p>
              <p className="text-sm text-muted-foreground">Generate a PDF report</p>
            </div>
            <Button variant="outline">Export PDF</Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Settings" subtitle="Manage your account and preferences">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl space-y-6"
      >
        {settingSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl bg-card p-6 shadow-card"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{section.title}</h3>
              </div>
              {section.content}
            </motion.div>
          );
        })}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Sign Out</p>
              <p className="text-sm text-muted-foreground">Sign out from your account</p>
            </div>
            <Button variant="destructive" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Settings;
