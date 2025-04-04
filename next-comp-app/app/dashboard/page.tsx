// app/dashboard/page.tsx
"use client"; // Needed for hooks like useRouter, useState etc. later

import { useRouter } from 'next/navigation'; // For navigation
import { Button } from '@/app/Components/ui/button'; // Adjust path
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/Components/ui/card'; // Adjust path
import { Textarea } from '@/app/Components/ui/textarea'; // Adjust path
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/Components/ui/table"; // Adjust path
import { PlusCircle, Settings, BookOpen, Calculator, StickyNote } from 'lucide-react'; // Icons

// Import dummy data (adjust path as needed)
import { recentWorkersData, calculatorLinks } from '@/app/dashboard/data'; // Adjust path

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
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" /> Settings
           </Button>
           <Button size="sm" onClick={() => router.push('/workers/new')}> {/* Assume a route for adding new worker */}
                <PlusCircle className="mr-2 h-4 w-4" /> Add Injured Worker
           </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Recent Workers Widget */}
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
                    <TableRow key={worker.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/workers/${worker.id}`)}>
                      <TableCell className="font-medium">{worker.name}</TableCell>
                      <TableCell>{worker.claimNumber ?? '-'}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{worker.lastAccessed}</TableCell>
                    </TableRow>
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
             {calculatorLinks.map(calc => (
                <Button
                    key={calc.id}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => router.push(calc.path)}
                    disabled={calc.premium && !hasPremiumAccess()} // Example disabled state
                >
                    {calc.name}
                    {calc.premium && <span className="ml-auto text-xs font-semibold text-primary">(Premium)</span>}
                </Button>
             ))}
              <Button variant="link" size="sm" className="mt-2 px-0 justify-start" onClick={() => router.push('/Calculators')}>View All Calculators</Button>
          </CardContent>
        </Card>

        {/* Training Progress Widget (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Training Progress
            </CardTitle>
            <CardDescription>Your continuing education status.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Training module coming soon...</p>
            {/* Placeholder for progress bars or course list */}
            <Button variant="secondary" size="sm" className="mt-4" disabled>View Training</Button>
          </CardContent>
        </Card>

        {/* Notepad Widget (Simple) */}
        <Card className="md:col-span-2">
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" /> Scratchpad
            </CardTitle>
            <CardDescription>Quick notes. Not saved automatically.</CardDescription>
          </CardHeader>
           <CardContent>
             <Textarea placeholder="Type your quick notes here..." className="min-h-[150px]" />
             {/* Add save functionality later if needed */}
           </CardContent>
        </Card>

        {/* Add other widgets like Quick Stats, Deadlines etc. here */}

      </div>
    </div>
  );
}
