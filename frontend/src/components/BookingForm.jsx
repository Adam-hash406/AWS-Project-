// BookingForm.jsx
import React, { useState } from "react";

const BookingForm = () => {
  const [selectedBase, setSelectedBase] = useState("");
  const [areaInfo, setAreaInfo] = useState(null);

  const bases = [
    { name: "RAF Brize Norton", postcode: "OX18 3LX" },
    { name: "RAF Coningsby", postcode: "LN4 4SY" },
    { name: "RAF Lossiemouth", postcode: "IV31 6SD" }
    // add more bases with postcodes here
  ];

  const handleBaseChange = async (e) => {
    const baseName = e.target.value;
    setSelectedBase(baseName);

    const base = bases.find((b) => b.name === baseName);
    if (!base) return;

    try {
      // Call your Lambda /base-info endpoint
      const response = await fetch(
        `https://qpt7e2jrjj.execute-api.us-east-1.amazonaws.com/dev/base-info?postcode=${base.postcode}`
      );
      const data = await response.json();
      console.log("Base info response:", data);

      // Expect Lambda to return { postcode, region, district, country, map_url }
      setAreaInfo(data);
    } catch (error) {
      console.error("Error fetching base info:", error);
    }
  };

  return (
    <div className="booking-form">
      <h2>Select a Base</h2>
      <select value={selectedBase} onChange={handleBaseChange}>
        <option value="">-- Select a Base --</option>
        {bases.map((base) => (
          <option key={base.name} value={base.name}>
            {base.name}
          </option>
        ))}
      </select>

      {areaInfo && (
        <div className="area-info">
          <h3>Area Information</h3>
          <p><strong>Postcode:</strong> {areaInfo.postcode}</p>
          <p><strong>Region:</strong> {areaInfo.region}</p>
          <p><strong>District:</strong> {areaInfo.district}</p>
          <p><strong>Country:</strong> {areaInfo.country}</p>

          {/* Map image returned from Lambda */}
          {areaInfo.map_url && (
            <div className="map-container">
              <h3>Surrounding Area (5 miles)</h3>
              <img
                src={areaInfo.map_url}
                alt="Map of surrounding area"
                style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingForm;
