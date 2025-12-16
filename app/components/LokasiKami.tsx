// FILE: app/components/LokasiKami.tsx
// Letakkan file ini di folder components Anda (sejajar dengan Header.tsx)

import React from 'react';

const LokasiKami = () => {
  const alamat = "Jl. Lap. Golf, Kp. Tengah, Kec. Pancur Batu, Kabupaten Deli Serdang, Sumatera Utara";
  const googleMapsLink = "https://maps.app.goo.gl/4XubE8Xa94614m1V8";

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-purple-600 to-indigo-600">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-10 text-center">
            <h2 className="text-4xl font-bold mb-2">📍 Lokasi Kami</h2>
            <p className="text-purple-100">Temukan kami dengan mudah</p>
          </div>

          {/* Content */}
          <div className="p-10">
            {/* Icon */}
            <div className="text-center mb-8">
              <div className="text-8xl animate-bounce">🗺️</div>
            </div>

            {/* Address Box */}
            <div className="bg-gray-50 border-l-4 border-purple-600 rounded-lg p-6 mb-8">
              <p className="text-gray-700 leading-relaxed text-lg">
                <strong className="text-gray-900">Alamat:</strong><br />
                {alamat}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-4 px-6 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                🧭 Buka Google Maps
              </a>
              
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white text-purple-600 text-center py-4 px-6 rounded-full font-bold text-lg border-2 border-purple-600 transition-all duration-300 hover:bg-purple-600 hover:text-white hover:scale-105"
              >
                🚗 Petunjuk Arah
              </a>
            </div>

            {/* Info Text */}
            <p className="text-center text-gray-500 mt-6 text-sm">
              💡 Klik tombol di atas untuk membuka lokasi di Google Maps
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LokasiKami;