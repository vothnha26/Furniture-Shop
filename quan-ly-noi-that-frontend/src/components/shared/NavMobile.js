import React from 'react';
import { navigation } from '../../data';

const NavMobile = ({ isOpen, setIsOpen }) => {
  return (
    <div
      aria-hidden={!isOpen}
      className={`${
        isOpen ? 'right-0 pointer-events-auto' : '-right-full pointer-events-none'
      } fixed top-0 bottom-0 w-64 bg-white shadow-2xl transition-all duration-300 z-50`}
    >
      <div className='flex flex-col h-full'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='text-xl font-bold text-primary'>FurniShop</div>
          <button
            onClick={() => setIsOpen(false)}
            className='text-gray-600 hover:text-primary'
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className='flex-1 p-4'>
          <ul className='space-y-4'>
            {navigation.map((item, index) => (
              <li key={index}>
                <a
                  href={`#${item.href}`}
                  className='block py-2 text-gray-700 hover:text-primary transition-colors duration-300'
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default NavMobile;



