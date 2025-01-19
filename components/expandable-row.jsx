'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../supabaseClient';
import { supabaseAdmin } from '../supabaseAdmin';
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Upload,
  Loader2,
  Star,
  Save,
  X,
} from 'lucide-react';
import { formatDate } from '../utils/format-date';
import MDEditor from '@uiw/react-md-editor';

function ImageWithFallback({ src, alt, ...props }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
        <ImageIcon className='h-5 w-5 text-gray-400' />
      </div>
    );
  }

  return (
    <Image src={src} alt={alt} {...props} onError={() => setError(true)} />
  );
}

export function ExpandableRow({ place: initialPlace, onDeleteClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [place, setPlace] = useState(initialPlace);
  const [editedPlace, setEditedPlace] = useState(initialPlace);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef(null);
  const [editedDescription, setEditedDescription] = useState(
    place.description_markdown
  );
  const [isSaving, setIsSaving] = useState(false);

  // Fetch cities and categories when editing starts
  const fetchOptions = async () => {
    const [citiesData, categoriesData] = await Promise.all([
      supabase.from('cities').select('id, name').order('name'),
      supabase.from('categories').select('id, name').order('name'),
    ]);

    if (citiesData.data) setCities(citiesData.data);
    if (categoriesData.data) setCategories(categoriesData.data);
  };

  const handleEdit = async () => {
    setIsEditing(true);
    await fetchOptions();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('places')
        .update({
          name: editedPlace.name,
          location: editedPlace.location,
          description_markdown: editedDescription,
          latitude: editedPlace.latitude,
          longitude: editedPlace.longitude,
          city_id: editedPlace.city_id,
          category_id: editedPlace.category_id,
        })
        .eq('id', place.id)
        .select(
          `
          *,
          cities (name),
          categories (name)
        `
        )
        .single();

      if (error) throw error;

      setPlace(data);
      setEditedPlace(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving place:', error);
      alert('Error saving place. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedPlace(place);
    setEditedDescription(place.description_markdown);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${place.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } =
        await supabaseAdmin.storage
          .from('temples')
          .upload(`places/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('temples')
        .getPublicUrl(`places/${fileName}`);

      const newImageUrl = publicUrlData.publicUrl;
      const newImageUrls = [...(place.image_urls || []), newImageUrl];

      const { data, error: updateError } = await supabaseAdmin
        .from('places')
        .update({
          image_urls: newImageUrls,
        })
        .eq('id', place.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setPlace({ ...place, image_urls: newImageUrls });
      setEditedPlace({ ...editedPlace, image_urls: newImageUrls });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetMainImage = async (imageUrl) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('places')
        .update({ image_url: imageUrl })
        .eq('id', place.id)
        .select()
        .single();

      if (error) throw error;

      setPlace({ ...place, image_url: imageUrl });
      setEditedPlace({ ...editedPlace, image_url: imageUrl });
    } catch (error) {
      console.error('Error setting main image:', error);
      alert('Error setting main image. Please try again.');
    }
  };

  const handleDeleteImage = async (imageUrlToDelete) => {
    try {
      const updatedImageUrls = place.image_urls.filter(
        (url) => url !== imageUrlToDelete
      );

      const updates = {
        image_urls: updatedImageUrls,
        ...(place.image_url === imageUrlToDelete && { image_url: null }),
      };

      const { data, error } = await supabaseAdmin
        .from('places')
        .update(updates)
        .eq('id', place.id)
        .select()
        .single();

      if (error) throw error;

      setPlace({
        ...place,
        image_urls: updatedImageUrls,
        ...(place.image_url === imageUrlToDelete && { image_url: null }),
      });
      setEditedPlace({
        ...editedPlace,
        image_urls: updatedImageUrls,
        ...(place.image_url === imageUrlToDelete && { image_url: null }),
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Please try again.');
    }
  };

  return (
    <>
      <tr className='group hover:bg-gray-50'>
        <td className='px-6 py-4'>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='text-gray-400 group-hover:text-gray-500'
          >
            {isExpanded ? (
              <ChevronDown className='h-5 w-5' />
            ) : (
              <ChevronRight className='h-5 w-5' />
            )}
          </button>
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
          <div className='flex items-center gap-3'>
            {place.image_url ? (
              <div className='relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0'>
                <Image
                  src={place.image_url}
                  alt={place.name}
                  fill
                  className='object-cover'
                />
              </div>
            ) : (
              <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0'>
                <ImageIcon className='h-5 w-5 text-gray-400' />
              </div>
            )}
            {isEditing ? (
              <input
                type='text'
                value={editedPlace.name}
                onChange={(e) =>
                  setEditedPlace({ ...editedPlace, name: e.target.value })
                }
                className='flex-1 px-2 py-1 border rounded-md'
              />
            ) : (
              <span>{place.name}</span>
            )}
          </div>
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
          {isEditing ? (
            <select
              value={editedPlace.city_id}
              onChange={(e) =>
                setEditedPlace({ ...editedPlace, city_id: e.target.value })
              }
              className='w-full px-2 py-1 border rounded-md'
            >
              <option value=''>Select City</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          ) : (
            place.cities?.name
          )}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
          {isEditing ? (
            <input
              type='text'
              value={editedPlace.location}
              onChange={(e) =>
                setEditedPlace({ ...editedPlace, location: e.target.value })
              }
              className='w-full px-2 py-1 border rounded-md'
            />
          ) : (
            place.location
          )}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
          {isEditing ? (
            <select
              value={editedPlace.category_id}
              onChange={(e) =>
                setEditedPlace({ ...editedPlace, category_id: e.target.value })
              }
              className='w-full px-2 py-1 border rounded-md'
            >
              <option value=''>Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          ) : (
            place.categories?.name
          )}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
          {isEditing ? (
            <div className='flex justify-end gap-2'>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className='text-green-600 hover:text-green-900 inline-flex items-center'
              >
                <Save className='h-4 w-4 mr-1' />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className='text-gray-600 hover:text-gray-900 inline-flex items-center'
              >
                <X className='h-4 w-4 mr-1' />
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className='text-blue-600 hover:text-blue-900 inline-flex items-center'
              >
                <Pencil className='h-4 w-4 mr-1' />
                Edit
              </button>
              <button
                onClick={() => onDeleteClick(place)}
                className='text-red-600 hover:text-red-900 ml-4 inline-flex items-center'
              >
                <Trash2 className='h-4 w-4 mr-1' />
                Delete
              </button>
            </>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className='bg-gray-50'>
          <td colSpan='6' className='px-6 py-4'>
            {/* Images Gallery */}
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='text-sm font-medium text-gray-900 flex items-center'>
                  <ImageIcon className='h-4 w-4 mr-1' />
                  Gallery
                </h4>
                <div>
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept='image/*'
                    className='hidden'
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className='inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-1.5 animate-spin' />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className='h-4 w-4 mr-1.5' />
                        Add Image
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className='grid grid-cols-4 gap-4'>
                {place.image_urls?.map((imageUrl, index) => (
                  <div
                    key={index}
                    className='relative aspect-square rounded-lg overflow-hidden group'
                  >
                    <ImageWithFallback
                      src={imageUrl}
                      alt={`${place.name} - Image ${index + 1}`}
                      fill
                      className='object-cover group-hover:scale-105 transition-transform duration-200'
                    />
                    {/* Overlay with buttons */}
                    <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100'>
                      <button
                        onClick={() => handleSetMainImage(imageUrl)}
                        className={`p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors ${
                          place.image_url === imageUrl
                            ? 'text-yellow-500'
                            : 'text-gray-700'
                        }`}
                        title={
                          place.image_url === imageUrl
                            ? 'Current main image'
                            : 'Set as main image'
                        }
                      >
                        <Star
                          className={`h-4 w-4 ${
                            place.image_url === imageUrl ? 'fill-current' : ''
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              'Are you sure you want to delete this image?'
                            )
                          ) {
                            handleDeleteImage(imageUrl);
                          }
                        }}
                        className='p-1.5 rounded-full bg-white/90 hover:bg-white text-red-600 transition-colors'
                        title='Delete image'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                    {/* Main image indicator */}
                    {place.image_url === imageUrl && (
                      <div className='absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full'>
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h4 className='text-sm font-medium text-gray-900 flex items-center'>
                  <MapPin className='h-4 w-4 mr-1' />
                  Coordinates
                </h4>
                {isEditing ? (
                  <div className='mt-1 space-y-2'>
                    <input
                      type='number'
                      value={editedPlace.latitude}
                      onChange={(e) =>
                        setEditedPlace({
                          ...editedPlace,
                          latitude: e.target.value,
                        })
                      }
                      placeholder='Latitude'
                      className='w-full px-2 py-1 border rounded-md'
                    />
                    <input
                      type='number'
                      value={editedPlace.longitude}
                      onChange={(e) =>
                        setEditedPlace({
                          ...editedPlace,
                          longitude: e.target.value,
                        })
                      }
                      placeholder='Longitude'
                      className='w-full px-2 py-1 border rounded-md'
                    />
                  </div>
                ) : (
                  <p className='mt-1 text-sm text-gray-500'>
                    Latitude: {place.latitude}
                    <br />
                    Longitude: {place.longitude}
                  </p>
                )}
              </div>
              <div>
                <h4 className='text-sm font-medium text-gray-900 flex items-center'>
                  <Calendar className='h-4 w-4 mr-1' />
                  Timestamps
                </h4>
                <p className='mt-1 text-sm text-gray-500'>
                  Created: {formatDate(place.created_at)}
                  <br />
                  Updated: {formatDate(place.updated_at)}
                </p>
              </div>
            </div>
            <div className='mt-4'>
              <h4 className='text-sm font-medium text-gray-900'>Description</h4>
              {isEditing ? (
                <div className='space-y-4'>
                  <div data-color-mode='light'>
                    <MDEditor
                      value={editedDescription}
                      onChange={setEditedDescription}
                      preview='edit'
                    />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                    >
                      <Save className='h-4 w-4 mr-1' />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className='inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                    >
                      <X className='h-4 w-4 mr-1' />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div data-color-mode='light'>
                  <MDEditor.Markdown source={place.description_markdown} />
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
