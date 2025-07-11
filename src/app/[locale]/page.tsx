// src/app/[locale]/page.tsx
'use client';
export const runtime = 'edge';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Target, Zap, BrainCircuit } from "lucide-react";
import { Link } from '@/navigation'; // Use Link from new navigation config
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('LandingPage');

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <h1
          className="text-4xl md:text-6xl font-bold mb-4 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700"
          dangerouslySetInnerHTML={{ __html: t.raw('heroTitle') }}
        />
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {t('heroSubtitle')}
        </p>
        <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          <Link href="/signup" passHref>
            <Button size="lg">{t('getStartedButton')}</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
        <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Target className="h-12 w-12 text-accent" />
            </div>
            <CardTitle>{t('featureProgressTrackerTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {t('featureProgressTrackerDescription')}
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <BrainCircuit className="h-12 w-12 text-accent" />
            </div>
            <CardTitle>{t('featureMotivatorTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {t('featureMotivatorDescription')}
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Zap className="h-12 w-12 text-accent" />
            </div>
            <CardTitle>{t('featureMetricsTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {t('featureMetricsDescription')}
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-accent" />
            </div>
            <CardTitle>{t('featureCleanInterfaceTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {t('featureCleanInterfaceDescription')}
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-24 bg-secondary rounded-lg px-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-400">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('howItWorksTitle')}</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
            <h3 className="text-xl font-semibold mb-2">{t('step1Title')}</h3>
            <p className="text-muted-foreground">{t('step1Description')}</p>
          </div>
          <div>
            <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
            <h3 className="text-xl font-semibold mb-2">{t('step2Title')}</h3>
            <p className="text-muted-foreground">{t('step2Description')}</p>
          </div>
          <div>
            <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
            <h3 className="text-xl font-semibold mb-2">{t('step3Title')}</h3>
            <p className="text-muted-foreground">{t('step3Description')}</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center py-16 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('ctaTitle')}</h2>
        <p className="text-lg text-muted-foreground mb-8">{t('ctaSubtitle')}</p>
        <Link href="/signup" passHref>
          <Button size="lg">{t('signUpNowButton')}</Button>
        </Link>
      </section>

      {/* Placeholder Image Section (Optional) */}
      <section className="animate-in fade-in duration-1000 delay-600">
         <Image
            src="https://picsum.photos/1200/400" // This image will not be localized by this setup
            alt={t('imageAltFitnessLifestyle')}
            width={1200}
            height={400}
            className="rounded-lg object-cover w-full"
            data-ai-hint="fitness workout health"
          />
      </section>
    </div>
  );
}
