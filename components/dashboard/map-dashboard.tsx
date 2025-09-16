'use client';

export function MapDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🗺️ TeppekGeo
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          İş İlanları Harita Platformu
        </p>
        <p className="text-lg text-green-600 font-semibold">
          ✅ Platform başarıyla canlıya alındı!
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Backend entegrasyonu devam ediyor...
        </p>
      </div>
    </div>
  );
}