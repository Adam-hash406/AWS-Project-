import { useState } from 'react';
import './styles/form.css';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    rank: '', surname: '', forename: '', serviceNumber: '',
    email: '', courseTitle: '', startDate: '', endDate: '', cicNumber: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("https://qpt7e2jrjj.execute-api.us-east-1.amazonaws.com/dev/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (response.ok) {
        alert("Booking submitted successfully!");
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("Error submitting booking:", err);
      alert("Submission failed. Check console for details.");
    }
  };

  return (
    <div className="form-container">
      <h1>DCA Accommodation Booking Form</h1>
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
    </div>
  );
}
