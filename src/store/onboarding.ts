import { create } from 'zustand';

interface OnboardingData {
  business_name: string;
  business_type: string;
  service_modes: string[];
  base_fee: string;
  cac_number: string;
  bio: string;
  service_categories: string[];
  whatsapp_number: string;
  location_text: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_code: string;
}

interface OnboardingStore {
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
}

const INIT: OnboardingData = {
  business_name: '', business_type: '', service_modes: [],
  base_fee: '', cac_number: '', bio: '', service_categories: [],
  whatsapp_number: '+234', location_text: '',
  bank_account_name: '', bank_account_number: '', bank_code: '',
};

export const useOnboarding = create<OnboardingStore>((set) => ({
  data: INIT,
  update: (partial) => set(s => ({ data: { ...s.data, ...partial } })),
  reset: () => set({ data: INIT }),
}));
