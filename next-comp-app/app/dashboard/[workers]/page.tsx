// app/workers/[workerId]/page.tsx
"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation'; // Use useParams to get workerId
import { Button } from '@/app/Components/ui/button'; // Adjust path
import { Card, CardHeader, CardTitle, CardContent } from '@/app/Components/ui/card'; // Adjust path
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/Components/ui/tabs"; // Adjust path
import { Textarea } from '@/app/Components/ui/textarea'; // Adjust path
import { ArrowLeft } from 'lucide-react';

// Dummy data type - replace with your actual type later
interface WorkerData {
    id: string;
    name: string;
    // Add other fields as needed
}

export default function WorkerDetailPage() {
    const router = useRouter();
    const params = useParams();
    const workerId = params.workerId as string; // Get workerId from URL

    // --- Data Fetching Placeholder ---
    // In a real app, use React Query (useQuery) here to fetch worker data based on workerId
    const [workerData, setWorkerData] = React.useState<WorkerData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Simulate fetching data
        setIsLoading(true);
        console.log("Fetching data for worker:", workerId);
        setTimeout(() => {
            // Replace with actual fetch call
            setWorkerData({ id: workerId, name: `Injured Worker ${workerId}` }); // Dummy data
            setIsLoading(false);
        }, 500);
    }, [workerId]);
    // --- End Data Fetching Placeholder ---

    if (isLoading) {
        return <div className="container mx-auto px-4 py-8">Loading worker data...</div>; // Add a proper loading state/skeleton
    }

    if (!workerData) {
        return <div className="container mx-auto px-4 py-8">Worker not found.</div>; // Handle not found case
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List / Dashboard
            </Button>

            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">
                {workerData.name} - Details
            </h1>

            {/* Tabs for Worker Information */}
            <Tabs defaultValue="claim-details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-8 mb-4"> {/* Adjust grid cols as needed */}
                    <TabsTrigger value="claim-details">Claim Details</TabsTrigger>
                    <TabsTrigger value="demographics">Demographics</TabsTrigger>
                    <TabsTrigger value="wage-aww">Wage/AWW</TabsTrigger>
                    <TabsTrigger value="medical">Medical</TabsTrigger>
                    <TabsTrigger value="benefits">Benefits Paid</TabsTrigger>
                    <TabsTrigger value="calculations">Calculations</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                {/* Tab Content Panes */}
                <TabsContent value="claim-details">
                    <Card>
                        <CardHeader><CardTitle>Claim Details</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Claim details form or display will go here...</p>
                            {/* Add Form using RHF/Zod here later */}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="demographics">
                     <Card>
                        <CardHeader><CardTitle>Demographics</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Demographics form or display will go here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="wage-aww">
                     <Card>
                        <CardHeader><CardTitle>Wage & AWW Info</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Wage/AWW form or display will go here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="medical">
                     <Card>
                        <CardHeader><CardTitle>Medical Info</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Medical records/bills display or upload will go here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="benefits">
                     <Card>
                        <CardHeader><CardTitle>Benefits Paid</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">History of benefits paid will go here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="calculations">
                     <Card>
                        <CardHeader><CardTitle>Calculations</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Links to calculators or saved calculation results for this worker...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="documents">
                     <Card>
                        <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Document upload/management will go here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="notes">
                     <Card>
                        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                        <CardContent>
                             <Textarea placeholder={`Notes for ${workerData.name}...`} className="min-h-[200px]" />
                             {/* Add save functionality later */}
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
