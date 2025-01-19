'use client';

import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { supabaseAdmin } from '../supabaseAdmin';

export function DeleteCategoryDialog({ isOpen, onClose, onDelete, category }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!category) return;

    setIsDeleting(true);
    try {
      // Check if category has any places
      const { count } = await supabaseAdmin
        .from('places')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id);

      if (count > 0) {
        throw new Error(
          'Cannot delete category that has places. Please delete or reassign all places first.'
        );
      }

      // Delete the category record
      const { error } = await supabaseAdmin
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;

      onDelete(); // Refresh the categories list
      onClose();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.message || 'Error deleting category. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
        <div className='flex items-center justify-between mb-5'>
          <div className='flex items-center space-x-2'>
            <AlertTriangle className='h-6 w-6 text-red-600' />
            <h2 className='text-xl font-semibold text-gray-900'>
              Delete Category
            </h2>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-500'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='mb-5'>
          <p className='text-sm text-gray-500'>
            Are you sure you want to delete "{category?.name}"? This action
            cannot be undone.
            <br />
            <br />
            Note: Categories with associated places cannot be deleted. Please
            delete or reassign all places first.
          </p>
        </div>

        <div className='flex justify-end gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleDelete}
            disabled={isDeleting}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isDeleting ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
