import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ViewStyle,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants';

// Comprehensive Nigerian locations list
const NIGERIA_LOCATIONS = [
  // Lagos
  'Lagos Island, Lagos', 'Victoria Island, Lagos', 'Ikoyi, Lagos',
  'Lekki Phase 1, Lagos', 'Lekki Phase 2, Lagos', 'Ajah, Lagos',
  'Sangotedo, Lagos', 'Chevron Drive, Lagos', 'Oniru, Lagos',
  'Yaba, Lagos', 'Surulere, Lagos', 'Ojuelegba, Lagos',
  'Mushin, Lagos', 'Oshodi, Lagos', 'Isolo, Lagos',
  'Ago Palace Way, Lagos', 'Festac Town, Lagos', 'Amuwo Odofin, Lagos',
  'Apapa, Lagos', 'Ikeja, Lagos', 'GRA Ikeja, Lagos',
  'Allen Avenue, Lagos', 'Maryland, Lagos', 'Gbagada, Lagos',
  'Anthony Village, Lagos', 'Ogba, Lagos', 'Agege, Lagos',
  'Ilupeju, Lagos', 'Ikorodu, Lagos', 'Badagry, Lagos',
  'Okokomaiko, Lagos', 'Ipaja, Lagos', 'Ayobo, Lagos',
  'Egbeda, Lagos', 'Magodo, Lagos', 'Ojodu Berger, Lagos',
  'Epe, Lagos', 'Ibeju-Lekki, Lagos',
  // Abuja
  'Wuse 2, Abuja', 'Maitama, Abuja', 'Garki, Abuja',
  'Asokoro, Abuja', 'Gwarinpa, Abuja', 'Jabi, Abuja',
  'Kubwa, Abuja', 'Lugbe, Abuja',
  // Other cities
  'Kano, Kano State', 'Enugu, Enugu State',
  'Port Harcourt, Rivers State', 'Ibadan, Oyo State',
  'Kaduna, Kaduna State', 'Benin City, Edo State',
  'Warri, Delta State', 'Abeokuta, Ogun State',
  'Owerri, Imo State', 'Calabar, Cross River State',
  'Uyo, Akwa Ibom State', 'Ilorin, Kwara State',
  'Jos, Plateau State', 'Maiduguri, Borno State',
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  containerStyle?: ViewStyle;
}

export const LocationAutocomplete: React.FC<Props> = ({
  value, onChange, label, placeholder = 'e.g. Lekki Phase 1, Lagos', containerStyle,
}) => {
  const [query, setQuery]           = useState(value);
  const [open, setOpen]             = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChange = (text: string) => {
    setQuery(text);
    onChange(text);
    if (text.length >= 2) {
      const matches = NIGERIA_LOCATIONS.filter(loc =>
        loc.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 6);
      setSuggestions(matches);
      setOpen(matches.length > 0);
    } else {
      setOpen(false);
      setSuggestions([]);
    }
  };

  const select = (loc: string) => {
    setQuery(loc);
    onChange(loc);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text2}
        onFocus={() => query.length >= 2 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((loc) => (
            <TouchableOpacity
              key={loc}
              style={styles.suggestion}
              onPress={() => select(loc)}
            >
              <Text style={styles.suggestionIcon}>📍</Text>
              <Text style={styles.suggestionText}>{loc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '500', color: COLORS.text1, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: SPACING.md, fontSize: 15, color: COLORS.text0, minHeight: 50,
  },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    marginTop: 2,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  suggestion: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    padding: SPACING.md, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  suggestionIcon: { fontSize: 14 },
  suggestionText: { fontSize: 14, color: COLORS.text0 },
});
