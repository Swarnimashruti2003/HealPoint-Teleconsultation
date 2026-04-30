import { firestoreSet } from './firebase-rest';
import { MOCK_DOCTORS } from './seed-data';

export const seedDoctors = async () => {
  console.log('Starting seed...');
  for (const doctor of MOCK_DOCTORS) {
    try {
      await firestoreSet('doctors', doctor.id, doctor);
      console.log(`Seeded doctor: ${doctor.name}`);
    } catch (error) {
      console.error(`Error seeding doctor ${doctor.name}:`, error);
      throw error;
    }
  }
  return true;
};
