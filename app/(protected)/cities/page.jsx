'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { supabaseAdmin } from '../../../supabaseAdmin';
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { formatDate } from '../../../utils/format-date';
import { BulkUploadCities } from '../../../components/bulk-upload-cities';
import { AddCityDialog } from '../../../components/add-city-dialog';
import { DeleteCityDialog } from '../../../components/delete-city-dialog';
import { CitiesFilter } from '../../../components/cities-filter';

const COUNTRIES = [
  { id: 'IN', name: 'India' },
  { id: 'AE', name: 'UAE' },
  { id: 'UK', name: 'UK' },
  { id: 'TH', name: 'Thailand' },
  { id: 'OM', name: 'Oman' },
];

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedCity, setEditedCity] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc',
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);
  const [filteredCities, setFilteredCities] = useState([]);

  const fetchCities = async () => {
    // Get all cities without inner join
    const { data, error } = await supabase
      .from('cities')
      .select(
        `
        *,
        places:places(id)
      `
      )
      .order('name');

    if (error) {
      setError(error);
      return;
    }

    // Process the data to include places count
    const citiesWithCount = await Promise.all(
      data.map(async (city) => {
        const { count } = await supabase
          .from('places')
          .select('*', { count: 'exact', head: true })
          .eq('city_id', city.id);

        return {
          ...city,
          places_count: count || 0,
          places: undefined, // Remove the places array as we only need the count
        };
      })
    );

    // Sort by name by default
    const sortedData = [...citiesWithCount].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
    setCities(sortedData);
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    setFilteredCities(cities);
  }, [cities]);

  const handleDeleteClick = (city) => {
    setCityToDelete(city);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (city) => {
    setEditingId(city.id);
    setEditedCity({ ...city });
  };

  const handleSave = async () => {
    try {
      const { error } = await supabaseAdmin
        .from('cities')
        .update({
          name: editedCity.name,
          state: editedCity.state,
          country: editedCity.country,
        })
        .eq('id', editingId);

      if (error) throw error;

      // Refresh the cities list
      fetchCities();
      setEditingId(null);
      setEditedCity(null);
    } catch (error) {
      console.error('Error updating city:', error);
      alert('Error updating city. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedCity(null);
  };

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedCities = [...cities].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Handle places_count sorting
      if (key === 'places_count') {
        aValue = a.places_count || 0;
        bValue = b.places_count || 0;
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle null values
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      if (aValue === bValue) return 0;

      // Compare values
      return (aValue < bValue ? -1 : 1) * (direction === 'asc' ? 1 : -1);
    });

    setCities(sortedCities);
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

  const getCountryName = (countryCode) => {
    return (
      COUNTRIES.find((country) => country.id === countryCode)?.name ||
      countryCode
    );
  };

  const handleFilter = ({ country, state }) => {
    let filtered = [...cities];

    if (country) {
      filtered = filtered.filter((city) => city.country === country);
    }

    if (state) {
      const searchState = state.toLowerCase();
      filtered = filtered.filter((city) =>
        city.state.toLowerCase().includes(searchState)
      );
    }

    setFilteredCities(filtered);
  };

  if (error) {
    return (
      <div className='rounded-md bg-red-50 p-4'>
        <div className='text-sm text-red-700'>Error fetching cities.</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-gray-900'>Cities</h1>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
          >
            <Plus className='h-4 w-4 mr-2' />
            Add City
          </button>
          <BulkUploadCities />
        </div>
      </div>

      <CitiesFilter onFilter={handleFilter} />

      <div className='bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead>
            <tr className='bg-gray-50'>
              <SortableHeader columnKey='name'>Name</SortableHeader>
              <SortableHeader columnKey='state'>State</SortableHeader>
              <SortableHeader columnKey='country'>Country</SortableHeader>
              <SortableHeader columnKey='places_count'>
                Places Count
              </SortableHeader>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Created At
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredCities.map((city) => (
              <tr key={city.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {editingId === city.id ? (
                    <input
                      type='text'
                      value={editedCity.name}
                      onChange={(e) =>
                        setEditedCity({ ...editedCity, name: e.target.value })
                      }
                      className='w-full px-2 py-1 border rounded-md'
                    />
                  ) : (
                    city.name
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {editingId === city.id ? (
                    <input
                      type='text'
                      value={editedCity.state}
                      onChange={(e) =>
                        setEditedCity({ ...editedCity, state: e.target.value })
                      }
                      className='w-full px-2 py-1 border rounded-md'
                    />
                  ) : (
                    city.state
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {editingId === city.id ? (
                    <select
                      value={editedCity.country}
                      onChange={(e) =>
                        setEditedCity({
                          ...editedCity,
                          country: e.target.value,
                        })
                      }
                      className='w-full px-2 py-1 border rounded-md'
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    getCountryName(city.country)
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {city.places_count}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {formatDate(city.created_at)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  {editingId === city.id ? (
                    <div className='flex justify-end gap-2'>
                      <button
                        onClick={handleSave}
                        className='text-green-600 hover:text-green-900 inline-flex items-center'
                      >
                        <Save className='h-4 w-4 mr-1' />
                        Save
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
                        onClick={() => handleEdit(city)}
                        className='text-blue-600 hover:text-blue-900 inline-flex items-center'
                      >
                        <Pencil className='h-4 w-4 mr-1' />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(city)}
                        className='text-red-600 hover:text-red-900 ml-4 inline-flex items-center'
                      >
                        <Trash2 className='h-4 w-4 mr-1' />
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddCityDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />

      <DeleteCityDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCityToDelete(null);
        }}
        onDelete={fetchCities}
        city={cityToDelete}
      />
    </div>
  );
}
