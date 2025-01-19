'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, Download } from 'lucide-react';
import { supabaseAdmin } from '../supabaseAdmin';
import Papa from 'papaparse';

export function BulkUploadEvents() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/events-template.csv';
    link.download = 'events-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const result = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results),
          error: (error) => reject(error),
        });
      });

      if (result.errors.length > 0) {
        console.error('CSV parsing errors:', result.errors);
        throw new Error('Error parsing CSV file');
      }

      const events = result.data
        .map((row) => ({
          name: row.name?.trim(),
          description: row.description?.trim(),
          start_date: row.start_date?.trim(),
          end_date: row.end_date?.trim(),
          place_id: row.place_id?.trim(),
        }))
        .filter((event) => event.name && event.place_id);

      setProgress({ current: 0, total: events.length });

      // Process events in batches of 10
      const batchSize = 10;
      for (let i = 0; i < events.length; i += batchSize) {
        const batch = events.slice(i, i + batchSize);
        const { error } = await supabaseAdmin.from('events').insert(batch);

        if (error) throw error;
        setProgress((prev) => ({ ...prev, current: i + batch.length }));
      }

      alert('Bulk upload completed successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error uploading events:', error);
      alert(
        'Error uploading events. Please check the CSV format and try again.'
      );
    } finally {
      setIsUploading(false);
      setProgress({ current: 0, total: 0 });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <button
        onClick={handleDownloadTemplate}
        className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
      >
        <Download className='h-4 w-4 mr-2' />
        Template
      </button>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept='.csv'
        className='hidden'
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isUploading ? (
          <>
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            {progress.current}/{progress.total}
          </>
        ) : (
          <>
            <Upload className='h-4 w-4 mr-2' />
            Bulk Upload
          </>
        )}
      </button>
    </div>
  );
}
