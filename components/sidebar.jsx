'use client';
import Link from 'next/link';
import {
  Home,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`bg-white border-r border-gray-200 h-screen flex flex-col relative transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div
        className={`p-6 flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <h1
          className={`font-semibold text-gray-900 transition-opacity duration-300 ${
            isCollapsed ? 'hidden' : 'text-xl'
          }`}
        >
          Admin Panel
        </h1>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
        >
          {isCollapsed ? (
            <ChevronRight size={20} className='text-gray-500' />
          ) : (
            <ChevronLeft size={20} className='text-gray-500' />
          )}
        </button>
      </div>
      <nav className='flex-1 px-4 space-y-1'>
        <NavItem
          href='/'
          icon={<Home size={20} />}
          text='Dashboard'
          isCollapsed={isCollapsed}
        />
        <NavItem
          href='/places'
          icon={<MapPin size={20} />}
          text='Places'
          isCollapsed={isCollapsed}
        />
        <NavItem
          href='/cities'
          icon={<Building2 size={20} />}
          text='Cities'
          isCollapsed={isCollapsed}
        />
        <NavItem
          href='/categories'
          icon={<MapPin size={20} />}
          text='Categories'
          isCollapsed={isCollapsed}
        />
        <NavItem
          href='/events'
          icon={<Calendar size={20} />}
          text='Events'
          isCollapsed={isCollapsed}
        />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, text, isCollapsed }) {
  return (
    <Link
      href={href}
      className='flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group'
    >
      <span className='mr-3 text-gray-400 group-hover:text-gray-500'>
        {icon}
      </span>
      <span
        className={`transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
        }`}
      >
        {text}
      </span>
    </Link>
  );
}
