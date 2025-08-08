// src/app/[locale]/gym/dashboard/page.tsx
'use client';
export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BarChart, Settings, Building } from "lucide-react";
import { useTranslations } from 'next-intl';

// Mock data for the Gym Dashboard
const gymData = {
  gymName: "Powerhouse Gym",
  totalClients: 152,
  totalCoaches: 12,
  activePlans: 125,
};

export default function GymDashboardPage() {
  const t = useTranslations('GymDashboardPage');

  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4">
        <Building className="h-10 w-10 text-primary" />
        <div>
            <h1 className="text-3xl font-bold">{t('title', { gymName: gymData.gymName })}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
        </div>
       </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalClients')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gymData.totalClients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('clientsSinceLastMonth', { count: 12 })}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalCoaches')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gymData.totalCoaches}</div>
             <p className="text-xs text-muted-foreground">{t('coachesOnPayroll')}</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activePlans')}</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gymData.activePlans.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">{t('activeClientPlans')}</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('clientManagementTitle')}</CardTitle>
              <CardDescription>{t('clientManagementDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground text-center py-8">{t('featurePlaceholder')}</p>
            </CardContent>
          </Card>

           <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('coachManagementTitle')}</CardTitle>
              <CardDescription>{t('coachManagementDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground text-center py-8">{t('featurePlaceholder')}</p>
            </CardContent>
          </Card>
       </div>
    </div>
  );
}
