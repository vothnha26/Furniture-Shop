import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import { newInStore } from '../../data';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const NewItemsSlider = () => {
  return (
    <section className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
            {newInStore.title}
          </h2>
          <p className='text-lg text-gray-600 mb-8'>
            {newInStore.subtitle}
          </p>
        </div>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          className='newItemsSlider'
        >
          {newInStore.products.map((product, index) => (
            <SwiperSlide key={index}>
              <div className='text-center group cursor-pointer'>
                <div className='bg-gray-100 rounded-lg p-6 mb-4 group-hover:bg-primary/10 transition-colors duration-300'>
                  <img
                    src={product.image}
                    alt={product.name}
                    className='w-full h-32 object-contain mx-auto'
                  />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 capitalize'>
                  {product.name}
                </h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className='text-center mt-8'>
          <a
            href='#'
            className='inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors duration-300'
          >
            {newInStore.link}
            {newInStore.icon}
          </a>
        </div>
      </div>
    </section>
  );
};

export default NewItemsSlider;



