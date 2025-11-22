import { useState } from 'react';
import './styles/form.css';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    rank: '', surname: '', forename: '', serviceNumber: '',
    email: '', courseTitle: '', startDate: '', endDate: '', cicNumber: '', base: ''
  });

  const [areaInfo, setAreaInfo] = useState(null);
  const [showMaps, setShowMaps] = useState(false);

  const bases = [
    "RAF Brize Norton",
    "RAF Lossiemouth",
    "Catterick Garrison",
    "HMNB Portsmouth",
    "RAF Marham"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBaseChange = async (e) => {
    const baseName = e.target.value;
    setFormData({ ...formData, base: baseName });

    if (baseName) {
      try {
        const res = await fetch(
          `https://qpt7e2jrjj.execute-api.us-east-1.amazonaws.com/dev/base-info?base=${encodeURIComponent(baseName)}`
        );
        const raw = await res.json();

        // ✅ Proxy integration guarantees raw.body is a string
        const parsed = JSON.parse(raw.body);

        if ((raw.statusCode && raw.statusCode === 200) || res.ok) {
          setAreaInfo(parsed);
          setShowMaps(false); // reset maps until submit
          console.log("Base info parsed:", parsed);
        } else {
          console.error("Base info error:", parsed?.error || "Unknown error");
          setAreaInfo(null);
        }
      } catch (err) {
        console.error("Error fetching base info:", err);
        setAreaInfo(null);
      }
    } else {
      setAreaInfo(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("https://qpt7e2jrjj.execute-api.us-east-1.amazonaws.com/dev/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        result = { message: text };
      }

      if (response.ok) {
        alert(result.message || "Booking submitted successfully!");
      } else {
        alert("Error: " + (result.error || "Unknown error"));
      }

      if (formData.base && areaInfo) {
        setShowMaps(true);
        console.log("Showing maps for:", areaInfo);
      }
    } catch (err) {
      console.error("Error submitting booking:", err);
      alert("Submission failed. Check console for details.");
    }
  };

  return (
    <div className="form-container">
      <h1>DCA Accommodation Booking Form</h1>

      <h2>Base Selection</h2>
      <select name="base" value={formData.base} onChange={handleBaseChange}>
        <option value="">-- Choose a base --</option>
        {bases.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>

      <form>
        <h2>Personal Details</h2>
        <input name="rank" placeholder="Rank" onChange={handleChange} />
        <input name="surname" placeholder="Surname" onChange={handleChange} />
        <input name="forename" placeholder="Forename" onChange={handleChange} />
        <input name="serviceNumber" placeholder="Service Number" onChange={handleChange} />
        <input name="email" placeholder="Contact Email" onChange={handleChange} />

        <h2>Course Details</h2>
        <input name="courseTitle" placeholder="Course Title" onChange={handleChange} />
        <input name="startDate" type="date" onChange={handleChange} />
        <input name="endDate" type="date" onChange={handleChange} />
        <input name="cicNumber" placeholder="CIC Number" onChange={handleChange} />

        <button type="button" onClick={handleSubmit}>Submit Booking</button>
      </form>

      {areaInfo && showMaps && (
        <div className="area-info">
          <h3>Area Information</h3>
          <p><strong>Postcode:</strong> {areaInfo.postcode}</p>
          <p><strong>Region:</strong> {areaInfo.area_info.region}</p>
          <p><strong>District:</strong> {areaInfo.area_info.district}</p>
          <p><strong>Country:</strong> {areaInfo.area_info.country}</p>

          <div className="map-container">
            <h3>Surrounding Area (5 miles)</h3>
            {areaInfo.map_urls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Map ${idx + 1}`}
                style={{ width: "100%", height: "300px", marginBottom: "10px", border: "1px solid #ccc" }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
