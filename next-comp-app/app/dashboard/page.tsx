// app/dashboard/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/app/Components/ui/button'; // Adjust path
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/Components/ui/card'; // Adjust path
import { Textarea } from '@/app/Components/ui/textarea'; // Adjust path
import { Progress } from '@/app/Components/ui/progress'; // Adjust path
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/Components/ui/table"; // Adjust path
import { PlusCircle, Settings, BookOpen, Calculator, StickyNote, FolderKanban } from 'lucide-react'; // Added more icons

// Import dummy data (adjust path as needed)
import { recentWorkersData, calculatorLinks } from '@/app/dashboard/data';

export default function DashboardPage() {
  const router = useRouter();

  // Placeholder function for premium checks
  const hasPremiumAccess = () => true; // Replace with actual logic

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        {/* Settings button remains in header */}
        <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
             <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>
      </div>
      {/* Dashboard Grid - Adjusted layout */}
      {/* Using 3 columns on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Quick Stats Widget */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5" /> Overview
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-2xl font-bold text-foreground">15</p>
                    <p className="text-xs text-muted-foreground">Active Cases</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-xs text-muted-foreground">Deadlines This Week</p>
                </div>
                 {/* Add more stats as needed */}
            </CardContent>
        </Card>

        {/* Quick Actions Widget */}
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                 <Button size="sm" onClick={() => router.push('/workers/new')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Injured Worker
                 </Button>
                 <Button variant="secondary" size="sm" onClick={() => router.push('/Calculators')}> {/* Or link to specific calc */}
                    <Calculator className="mr-2 h-4 w-4" /> Start Calculation
                 </Button>
                 {/* Add other common actions */}
            </CardContent>
        </Card>

        {/* Training Progress Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Training Progress
            </CardTitle>
            <CardDescription>Your continuing education status.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Current Course:</span>
                    <span className="font-medium text-foreground">Intro to AWW</span>
                </div>
                <Progress value={75} aria-label="Training progress for Intro to AWW at 75%" />
                <p className="text-xs text-muted-foreground text-right">75% Complete</p>
             </div>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => router.push('/training')} >
                View Training Library
            </Button>
          </CardContent>
        </Card>

        {/* Recent Workers Widget - Spanning 2 columns on md+ */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Recently accessed injured worker files.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentWorkersData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Claim #</TableHead>
                    <TableHead className="text-right">Last Accessed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentWorkersData.slice(0, 5).map((worker) => ( // Show top 5
                    (<TableRow key={worker.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/workers/${worker.id}`)}>
                      <TableCell className="font-medium">{worker.name}</TableCell>
                      <TableCell>{worker.claimNumber ?? '-'}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{worker.lastAccessed}</TableCell>
                    </TableRow>)
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            )}
             <Button variant="link" size="sm" className="mt-4 px-0" onClick={() => router.push('/workers')}>View All Workers</Button>
          </CardContent>
        </Card>

        {/* Calculator Access Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" /> Calculators
            </CardTitle>
            <CardDescription>Quick access to calculation tools.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
             {calculatorLinks.slice(0, 4).map(calc => ( // Show first 4 for example
                (<Button
                    key={calc.id}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => router.push(calc.path)}
                    disabled={calc.premium && !hasPremiumAccess()}
                >
                  {calc.name}
                  {calc.premium && <span className="ml-auto text-xs font-semibold text-primary">(Premium)</span>}
                </Button>)
             ))}
              <Button variant="link" size="sm" className="mt-2 px-0 justify-start" onClick={() => router.push('/Calculators')}>View All Calculators</Button>
          </CardContent>
        </Card>

        {/* Notepad Widget - Spanning 2 columns on md+, 3 on lg+ */}
        <Card className="md:col-span-2 lg:col-span-3">
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" /> Scratchpad
            </CardTitle>
            <CardDescription>Quick notes for your current session. Not saved automatically.</CardDescription>
          </CardHeader>
           <CardContent>
             <Textarea placeholder="Type your quick notes here..." className="min-h-[150px]" />
           </CardContent>
        </Card>

      </div>
    </div>
  );
}
