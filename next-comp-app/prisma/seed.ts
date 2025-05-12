// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client'; // Use standard import
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// --- Configuration for specific user seeding ---
const TARGET_USER_EMAIL = "scottspivey@gmail.com"; // The email of the user to add specific claims for
const NUMBER_OF_CLAIMS_FOR_TARGET_USER = 10;
// --- End Configuration ---

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
  const maxCompRatesRawData: Record<number, number> = {
    1979: 185.00, 1980: 197.00, 1981: 216.00, 1982: 235.00, 1983: 254.38,1984: 268.99, 1985: 287.02, 1986: 294.95, 1987: 308.24, 1988: 319.20,1989: 334.87, 1990: 350.19, 1991: 364.37, 1992: 379.82, 1993: 393.06,1994: 410.26, 1995: 422.48, 1996: 437.79, 1997: 450.62, 1998: 465.18,1999: 483.47, 2000: 507.34, 2001: 532.77, 2002: 549.42, 2003: 563.55,2004: 577.73, 2005: 592.56, 2006: 616.48, 2007: 645.94, 2008: 661.29,2009: 681.36, 2010: 689.71, 2011: 704.92, 2012: 725.47, 2013: 743.72,2014: 752.16, 2015: 766.05, 2016: 784.03, 2017: 806.92, 2018: 838.21,2019: 845.74, 2020: 866.67, 2021: 903.40, 2022: 963.37, 2023: 1035.78,2024: 1093.67, 2025: 1134.43
  };
  const discountRatesRawData: Record<number, number> = {
    2005: 0.0500, 2006: 0.0500, 2007: 0.0500, 2008: 0.0500, 2009: 0.0500,2010: 0.0500, 2011: 0.0500, 2012: 0.0500, 2013: 0.0500, 2014: 0.0500,2015: 0.0200, 2016: 0.0200, 2017: 0.0200, 2018: 0.0225, 2019: 0.0249,2020: 0.0200, 2021: 0.0200, 2022: 0.0200, 2023: 0.0394, 2024: 0.0393,2025: 0.0438
  };
  const maxCompRatesData = Object.entries(maxCompRatesRawData).map(([yearStr, rate]) => {
    const year = parseInt(yearStr, 10);
    return { year: year, rate_type: 'MAX_COMPENSATION', value: new Prisma.Decimal(rate), effective_date: new Date(`${year}-01-01T00:00:00.000Z`), description: `Maximum Weekly Compensation Rate for SC in ${year}`, };
  });
  const discountRatesData = Object.entries(discountRatesRawData).map(([yearStr, rate]) => {
    const year = parseInt(yearStr, 10);
    return { year: year, rate_type: 'DISCOUNT_RATE_101_PLUS', value: new Prisma.Decimal(rate), effective_date: new Date(`${year}-01-01T00:00:00.000Z`), description: `WCC Discount Rate (101+ weeks) for SC in ${year}`, };
  });
  const allRateData = [...maxCompRatesData, ...discountRatesData];
  for (const data of allRateData) {
    await prisma.rateSetting.upsert({
      where: { year_rate_type: { year: data.year, rate_type: data.rate_type } },
      update: { value: data.value, effective_date: data.effective_date, description: data.description }, create: data,
    });
    console.log(`Upserted rate for ${data.year} - ${data.rate_type}`);
  }
  const otherRates = [
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
  // Optional: Clear data. Use with caution.
  // await prisma.formGenerated.deleteMany();
  // await prisma.claimMedicalProvider.deleteMany();
  // await prisma.note.deleteMany();
  // await prisma.savedCalculation.deleteMany();
  // await prisma.claim.deleteMany(); // Deleting claims before specific user seeding if they are re-runnable
  // await prisma.injuredWorker.deleteMany(); // Deleting workers before specific user seeding
  // await prisma.medicalProvider.deleteMany();
  // await prisma.employer.deleteMany();
  // await prisma.rateSetting.deleteMany();
  // await prisma.profile.deleteMany();
  // await prisma.user.deleteMany();

  await seedRateSettings();

  // --- Create General Users and Profiles (if needed for other testing) ---
  const numberOfGeneralProfiles = 2; // Create a couple of general profiles
  const generalProfiles = [];
  for (let i = 0; i < numberOfGeneralProfiles; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({firstName: `generalUser${i}`, lastName: 'seed'}),
        name: faker.person.fullName(),
      },
    });
    const profileData = {
        userId: user.id,
        full_name: user.name,
        firm_name: faker.company.name() + ' Associates',
        role: faker.helpers.arrayElement(['paralegal', 'adjuster']),
        avatar_url: faker.image.avatar(),
        phone_number: formatPhoneNumber(),
      };
    const profile = await prisma.profile.create({ data: profileData });
    generalProfiles.push(profile);
    console.log(`Created general user ${user.email} with profile ${profile.id}`);
  }
  console.log('General User and Profile seeding completed.');

  // --- Create General Employers ---
  console.log('Attempting to seed general Employers...');
  const numberOfEmployers = 5; // Create some general employers
  const employers = [];
  for (let i = 0; i < numberOfEmployers; i++) {
    const companyName = faker.company.name();
    const employerData = {
        name: companyName,
        fein: `${faker.string.numeric(2)}-${faker.string.numeric(7)}`,
        address_line1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.helpers.arrayElement(US_STATES),
        zip_code: faker.location.zipCode(),
        phone_number: formatPhoneNumber(),
        insurance_carrier_name: faker.company.name() + ' Insurance',
        insurance_policy_number: faker.string.alphanumeric(10).toUpperCase(),
        carrier_code: `C${faker.string.numeric(3)}`,
        contact_person_name: faker.person.fullName(),
        contact_person_phone: formatPhoneNumber(),
        contact_person_email: faker.internet.email({firstName: 'contact', lastName: companyName.split(' ')[0] || `emp${i}`}),
      };
     if (!prisma.employer) {
       console.error('CRITICAL: prisma.employer is undefined. Exiting.');
       throw new Error('prisma.employer is undefined');
     }
    const employer = await prisma.employer.create({ data: employerData });
    employers.push(employer);
    console.log(`Created general employer ${employer.name}`);
  }
  console.log('General Employer seeding completed.');

  // --- Create General Medical Providers ---
  console.log('Attempting to seed general Medical Providers...');
   if (!prisma.medicalProvider) {
     console.error('CRITICAL: prisma.medicalProvider is undefined. Exiting.');
     throw new Error('prisma.medicalProvider is undefined');
   }
  const numberOfMedicalProviders = 8; // Create some general medical providers
  const medicalProviders = [];
  for (let i = 0; i < numberOfMedicalProviders; i++) {
    const providerLastName = faker.person.lastName();
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
    console.log(`Created general medical provider ${provider.name}`);
  }
  console.log('General Medical Provider seeding completed.');

  // --- Seed specific claims for TARGET_USER_EMAIL ---
  console.log(`Attempting to seed ${NUMBER_OF_CLAIMS_FOR_TARGET_USER} claims for user: ${TARGET_USER_EMAIL}`);
  const targetUser = await prisma.user.findUnique({
    where: { email: TARGET_USER_EMAIL.toLowerCase() },
    include: { profile: true }, // Include the profile directly
  });

  if (targetUser && targetUser.profile) {
    const targetProfile = targetUser.profile;
    console.log(`Found profile ${targetProfile.id} for user ${TARGET_USER_EMAIL}. Creating claims...`);

    if (employers.length === 0) {
        console.error("No general employers available to link claims to. Please ensure employers are seeded first.");
    }

    for (let i = 0; i < NUMBER_OF_CLAIMS_FOR_TARGET_USER; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      const injuredWorkerData = {
          profile: { connect: { id: targetProfile.id } },
          first_name: firstName,
          last_name: lastName, // Ensure this matches schema (snake_case)
          middle_name: faker.datatype.boolean(0.3) ? faker.person.middleName() : undefined,
          ssn: createFullSSN(),
          date_of_birth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
          phone_number: formatPhoneNumber(),
          work_phone_number: faker.datatype.boolean(0.5) ? formatPhoneNumber() : undefined,
          email: faker.internet.email({firstName, lastName}),
          occupation: faker.person.jobTitle(),
          address_line1: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.helpers.arrayElement(SC_STATES),
          zip_code: faker.location.zipCode("#####"),
      };
      if (!prisma.injuredWorker) {
        console.error('CRITICAL: prisma.injuredWorker is undefined. Exiting.');
        throw new Error('prisma.injuredWorker is undefined');
      }
      const injuredWorker = await prisma.injuredWorker.create({ data: injuredWorkerData });
      console.log(`Created InjuredWorker ${injuredWorker.id} for ${TARGET_USER_EMAIL}`);

      const associatedEmployer = employers.length > 0 ? faker.helpers.arrayElement(employers) : null;
      const dateOfInjury = faker.date.past({ years: 2 });

      const claimData = {
          injuredWorker: { connect: { id: injuredWorker.id } },
          profile: { connect: { id: targetProfile.id } },
          employer: associatedEmployer ? { connect: { id: associatedEmployer.id } } : undefined,
          wcc_file_number: `WCC-SPEC-${faker.string.alphanumeric(6).toUpperCase()}`,
          carrier_file_number: `CARRIER-SPEC-${faker.string.alphanumeric(8).toUpperCase()}`,
          date_of_injury: dateOfInjury,
          accident_description: `Specific claim for ${TARGET_USER_EMAIL}: ${faker.lorem.sentence(5)}`,
          part_of_body_injured: faker.lorem.words(2),
          nature_of_injury: faker.lorem.words(1),
          mmi_date: faker.datatype.boolean(0.4) ? faker.date.future({ years: 1, refDate: dateOfInjury }) : undefined,
          average_weekly_wage: new Prisma.Decimal(faker.finance.amount({ min: 400, max: 1200, dec: 2 })),
          compensation_rate: new Prisma.Decimal(faker.finance.amount({ min: 250, max: 800, dec: 2 })),
          claim_status: faker.helpers.arrayElement(CLAIM_STATUSES),
      };
      if (!prisma.claim) {
        console.error('CRITICAL: prisma.claim is undefined. Exiting.');
        throw new Error('prisma.claim is undefined');
      }
      const claim = await prisma.claim.create({ data: claimData });
      console.log(`Created Claim ${claim.id} for ${TARGET_USER_EMAIL}, linked to Worker ${injuredWorker.id}`);

      if (medicalProviders.length > 0 && prisma.claimMedicalProvider) {
        const numSpecificClaimProviders = faker.number.int({ min: 0, max: 2 });
        const shuffledSpecificProviders = faker.helpers.shuffle(medicalProviders);
        for (let k = 0; k < numSpecificClaimProviders; k++) {
            if (shuffledSpecificProviders[k]) {
                await prisma.claimMedicalProvider.create({
                    data: {
                        claim: { connect: { id: claim.id }},
                        medicalProvider: { connect: { id: shuffledSpecificProviders[k].id }},
                        date_of_first_visit: faker.date.soon({days: 2, refDate: dateOfInjury}),
                        notes: "Initial consultation for specific claim."
                    }
                });
            }
        }
        console.log(`Linked ${numSpecificClaimProviders} medical providers to specific claim ${claim.id}`);
      }
    }
    console.log(`Successfully seeded ${NUMBER_OF_CLAIMS_FOR_TARGET_USER} claims for user ${TARGET_USER_EMAIL}.`);

  } else {
    console.warn(`Target user with email ${TARGET_USER_EMAIL} (or their profile) not found. Skipping specific claim seeding for this user. Please ensure the user is registered and has a profile.`);
  }

  console.log("Starting general claim seeding for other profiles (if any)...");
  const generalProfilesToSeedFor = generalProfiles.filter(p => p.id !== targetUser?.profile?.id);

  for (const profile of generalProfilesToSeedFor) {
    const numberOfInjuredWorkersPerGeneralProfile = 2;
    for (let i = 0; i < numberOfInjuredWorkersPerGeneralProfile; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const injuredWorkerData = {
          profile: { connect: { id: profile.id } },
          first_name: firstName,
          last_name: lastName, // Corrected from lastName (camelCase) to last_name (snake_case)
          ssn: createFullSSN(),
          date_of_birth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
          phone_number: formatPhoneNumber(),
          email: faker.internet.email({firstName, lastName}),
          // Add other optional fields for general injured workers if desired
          // middle_name: faker.datatype.boolean(0.2) ? faker.person.middleName() : undefined,
          // work_phone_number: faker.datatype.boolean(0.3) ? formatPhoneNumber() : undefined,
          // occupation: faker.person.jobTitle(),
          // address_line1: faker.location.streetAddress(),
          // city: faker.location.city(),
          // state: faker.helpers.arrayElement(SC_STATES),
          // zip_code: faker.location.zipCode("#####"),
      };
      const injuredWorker = await prisma.injuredWorker.create({ data: injuredWorkerData });
      const associatedEmployer = employers.length > 0 ? faker.helpers.arrayElement(employers) : null;
      const dateOfInjury = faker.date.past({ years: 1 });
      const claimData = {
        injuredWorker: { connect: { id: injuredWorker.id } },
        profile: { connect: { id: profile.id } },
        employer: associatedEmployer ? { connect: { id: associatedEmployer.id } } : undefined,
        wcc_file_number: `WCC-GEN-${faker.string.alphanumeric(7).toUpperCase()}`,
        date_of_injury: dateOfInjury,
      };
      await prisma.claim.create({ data: claimData });
      console.log(`Created general claim for profile ${profile.id}`);
    }
  }
  console.log('General claim seeding for other profiles completed.');

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
