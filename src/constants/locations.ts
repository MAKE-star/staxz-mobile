export const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export const STATE_AREAS: Record<string, string[]> = {
  'Lagos': [
    'Lekki Phase 1', 'Lekki Phase 2', 'Victoria Island', 'Ikoyi', 'Oniru',
    'Ajah', 'Sangotedo', 'Chevron', 'Surulere', 'Yaba', 'Ojuelegba',
    'Ikeja', 'Ikeja GRA', 'Allen Avenue', 'Maryland', 'Gbagada',
    'Anthony', 'Ogba', 'Magodo', 'Ojodu Berger', 'Festac',
    'Isolo', 'Oshodi', 'Mushin', 'Ikorodu', 'Badagry', 'Apapa',
  ],
  'FCT (Abuja)': [
    'Wuse 2', 'Maitama', 'Asokoro', 'Garki', 'Jabi',
    'Gwarinpa', 'Kubwa', 'Lugbe', 'Apo', 'Utako',
    'Gudu', 'Kado', 'Lokogoma', 'Dawaki', 'Galadimawa',
  ],
  'Rivers': [
    'GRA Phase 1', 'GRA Phase 2', 'GRA Phase 3', 'D-Line',
    'Peter Odili', 'Rumuola', 'Rumuokwuta', 'Wimpey',
    'Trans Amadi', 'Eliozu', 'Rukpokwu', 'Eneka',
  ],
  'Oyo': [
    'Bodija', 'Dugbe', 'Ring Road', 'Ibadan North', 'Mokola',
    'Agodi', 'Jericho', 'Challenge', 'Oluyole', 'Iwo Road',
  ],
  'Kano': [
    'Nassarawa GRA', 'Bompai', 'Fagge', 'Tarauni',
    'Gwale', 'Kano Municipal', 'Sharada', 'Panshekara',
  ],
  'Enugu': [
    'Independence Layout', 'GRA', 'Asata', 'New Haven',
    'Ogui', 'Coal Camp', 'Trans Ekulu', 'Emene',
  ],
  'Anambra': [
    'Awka', 'Onitsha', 'Nnewi', 'Ekwulobia',
    'Aguata', 'Ihiala', 'Ogidi', 'Nkpor',
  ],
  'Delta': [
    'Asaba GRA', 'Asaba', 'Warri', 'Sapele', 'Ughelli',
    'Abraka', 'Agbor', 'Koko', 'Oleh',
  ],
  'Edo': [
    'GRA Benin', 'Ugbowo', 'Uselu', 'Ikpoba Hill',
    'Sapele Road', 'Adesuwa', 'New Benin', 'Egor',
  ],
  'Kaduna': [
    'Kaduna North', 'Kaduna South', 'Barnawa', 'Malali',
    'Ungwan Rimi', 'Television', 'Sabon Gari', 'Rigasa',
  ],
  'Imo': [
    'Owerri', 'New Owerri', 'Ikenegbu', 'Orlu',
    'Okigwe', 'Nnokwa', 'Douglas Road', 'Works Layout',
  ],
  'Abia': [
    'Aba', 'Umuahia', 'Ariaria', 'Osisioma',
    'Ogbor Hill', 'Factory Road', 'Ehere', 'Ohanku',
  ],
  'Cross River': [
    'Calabar South', 'Calabar Municipality', 'Diamond Hill',
    'TINAPA', '8 Miles', 'Satellite Town', 'Watt Market',
  ],
  'Akwa Ibom': [
    'Uyo', 'Eket', 'Ikot Ekpene', 'Oron',
    'Ring Road', 'Wellington Bassey', 'Ewet Housing', 'Itam',
  ],
  'Ogun': [
    'Abeokuta', 'Sagamu', 'Ijebu Ode', 'Ota',
    'Mowe', 'Magboro', 'Sango Otta', 'Ifo',
  ],
};

// Default areas for states not explicitly listed
export const DEFAULT_AREAS = ['GRA', 'Town Centre', 'New Layout', 'Old GRA', 'Secretariat'];

export const getAreasForState = (state: string): string[] => {
  return STATE_AREAS[state] ?? DEFAULT_AREAS;
};
