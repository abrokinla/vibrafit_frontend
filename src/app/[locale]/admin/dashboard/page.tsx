// src/app/[locale]/admin/dashboard/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BarChart, Settings } from "lucide-react";
import { useTranslations } from 'next-intl';

const adminData = {
  totalUsers: 1250,
  totalTrainers: 45,
  activeSubscriptions: 980,
  monthlyRevenue: 14700, 
};

export default function AdminDashboardPage() {
  const t = useTranslations('AdminDashboardPage');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('usersSinceLastWeek', { count: 50 })}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalTrainers')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData.totalTrainers}</div>
             <p className="text-xs text-muted-foreground">{t('trainersSinceLastMonth', { count: 2 })}</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeSubscriptions')}</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData.activeSubscriptions.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">{t('conversionRate', { rate: ((adminData.activeSubscriptions / adminData.totalUsers) * 100).toFixed(0) })}</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('monthlyRevenue')}</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" /> 
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${adminData.monthlyRevenue.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">{t('revenueBasedOnSubscriptions')}</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('userManagementTitle')}</CardTitle>
              <CardDescription>{t('userManagementDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground text-center py-8">{t('userManagementPlaceholder')}</p>
            </CardContent>
          </Card>

           <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('trainerManagementTitle')}</CardTitle>
              <CardDescription>{t('trainerManagementDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground text-center py-8">{t('trainerManagementPlaceholder')}</p>
            </CardContent>
          </Card>
       </div>

       <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('systemSettingsTitle')}</CardTitle>
               <CardDescription>{t('systemSettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground text-center py-8">{t('systemSettingsPlaceholder')}</p>
            </CardContent>
          </Card>
    </div>
  );
}
