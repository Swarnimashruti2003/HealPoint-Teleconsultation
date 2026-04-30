import { Doctor } from './types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

const generateAvailability = () => {
  return DAYS.map(day => ({
    day,
    slots: TIME_SLOTS.map(time => ({
      time,
      available: Math.random() > 0.3
    }))
  }));
};

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    specialty: 'Cardiologist',
    experience: '12 Years',
    rating: 4.8,
    reviewsCount: 120,
    location: 'Apollo Delhi',
    consultationFee: 800,
    availabilityStatus: 'Available Today',
    image: 'https://picsum.photos/seed/doctor1/400/400',
    description: 'Expert in non-invasive cardiology and heart health management.',
    qualifications: 'MBBS AIIMS, MD Cardiology PGI',
    affiliation: 'Apollo Hospitals',
    languages: ['Hindi', 'English'],
    modes: ['Video', 'Audio'],
    reviews: [
      { id: 'r1', patientName: 'Amit Shah', rating: 5, comment: 'Very professional and empathetic.', date: '2024-03-10' }
    ],
    weeklyAvailability: generateAvailability()
  },
  {
    id: '2',
    name: 'Dr. Arjun Mehta',
    specialty: 'Neurologist',
    experience: '15 Years',
    rating: 4.6,
    reviewsCount: 85,
    location: 'Fortis Mumbai',
    consultationFee: 1200,
    availabilityStatus: 'Available Tomorrow',
    image: 'https://picsum.photos/seed/doctor2/400/400',
    description: 'Specialist in stroke management and neurological disorders.',
    qualifications: 'MD Neurology, DNB',
    affiliation: 'Fortis Healthcare',
    languages: ['Hindi', 'English', 'Marathi'],
    modes: ['Video', 'Chat'],
    reviews: [],
    weeklyAvailability: generateAvailability()
  },
  {
    id: '3',
    name: 'Dr. Kavita Nair',
    specialty: 'Dermatologist',
    experience: '8 Years',
    rating: 4.9,
    reviewsCount: 210,
    location: 'Manipal Bangalore',
    consultationFee: 600,
    availabilityStatus: 'Available Today',
    image: 'https://picsum.photos/seed/doctor3/400/400',
    description: 'Expert in clinical dermatology and aesthetic treatments.',
    qualifications: 'MD Dermatology, MBBS',
    affiliation: 'Manipal Hospitals',
    languages: ['English', 'Kannada', 'Tamil'],
    modes: ['Video', 'Audio', 'Chat'],
    reviews: [],
    weeklyAvailability: generateAvailability()
  },
  {
    id: '4',
    name: 'Dr. Rajesh Gupta',
    specialty: 'General Physician',
    experience: '20 Years',
    rating: 4.5,
    reviewsCount: 340,
    location: 'Max Noida',
    consultationFee: 400,
    availabilityStatus: 'Available Today',
    image: 'https://picsum.photos/seed/doctor4/400/400',
    description: 'Family physician with extensive experience in chronic disease management.',
    qualifications: 'MBBS, DNB Family Medicine',
    affiliation: 'Max Healthcare',
    languages: ['Hindi', 'English'],
    modes: ['Video', 'Audio', 'Chat'],
    reviews: [],
    weeklyAvailability: generateAvailability()
  },
  {
    id: '5',
    name: 'Dr. Sneha Rao',
    specialty: 'Pediatrician',
    experience: '10 Years',
    rating: 4.7,
    reviewsCount: 156,
    location: 'Cloudnine Hyderabad',
    consultationFee: 700,
    availabilityStatus: 'Available Today',
    image: 'https://picsum.photos/seed/doctor5/400/400',
    description: 'Specialized in newborn care and adolescent health.',
    qualifications: 'MD Pediatrics, DCH',
    affiliation: 'Cloudnine Hospitals',
    languages: ['English', 'Telugu', 'Hindi'],
    modes: ['Video', 'Audio'],
    reviews: [],
    weeklyAvailability: generateAvailability()
  },
  {
    id: '6',
    name: 'Dr. Vikram Singh',
    specialty: 'Orthopedic',
    experience: '14 Years',
    rating: 4.4,
    reviewsCount: 92,
    location: 'Medanta Gurugram',
    consultationFee: 1000,
    availabilityStatus: 'Available Tomorrow',
    image: 'https://picsum.photos/seed/doctor6/400/400',
    description: 'Expert in joint replacement and sports injuries.',
    qualifications: 'MS Orthopedics, Fellowship in Arthroplasty',
    affiliation: 'Medanta - The Medicity',
    languages: ['Hindi', 'English', 'Punjabi'],
    modes: ['Video', 'Chat'],
    reviews: [],
    weeklyAvailability: generateAvailability()
  },
  {
    id: '7',
    name: 'Dr. Anjali Desai',
    specialty: 'Gynecologist',
    experience: '11 Years',
    rating: 4.8,
    reviewsCount: 245,
    location: 'Nanavati Mumbai',
    consultationFee: 900,
    availabilityStatus: 'Available Today',
    image: 'https://picsum.photos/seed/doctor7/400/400',
    description: 'Specialist in high-risk pregnancies and laparoscopic surgery.',
    qualifications: 'MS OB-GYN, MBBS AIIMS',
    affiliation: 'Nanavati Super Speciality Hospital',
    languages: ['English', 'Gujarati', 'Hindi'],
    modes: ['Video', 'Audio', 'Chat'],
    reviews: [],
    weeklyAvailability: generateAvailability()
  },
  {
    id: '8',
    name: 'Dr. Sameer Khan',
    specialty: 'Psychiatrist',
    experience: '13 Years',
    rating: 4.9,
    reviewsCount: 180,
    location: 'NIMHANS Bangalore',
    consultationFee: 1500,
    availabilityStatus: 'Available Today',
    image: 'https://picsum.photos/seed/doctor8/400/400',
    description: 'Expert in cognitive behavioral therapy and mood disorders.',
    qualifications: 'MD Psychiatry, MBBS',
    affiliation: 'NIMHANS',
    languages: ['Hindi', 'English', 'Urdu'],
    modes: ['Video', 'Audio'],
    reviews: [],
    weeklyAvailability: generateAvailability()
  }
];
