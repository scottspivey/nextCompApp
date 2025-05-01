// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// --- Define your rate data ---

// Source: SC WCC Website / Search Results
const maxCompRatesRawData: Record<number, number> = {
  1979: 185.00, 1980: 197.00, 1981: 216.00, 1982: 235.00, 1983: 254.38,
  1984: 268.99, 1985: 287.02, 1986: 294.95, 1987: 308.24, 1988: 319.20,
  1989: 334.87, 1990: 350.19, 1991: 364.37, 1992: 379.82, 1993: 393.06,
  1994: 410.26, 1995: 422.48, 1996: 437.79, 1997: 450.62, 1998: 465.18,
  1999: 483.47, 2000: 507.34, 2001: 532.77, 2002: 549.42, 2003: 563.55,
  2004: 577.73, 2005: 592.56, 2006: 616.48, 2007: 645.94, 2008: 661.29,
  2009: 681.36, 2010: 689.71, 2011: 704.92, 2012: 725.47, 2013: 743.72,
  2014: 752.16, 2015: 766.05, 2016: 784.03, 2017: 806.92, 2018: 838.21,
  2019: 845.74, 2020: 866.67, 2021: 903.40, 2022: 963.37, 2023: 1035.78,
  2024: 1093.67, 2025: 1134.43
};

// Convert raw max comp data to Prisma input format
const maxCompRatesData: Prisma.RateSettingCreateManyInput[] = Object.entries(
  maxCompRatesRawData
).map(([yearStr, rate]) => ({
  year: parseInt(yearStr, 10),
  rate_type: 'MAX_COMPENSATION',
  value: rate, // Prisma handles number -> Decimal conversion
}));

// Source: SC WCC Memos / T-Note Yields (Capped 2%-6%) / Pre-2015 Rule
const discountRatesRawData: Record<number, number> = {
  2005: 0.0500, 2006: 0.0500, 2007: 0.0500, 2008: 0.0500, 2009: 0.0500,
  2010: 0.0500, 2011: 0.0500, 2012: 0.0500, 2013: 0.0500, 2014: 0.0500,
  2015: 0.0200, 2016: 0.0200, 2017: 0.0200, 2018: 0.0225, 2019: 0.0249,
  2020: 0.0200, 2021: 0.0200, 2022: 0.0200, 2023: 0.0394, 2024: 0.0393,
  2025: 0.0438
};

// Convert raw discount rate data to Prisma input format
const discountRatesData: Prisma.RateSettingCreateManyInput[] = Object.entries(
  discountRatesRawData
).map(([yearStr, rate]) => ({
  year: parseInt(yearStr, 10),
  rate_type: 'DISCOUNT_RATE_101_PLUS',
  value: rate,
}));

async function main() {
  console.log(`Start seeding rate_settings table...`);

  const allRateData = [...maxCompRatesData, ...discountRatesData];

  // Use upsert to create or update records based on the composite key
  // This prevents errors if you run the seed script multiple times
  for (const data of allRateData) {
    await prisma.rateSetting.upsert({
      where: {
        // Specify the composite key for the where clause
        year_rate_type: {
          year: data.year,
          rate_type: data.rate_type,
        },
      },
      // Data to update if the record exists (just the value)
      update: {
        value: data.value,
      },
      // Data to create if the record does not exist
      create: data,
    });
    console.log(`Upserted rate for ${data.year} - ${data.rate_type}`);
  }

  console.log(`Seeding finished.`);
}

// Standard Prisma seed script execution boilerplate
main()
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });