import { useState } from "react";

const App = () => {
  const [coords, setCoords] = useState(null);
  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState("");
  const [placeType, setPlaceType] = useState("restaurant");

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setStatus("Getting your location...");
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  };

  const showPosition = (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    setCoords({ lat, lng });
    setStatus(`Your coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    fetchNearbyPlaces(lat, lng);
  };

  const showError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setStatus("Permission denied for location access.");
        break;
      case error.POSITION_UNAVAILABLE:
        setStatus("Location information unavailable.");
        break;
      case error.TIMEOUT:
        setStatus("Location request timed out.");
        break;
      default:
        setStatus("An unknown error occurred.")
    }
  };

  const fetchNearbyPlaces = async (lat, lng) => {
    try {
      setStatus(`Fetching nearby ${placeType}s...`);
      const res = await fetch("https://geo-spatial-backend.vercel.app/api/nearby-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, type: placeType }),
      });

      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Backend error:", errorData);
        setStatus(`Error: ${errorData.error || 'Failed to fetch places'}`);
        return;
      }
      
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setPlaces(data.results);
        setStatus(`Found ${data.results.length} ${placeType}s nearby.`);
      } else {
        setPlaces([]);
        setStatus(`No ${placeType}s found nearby.`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setStatus(`Error fetching ${placeType}s: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-6 sm:p-8 transition-all duration-300">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Nearby Places Finder
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-gray-700 font-semibold text-sm">Select Type:</span>
            <select
              value={placeType}
              onChange={(e) => setPlaceType(e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white cursor-pointer"
            >
              <option value="restaurant">🍽️ Restaurant</option>
              <option value="school">🎓 School</option>
              <option value="hotel">🏨 Hotel</option>
              <option value="hospital">🏥 Hospital</option>
              <option value="bank">🏦 Bank</option>
            </select>
          </label>

          <button
            onClick={getLocation}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            📍 Get My Location
          </button>
        </div>

        {status && (
          <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-blue-800 text-sm font-medium">{status}</p>
          </div>
        )}

        {coords && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <p className="text-green-800 text-sm">
              <strong>📍 Location:</strong> {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          </div>
        )}

        {places.length > 0 && (
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Results ({places.length})
            </h3>
          </div>
        )}

        <ul className="space-y-3">
          {places.map((place, index) => (
            <li
              key={place.id}
              className="bg-white border-2 border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <strong className="text-gray-900 text-lg leading-tight">{place.name}</strong>
                  </div>
                </div>
                <div className="text-gray-600 text-sm pl-8">
                  {place.address}
                </div>
                <div className="flex flex-wrap gap-2 mt-1 pl-8">
                  {place.distance && (
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {place.distance}
                    </span>
                  )}
                  {place.distance === null && (
                    <span className="inline-flex items-center gap-1.5 bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs font-semibold">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      N/A
                    </span>
                  )}
                  {place.travelTime && (
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {place.travelTime}
                    </span>
                  )}
                  {place.travelTime === null && (
                    <span className="inline-flex items-center gap-1.5 bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs font-semibold">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      N/A
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {places.length === 0 && coords && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">🔍</div>
            <p className="text-gray-500 font-medium">No places found nearby</p>
            <p className="text-gray-400 text-sm mt-1">Try selecting a different place type</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
