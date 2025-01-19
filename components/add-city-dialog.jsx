'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabaseAdmin } from '../supabaseAdmin';

const COUNTRIES = [
  { id: 'IN', name: 'India' },
  { id: 'AE', name: 'UAE' },
  { id: 'GB', name: 'UK' },
  { id: 'TH', name: 'Thailand' },
  { id: 'OM', name: 'Oman' },
];

export function AddCityDialog({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    country: 'IN', // Default to India
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabaseAdmin.from('cities').insert([formData]);

      if (error) throw error;

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error adding city:', error);
      alert('Error adding city. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <h2 className='text-xl font-semibold text-gray-900'>Add New City</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-500'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6'>
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Name
              </label>
              <input
                type='text'
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                State
              </label>
              <input
                type='text'
                required
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Country
              </label>
              <select
                required
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
              >
                {COUNTRIES.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='mt-6 flex justify-end gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Saving...
                </>
              ) : (
                'Save City'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
