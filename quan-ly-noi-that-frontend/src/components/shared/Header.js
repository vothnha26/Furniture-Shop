import React, { useState } from 'react';
import { IoMenuOutline, IoCloseOutline } from 'react-icons/io5';
import { navigation } from '../../data';
import NavMobile from './NavMobile';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className='bg-white shadow-lg relative'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <a href='#' className='text-2xl font-bold text-primary'>
              FurniShop
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-8'>
            {navigation.map((item, index) => (
              <a
                key={index}
                href={`#${item.href}`}
                className='text-gray-700 hover:text-primary transition-colors duration-300'
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='text-gray-700 hover:text-primary transition-colors duration-300'
            >
              {isOpen ? <IoCloseOutline size={24} /> : <IoMenuOutline size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <NavMobile isOpen={isOpen} setIsOpen={setIsOpen} />
    </header>
  );
};

export default Header;



