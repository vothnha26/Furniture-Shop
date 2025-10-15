import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import { testimonial } from '../../data';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const TestimonialSlider = () => {
  return (
    <section className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
            {testimonial.title}
          </h2>
        </div>

        <div className='flex flex-col lg:flex-row items-center gap-12'>
          {/* Testimonial Image */}
          <div className='flex-1'>
            <img
              src={testimonial.image}
              alt='Testimonial'
              className='w-full h-auto rounded-lg shadow-lg'
            />
          </div>

          {/* Testimonials Slider */}
          <div className='flex-1'>
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              className='testimonialSlider'
            >
              {testimonial.persons.map((person, index) => (
                <SwiperSlide key={index}>
                  <div className='bg-gray-50 p-6 rounded-lg'>
                    <div className='flex items-center gap-4 mb-4'>
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className='w-12 h-12 rounded-full'
                      />
                      <div>
                        <h4 className='font-semibold text-gray-900'>
                          {person.name}
                        </h4>
                        <p className='text-gray-600 text-sm'>
                          {person.occupation}
                        </p>
                      </div>
                    </div>
                    <p className='text-gray-700 italic'>
                      {person.message}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSlider;



