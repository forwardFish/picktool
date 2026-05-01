import { getConfiguredBaseUrl } from '@/lib/runtime/base-url';

function isLocalHttpUrl(value: string | undefined) {
  if (!value) {
    return false;
  }

  return (
    value.startsWith('http://localhost') ||
    value.startsWith('http://127.0.0.1')
  );
}

export function shouldUseSecureCookies() {
  const explicitBaseUrl =
    process.env.GOOGLE_REDIRECT_URI || getConfiguredBaseUrl();

  if (explicitBaseUrl) {
    if (isLocalHttpUrl(explicitBaseUrl)) {
      return false;
    }

    if (explicitBaseUrl.startsWith('https://')) {
      return true;
    }
  }

  return process.env.NODE_ENV === 'production';
}
