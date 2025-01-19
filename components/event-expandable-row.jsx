'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../supabaseClient';
import { supabaseAdmin } from '../supabaseAdmin';
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Upload,
  Loader2,
  Star,
  Save,
  X,
} from 'lucide-react';
import { formatDate } from '../utils/format-date';
import MDEditor from '@uiw/react-md-editor';
import { getImageUrl } from '../utils/get-image-url';
import { v4 as uuidv4 } from 'uuid';

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

export function EventExpandableRow({ event: initialEvent, onDeleteClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [event, setEvent] = useState(initialEvent);
  const [editedEvent, setEditedEvent] = useState(initialEvent);
  const [places, setPlaces] = useState([]);
  const [editedDescription, setEditedDescription] = useState(event.description);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const fetchPlaces = async () => {
    const { data } = await supabase
      .from('places')
      .select('id, name')
      .order('name');
    if (data) setPlaces(data);
  };

  const handleEdit = async () => {
    setIsEditing(true);
    await fetchPlaces();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let primaryImagePath = editedEvent.image_url;
      let galleryImagePaths = editedEvent.image_urls || [];

      const { data, error } = await supabaseAdmin
        .from('events')
        .update({
          name: editedEvent.name,
          description: editedDescription,
          start_date: editedEvent.start_date,
          end_date: editedEvent.end_date,
          place_id: editedEvent.place_id,
          image_url: primaryImagePath,
          image_urls: galleryImagePaths,
        })
        .eq('id', event.id)
        .select(
          `
          *,
          place:places(name)
        `
        )
        .single();

      if (error) throw error;

      setEvent(data);
      setEditedEvent(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEvent(event);
    setEditedDescription(event.description);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `events/${event.id}/primary/${fileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('temples')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('events')
        .update({
          image_url: filePath,
        })
        .eq('id', event.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setEvent(updateData);
      setEditedEvent(updateData);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddGalleryImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploading(true);

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `events/${event.id}/gallery/${fileName}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('temples')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        return filePath;
      });

      const newPaths = await Promise.all(uploadPromises);
      const updatedGalleryImages = [...(event.image_urls || []), ...newPaths];

      const { data, error } = await supabaseAdmin
        .from('events')
        .update({
          image_urls: updatedGalleryImages,
        })
        .eq('id', event.id)
        .select()
        .single();

      if (error) throw error;

      setEvent(data);
      setEditedEvent(data);
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      alert('Error uploading gallery images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imagePath, type) => {
    try {
      if (type === 'primary') {
        const { error: updateError } = await supabaseAdmin
          .from('events')
          .update({
            image_url: null,
          })
          .eq('id', event.id);

        if (updateError) throw updateError;
      } else {
        const updatedGalleryImages = event.image_urls.filter(
          (path) => path !== imagePath
        );

        const { error: updateError } = await supabaseAdmin
          .from('events')
          .update({
            image_urls: updatedGalleryImages,
          })
          .eq('id', event.id);

        if (updateError) throw updateError;
      }

      const { error: deleteError } = await supabaseAdmin.storage
        .from('temples')
        .remove([imagePath]);

      if (deleteError) throw deleteError;

      // Refresh event data
      const { data, error } = await supabase
        .from('events')
        .select(
          `
          *,
          place:places(name)
        `
        )
        .eq('id', event.id)
        .single();

      if (error) throw error;

      setEvent(data);
      setEditedEvent(data);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Please try again.');
    }
  };

  const handleSetAsPrimary = async (imagePath) => {
    try {
      const { error: updateError } = await supabaseAdmin
        .from('events')
        .update({
          image_url: imagePath,
        })
        .eq('id', event.id);

      if (updateError) throw updateError;

      // Refresh event data
      const { data, error } = await supabase
        .from('events')
        .select(
          `
          *,
          place:places(name)
        `
        )
        .eq('id', event.id)
        .single();

      if (error) throw error;

      setEvent(data);
      setEditedEvent(data);
    } catch (error) {
      console.error('Error setting primary image:', error);
      alert('Error setting primary image. Please try again.');
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
            {event.image_url ? (
              <div className='relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0'>
                <Image
                  src={getImageUrl('events', event.image_url)}
                  alt={event.name}
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
                value={editedEvent.name}
                onChange={(e) =>
                  setEditedEvent({ ...editedEvent, name: e.target.value })
                }
                className='flex-1 px-2 py-1 border rounded-md'
              />
            ) : (
              <span>{event.name}</span>
            )}
          </div>
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
          {isEditing ? (
            <input
              type='datetime-local'
              value={editedEvent.start_date}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, start_date: e.target.value })
              }
              className='w-full px-2 py-1 border rounded-md'
            />
          ) : (
            formatDate(event.start_date)
          )}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
          {isEditing ? (
            <input
              type='datetime-local'
              value={editedEvent.end_date}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, end_date: e.target.value })
              }
              className='w-full px-2 py-1 border rounded-md'
            />
          ) : (
            formatDate(event.end_date)
          )}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
          {isEditing ? (
            <select
              value={editedEvent.place_id}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, place_id: e.target.value })
              }
              className='w-full px-2 py-1 border rounded-md'
            >
              <option value=''>Select Place</option>
              {places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
          ) : (
            event.place?.name
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
                onClick={() => onDeleteClick(event)}
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
          <td colSpan='7' className='px-6 py-4'>
            {/* Images Gallery */}
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='text-sm font-medium text-gray-900 flex items-center'>
                  <ImageIcon className='h-4 w-4 mr-1' />
                  Images
                </h4>
                <div className='flex gap-2'>
                  <input
                    type='file'
                    multiple
                    onChange={handleAddGalleryImages}
                    accept='image/*'
                    className='hidden'
                    id='gallery-upload'
                  />
                  <button
                    onClick={() =>
                      document.getElementById('gallery-upload').click()
                    }
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
                        Add Images
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className='grid grid-cols-4 gap-4'>
                {/* Primary Image */}
                {event.image_url && (
                  <div className='relative aspect-square rounded-lg overflow-hidden'>
                    <ImageWithFallback
                      src={getImageUrl('events', event.image_url)}
                      alt={event.name}
                      fill
                      className='object-cover'
                    />
                    <div className='absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full'>
                      Primary
                    </div>
                    <button
                      onClick={() =>
                        handleDeleteImage(event.image_url, 'primary')
                      }
                      className='absolute top-2 right-2 p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                )}
                {/* Gallery Images */}
                {event.image_urls
                  ?.filter((imagePath) => imagePath !== event.image_url)
                  .map((imagePath, index) => (
                    <div
                      key={index}
                      className='relative aspect-square rounded-lg overflow-hidden group'
                    >
                      <ImageWithFallback
                        src={getImageUrl('events', imagePath)}
                        alt={`${event.name} gallery ${index + 1}`}
                        fill
                        className='object-cover'
                      />
                      <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100'>
                        <button
                          onClick={() => handleSetAsPrimary(imagePath)}
                          className='p-1.5 rounded-full bg-white/90 hover:bg-white text-blue-600 transition-colors'
                          title='Set as primary image'
                        >
                          <Star className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteImage(imagePath, 'gallery')
                          }
                          className='p-1.5 rounded-full bg-white/90 hover:bg-white text-red-600 transition-colors'
                          title='Delete image'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Event Details */}
            <div className='grid grid-cols-2 gap-4 mb-6'>
              <div>
                <h4 className='text-sm font-medium text-gray-900 flex items-center'>
                  <MapPin className='h-4 w-4 mr-1' />
                  Location
                </h4>
                <p className='mt-1 text-sm text-gray-500'>
                  {event.place?.name}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className='text-sm font-medium text-gray-900 mb-2'>
                Description
              </h4>
              {isEditing ? (
                <div data-color-mode='light'>
                  <MDEditor
                    value={editedDescription}
                    onChange={setEditedDescription}
                    preview='edit'
                  />
                </div>
              ) : (
                <div data-color-mode='light'>
                  <MDEditor.Markdown source={event.description} />
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
