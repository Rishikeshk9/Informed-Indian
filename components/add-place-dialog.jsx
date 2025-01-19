'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabaseAdmin } from '../supabaseAdmin';
import MDEditor from '@uiw/react-md-editor';

export function AddPlaceDialog({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description_markdown: '',
    latitude: '',
    longitude: '',
    city_id: '',
    category_id: '',
  });
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Fetch cities and categories when dialog opens
  useEffect(() => {
    const fetchOptions = async () => {
      if (!isOpen) return;

      setIsLoadingOptions(true);
      try {
        const [citiesData, categoriesData] = await Promise.all([
          supabaseAdmin.from('cities').select('id, name').order('name'),
          supabaseAdmin.from('categories').select('id, name').order('name'),
        ]);

        if (citiesData.error) throw citiesData.error;
        if (categoriesData.error) throw categoriesData.error;

        setCities(citiesData.data || []);
        setCategories(categoriesData.data || []);
      } catch (error) {
        console.error('Error fetching options:', error);
        alert('Error loading cities and categories. Please try again.');
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [isOpen]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        location: '',
        description_markdown: '',
        latitude: '',
        longitude: '',
        city_id: '',
        category_id: '',
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabaseAdmin.from('places').insert([
        {
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          city_id: parseInt(formData.city_id),
          category_id: parseInt(formData.category_id),
        },
      ]);

      if (error) throw error;

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error adding place:', error);
      alert('Error adding place. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden'>
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <h2 className='text-xl font-semibold text-gray-900'>Add New Place</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-500'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className='p-6 overflow-y-auto max-h-[calc(90vh-129px)]'
        >
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
                Location
              </label>
              <input
                type='text'
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  City
                </label>
                <select
                  required
                  value={formData.city_id}
                  onChange={(e) =>
                    setFormData({ ...formData, city_id: e.target.value })
                  }
                  disabled={isLoadingOptions}
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed'
                >
                  <option value=''>
                    {isLoadingOptions ? 'Loading...' : 'Select City'}
                  </option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Category
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  disabled={isLoadingOptions}
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed'
                >
                  <option value=''>
                    {isLoadingOptions ? 'Loading...' : 'Select Category'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Latitude
                </label>
                <input
                  type='number'
                  step='any'
                  required
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Longitude
                </label>
                <input
                  type='number'
                  step='any'
                  required
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Description (Markdown)
              </label>
              <div data-color-mode='light'>
                <MDEditor
                  value={formData.description_markdown}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      description_markdown: value || '',
                    })
                  }
                  preview='edit'
                  className='mt-1'
                />
              </div>
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
                'Save Place'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
