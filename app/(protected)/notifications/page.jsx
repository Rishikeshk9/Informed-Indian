'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const countries = [
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
    { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  ];

  useEffect(() => {
    if (selectedCountry) {
      loadCities(selectedCountry);
    }
  }, [selectedCountry]);

  const loadCities = async (countryCode) => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name')
        .eq('country', countryCode)
        .order('name');

      if (error) throw error;
      setCities(data);
    } catch (error) {
      console.error('Error loading cities:', error);
      toast.error('Failed to load cities');
    }
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    try {
      // Create notification record
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          title,
          body,
          country: selectedCountry,
          city_id: selectedCity || null,
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (notificationError) throw notificationError;

      // Here you would integrate with your FCM service
      // to actually send the push notification

      toast.success('Notification sent successfully!');
      setTitle('');
      setBody('');
      setSelectedCity('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className='p-6 max-w-2xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Send Notifications</h1>

      <form onSubmit={sendNotification} className='space-y-6'>
        <div>
          <label className='block text-sm font-medium mb-2'>
            Country (Optional)
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedCity('');
            }}
            className='w-full p-2 border rounded-md'
          >
            <option value=''>All Countries</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCountry && (
          <div>
            <label className='block text-sm font-medium mb-2'>
              City (Optional)
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className='w-full p-2 border rounded-md'
            >
              <option value=''>All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className='block text-sm font-medium mb-2'>
            Notification Title *
          </label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='w-full p-2 border rounded-md'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-2'>
            Notification Body *
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className='w-full p-2 border rounded-md h-32'
            required
          />
        </div>

        <button
          type='submit'
          disabled={isSending}
          className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors
            ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSending ? 'Sending...' : 'Send Notification'}
        </button>
      </form>

      <div className='mt-8'>
        <h2 className='text-xl font-semibold mb-4'>Instructions</h2>
        <ul className='list-disc pl-5 space-y-2'>
          <li>
            Select a country to target users from a specific country (optional)
          </li>
          <li>Select a city to target users from a specific city (optional)</li>
          <li>Leave both country and city unselected to send to all users</li>
          <li>Title and body are required fields</li>
          <li>Notifications will be sent immediately</li>
        </ul>
      </div>
    </div>
  );
}
