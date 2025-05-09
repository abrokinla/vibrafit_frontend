import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Target, Zap, BrainCircuit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          Track Your Progress, <span className="text-primary">Vibrate</span> With Energy
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Vibrafit helps you stay motivated and achieve your fitness goals with personalized tracking, insights, and daily encouragement.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/signup" passHref>
            <Button size="lg">Get Started Today</Button>
          </Link>
          {/* <Button size="lg" variant="outline">Learn More</Button> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Target className="h-12 w-12 text-accent" />
            </div>
            <CardTitle>Progress Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Log daily meals and exercises effortlessly. Visualize your journey and celebrate milestones.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <BrainCircuit className="h-12 w-12 text-accent" />
            </div>
            <CardTitle>Motivator</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Receive personalized daily motivational messages powered by AI to keep you inspired.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Zap className="h-12 w-12 text-accent" />
            </div>
            <CardTitle>Metrics & Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Update key metrics like weight and see your progress visualized with intuitive charts.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-accent" />
            </div>
            <CardTitle>Clean Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Enjoy a simple, card-based layout designed for easy navigation and information access.
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-24 bg-secondary rounded-lg px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How Vibrafit Works</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
            <h3 className="text-xl font-semibold mb-2">Sign Up & Set Goals</h3>
            <p className="text-muted-foreground">Create your account and define what you want to achieve.</p>
          </div>
          <div>
            <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
            <h3 className="text-xl font-semibold mb-2">Track Daily Activities</h3>
            <p className="text-muted-foreground">Log your meals, workouts, and update your metrics regularly.</p>
          </div>
          <div>
            <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
            <h3 className="text-xl font-semibold mb-2">Stay Motivated & See Results</h3>
            <p className="text-muted-foreground">Get daily motivation and watch your progress unfold.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Vibrafit Journey?</h2>
        <p className="text-lg text-muted-foreground mb-8">Join Vibrafit today and take control of your health and fitness.</p>
        <Link href="/signup" passHref>
          <Button size="lg">Sign Up Now</Button>
        </Link>
      </section>

      {/* Placeholder Image Section (Optional) */}
      <section>
         <Image
            src="https://picsum.photos/1200/400"
            alt="Fitness lifestyle"
            width={1200}
            height={400}
            className="rounded-lg object-cover w-full"
            data-ai-hint="fitness workout health"
          />
      </section>

    </div>
  );
}
