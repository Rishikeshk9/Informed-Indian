'use client';

import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  ChevronUp,
} from 'lucide-react';
import { ExpandableRow } from '../../components/expandable-row';
import { BulkUploadPlaces } from '../../components/bulk-upload-places';
import { useState, useEffect } from 'react';
import { AddPlaceDialog } from '../../components/add-place-dialog';
import { DeletePlaceDialog } from '../../components/delete-place-dialog';
import MDEditor from '@uiw/react-md-editor';

export default function Places() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc',
  });
  const [editingId, setEditingId] = useState(null);
  const [editedPlace, setEditedPlace] = useState({});

  const fetchPlaces = async () => {
    const { data, error } = await supabase.from('places').select(`
      *,
      cities (name),
      categories (name)
    `);

    if (error) {
      setError(error);
    } else {
      // Sort by name by default
      const sortedData = [...data].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );
      setPlaces(sortedData);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleDeleteClick = (place) => {
    setPlaceToDelete(place);
    setIsDeleteDialogOpen(true);
  };

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedPlaces = [...places].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Handle nested objects (cities and categories)
      if (key === 'city') {
        aValue = a.cities?.name || '';
        bValue = b.cities?.name || '';
      } else if (key === 'category') {
        aValue = a.categories?.name || '';
        bValue = b.categories?.name || '';
      }

      // Handle null values
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      if (aValue === bValue) return 0;

      // Compare values
      return (aValue < bValue ? -1 : 1) * (direction === 'asc' ? 1 : -1);
    });

    setPlaces(sortedPlaces);
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
        <div className='text-sm text-red-700'>Error fetching places.</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-gray-900'>Places</h1>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
          >
            <Plus className='h-4 w-4 mr-2' />
            Add Place
          </button>
          <BulkUploadPlaces />
        </div>
      </div>

      <div className='bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='w-12 px-6 py-3'></th>
              <SortableHeader columnKey='name'>Name</SortableHeader>
              <SortableHeader columnKey='city'>City</SortableHeader>
              <SortableHeader columnKey='location'>Location</SortableHeader>
              <SortableHeader columnKey='category'>Category</SortableHeader>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {places.map((place) => (
              <ExpandableRow
                key={place.id}
                place={place}
                onDeleteClick={() => handleDeleteClick(place)}
              >
                <td className='px-6 py-4 text-sm text-gray-500'>
                  {editingId === place.id ? (
                    <div data-color-mode='light'>
                      <MDEditor
                        value={editedPlace.description}
                        onChange={(value) =>
                          setEditedPlace({
                            ...editedPlace,
                            description: value || '',
                          })
                        }
                        preview='edit'
                      />
                    </div>
                  ) : (
                    <div data-color-mode='light'>
                      <MDEditor.Markdown source={place.description} />
                    </div>
                  )}
                </td>
              </ExpandableRow>
            ))}
          </tbody>
        </table>
      </div>

      <AddPlaceDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />

      <DeletePlaceDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPlaceToDelete(null);
        }}
        onDelete={fetchPlaces}
        place={placeToDelete}
      />
    </div>
  );
}
