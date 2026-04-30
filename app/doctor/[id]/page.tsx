'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Calendar, 
  ArrowLeft,
  Stethoscope,
  Award,
  Globe,
  Video,
  Phone,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { firestoreGet, firestoreAdd } from '@/lib/firebase-rest';
import { Doctor } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DoctorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const loadDoctor = React.useCallback(async () => {
    try {
      const data = await firestoreGet('doctors', id as string);
      if (data) {
        setDoctor(data as any);
        // Set first available day by default
        if (data.weeklyAvailability && data.weeklyAvailability.length > 0) {
          setSelectedDay(data.weeklyAvailability[0].day);
        }
      }
    } catch (err) {
      console.error('Error loading doctor:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        loadDoctor();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [id, loadDoctor]);

  const handleBooking = async () => {
    if (!selectedDay || !selectedTime) return;
    setIsBooking(true);
    try {
      const apptData = {
        doctorId: id,
        doctorName: doctor?.name,
        patientId: currentUser?.uid || 'guest',
        patientName: currentUser?.name || 'Guest Patient',
        day: selectedDay,
        time: selectedTime,
        status: 'waiting',
        queuePosition: 3,
        createdAt: new Date().toISOString()
      };
      const apptId = await firestoreAdd('appointments', apptData);
      // Redirect to waiting room
      router.push(`/waiting-room?id=${apptId}&doctor=${doctor?.name}`);
    } catch (err) {
      alert('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BFA6]" />
    </div>
  );

  if (!doctor) return <div className="text-center py-20">Doctor not found</div>;

  const currentDaySlots = doctor.weeklyAvailability?.find(d => d.day === selectedDay)?.slots || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-[#0A1628] mb-8 transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Back to Results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-gray-100 sticky top-24">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-6">
                <img 
                  src={doctor.image} 
                  alt={doctor.name} 
                  className="w-32 h-32 rounded-[24px] object-cover border-4 border-white shadow-lg" 
                />
                <div className="absolute -bottom-2 -right-2 bg-[#00BFA6] text-white p-2 rounded-xl shadow-lg">
                  <ShieldCheck size={20} />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[#0A1628] mb-1">{doctor.name}</h1>
              <p className="text-[#00BFA6] font-semibold mb-4 flex items-center gap-1.5 justify-center">
                <Stethoscope size={16} />
                {doctor.specialty}
              </p>
              
              <div className="flex items-center gap-4 py-3 px-6 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rating</p>
                  <p className="text-sm font-bold text-[#0A1628] flex items-center gap-1">
                    {doctor.rating} <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Experience</p>
                  <p className="text-sm font-bold text-[#0A1628]">{doctor.experience}</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Reviews</p>
                  <p className="text-sm font-bold text-[#0A1628]">{doctor.reviewsCount}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Qualifications</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Award className="text-[#00BFA6] shrink-0" size={18} />
                    <p className="text-sm text-gray-600 leading-tight">{doctor.qualifications}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="text-[#00BFA6] shrink-0" size={18} />
                    <p className="text-sm text-gray-600 leading-tight">{doctor.languages.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Consultation Modes</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.modes.map(mode => (
                    <div key={mode} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-100">
                      {mode === 'Video' && <Video size={12} />}
                      {mode === 'Audio' && <Phone size={12} />}
                      {mode === 'Chat' && <MessageSquare size={12} />}
                      {mode}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content & Booking */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">About Doctor</h2>
            <p className="text-gray-500 leading-relaxed">
              {doctor.description} {doctor.name} is a highly accomplished {doctor.specialty} currently affiliated with {doctor.affiliation} in {doctor.location}. With over {doctor.experience} of dedicated research and clinical practice, they have helped thousands of patients achieve better health outcomes.
            </p>
          </div>

          {/* Booking Section */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-[#0A1628]">Select Appointment Slot</h2>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Consultation Fee</p>
                <p className="text-2xl font-black text-[#00BFA6]">₹{doctor.consultationFee.toLocaleString()}</p>
              </div>
            </div>

            {/* Day Selector */}
            <div className="mb-8">
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {doctor.weeklyAvailability.map((availability, idx) => (
                  <button
                    key={availability.day}
                    onClick={() => {
                      setSelectedDay(availability.day);
                      setSelectedTime(null);
                    }}
                    className={`flex flex-col items-center min-w-[80px] p-4 rounded-2xl border transition-all ${
                      selectedDay === availability.day 
                      ? 'bg-[#0A1628] text-white border-[#0A1628] shadow-lg scale-105' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#00BFA6]'
                    }`}
                  >
                    <span className="text-xs uppercase font-bold tracking-widest mb-1 opacity-60">{availability.day}</span>
                    <span className="text-lg font-black">
                      {/* Using mock dates for display */}
                      {idx + 15}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selector */}
            <div className="mb-8">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Clock size={14} /> Available Slots
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {currentDaySlots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                      !slot.available 
                      ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-50' 
                      : selectedTime === slot.time
                        ? 'bg-[#00BFA6] text-white border-[#00BFA6] shadow-md scale-105'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#00BFA6] hover:bg-emerald-50/50'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking Action */}
            <button
              onClick={handleBooking}
              disabled={!selectedDay || !selectedTime || isBooking}
              className={`w-full py-5 rounded-2xl text-lg font-bold transition-all shadow-xl flex items-center justify-center gap-3 ${
                !selectedDay || !selectedTime || isBooking
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#00BFA6] text-white hover:bg-[#00a68f] hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isBooking ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Booking Securely...
                </>
              ) : (
                <>
                  Confirm Appointment
                  <ChevronRight size={20} />
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-[#00BFA6]" />
              Safe & Secure Video Consultation
            </p>
          </div>

          {/* User Reviews */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-[#0A1628]">Patient Reviews</h2>
              <button className="text-[#00BFA6] text-sm font-bold hover:underline">View All</button>
            </div>
            
            <div className="space-y-6">
              {doctor.reviews.length > 0 ? (
                doctor.reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-gray-50 last:border-none">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-[#0A1628]">{review.patientName}</h4>
                      <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                        <Star size={14} fill="currentColor" />
                        {review.rating}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 leading-relaxed">{review.comment}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{review.date}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 italic">No reviews yet for this doctor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
