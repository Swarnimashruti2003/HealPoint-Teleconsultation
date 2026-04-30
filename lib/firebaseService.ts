import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { GoogleGenAI, Type } from "@google/genai";

// --- AUTH ---
export const registerUser = async (name: string, email: string, password: string, role: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    name,
    email,
    role,
    createdAt: serverTimestamp()
  });
  return cred.user;
};

export const loginUser = async (email: string, password: string) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  if (!userDoc.exists()) throw new Error("User profile not found");
  return { uid: cred.user.uid, ...(userDoc.data() as any) };
};

export const logoutUser = () => signOut(auth);

// --- DOCTORS ---
export const getDoctors = async (filters: { specialization?: string; minRating?: number; mode?: string } = {}) => {
  let q: any = collection(db, 'doctors');
  
  if (filters.specialization) {
    q = query(q, where('specialization', '==', filters.specialization));
  }
  if (filters.minRating) {
    q = query(q, where('rating', '>=', Number(filters.minRating)));
  }
  if (filters.mode) {
    q = query(q, where('consultationModes', 'array-contains', filters.mode));
  }
  
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

export const getDoctorById = async (id: string) => {
  const snap = await getDoc(doc(db, 'doctors', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) };
};

// --- APPOINTMENTS ---
export const bookAppointment = async (data: { 
  doctorId: string; 
  patientId: string; 
  day: string; 
  time: string;
  [key: string]: any;
}) => {
  // 1. Count today's appointments for queue position
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const q = query(
    collection(db, 'appointments'),
    where('doctorId', '==', data.doctorId),
    where('createdAt', '>=', Timestamp.fromDate(todayStart))
  );
  const snap = await getDocs(q);
  const queuePosition = snap.size + 1;

  // 2. Create appointment
  const ref = await addDoc(collection(db, 'appointments'), {
    ...data,
    queuePosition,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: serverTimestamp()
  });

  // 3. Mark slot as booked in doctor doc
  const doctorRef = doc(db, 'doctors', data.doctorId);
  const doctorSnap = await getDoc(doctorRef);
  if (doctorSnap.exists()) {
    const docData = doctorSnap.data();
    const slots = [...(docData.weeklySlots || docData.weeklyAvailability || [])];
    const dayIdx = slots.findIndex((s: any) => s.day === data.day || s.day.startsWith(data.day));
    
    if (dayIdx !== -1) {
      const slotIdx = slots[dayIdx].slots.findIndex((s: any) => s.time === data.time);
      if (slotIdx !== -1) {
        slots[dayIdx].slots[slotIdx].isBooked = true;
        await updateDoc(doctorRef, { 
          weeklySlots: slots,
          weeklyAvailability: slots // sync both just in case
        });
      }
    }
  }

  return { id: ref.id, queuePosition };
};

export const getMyAppointments = async (userId: string, role: 'patient' | 'doctor') => {
  const field = role === 'patient' ? 'patientId' : 'doctorId';
  const q = query(collection(db, 'appointments'), where(field, '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

// --- EHR ---
export const createEHR = async (data: { appointmentId: string; [key: string]: any }) => {
  const ref = await addDoc(collection(db, 'ehrs'), {
    ...data,
    createdAt: serverTimestamp()
  });
  await updateDoc(doc(db, 'appointments', data.appointmentId), {
    status: 'completed'
  });
  return ref.id;
};

export const getEHRByAppointment = async (appointmentId: string) => {
  const q = query(collection(db, 'ehrs'), where('appointmentId', '==', appointmentId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...(snap.docs[0].data() as any) };
};

// --- AI EXPLANATION ---
// Using Gemini for environment compatibility and structured output support
export const getAIExplanation = async (ehrId: string, prescriptions: any[]) => {
  // Check cache first
  const ehrRef = doc(db, 'ehrs', ehrId);
  const ehrSnap = await getDoc(ehrRef);
  
  if (ehrSnap.exists()) {
    const data = ehrSnap.data();
    if (data.aiExplanation) {
      try {
        return JSON.parse(data.aiExplanation);
      } catch (e) {
        console.warn("Cached AI explanation is not valid JSON, regenerating...");
      }
    }
  }

  const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

  const medList = prescriptions.map(p => 
    `${p.medicine || p.name} ${p.dosage} ${p.frequency}`).join(', ');

  const prompt = `Patient prescribed: ${medList}. 
  For each medicine explain: purpose in simple words, 
  when to take it, one key precaution.
  Return ONLY JSON array: 
  [{name,dosage,purpose,timing,precaution}]
  No markdown, no extra text.`;

  const result = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const explanation = JSON.parse(result.text || '[]');

  // Cache in Firestore
  await updateDoc(ehrRef, {
    aiExplanation: JSON.stringify(explanation)
  });

  return explanation;
};

// --- REVIEWS ---
export const addReview = async (doctorId: string, review: { rating: number; [key: string]: any }) => {
  const ref = doc(db, 'doctors', doctorId);
  const snap = await getDoc(ref);
  
  if (snap.exists()) {
    const data = snap.data();
    const reviews = [...(data.reviews || []), review];
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await updateDoc(ref, {
      reviews,
      rating: parseFloat(avgRating.toFixed(1)),
      totalReviews: reviews.length
    });
  }
};

// --- SEEDING ---
export const seedDoctors = async () => {
  const doctorsCollection = collection(db, 'doctors');
  
  const seedData = [
    {
      name: "Dr. Sarah Mitchell",
      specialization: "Cardiologist",
      specialty: "Cardiologist",
      experience: "15+ Years",
      rating: 4.9,
      totalReviews: 1240,
      hospital: "City Heart Institute, Bangalore",
      fee: 800,
      consultationFee: 800,
      languages: ["English", "Hindi", "Kannada"],
      consultationModes: ["Video", "Chat"],
      description: "Senior Cardiologist with extensive experience in non-invasive cardiology and preventive heart care.",
      qualifications: "MBBS, MD (Medicine), DM (Cardiology), FACC",
      image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400",
      weeklySlots: [
        { day: 'Mon', slots: [{time: '10:00 AM', isBooked: false}, {time: '11:00 AM', isBooked: false}, {time: '04:00 PM', isBooked: false}] },
        { day: 'Wed', slots: [{time: '02:00 PM', isBooked: false}, {time: '03:00 PM', isBooked: false}] },
        { day: 'Fri', slots: [{time: '10:00 AM', isBooked: false}, {time: '04:00 PM', isBooked: false}] }
      ],
      reviews: [
        { id: '1', patientName: 'Amit Shah', rating: 5, comment: 'Excellent doctor, very patient and explained everything clearly.', date: 'Dec 20, 2023' },
        { id: '2', patientName: 'Priya R.', rating: 4, comment: 'Wait time was a bit long but the consultation was worth it.', date: 'Nov 12, 2023' }
      ]
    },
    {
      name: "Dr. James Wilson",
      specialization: "Neurologist",
      specialty: "Neurologist",
      experience: "12+ Years",
      rating: 4.8,
      totalReviews: 850,
      hospital: "NeuroCare Center, Mumbai",
      fee: 1000,
      consultationFee: 1000,
      languages: ["English", "Marathi"],
      consultationModes: ["Video", "Audio"],
      description: "Specializing in headache disorders, epilepsy, and stroke management with a focus on long-term wellness.",
      qualifications: "MBBS, MD, DM (Neurology)",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
      weeklySlots: [
        { day: 'Tue', slots: [{time: '09:00 AM', isBooked: false}, {time: '12:00 PM', isBooked: false}] },
        { day: 'Thu', slots: [{time: '03:00 PM', isBooked: false}, {time: '06:00 PM', isBooked: false}] }
      ],
      reviews: []
    },
    {
      name: "Dr. Ananya Iyer",
      specialization: "Dermatologist",
      specialty: "Dermatologist",
      experience: "8+ Years",
      rating: 4.7,
      totalReviews: 540,
      hospital: "Skin & Aesthetic Clinic, Chennai",
      fee: 600,
      consultationFee: 600,
      languages: ["English", "Tamil", "Hindi"],
      consultationModes: ["Video", "Chat", "Audio"],
      description: "Expert in clinical dermatology and aesthetic procedures including acne management and anti-aging treatments.",
      qualifications: "MBBS, DDVL",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
      weeklySlots: [
        { day: 'Mon', slots: [{time: '11:00 AM', isBooked: false}, {time: '12:00 PM', isBooked: false}] },
        { day: 'Sat', slots: [{time: '10:00 AM', isBooked: false}, {time: '02:00 PM', isBooked: false}] }
      ],
      reviews: []
    },
    {
      name: "Dr. Robert Chen",
      specialization: "General Physician",
      specialty: "General Physician",
      experience: "20+ Years",
      rating: 4.9,
      totalReviews: 3200,
      hospital: "Global Family Health, Delhi",
      fee: 500,
      consultationFee: 500,
      languages: ["English", "Hindi", "Mandarin"],
      consultationModes: ["Video", "Audio"],
      description: "Compassionate primary care physician focused on holistic health and chronic disease management.",
      qualifications: "MBBS, MD (General Medicine)",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
      weeklySlots: [
        { day: 'Mon', slots: [{time: '09:00 AM', isBooked: false}, {time: '10:00 AM', isBooked: false}] },
        { day: 'Tue', slots: [{time: '09:00 AM', isBooked: false}, {time: '10:00 AM', isBooked: false}] },
        { day: 'Wed', slots: [{time: '09:00 AM', isBooked: false}, {time: '10:00 AM', isBooked: false}] },
        { day: 'Thu', slots: [{time: '09:00 AM', isBooked: false}, {time: '10:00 AM', isBooked: false}] },
        { day: 'Fri', slots: [{time: '09:00 AM', isBooked: false}, {time: '10:00 AM', isBooked: false}] }
      ],
      reviews: []
    }
  ];

  for (const docData of seedData) {
    const docRef = doc(doctorsCollection);
    await setDoc(docRef, {
      ...docData,
      id: docRef.id,
      createdAt: serverTimestamp()
    });
  }
};
