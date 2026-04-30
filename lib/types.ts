export interface Review {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DayAvailability {
  day: string;
  slots: TimeSlot[];
}

export interface AIExplanation {
  name: string;
  purpose: string;
  timing: string;
  precaution: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  location: string;
  consultationFee: number;
  availabilityStatus: string;
  image: string;
  description: string;
  qualifications: string;
  affiliation: string;
  languages: string[];
  modes: ('Video' | 'Audio' | 'Chat')[];
  reviews: Review[];
  weeklyAvailability: DayAvailability[];
}

export interface EHRRecord {
  id: string;
  consultationDate: string;
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    spo2: number;
    weight: number;
  };
  diagnosis: {
    primary: string;
    secondary: string;
  };
  prescriptions: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    purpose: string;
    explanation: string;
  }[];
  doctorNotes: string;
  followUpDate: string;
}
