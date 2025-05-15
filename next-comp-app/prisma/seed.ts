// prisma/seed.ts
import { PrismaClient, Prisma, Role, ClaimStatus, Gender, MaritalStatus, WorkStatus, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// --- Configuration ---
const TARGET_USER_EMAIL = "scottspivey@gmail.com";
const TARGET_USER_FIRST_NAME = "Scott";
const TARGET_USER_LAST_NAME = "Spivey";
const NUMBER_OF_CLAIMS_FOR_TARGET_USER = 10;

// --- Constants from your old seed file (selectively used or replaced by Faker/Enums) ---
const MEDICAL_PROVIDER_TYPES_FROM_OLD_SEED = ['Doctor', 'Hospital', 'Physical Therapist', 'Chiropractor', 'Specialist Clinic'];
const MEDICAL_SPECIALTIES_FROM_OLD_SEED = ['Orthopedics', 'Neurology', 'General Practice', 'Emergency Medicine', 'Radiology', 'Physical Therapy'];

// Helper function from your old seed
function createFullSSN() {
  return `${faker.string.numeric(3)}-${faker.string.numeric(2)}-${faker.string.numeric(4)}`;
}

function formatPhoneNumber() {
    return faker.helpers.fromRegExp(/[0-9]{3}-[0-9]{3}-[0-9]{4}/);
}

// --- Function to Seed Rate Settings (Using YOUR provided data) ---
async function seedRateSettings() {
  console.log('Seeding Rate Settings using provided historical data...');

  // Max Compensation Rates - Directly from your old seed file
  const maxCompRatesRawData: Record<number, number> = {
    1979: 185.00, 1980: 197.00, 1981: 216.00, 1982: 235.00, 1983: 254.38,1984: 268.99, 1985: 287.02, 1986: 294.95, 1987: 308.24, 1988: 319.20,1989: 334.87, 1990: 350.19, 1991: 364.37, 1992: 379.82, 1993: 393.06,1994: 410.26, 1995: 422.48, 1996: 437.79, 1997: 450.62, 1998: 465.18,1999: 483.47, 2000: 507.34, 2001: 532.77, 2002: 549.42, 2003: 563.55,2004: 577.73, 2005: 592.56, 2006: 616.48, 2007: 645.94, 2008: 661.29,2009: 681.36, 2010: 689.71, 2011: 704.92, 2012: 725.47, 2013: 743.72,2014: 752.16, 2015: 766.05, 2016: 784.03, 2017: 806.92, 2018: 838.21,2019: 845.74, 2020: 866.67, 2021: 903.40, 2022: 963.37, 2023: 1035.78, 2024: 1093.67, 2025: 1134.43
  };

  // Discount Rates - Directly from your old seed file
  const discountRatesRawData: Record<number, number> = {
    2005: 0.0500, 2006: 0.0500, 2007: 0.0500, 2008: 0.0500, 2009: 0.0500,2010: 0.0500, 2011: 0.0500, 2012: 0.0500, 2013: 0.0500, 2014: 0.0500,2015: 0.0200, 2016: 0.0200, 2017: 0.0200, 2018: 0.0225, 2019: 0.0249,2020: 0.0200, 2021: 0.0200, 2022: 0.0200, 2023: 0.0394, 2024: 0.0393, 2025: 0.0438
  };

  const maxCompRatesData = Object.entries(maxCompRatesRawData).map(([yearStr, rate]) => {
    const year = parseInt(yearStr, 10);
    // Using January 1st as effective_date for calendar year rates
    return { year: year, rate_type: 'MAX_COMPENSATION', value: new Prisma.Decimal(rate), effective_date: new Date(Date.UTC(year, 0, 1)), description: `Maximum Weekly Compensation Rate for SC in ${year}` };
  });

  const discountRatesData = Object.entries(discountRatesRawData).map(([yearStr, rate]) => {
    const year = parseInt(yearStr, 10);
    // Using January 1st as effective_date for calendar year rates
    return { year: year, rate_type: 'DISCOUNT_RATE_101_PLUS', value: new Prisma.Decimal(rate), effective_date: new Date(Date.UTC(year, 0, 1)), description: `WCC Discount Rate (101+ weeks) for SC in ${year}` };
  });

  // Other Rates - Directly from your old seed file
  const otherRatesFromOldSeed = [
    { year: 2024, rate_type: 'MILEAGE_RATE_SC', value: new Prisma.Decimal('0.685'), effective_date: new Date(Date.UTC(2024, 0, 1)), description: 'Standard Mileage Rate for Medical Travel SC 2024 (Verify with WCC/IRS)', },
    { year: 2024, rate_type: 'MIN_COMP_RATE_SC', value: new Prisma.Decimal('75.00'), effective_date: new Date(Date.UTC(2024, 0, 1)), description: 'Minimum Weekly Compensation Rate for SC 2024 (typically $75 or AWW if lower)', }
  ];

  const allRateData = [...maxCompRatesData, ...discountRatesData, ...otherRatesFromOldSeed];

  for (const data of allRateData) {
    await prisma.rateSetting.upsert({
      where: { year_rate_type: { year: data.year, rate_type: data.rate_type } },
      update: { value: data.value, effective_date: data.effective_date, description: data.description },
      create: data,
    });
    console.log(`Upserted rate for ${data.year} - ${data.rate_type}`);
  }
  console.log('Finished seeding Rate Settings with your provided data.');
}

async function seedScheduledLossBodyParts() {
  console.log('Seeding scheduled loss body parts (CRITICAL: VERIFY/COMPLETE THIS DATA)...');
  const scheduledLossBodyPartsData = [
    { name: "Thumb", statutorySection: "§ 42-9-30(1)", maxWeeksCompensation: 65, category: "Hand" },
    { name: "First Finger (Index)", statutorySection: "§ 42-9-30(2)", maxWeeksCompensation: 40, category: "Hand" },
    { name: "Second Finger (Middle)", statutorySection: "§ 42-9-30(3)", maxWeeksCompensation: 35, category: "Hand" },
    { name: "Third Finger (Ring)", statutorySection: "§ 42-9-30(4)", maxWeeksCompensation: 25, category: "Hand" },
    { name: "Fourth Finger (Little)", statutorySection: "§ 42-9-30(5)", maxWeeksCompensation: 20, category: "Hand" },
    { name: "Great Toe", statutorySection: "§ 42-9-30(6)", maxWeeksCompensation: 35, category: "Foot" },
    { name: "Other Toe (each)", statutorySection: "§ 42-9-30(7)", maxWeeksCompensation: 10, category: "Foot" },
    { name: "Hand", statutorySection: "§ 42-9-30(10)", maxWeeksCompensation: 185, category: "Upper Extremity" },
    { name: "Arm (at or above elbow)", statutorySection: "§ 42-9-30(11)", maxWeeksCompensation: 220, category: "Upper Extremity" },
    { name: "Foot", statutorySection: "§ 42-9-30(13)", maxWeeksCompensation: 140, category: "Lower Extremity" },
    { name: "Leg (at or above knee)", statutorySection: "§ 42-9-30(14)", maxWeeksCompensation: 195, category: "Lower Extremity" },
    { name: "Eye (loss of vision)", statutorySection: "§ 42-9-30(16)", maxWeeksCompensation: 140, category: "Sensory" },
    { name: "Hearing (one ear)", statutorySection: "§ 42-9-30(17)", maxWeeksCompensation: 80, category: "Sensory" },
    { name: "Hearing (both ears)", statutorySection: "§ 42-9-30(17)", maxWeeksCompensation: 165, category: "Sensory" },
    { name: "Loss of one testicle", statutorySection: "§ 42-9-30(21)", maxWeeksCompensation: 60, category: "Other" },
    { name: "Loss of both testicles", statutorySection: "§ 42-9-30(21)", maxWeeksCompensation: 150, category: "Other" },
    { name: "Total loss of use of the back", statutorySection: "§ 42-9-30(19)", maxWeeksCompensation: 300, category: "Back" },
    { name: "Serious bodily disfigurement", statutorySection: "§ 42-9-30(20)", maxWeeksCompensation: 60, category: "Disfigurement" },
    // YOU MUST VERIFY AND COMPLETE THIS LIST FROM S.C. Code Ann. § 42-9-30
  ];

  for (const part of scheduledLossBodyPartsData) {
    await prisma.scheduledLossBodyPart.upsert({
      where: { name: part.name },
      update: part,
      create: part,
    });
  }
  console.log(`${scheduledLossBodyPartsData.length} scheduled loss body parts seeded. VERIFY AND COMPLETE THIS LIST.`);
  return prisma.scheduledLossBodyPart.findMany();
}


async function main() {
  console.log(`Start seeding ...`);

  console.log('Deleting existing data (order matters)...');
  await prisma.claimImpairmentEntry.deleteMany({});
  await prisma.scheduledLossBodyPart.deleteMany({});
  await prisma.claimMedicalProvider.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.savedCalculation.deleteMany({});
  await prisma.formGenerated.deleteMany({});
  await prisma.claim.deleteMany({});
  await prisma.employer.deleteMany({});
  await prisma.injuredWorker.deleteMany({});
  await prisma.medicalProvider.deleteMany({});
  await prisma.rateSetting.deleteMany({});
  // For a truly clean seed for the target user, you might delete their profile and related user records first
  // and then recreate them. Or rely on upsert.
  const existingTargetUser = await prisma.user.findUnique({ where: { email: TARGET_USER_EMAIL }});
  if (existingTargetUser) {
      // More granular deletion if needed, or handle via upsert's update behavior
      await prisma.profile.deleteMany({ where: { userId: existingTargetUser.id }});
      // If subscription is one-to-one and linked to user, deleting user cascades.
      // If you want to only update the profile under an existing user:
      // await prisma.user.update({ where: { email: TARGET_USER_EMAIL }, data: { profile: { delete: true } } });
  }


  await seedRateSettings();
  const allScheduledParts = await seedScheduledLossBodyParts();

  console.log(`Upserting target test user: ${TARGET_USER_EMAIL}`);
  const hashedPassword = await bcrypt.hash("password123", 10);

  const testUser = await prisma.user.upsert({
    where: { email: TARGET_USER_EMAIL },
    update: {
      name: `${TARGET_USER_FIRST_NAME} ${TARGET_USER_LAST_NAME}`,
      emailVerified: new Date(),
      // Update profile if user exists but profile might need changes
      profile: {
        upsert: {
          create: {
            firstName: TARGET_USER_FIRST_NAME,
            lastName: TARGET_USER_LAST_NAME,
            role: Role.ADMIN,
            firm_name: "Spivey & Associates",
            phone_number: formatPhoneNumber(),
          },
          update: {
            firstName: TARGET_USER_FIRST_NAME,
            lastName: TARGET_USER_LAST_NAME,
            role: Role.ADMIN,
            firm_name: "Spivey & Associates",
            phone_number: formatPhoneNumber(),
          }
        }
      },
      subscriptions: {
        upsert: {
             create: {
                plan_id: "pro_power_user_annual_test", 
                status: SubscriptionStatus.ACTIVE,
                stripe_customer_id: `cus_${faker.string.alphanumeric(14)}`,
                stripe_subscription_id: `sub_${faker.string.alphanumeric(14)}`,
                current_period_end: faker.date.future({ years: 1 }),
            },
            update: { // What to update if subscription exists
                plan_id: "pro_power_user_annual_test",
                status: SubscriptionStatus.ACTIVE,
                current_period_end: faker.date.future({ years: 1 }),
            }
        }
      }
    },
    create: {
      email: TARGET_USER_EMAIL,
      name: `${TARGET_USER_FIRST_NAME} ${TARGET_USER_LAST_NAME}`,
      password: hashedPassword,
      emailVerified: new Date(),
      profile: {
        create: {
          firstName: TARGET_USER_FIRST_NAME,
          lastName: TARGET_USER_LAST_NAME,
          role: Role.ADMIN,
          firm_name: "Spivey & Associates",
          phone_number: formatPhoneNumber(),
        },
      },
      subscriptions: {
        create: {
            plan_id: "pro_power_user_annual_test", 
            status: SubscriptionStatus.ACTIVE,
            stripe_customer_id: `cus_${faker.string.alphanumeric(14)}`,
            stripe_subscription_id: `sub_${faker.string.alphanumeric(14)}`,
            current_period_end: faker.date.future({ years: 1 }),
        }
      }
    },
    include: { profile: true },
  });
  
  if (!testUser.profile) {
    console.error(`CRITICAL: Profile for target user ${TARGET_USER_EMAIL} was not created or found. Aborting.`);
    process.exit(1);
  }
  const targetUserProfileId = testUser.profile.id;
  console.log(`Target user ${testUser.profile.firstName} ${testUser.profile.lastName} (Profile ID: ${targetUserProfileId}) upserted.`);

  console.log('Seeding general Employers...');
  const generalEmployers = [];
  const numberOfGeneralEmployers = 5; // From your old seed
  for (let i = 0; i < numberOfGeneralEmployers; i++) {
    const employer = await prisma.employer.create({
      data: {
        name: faker.company.name(),
        fein: `${faker.string.numeric(2)}-${faker.string.numeric(7)}`,
        address_line1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip_code: faker.location.zipCode(),
        phone_number: formatPhoneNumber(),
        insurance_carrier_name: faker.company.name() + " Insurance Co.",
        insurance_policy_number: faker.string.alphanumeric(10).toUpperCase(),
        carrier_code: faker.string.alphanumeric(5).toUpperCase(),
        contact_person_name: faker.person.fullName(),
        contact_person_phone: formatPhoneNumber(),
        contact_person_email: faker.internet.email(),
      },
    });
    generalEmployers.push(employer);
  }
  console.log(`${generalEmployers.length} general employers seeded.`);

  console.log('Seeding general Medical Providers...');
  const generalMedicalProviders = [];
  const numberOfGeneralMedicalProviders = 8; // From your old seed
  for (let i = 0; i < numberOfGeneralMedicalProviders; i++) {
    const provider = await prisma.medicalProvider.create({
      data: {
        name: `Dr. ${faker.person.lastName()}, ${faker.person.suffix() || 'MD'}`,
        type: faker.helpers.arrayElement(MEDICAL_PROVIDER_TYPES_FROM_OLD_SEED),
        specialty: faker.helpers.arrayElement(MEDICAL_SPECIALTIES_FROM_OLD_SEED),
        address_line1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip_code: faker.location.zipCode(),
        phone_number: formatPhoneNumber(),
        npi_number: faker.string.numeric(10),
      },
    });
    generalMedicalProviders.push(provider);
  }
  console.log(`${generalMedicalProviders.length} general medical providers seeded.`);

  console.log(`Seeding ${NUMBER_OF_CLAIMS_FOR_TARGET_USER} claims for user: ${TARGET_USER_EMAIL}`);
  const createdClaimsForTargetUser = [];

  for (let i = 0; i < NUMBER_OF_CLAIMS_FOR_TARGET_USER; i++) {
    const genderValue = faker.helpers.arrayElement(Object.values(Gender)); // Using Enum
    const workerFirstName = faker.person.firstName(genderValue === Gender.MALE ? 'male' : genderValue === Gender.FEMALE ? 'female' : undefined);
    const workerLastName = faker.person.lastName();

    const injuredWorker = await prisma.injuredWorker.create({
      data: {
        profileId: targetUserProfileId,
        first_name: workerFirstName,
        last_name: workerLastName,
        middle_name: faker.datatype.boolean(0.3) ? faker.person.middleName() : undefined,
        ssn: createFullSSN(),
        date_of_birth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        gender: genderValue,
        marital_status: faker.helpers.arrayElement(Object.values(MaritalStatus)), // Using Enum
        address_line1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: "SC",
        zip_code: faker.location.zipCode("#####-####"),
        phone_number: formatPhoneNumber(),
        email: faker.internet.email({firstName: workerFirstName, lastName: workerLastName}),
        occupation: faker.person.jobTitle(),
      },
    });

    const associatedEmployer = faker.helpers.arrayElement(generalEmployers);
    const dateOfInjury = faker.date.past({ years: 3, refDate: new Date(2024,0,1) });
    const mmiDate = faker.datatype.boolean(0.6) ? faker.date.between({ from: new Date(dateOfInjury.getTime() + 60 * 24 * 60 * 60 * 1000), to: new Date(dateOfInjury.getTime() + 500 * 24 * 60 * 60 * 1000) }) : undefined;
    const hasPIR = faker.datatype.boolean(0.4);
    const pirValue = hasPIR ? faker.number.int({ min: 1, max: 50 }) : undefined;
    const bodyPartForInjury = faker.helpers.arrayElement(allScheduledParts.filter(p => p.category !== "Disfigurement" && p.category !== "Other").map(p=>p.name));

    const claim = await prisma.claim.create({
      data: {
        profileId: targetUserProfileId,
        injuredWorkerId: injuredWorker.id,
        employerId: associatedEmployer.id,
        wcc_file_number: `WCC-S${faker.string.alphanumeric(6).toUpperCase()}`,
        carrier_file_number: `CARR-S${faker.string.alphanumeric(7).toUpperCase()}`,
        date_of_injury: dateOfInjury,
        accident_description: `Specific claim for ${TARGET_USER_EMAIL}: ${faker.lorem.sentence(7)}`,
        part_of_body_injured: bodyPartForInjury,
        nature_of_injury: faker.lorem.words(3),
        average_weekly_wage: new Prisma.Decimal(faker.finance.amount({ min: 350, max: 1500, dec: 2 })),
        compensation_rate: new Prisma.Decimal(faker.finance.amount({ min: 200, max: 900, dec: 2 })),
        claim_status: faker.helpers.arrayElement(Object.values(ClaimStatus)),
        mmi_date: mmiDate,
        permanent_impairment_rating: pirValue, // This is the overall rating on claim
        current_work_status: faker.helpers.arrayElement(Object.values(WorkStatus)),
        claimMedicalProviderEntries: {
          create: Array.from({ length: faker.number.int({ min: 0, max: 2 }) }).map(() => ({
            medicalProviderId: faker.helpers.arrayElement(generalMedicalProviders).id,
            date_of_first_visit: faker.date.soon({ days: 10, refDate: dateOfInjury }),
            notes: faker.lorem.sentence(),
          })),
        },
      },
    });
    createdClaimsForTargetUser.push(claim);

    // Create ClaimImpairmentEntry if applicable
    if (hasPIR && pirValue && bodyPartForInjury) {
        const scheduledPartForImpairment = allScheduledParts.find(p => p.name === bodyPartForInjury);
        if (scheduledPartForImpairment) {
            await prisma.claimImpairmentEntry.create({
                data: {
                    claimId: claim.id,
                    scheduledLossBodyPartId: scheduledPartForImpairment.id,
                    percentageImpairment: new Prisma.Decimal(pirValue), // Using the PIR from claim for this example
                    notes: `Impairment: ${pirValue}% to ${scheduledPartForImpairment.name} (specific claim).`
                }
            });
        }
    }
  }
  console.log(`Seeded ${createdClaimsForTargetUser.length} claims (and workers) for ${TARGET_USER_EMAIL}.`);

  console.log(`Seeding notes for ${TARGET_USER_EMAIL}'s data...`);
  for (const claim of createdClaimsForTargetUser) {
    if (faker.datatype.boolean(0.6)) { 
      await prisma.note.create({
        data: {
          profileId: targetUserProfileId,
          claimId: claim.id,
          injuredWorkerId: claim.injuredWorkerId,
          note_type: faker.helpers.arrayElement(["Case Update", "Client Communication", "Medical Record Review", "Strategy"]),
          content: faker.lorem.paragraphs({min:1, max:3}),
        },
      });
    }
  }
   console.log(`Notes for ${TARGET_USER_EMAIL} seeded.`);

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