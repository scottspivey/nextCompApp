// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client'; // Use standard import
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const SC_STATES = ['SC']; // South Carolina
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
const CLAIM_STATUSES = ['Open', 'Closed', 'Denied', 'In Litigation', 'Settled', 'Pending Review'];
const MEDICAL_PROVIDER_TYPES = ['Doctor', 'Hospital', 'Physical Therapist', 'Chiropractor', 'Specialist Clinic'];
const MEDICAL_SPECIALTIES = ['Orthopedics', 'Neurology', 'General Practice', 'Emergency Medicine', 'Radiology', 'Physical Therapy'];

// Helper to create a full SSN string (XXX-XX-XXXX)
function createFullSSN() {
  return `${faker.string.numeric(3)}-${faker.string.numeric(2)}-${faker.string.numeric(4)}`;
}

// Helper to format phone numbers consistently
function formatPhoneNumber() {
    return faker.helpers.fromRegExp(/[0-9]{3}-[0-9]{3}-[0-9]{4}/);
}

// --- Function to Seed Rate Settings ---
async function seedRateSettings() {
  console.log('Seeding Rate Settings...');
  // --- User's Rate Data ---
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
  const discountRatesRawData: Record<number, number> = {
    2005: 0.0500, 2006: 0.0500, 2007: 0.0500, 2008: 0.0500, 2009: 0.0500,
    2010: 0.0500, 2011: 0.0500, 2012: 0.0500, 2013: 0.0500, 2014: 0.0500,
    2015: 0.0200, 2016: 0.0200, 2017: 0.0200, 2018: 0.0225, 2019: 0.0249,
    2020: 0.0200, 2021: 0.0200, 2022: 0.0200, 2023: 0.0394, 2024: 0.0393,
    2025: 0.0438
  };
  // Removed explicit : Prisma.RateSettingCreateInput[] annotations
  const maxCompRatesData = Object.entries(
    maxCompRatesRawData
  ).map(([yearStr, rate]) => {
    const year = parseInt(yearStr, 10);
    return {
      year: year, rate_type: 'MAX_COMPENSATION', value: new Prisma.Decimal(rate),
      effective_date: new Date(`${year}-01-01T00:00:00.000Z`), description: `Maximum Weekly Compensation Rate for SC in ${year}`,
    };
  });
  const discountRatesData = Object.entries(
    discountRatesRawData
  ).map(([yearStr, rate]) => {
    const year = parseInt(yearStr, 10);
    return {
      year: year, rate_type: 'DISCOUNT_RATE_101_PLUS', value: new Prisma.Decimal(rate),
      effective_date: new Date(`${year}-01-01T00:00:00.000Z`), description: `WCC Discount Rate (101+ weeks) for SC in ${year}`,
    };
  });
  const allRateData = [...maxCompRatesData, ...discountRatesData];
  for (const data of allRateData) {
    await prisma.rateSetting.upsert({
      where: { year_rate_type: { year: data.year, rate_type: data.rate_type } },
      update: { value: data.value, effective_date: data.effective_date, description: data.description }, create: data,
    });
    console.log(`Upserted rate for ${data.year} - ${data.rate_type}`);
  }
  const otherRates = [ // Removed explicit type annotation
    { year: 2024, rate_type: 'MILEAGE_RATE_SC', value: new Prisma.Decimal('0.685'), effective_date: new Date('2024-01-01T00:00:00.000Z'), description: 'Standard Mileage Rate for Medical Travel SC 2024 (based on IRS general rate, verify with WCC)', },
    { year: 2024, rate_type: 'MIN_COMP_RATE_SC', value: new Prisma.Decimal('75.00'), effective_date: new Date('2024-01-01T00:00:00.000Z'), description: 'Minimum Weekly Compensation Rate for SC 2024 (typically $75 or AWW if lower)', }
  ];
  for (const data of otherRates) {
    await prisma.rateSetting.upsert({
      where: { year_rate_type: { year: data.year, rate_type: data.rate_type } },
      update: { value: data.value, effective_date: data.effective_date, description: data.description }, create: data,
    });
    console.log(`Upserted rate for ${data.year} - ${data.rate_type}`);
  }
  console.log('Finished seeding Rate Settings.');
}

async function main() {
  console.log(`Start seeding ...`);
  // Clear data if needed (use with caution!)
  // ... (deleteMany calls omitted for brevity) ...

  await seedRateSettings();

  // --- Create Users and Profiles ---
  const numberOfProfiles = 5;
  const profiles = [];
  for (let i = 0; i < numberOfProfiles; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({firstName: `user${i}`, lastName: 'seed'}),
        name: faker.person.fullName(),
      },
    });
    // Removed explicit type annotation for profile data
    const profileData = {
        userId: user.id,
        full_name: user.name,
        firm_name: faker.company.name() + ' Law Group',
        role: faker.helpers.arrayElement(['attorney', 'paralegal', 'adjuster', 'admin']),
        avatar_url: faker.image.avatar(),
        phone_number: formatPhoneNumber(),
      };
    const profile = await prisma.profile.create({ data: profileData });
    profiles.push(profile);
    console.log(`Created user ${user.email} with profile ${profile.id}`);
  }
  console.log('User and Profile seeding completed.');

  // --- Create Employers ---
  console.log('Attempting to seed Employers...');
  const numberOfEmployers = 10;
  const employers = [];
  for (let i = 0; i < numberOfEmployers; i++) {
    const companyName = faker.company.name();
    // Removed explicit type annotation for employer data
    const employerData = {
        name: companyName,
        fein: `${faker.string.numeric(2)}-${faker.string.numeric(7)}`,
        address_line1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.helpers.arrayElement(US_STATES),
        zip_code: faker.location.zipCode(),
        phone_number: formatPhoneNumber(),
        insurance_carrier_name: faker.company.name() + ' Insurance Co.',
        insurance_policy_number: faker.string.alphanumeric(10).toUpperCase(),
        carrier_code: `C${faker.string.numeric(3)}`,
        contact_person_name: faker.person.fullName(),
        contact_person_phone: formatPhoneNumber(),
        contact_person_email: faker.internet.email({firstName: 'contact', lastName: companyName.split(' ')[0] || `emp${i}`}),
      };
     if (!prisma.employer) {
       console.error('CRITICAL: prisma.employer is undefined before creating employer. Exiting.');
       throw new Error('prisma.employer is undefined');
     }
    const employer = await prisma.employer.create({ data: employerData });
    employers.push(employer);
    console.log(`Created employer ${employer.name}`);
  }
  console.log('Employer seeding completed.');

  // --- Create Medical Providers ---
  console.log('Attempting to seed Medical Providers...');
   if (!prisma.medicalProvider) {
     console.error('CRITICAL: prisma.medicalProvider is undefined before creating medical provider. Exiting.');
     throw new Error('prisma.medicalProvider is undefined');
   }
  const numberOfMedicalProviders = 15;
  const medicalProviders = [];
  for (let i = 0; i < numberOfMedicalProviders; i++) {
    const providerLastName = faker.person.lastName();
    // Removed explicit type annotation for medical provider data
    const medicalProviderData = {
        name: `Dr. ${providerLastName}, ${faker.person.suffix() || 'MD'}` ,
        type: faker.helpers.arrayElement(MEDICAL_PROVIDER_TYPES),
        specialty: faker.helpers.arrayElement(MEDICAL_SPECIALTIES),
        address_line1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.helpers.arrayElement(US_STATES),
        zip_code: faker.location.zipCode(),
        phone_number: formatPhoneNumber(),
        fax_number: formatPhoneNumber(),
        email_address: faker.internet.email({firstName: 'clinic', lastName: providerLastName}),
        npi_number: faker.string.numeric(10),
      };
    const provider = await prisma.medicalProvider.create({ data: medicalProviderData });
    medicalProviders.push(provider);
    console.log(`Created medical provider ${provider.name}`);
  }
  console.log('Medical Provider seeding completed.');


  // --- Create Injured Workers and Claims ---
  console.log('Attempting to seed Injured Workers and Claims...');
   if (!prisma.injuredWorker) {
     console.error('CRITICAL: prisma.injuredWorker is undefined before creating worker. Exiting.');
     throw new Error('prisma.injuredWorker is undefined');
   }
   if (!prisma.claim) {
     console.error('CRITICAL: prisma.claim is undefined before creating claim. Exiting.');
     throw new Error('prisma.claim is undefined');
   }

  const numberOfInjuredWorkersPerProfile = 3;

  for (const profile of profiles) {
    for (let i = 0; i < numberOfInjuredWorkersPerProfile; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      // Removed explicit type annotation for injured worker data
      const injuredWorkerData = {
          profile: { connect: { id: profile.id } },
          first_name: firstName,
          last_name: lastName,
          middle_name: faker.datatype.boolean(0.3) ? faker.person.middleName() : undefined,
          suffix: faker.datatype.boolean(0.1) ? faker.person.suffix() : undefined,
          ssn: createFullSSN(),
          date_of_birth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
          gender: faker.helpers.arrayElement(GENDERS),
          marital_status: faker.helpers.arrayElement(MARITAL_STATUSES),
          address_line1: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.helpers.arrayElement(SC_STATES),
          zip_code: faker.location.zipCode('#####'),
          phone_number: formatPhoneNumber(),
          work_phone_number: faker.datatype.boolean(0.5) ? formatPhoneNumber() : undefined,
          email: faker.internet.email({firstName, lastName}),
          occupation: faker.person.jobTitle(),
          num_dependents: faker.number.int({ min: 0, max: 5 }),
          last_accessed_at: faker.date.recent({ days: 30 }),
        };
      const injuredWorker = await prisma.injuredWorker.create({ data: injuredWorkerData });
      console.log(`Created injured worker ${injuredWorker.first_name} ${injuredWorker.last_name} for profile ${profile.id}`);

      const associatedEmployer = faker.helpers.arrayElement(employers);
      const dateOfInjury = faker.date.past({ years: 2 });

      // Removed explicit type annotation for claim data
      const claimData = {
          injuredWorker: { connect: { id: injuredWorker.id } },
          profile: { connect: { id: profile.id } },
          employer: associatedEmployer ? { connect: { id: associatedEmployer.id } } : undefined,
          wcc_file_number: `WCC-${faker.string.alphanumeric(8).toUpperCase()}`,
          carrier_file_number: `CARRIER-${faker.string.alphanumeric(10).toUpperCase()}`,
          date_of_injury: dateOfInjury,
          time_of_injury: faker.date.recent().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          place_of_injury: faker.location.secondaryAddress() + ", " + (associatedEmployer?.name || "Unknown Employer"),
          accident_description: faker.lorem.sentence({min: 5, max: 10}),
          part_of_body_injured: faker.lorem.words(3),
          nature_of_injury: faker.lorem.words(2),
          cause_of_injury: faker.lorem.words(2),
          notice_given_date: faker.date.soon({ days: 5, refDate: dateOfInjury }),
          average_weekly_wage: new Prisma.Decimal(faker.finance.amount({ min: 300, max: 1500, dec: 2 })),
          compensation_rate: new Prisma.Decimal(faker.finance.amount({ min: 200, max: 1000, dec: 2 })),
          date_disability_began: faker.date.soon({ days: 1, refDate: dateOfInjury }),
          mmi_date: faker.datatype.boolean(0.3) ? faker.date.future({ years: 1, refDate: dateOfInjury }) : undefined,
          current_work_status: faker.helpers.arrayElement(['Totally Disabled', 'Light Duty', 'Full Duty', 'MMI - Awaiting Rating', 'MMI - Released']),
          permanent_impairment_rating: faker.datatype.boolean(0.2) ? faker.number.int({ min: 5, max: 50 }) : undefined,
          claim_status: faker.helpers.arrayElement(CLAIM_STATUSES),
          claimant_attorney_name: profile.role === 'attorney' ? profile.full_name : (faker.datatype.boolean(0.3) ? faker.person.fullName() : undefined),
          claimant_attorney_firm: profile.role === 'attorney' ? profile.firm_name : (faker.datatype.boolean(0.3) ? faker.company.name() + " Law LLC" : undefined),
        };
      const claim = await prisma.claim.create({ data: claimData });
      console.log(`Created claim ${claim.id} for worker ${injuredWorker.id}`);

       // Link some medical providers to this claim
       if (!prisma.claimMedicalProvider) {
         console.error('CRITICAL: prisma.claimMedicalProvider is undefined before linking providers. Exiting.');
         throw new Error('prisma.claimMedicalProvider is undefined');
       }
      const numClaimProviders = faker.number.int({ min: 1, max: 3 });
      const shuffledProviders = faker.helpers.shuffle(medicalProviders);
      for (let k = 0; k < numClaimProviders; k++) {
        if (shuffledProviders[k]) {
          // Removed explicit type annotation for claim medical provider data
          const claimMedicalProviderData = {
              claim: { connect: { id: claim.id } },
              medicalProvider: { connect: { id: shuffledProviders[k].id } },
              date_of_first_visit: faker.date.soon({ days: 2, refDate: dateOfInjury }),
              date_of_last_visit: faker.date.between({ from: dateOfInjury, to: new Date() }),
              notes: faker.lorem.sentence(),
            };
          await prisma.claimMedicalProvider.create({ data: claimMedicalProviderData });
        }
      }
      console.log(`Linked ${numClaimProviders} medical providers to claim ${claim.id}`);

       // Create some dummy FormGenerated entries
       if (faker.datatype.boolean(0.7)) {
         if (!prisma.formGenerated) {
             console.error('CRITICAL: prisma.formGenerated is undefined before creating form entry. Exiting.');
             throw new Error('prisma.formGenerated is undefined');
         }
         // Removed explicit type annotation for form generated data
        const formGeneratedData = {
            form_type: faker.helpers.arrayElement(["SCWCC_Form27", "SCWCC_Form21", "SCWCC_Form50"]),
            injuredWorker: { connect: { id: injuredWorker.id } },
            claim: { connect: { id: claim.id } },
            generatedByProfile: { connect: { id: profile.id } },
            file_name: `Form_${faker.string.alphanumeric(5)}.pdf`,
            form_data_snapshot: {
              reason: "Initial filing test",
              filledFields: faker.number.int({min: 5, max: 20})
            } as Prisma.JsonObject
          };
        await prisma.formGenerated.create({ data: formGeneratedData });
        console.log(`Created dummy FormGenerated entry for claim ${claim.id}`);
      }
    }
  }
  console.log('Injured Worker and Claim seeding completed.');
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
