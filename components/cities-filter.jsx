'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const COUNTRIES = [
  { id: 'IN', name: 'India' },
  { id: 'AE', name: 'UAE' },
  { id: 'UK', name: 'UK' },
  { id: 'TH', name: 'Thailand' },
  { id: 'OM', name: 'Oman' },
];

export function CitiesFilter({ onFilter }) {
  const [filters, setFilters] = useState({
    country: '',
    state: '',
  });

  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...filters,
      [field]: value,
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setFilters({ country: '', state: '' });
    onFilter({ country: '', state: '' });
  };

  return (
    <div className='flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm ring-1 ring-gray-900/5'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Country
        </label>
        <select
          value={filters.country}
          onChange={(e) => handleFilterChange('country', e.target.value)}
          className='block w-40 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
        >
          <option value=''>All Countries</option>
          {COUNTRIES.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          State
        </label>
        <div className='flex items-center gap-2'>
          <input
            type='text'
            value={filters.state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            placeholder='Filter by state...'
            className='block w-40 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
          />
        </div>
      </div>

      {(filters.country || filters.state) && (
        <button
          onClick={clearFilters}
          className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 self-end'
        >
          <X className='h-4 w-4 mr-1' />
          Clear Filters
        </button>
      )}
    </div>
  );
}
