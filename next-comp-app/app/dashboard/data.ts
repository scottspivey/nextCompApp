// app/lib/placeholder-data.ts

export interface RecentWorker {
    id: string;
    name: string;
    lastAccessed: string; // Simple date string for now
    claimNumber?: string; // Optional
}

export const recentWorkersData: RecentWorker[] = [
    { id: "123", name: "Smith, John A.", lastAccessed: "2h ago", claimNumber: "SCWCC-0012345" },
    { id: "456", name: "Garcia, Maria L.", lastAccessed: "1 day ago", claimNumber: "SCWCC-0098765" },
    { id: "789", name: "Chen, Wei", lastAccessed: "3 days ago", claimNumber: "SCWCC-0054321" },
    { id: "101", name: "Williams, David P.", lastAccessed: "1 week ago" },
    { id: "112", name: "Jones, Samantha B.", lastAccessed: "2 weeks ago", claimNumber: "SCWCC-0112233" },
];

// You can add dummy data for Calculators here too if needed
export interface CalculatorLink {
    id: string;
    name: string;
    path: string;
    premium: boolean;
}

export const calculatorLinks: CalculatorLink[] = [
    { id: 'aww', name: 'Average Weekly Wage', path: '/Calculators/aww', premium: false },
    { id: 'commuted', name: 'Commuted Value', path: '/Calculators/commuted', premium: false },
    { id: 'indemnity', name: 'Indemnity Benefits', path: '/Calculators/indemnity', premium: true },
    // Add other calculators...
];

