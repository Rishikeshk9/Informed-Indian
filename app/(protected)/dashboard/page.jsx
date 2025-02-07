'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MapPin, Calendar, Building2, Users } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    places: '...',
    events: '...',
    cities: '...',
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch counts from Supabase
      const [placesCount, eventsCount, citiesCount] = await Promise.all([
        supabase.from('places').select('id', { count: 'exact' }),
        supabase.from('events').select('id', { count: 'exact' }),
        supabase.from('cities').select('id', { count: 'exact' }),
      ]);

      setStats({
        places: placesCount.count ?? 0,
        events: eventsCount.count ?? 0,
        cities: citiesCount.count ?? 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Admin Dashboard</h1>
        <p className='mt-2 text-gray-600'>
          Welcome to the Admin Panel! Here's an overview of your data.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <DashboardCard
          title='Total Places'
          icon={<MapPin className='w-6 h-6' />}
          value={stats.places}
          description='Registered tourist places'
          color='text-blue-500'
        />
        <DashboardCard
          title='Total Events'
          icon={<Calendar className='w-6 h-6' />}
          value={stats.events}
          description='Upcoming & past events'
          color='text-green-500'
        />
        <DashboardCard
          title='Total Cities'
          icon={<Building2 className='w-6 h-6' />}
          value={stats.cities}
          description='Cities covered'
          color='text-purple-500'
        />
      </div>

      {/* Recent Activity Section */}
      <div className='mt-8'>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>
          Quick Actions
        </h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <QuickActionCard
            title='Add New Place'
            description='Create a new tourist place listing'
            icon={<MapPin className='w-5 h-5' />}
            href='/places'
          />
          <QuickActionCard
            title='Create Event'
            description='Schedule a new event'
            icon={<Calendar className='w-5 h-5' />}
            href='/events'
          />
          <QuickActionCard
            title='Add City'
            description='Add a new city to the database'
            icon={<Building2 className='w-5 h-5' />}
            href='/cities'
          />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, icon, value, description, color }) {
  return (
    <div className='p-6 bg-white border border-gray-200 rounded-lg shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold text-gray-700'>{title}</h2>
        <div className={color}>{icon}</div>
      </div>
      <p className='text-3xl font-bold text-gray-900'>{value}</p>
      <p className='mt-2 text-sm text-gray-600'>{description}</p>
    </div>
  );
}

function QuickActionCard({ title, description, icon, href }) {
  return (
    <Link
      href={href}
      className='block p-6 transition-shadow duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md'
    >
      <div className='flex items-center space-x-4'>
        <div className='flex-shrink-0'>
          <div className='p-2 text-blue-600 rounded-lg bg-blue-50'>{icon}</div>
        </div>
        <div>
          <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
          <p className='mt-1 text-sm text-gray-500'>{description}</p>
        </div>
      </div>
    </Link>
  );
}
