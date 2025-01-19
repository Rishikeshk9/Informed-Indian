'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { supabaseAdmin } from '../../supabaseAdmin';
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Save,
  X,
  ImagePlus,
} from 'lucide-react';
import { formatDate } from '../../utils/format-date';
import { AddEventDialog } from '../../components/add-event-dialog';
import { DeleteEventDialog } from '../../components/delete-event-dialog';
import { BulkUploadEvents } from '../../components/bulk-upload-events';
import MDEditor from '@uiw/react-md-editor';
import { getImageUrl } from '../../utils/get-image-url';
import { v4 as uuidv4 } from 'uuid';
import { EventExpandableRow } from '../../components/event-expandable-row';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedEvent, setEditedEvent] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc',
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [places, setPlaces] = useState([]);
  const [primaryImageFile, setPrimaryImageFile] = useState(null);
  const [newGalleryImages, setNewGalleryImages] = useState([]);
  const [primaryImagePreview, setPrimaryImagePreview] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const primaryImageRef = useRef(null);
  const galleryImageRef = useRef(null);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select(
        `
        *,
        place:places(name)
      `
      )
      .order('start_date');

    if (error) {
      setError(error);
      return;
    }

    const sortedData = [...data].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
    setEvents(sortedData);
  };

  const fetchPlaces = async () => {
    const { data } = await supabase
      .from('places')
      .select('id, name')
      .order('name');
    setPlaces(data || []);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = async (event) => {
    await fetchPlaces();
    setEditingId(event.id);
    setEditedEvent({ ...event });
    setPrimaryImagePreview(
      event.image_url ? getImageUrl('events', event.image_url) : ''
    );
    setGalleryPreviews(
      event.image_urls?.map((image) => getImageUrl('events', image)) || []
    );
  };

  const handlePrimaryImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrimaryImageFile(file);
      setPrimaryImagePreview(URL.createObjectURL(file));
      setEditedEvent({
        ...editedEvent,
        primary_image_changed: true,
      });
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewGalleryImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    setEditedEvent({
      ...editedEvent,
      gallery_images_changed: true,
    });
  };

  const removeGalleryImage = (index, isExisting = false) => {
    if (isExisting) {
      setEditedEvent({
        ...editedEvent,
        image_urls: editedEvent.image_urls.filter((_, i) => i !== index),
        gallery_images_changed: true,
      });
    } else {
      setNewGalleryImages((prev) => prev.filter((_, i) => i !== index));
      setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const uploadImage = async (file, path) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    //
    const { error: uploadError } = await supabaseAdmin.storage
      .from('events')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    return filePath;
  };

  const handleSave = async () => {
    try {
      let primaryImagePath = editedEvent.image_url;
      let galleryImagePaths = editedEvent.image_urls || [];

      if (editedEvent.primary_image_changed && primaryImageFile) {
        if (editedEvent.image_url) {
          await supabaseAdmin.storage
            .from('events')
            .remove([`primary/${editedEvent.image_url.split('/').pop()}`]);
        }
        primaryImagePath = await uploadImage(primaryImageFile, 'primary');
      }

      if (editedEvent.gallery_images_changed) {
        if (newGalleryImages.length > 0) {
          const newPaths = await Promise.all(
            newGalleryImages.map((file) => uploadImage(file, 'gallery'))
          );
          galleryImagePaths = [...galleryImagePaths, ...newPaths];
        }
      }

      const { error } = await supabaseAdmin
        .from('events')
        .update({
          name: editedEvent.name,
          description: editedEvent.description,
          start_date: editedEvent.start_date,
          end_date: editedEvent.end_date,
          place_id: editedEvent.place_id,
          image_url: primaryImagePath,
          image_urls: galleryImagePaths,
        })
        .eq('id', editingId);

      if (error) throw error;

      fetchEvents();
      setEditingId(null);
      setEditedEvent(null);
      setPrimaryImageFile(null);
      setNewGalleryImages([]);
      setPrimaryImagePreview('');
      setGalleryPreviews([]);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedEvent(null);
  };

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedEvents = [...events].sort((a, b) => {
      if (key === 'start_date' || key === 'end_date') {
        const aDate = new Date(a[key] || '');
        const bDate = new Date(b[key] || '');
        return direction === 'asc'
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }

      const aValue = a[key] || '';
      const bValue = b[key] || '';
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    setEvents(sortedEvents);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <ChevronUp className='h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100' />
      );
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className='h-4 w-4 text-blue-500' />
    ) : (
      <ChevronDown className='h-4 w-4 text-blue-500' />
    );
  };

  const SortableHeader = ({ columnKey, children }) => (
    <th
      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer hover:bg-gray-50'
      onClick={() => sortData(columnKey)}
    >
      <div className='flex items-center gap-1'>
        {children}
        <SortIcon columnKey={columnKey} />
      </div>
    </th>
  );

  if (error) {
    return (
      <div className='rounded-md bg-red-50 p-4'>
        <div className='text-sm text-red-700'>Error fetching events.</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-gray-900'>Events</h1>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
          >
            <Plus className='h-4 w-4 mr-2' />
            Add Event
          </button>
          <BulkUploadEvents />
        </div>
      </div>

      <div className='bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead>
            <tr className='bg-gray-50'>
              <SortableHeader columnKey='name'>Name</SortableHeader>
              <SortableHeader columnKey='description'>
                Description
              </SortableHeader>
              <SortableHeader columnKey='start_date'>Start Date</SortableHeader>
              <SortableHeader columnKey='end_date'>End Date</SortableHeader>
              <SortableHeader columnKey='place.name'>Place</SortableHeader>

              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {events.map((event) => (
              <EventExpandableRow
                key={event.id}
                event={event}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      <AddEventDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />

      <DeleteEventDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setEventToDelete(null);
        }}
        onDelete={fetchEvents}
        event={eventToDelete}
      />
    </div>
  );
}
