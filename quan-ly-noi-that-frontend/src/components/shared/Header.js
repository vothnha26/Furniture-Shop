import React, { useState } from 'react';
import { IoMenuOutline, IoCloseOutline, IoCartOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { navigation } from '../../data';
import NavMobile from './NavMobile';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { getCartCount } = useCart();

  return (
    <header className='bg-white shadow-lg relative'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <button onClick={() => navigate('/')} className='text-2xl font-bold text-primary hover:text-primary/80'>
              FurniShop
            </button>
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
            
            {/* Cart Icon */}
            <button
              onClick={() => navigate('/cart')}
              className='relative text-gray-700 hover:text-primary transition-colors duration-300'
            >
              <IoCartOutline size={24} />
              {getCartCount() > 0 && (
                <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold'>
                  {getCartCount()}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className='md:hidden flex items-center gap-4'>
            {/* Cart Icon for mobile */}
            <button
              onClick={() => navigate('/cart')}
              className='relative text-gray-700 hover:text-primary transition-colors duration-300'
            >
              <IoCartOutline size={24} />
              {getCartCount() > 0 && (
                <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold'>
                  {getCartCount()}
                </span>
              )}
            </button>
            
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



