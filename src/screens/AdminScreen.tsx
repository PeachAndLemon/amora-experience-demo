import { ArrowLeft, Calendar, Activity, Gift, Shield, ClipboardList, Award, Stamp as StampIcon, Ticket, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminEventsTab } from '@/components/admin/AdminEventsTab';
import { AdminActivitiesTab } from '@/components/admin/AdminActivitiesTab';
import { AdminRewardsTab } from '@/components/admin/AdminRewardsTab';
import { AdminChangelogTab } from '@/components/admin/AdminChangelogTab';
import { AdminMilestonesTab } from '@/components/admin/AdminMilestonesTab';
import { AdminStampsTab } from '@/components/admin/AdminStampsTab';
import { AdminPromoCodesTab } from '@/components/admin/AdminPromoCodesTab';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';

interface AdminScreenProps { onBack: () => void; }

export function AdminScreen({ onBack }: AdminScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-wine px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-foreground" />
            <h1 className="text-xl font-bold text-primary-foreground font-serif">Admin Panel</h1>
          </div>
        </div>
        <p className="text-primary-foreground/70 text-sm">Manage events, content, rewards, and users</p>
      </div>

      <div className="px-4 -mt-3">
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="w-full bg-card border border-border rounded-2xl p-1 grid grid-cols-9 gap-0.5 h-auto">
            <TabsTrigger value="events" className="flex-col gap-0.5 rounded-xl text-[9px] px-1 py-2"><Calendar className="w-3 h-3" />Events</TabsTrigger>
            <TabsTrigger value="activities" className="flex-col gap-0.5 rounded-xl text-[9px] px-1 py-2"><Activity className="w-3 h-3" />Acts</TabsTrigger>
            <TabsTrigger value="rewards" className="flex-col gap-0.5 rounded-xl text-[9px] px-1 py-2"><Gift className="w-3 h-3" />Rewards</TabsTrigger>
            <TabsTrigger value="milestones" className="flex-col gap-0.5 rounded-xl text-[9px] px-1 py-2"><Award className="w-3 h-3" />Mile</TabsTrigger>
            <TabsTrigger value="stamps" className="flex-col gap-0.5 rounded-xl text-[9px] px-1 py-2"><StampIcon className="w-3 h-3" />Stamps</TabsTrigger>
            <TabsTrigger value="promo" className="flex-col gap-0.5 rounded-xl text-[9px] px-1 py-2"><Ticket className="w-3 h-3" />Promo</TabsTrigger>
            <TabsTrigger value="users" className="flex-col gap-0.5 rounded-xl text-[9px] px-1 py-2"><Users className="w-3 h-3" />Users</TabsTrigger>
            <TabsTrigger value="changelog" className="flex-col gap-0.5 rounded-xl text-[9px] px-1 py-2"><ClipboardList className="w-3 h-3" />Log</TabsTrigger>
            <TabsTrigger value="info" className="flex-col gap-0.5 rounded-xl text-[9px] px-1 py-2"><Shield className="w-3 h-3" />Info</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-4"><AdminEventsTab /></TabsContent>
          <TabsContent value="activities" className="mt-4"><AdminActivitiesTab /></TabsContent>
          <TabsContent value="rewards" className="mt-4"><AdminRewardsTab /></TabsContent>
          <TabsContent value="milestones" className="mt-4"><AdminMilestonesTab /></TabsContent>
          <TabsContent value="stamps" className="mt-4"><AdminStampsTab /></TabsContent>
          <TabsContent value="promo" className="mt-4"><AdminPromoCodesTab /></TabsContent>
          <TabsContent value="users" className="mt-4"><AdminUsersTab /></TabsContent>
          <TabsContent value="changelog" className="mt-4"><AdminChangelogTab /></TabsContent>
          <TabsContent value="info" className="mt-4">
            <div className="bg-card rounded-2xl p-4 text-sm text-muted-foreground space-y-2">
              <p>All admin actions are audited in the Log tab.</p>
              <p>Promo code <span className="font-mono">AMORADEMO</span> activates demo mode for admins.</p>
              <p>Event QR codes are HEX, server-validated, single-use per user, and downloadable for print from each event.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
