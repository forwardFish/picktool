import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function logCreemProductReminder() {
  if (!process.env.CREEM_API_KEY) {
    console.log(
      'Skipping live product reminder because CREEM_API_KEY is not set. Demo checkout remains available.'
    );
    return;
  }

  console.log('Creem products are managed in the Creem dashboard.');
  console.log(
    'Create and map these product IDs in .env: CREEM_PRODUCT_ONE_TIME_ID, CREEM_PRODUCT_MONTHLY_ID, CREEM_PRODUCT_ANNUAL_ID.'
  );
}

async function seed() {
  const email = 'test@test.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        name: 'Parent Tester',
        email: email,
        passwordHash: passwordHash,
        role: "owner",
        is18PlusConfirmed: true,
        country: 'US',
        timezone: 'America/Los_Angeles',
        locale: 'en-US'
      },
    ])
    .returning();

  console.log('Initial user created.');

  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Team',
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: 'owner',
  });

  await logCreemProductReminder();
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
