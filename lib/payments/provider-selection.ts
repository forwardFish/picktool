import type { BillingProviderName } from './provider';

export type BillingSelectionInput = {
  demoMode: boolean;
  requested: BillingProviderName;
  freemiusConfigured: boolean;
  creemConfigured: boolean;
  allowCreemFallback: boolean;
};

export type BillingSelectionResult = {
  requested: BillingProviderName;
  active: BillingProviderName;
  fallbackApplied: boolean;
  rollbackEnabled: boolean;
};

export function resolveBillingProviderSelection(
  input: BillingSelectionInput
): BillingSelectionResult {
  if (input.demoMode) {
    return {
      requested: input.requested,
      active: input.requested,
      fallbackApplied: false,
      rollbackEnabled: input.allowCreemFallback,
    };
  }

  const providerConfigured =
    input.requested === 'freemius'
      ? input.freemiusConfigured
      : input.creemConfigured;

  if (providerConfigured) {
    return {
      requested: input.requested,
      active: input.requested,
      fallbackApplied: false,
      rollbackEnabled: input.allowCreemFallback,
    };
  }

  if (
    input.requested !== 'creem' &&
    input.allowCreemFallback &&
    input.creemConfigured
  ) {
    return {
      requested: input.requested,
      active: 'creem',
      fallbackApplied: true,
      rollbackEnabled: true,
    };
  }

  return {
    requested: input.requested,
    active: input.requested,
    fallbackApplied: false,
    rollbackEnabled: input.allowCreemFallback,
  };
}
