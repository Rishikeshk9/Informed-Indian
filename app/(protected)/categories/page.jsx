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
import { AddCategoryDialog } from '../../../components/add-category-dialog';
import { DeleteCategoryDialog } from '../../../components/delete-category-dialog';
import { BulkUploadCategories } from '../../../components/bulk-upload-categories';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedCategory, setEditedCategory] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc',
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
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
    const categoriesWithCount = await Promise.all(
      data.map(async (category) => {
        const { count } = await supabase
          .from('places')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);

        return {
          ...category,
          places_count: count || 0,
          places: undefined,
        };
      })
    );

    const sortedData = [...categoriesWithCount].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
    setCategories(sortedData);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditedCategory({ ...category });
  };

  const handleSave = async () => {
    try {
      const { error } = await supabaseAdmin
        .from('categories')
        .update({
          name: editedCategory.name,
          description: editedCategory.description,
        })
        .eq('id', editingId);

      if (error) throw error;

      fetchCategories();
      setEditingId(null);
      setEditedCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedCategory(null);
  };

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedCategories = [...categories].sort((a, b) => {
      if (key === 'places_count') {
        return direction === 'asc'
          ? (a.places_count || 0) - (b.places_count || 0)
          : (b.places_count || 0) - (a.places_count || 0);
      }

      const aValue = a[key] || '';
      const bValue = b[key] || '';
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    setCategories(sortedCategories);
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
        <div className='text-sm text-red-700'>Error fetching categories.</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-gray-900'>Categories</h1>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
          >
            <Plus className='h-4 w-4 mr-2' />
            Add Category
          </button>
          <BulkUploadCategories />
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
            {categories.map((category) => (
              <tr key={category.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {editingId === category.id ? (
                    <input
                      type='text'
                      value={editedCategory.name}
                      onChange={(e) =>
                        setEditedCategory({
                          ...editedCategory,
                          name: e.target.value,
                        })
                      }
                      className='w-full px-2 py-1 border rounded-md'
                    />
                  ) : (
                    category.name
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {editingId === category.id ? (
                    <input
                      type='text'
                      value={editedCategory.description}
                      onChange={(e) =>
                        setEditedCategory({
                          ...editedCategory,
                          description: e.target.value,
                        })
                      }
                      className='w-full px-2 py-1 border rounded-md'
                    />
                  ) : (
                    category.description
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {category.places_count}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {formatDate(category.created_at)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  {editingId === category.id ? (
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
                        onClick={() => handleEdit(category)}
                        className='text-blue-600 hover:text-blue-900 inline-flex items-center'
                      >
                        <Pencil className='h-4 w-4 mr-1' />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
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

      <AddCategoryDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />

      <DeleteCategoryDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onDelete={fetchCategories}
        category={categoryToDelete}
      />
    </div>
  );
}
