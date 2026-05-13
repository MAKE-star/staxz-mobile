import { create } from 'zustand';

export interface OnboardingData {
  // Step 1 — Business Info
  business_name: string;
  business_type: 'salon' | 'independent' | '';
  cac_number: string;
  bio: string;
  years_experience: string;

  // Step 2 — Services
  service_categories: string[];
  service_modes: string[];
  base_fee_kobo: string; // stored as naira string, converted on submit

  // Step 3 — Portfolio (handled separately via upload)

  // Step 4 — WhatsApp
  whatsapp_number: string;
  location_text: string;
  location_lat?: number;
  location_lng?: number;

  // Step 5 — Bank
  bank_account_name: string;
  bank_account_number: string;
  bank_code: string;
}

interface OnboardingStore {
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
}

const INITIAL: OnboardingData = {
  business_name: '', business_type: '', cac_number: '', bio: '', years_experience: '',
  service_categories: [], service_modes: [], base_fee_kobo: '',
  whatsapp_number: '+234', location_text: '', location_lat: undefined, location_lng: undefined,
  bank_account_name: '', bank_account_number: '', bank_code: '',
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  data: INITIAL,
  update: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
  reset: () => set({ data: INITIAL }),
}));
