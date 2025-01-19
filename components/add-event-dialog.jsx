'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { supabaseAdmin } from '../supabaseAdmin';
import MDEditor from '@uiw/react-md-editor';
import { v4 as uuidv4 } from 'uuid';

export function AddEventDialog({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    place_id: '',
    city_id: '',
  });
  const [primaryImage, setPrimaryImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [primaryImagePreview, setPrimaryImagePreview] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const primaryImageRef = useRef(null);
  const galleryImageRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const [placesData, citiesData] = await Promise.all([
        supabaseAdmin.from('places').select('id, name, city_id').order('name'),
        supabaseAdmin.from('cities').select('id, name').order('name'),
      ]);

      if (placesData.data) {
        setPlaces(placesData.data);
      }
      if (citiesData.data) {
        setCities(citiesData.data);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handlePrimaryImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrimaryImage(file);
      setPrimaryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setGalleryImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file, path) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const eventId = uuidv4();
    const filePath = `events/${eventId}/${path}/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('temples')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    return filePath;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let primaryImagePath = null;
      let galleryImagePaths = [];

      if (primaryImage) {
        primaryImagePath = await uploadImage(primaryImage, 'primary');
      }

      if (galleryImages.length > 0) {
        galleryImagePaths = await Promise.all(
          galleryImages.map((file) => uploadImage(file, 'gallery'))
        );
      }

      const { error } = await supabaseAdmin.from('events').insert([
        {
          ...formData,
          image_url: primaryImagePath,
          image_urls: galleryImagePaths,
        },
      ]);

      if (error) throw error;

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error adding event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <h2 className='text-xl font-semibold text-gray-900'>Add New Event</h2>
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
                Description (Markdown)
              </label>
              <div data-color-mode='light'>
                <MDEditor
                  value={formData.description}
                  onChange={(value) =>
                    setFormData({ ...formData, description: value || '' })
                  }
                  preview='edit'
                  className='mt-1'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Start Date
              </label>
              <input
                type='datetime-local'
                required
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                End Date
              </label>
              <input
                type='datetime-local'
                required
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                City
              </label>
              <select
                required
                value={formData.city_id}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    city_id: e.target.value,
                    place_id: '',
                  });
                }}
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
              >
                <option value=''>Select a city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Place
              </label>
              <select
                required
                value={formData.place_id}
                onChange={(e) =>
                  setFormData({ ...formData, place_id: e.target.value })
                }
                disabled={!formData.city_id}
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed'
              >
                <option value=''>Select a place</option>
                {places
                  .filter(
                    (place) => place.city_id === parseInt(formData.city_id)
                  )
                  .map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Primary Image
              </label>
              <div className='mt-1 flex items-center gap-4'>
                <input
                  type='file'
                  ref={primaryImageRef}
                  onChange={handlePrimaryImageChange}
                  accept='image/*'
                  className='hidden'
                />
                <button
                  type='button'
                  onClick={() => primaryImageRef.current?.click()}
                  className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                >
                  <ImagePlus className='h-4 w-4 mr-2' />
                  Select Image
                </button>
                {primaryImagePreview && (
                  <div className='relative'>
                    <img
                      src={primaryImagePreview}
                      alt='Preview'
                      className='h-20 w-20 object-cover rounded-md'
                    />
                    <button
                      type='button'
                      onClick={() => {
                        setPrimaryImage(null);
                        setPrimaryImagePreview('');
                      }}
                      className='absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Gallery Images
              </label>
              <div className='mt-1'>
                <input
                  type='file'
                  ref={galleryImageRef}
                  onChange={handleGalleryImagesChange}
                  accept='image/*'
                  multiple
                  className='hidden'
                />
                <button
                  type='button'
                  onClick={() => galleryImageRef.current?.click()}
                  className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                >
                  <ImagePlus className='h-4 w-4 mr-2' />
                  Add Images
                </button>
              </div>
              {galleryPreviews.length > 0 && (
                <div className='mt-4 grid grid-cols-4 gap-4'>
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className='relative'>
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        className='h-20 w-20 object-cover rounded-md'
                      />
                      <button
                        type='button'
                        onClick={() => removeGalleryImage(index)}
                        className='absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                'Save Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
