import { collection, doc, setDoc, getDocs, deleteDoc, query } from 'firebase/firestore';
import { db } from './firebase';

const DOCTORS_SEED = [
  {
    id: 'dr-priya-sharma',
    name: 'Dr. Priya Sharma',
    specialty: 'Cardiologist',
    qualifications: 'MD, DM (Cardiology)',
    experience: '12 Years',
    hospital: 'Apollo Delhi',
    fee: 800,
    rating: 4.8,
    totalReviews: 240,
    languages: ['Hindi', 'English', 'Punjabi'],
    consultationModes: ['video', 'audio', 'chat'],
    image: 'https://picsum.photos/seed/dr1/400/400',
    availabilityStatus: 'Available at 09:00 AM',
    location: 'Delhi, IN'
  },
  {
    id: 'dr-arjun-mehta',
    name: 'Dr. Arjun Mehta',
    specialty: 'Neurologist',
    qualifications: 'MD, DM (Neurology)',
    experience: '15 Years',
    hospital: 'Fortis Mumbai',
    fee: 1200,
    rating: 4.6,
    totalReviews: 180,
    languages: ['Hindi', 'English', 'Marathi'],
    consultationModes: ['video', 'audio', 'chat'],
    image: 'https://picsum.photos/seed/dr2/400/400',
    availabilityStatus: 'Online now',
    location: 'Mumbai, IN'
  },
  {
    id: 'dr-kavita-nair',
    name: 'Dr. Kavita Nair',
    specialty: 'Dermatologist',
    qualifications: 'MD (Dermatology)',
    experience: '8 Years',
    hospital: 'Manipal Bangalore',
    fee: 600,
    rating: 4.9,
    totalReviews: 150,
    languages: ['Hindi', 'English', 'Kannada'],
    consultationModes: ['video', 'audio', 'chat'],
    image: 'https://picsum.photos/seed/dr3/400/400',
    availabilityStatus: 'Next: 11:30 AM',
    location: 'Bangalore, IN'
  },
  {
    id: 'dr-rajesh-gupta',
    name: 'Dr. Rajesh Gupta',
    specialty: 'General Physician',
    qualifications: 'MBBS, MD',
    experience: '20 Years',
    hospital: 'Max Noida',
    fee: 400,
    rating: 4.5,
    totalReviews: 400,
    languages: ['Hindi', 'English', 'Bengali'],
    consultationModes: ['video', 'audio', 'chat'],
    image: 'https://picsum.photos/seed/dr4/400/400',
    availabilityStatus: 'Online now',
    location: 'Noida, IN'
  },
  {
    id: 'dr-sunita-patel',
    name: 'Dr. Sunita Patel',
    specialty: 'Gynecologist',
    qualifications: 'MS (OBG)',
    experience: '11 Years',
    hospital: 'Lilavati Mumbai',
    fee: 900,
    rating: 4.7,
    totalReviews: 210,
    languages: ['Hindi', 'English', 'Gujarati'],
    consultationModes: ['video', 'audio', 'chat'],
    image: 'https://picsum.photos/seed/dr5/400/400',
    availabilityStatus: 'Available now',
    location: 'Mumbai, IN'
  },
  {
    id: 'dr-vikram-singh',
    name: 'Dr. Vikram Singh',
    specialty: 'Orthopedic',
    qualifications: 'MS (Ortho)',
    experience: '18 Years',
    hospital: 'AIIMS Delhi',
    fee: 1000,
    rating: 4.4,
    totalReviews: 320,
    languages: ['Hindi', 'English', 'Rajasthani'],
    consultationModes: ['video', 'audio', 'chat'],
    image: 'https://picsum.photos/seed/dr6/400/400',
    availabilityStatus: 'Next: 02:00 PM',
    location: 'Delhi, IN'
  }
];

const generateWeeklySlots = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
  
  return days.map(day => ({
    day,
    slots: times.map(time => ({
      time,
      available: Math.random() > 0.3
    }))
  }));
};

const REVIEWS_POOL = [
  { patientName: 'Amit S.', rating: 5, comment: 'Excellent doctor, very professional and empathetic.', date: '2 days ago' },
  { patientName: 'Ritika K.', rating: 4, comment: 'Wait time was a bit long but the consultation was thorough.', date: '1 week ago' },
  { patientName: 'Suresh V.', rating: 5, comment: 'Highly recommended for any chronic issues.', date: '3 days ago' },
  { patientName: 'Neha M.', rating: 4.5, comment: 'The diagnosis was very accurate. Feeling much better now.', date: 'Today' }
];

export const seedDoctors = async () => {
  try {
    const doctorsCol = collection(db, 'doctors');
    
    // Clear existing (optional but good for a clean seed)
    const existingDocs = await getDocs(doctorsCol);
    for (const doc of existingDocs.docs) {
      await deleteDoc(doc.ref);
    }

    for (const docData of DOCTORS_SEED) {
      const doctorWithExtras = {
        ...docData,
        weeklyAvailability: generateWeeklySlots(),
        reviews: REVIEWS_POOL.sort(() => 0.5 - Math.random()).slice(0, 3),
        isAvailable: true,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'doctors', docData.id), doctorWithExtras);
    }
    
    console.log("Firebase seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding Firebase:", error);
    throw error;
  }
};
