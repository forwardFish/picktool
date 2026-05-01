import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';
import readline from 'node:readline';
import crypto from 'node:crypto';
import path from 'node:path';

const execAsync = promisify(exec);
const LEGACY_LOCAL_POSTGRES_URL =
  'postgres://postgres:postgres@localhost:54322/postgres';

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

async function questionWithDefault(
  query: string,
  defaultValue: string
): Promise<string> {
  const answer = await question(`${query} [${defaultValue}]: `);
  return answer || defaultValue;
}

async function confirm(query: string, defaultValue = false) {
  const suffix = defaultValue ? 'Y/n' : 'y/N';
  const answer = await question(`${query} (${suffix}): `);
  if (!answer) {
    return defaultValue;
  }

  return answer.toLowerCase().startsWith('y');
}

async function setupLegacyLocalPostgres() {
  console.log('Checking Docker for the legacy local Postgres fallback...');
  try {
    await execAsync('docker --version');
  } catch {
    console.error('Docker is not installed. Install Docker Desktop and try again.');
    process.exit(1);
  }

  const dockerComposeContent = `services:
  postgres:
    image: postgres:16.4-alpine
    container_name: pathnook_postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

  await fs.writeFile(
    path.join(process.cwd(), 'docker-compose.yml'),
    dockerComposeContent,
    'utf8'
  );

  console.log('Starting Docker container with `docker compose up -d`...');
  try {
    await execAsync('docker compose up -d');
  } catch {
    console.error('Failed to start Docker compose for legacy local Postgres.');
    process.exit(1);
  }
}

async function resolveDatabaseConfig() {
  console.log('Step 1: Choose the primary database flow.');
  console.log('Recommended: Vercel Marketplace Neon Postgres via DATABASE_URL.');
  console.log('Legacy fallback: local Docker Postgres via POSTGRES_URL.');

  const choice = (
    await questionWithDefault(
      'Use Vercel-managed Neon (V) or legacy local Docker Postgres (L)?',
      'V'
    )
  ).toLowerCase();

  if (choice === 'l') {
    await setupLegacyLocalPostgres();
    return {
      databaseUrl: '',
      postgresUrl: LEGACY_LOCAL_POSTGRES_URL,
      usingLegacyLocalFallback: true,
    };
  }

  console.log(
    'Open Vercel Storage and attach Neon Postgres to the family-education project before continuing.'
  );
  const databaseUrl = await question(
    'Enter your Neon DATABASE_URL from Vercel: '
  );

  if (!databaseUrl) {
    console.error('DATABASE_URL is required for the Vercel-first setup flow.');
    process.exit(1);
  }

  return {
    databaseUrl,
    postgresUrl: '',
    usingLegacyLocalFallback: false,
  };
}

async function collectBlobConfig(usingLegacyLocalFallback: boolean) {
  console.log('Step 2: Configure file storage.');
  if (usingLegacyLocalFallback) {
    console.log(
      'Legacy local mode keeps FILE_STORAGE_BACKEND=local. Blob stays optional.'
    );
    return {
      fileStorageBackend: 'local',
      blobToken: '',
    };
  }

  const blobToken = await question('Enter your Vercel BLOB_READ_WRITE_TOKEN: ');
  if (!blobToken) {
    console.error('BLOB_READ_WRITE_TOKEN is required for the Vercel-first setup flow.');
    process.exit(1);
  }

  return {
    fileStorageBackend: 'blob',
    blobToken,
  };
}

async function collectGoogleConfig(baseUrl: string) {
  console.log('Step 3: Configure Google OAuth.');
  const clientId = await question('Enter GOOGLE_CLIENT_ID (leave blank to skip): ');
  const clientSecret = await question(
    'Enter GOOGLE_CLIENT_SECRET (leave blank to skip): '
  );
  const redirectUriDefault = `${baseUrl.replace(/\/$/, '')}/api/auth/google/callback`;
  const redirectUri =
    clientId && clientSecret
      ? await questionWithDefault(
          'Enter GOOGLE_REDIRECT_URI',
          redirectUriDefault
        )
      : '';

  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

async function collectCreemConfig() {
  console.log('Step 4: Configure Creem billing.');
  const apiKey = await question('Enter CREEM_API_KEY (leave blank to skip): ');
  const webhookSecret = apiKey
    ? await question('Enter CREEM_WEBHOOK_SECRET: ')
    : '';
  const useTestMode = apiKey
    ? await confirm('Use Creem test mode for this environment?', false)
    : false;
  const productOneTimeId = apiKey
    ? await question('Enter CREEM_PRODUCT_ONE_TIME_ID: ')
    : '';
  const productMonthlyId = apiKey
    ? await question('Enter CREEM_PRODUCT_MONTHLY_ID: ')
    : '';
  const productAnnualId = apiKey
    ? await question('Enter CREEM_PRODUCT_ANNUAL_ID: ')
    : '';

  return {
    apiKey,
    webhookSecret,
    testMode: useTestMode ? '1' : '0',
    productOneTimeId,
    productMonthlyId,
    productAnnualId,
  };
}

function generateAuthSecret() {
  console.log('Step 5: Generating AUTH_SECRET.');
  return crypto.randomBytes(32).toString('hex');
}

async function writeEnvFile(lines: string[]) {
  console.log('Step 6: Writing environment variables to .env');
  await fs.writeFile(path.join(process.cwd(), '.env'), `${lines.join('\n')}\n`, 'utf8');
  console.log('.env file created.');
}

async function main() {
  const databaseConfig = await resolveDatabaseConfig();
  const defaultBaseUrl = databaseConfig.usingLegacyLocalFallback
    ? 'http://localhost:3000'
    : 'https://www.pathnook.com';
  const baseUrl = await questionWithDefault('Step 2: Enter BASE_URL', defaultBaseUrl);
  const storageConfig = await collectBlobConfig(
    databaseConfig.usingLegacyLocalFallback
  );
  const googleConfig = await collectGoogleConfig(baseUrl);
  const creemConfig = await collectCreemConfig();
  const authSecret = generateAuthSecret();

  const envLines = [
    '# Pathnook environment bootstrap',
    '# Production should use Vercel + Neon + Blob.',
    `DATABASE_URL=${databaseConfig.databaseUrl}`,
    '# POSTGRES_URL is kept only as a legacy fallback path.',
    `POSTGRES_URL=${databaseConfig.postgresUrl}`,
    `BASE_URL=${baseUrl}`,
    `AUTH_SECRET=${authSecret}`,
    '',
    '# Google OAuth',
    `GOOGLE_CLIENT_ID=${googleConfig.clientId}`,
    `GOOGLE_CLIENT_SECRET=${googleConfig.clientSecret}`,
    `GOOGLE_REDIRECT_URI=${googleConfig.redirectUri}`,
    '',
    '# Creem billing',
    `CREEM_API_KEY=${creemConfig.apiKey}`,
    `CREEM_WEBHOOK_SECRET=${creemConfig.webhookSecret}`,
    `CREEM_TEST_MODE=${creemConfig.testMode}`,
    `CREEM_PRODUCT_ONE_TIME_ID=${creemConfig.productOneTimeId}`,
    `CREEM_PRODUCT_MONTHLY_ID=${creemConfig.productMonthlyId}`,
    `CREEM_PRODUCT_ANNUAL_ID=${creemConfig.productAnnualId}`,
    '',
    '# Pathnook runtime',
    'SUPPORT_EMAIL=support@example.com',
    'DEFAULT_LOCALE=en-US',
    'DEFAULT_COUNTRY=US',
    'DEFAULT_TIMEZONE=America/Los_Angeles',
    'MODEL_PROVIDER=openai',
    'MODEL_DEFAULT=',
    'OPENAI_API_KEY=',
    'OPENAI_MODEL_VISION=',
    'OPENAI_BASE_URL=',
    'MOONSHOT_API_KEY=',
    'MOONSHOT_BASE_URL=https://api.moonshot.cn/v1',
    'MOONSHOT_MODEL=kimi-k2.5',
    'MATHPIX_APP_ID=',
    'MATHPIX_APP_KEY=',
    'GOOGLE_APPLICATION_CREDENTIALS=',
    'DATA_RETENTION_DAYS=30',
    'FAMILY_EDU_DEMO_MODE=0',
    'FAMILY_EDU_DEMO_AUTO_AUTH=0',
    'FAMILY_EDU_RUNTIME_ROOT=',
    `FILE_STORAGE_BACKEND=${storageConfig.fileStorageBackend}`,
    `BLOB_READ_WRITE_TOKEN=${storageConfig.blobToken}`,
    'NODE_USE_ENV_PROXY=1',
    '',
    '# Optional Vercel CLI targeting',
    'VERCEL_ORG_ID=team_OybJGhOtR1CiHCOFomLcXNF4',
    'VERCEL_PROJECT_ID=prj_uVnuKJSGB3bjvNwSB3tpPZTFVGHw',
  ];

  await writeEnvFile(envLines);
  console.log('Setup completed successfully.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
