import React from 'react'

function PatientForm({ form, handleChange, handleSubmit, editingId }) {
    return (
        <>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
                <input
                    name="name"
                    placeholder="Patient name"
                    value={form.name}
                    onChange={handleChange}
                    className="rounded-lg border p-3"
                    required
                />

                <input
                    name="age"
                    type="number"
                    min="0"
                    placeholder="Age"
                    value={form.age}
                    onChange={handleChange}
                    className="rounded-lg border p-3"
                    required
                />

                <input
                    name="contact"
                    placeholder="Contact number"
                    value={form.contact}
                    onChange={handleChange}
                    className="rounded-lg border p-3"
                    required
                />


                <select
                    name="Department"
                    value={form.Department}
                    onChange={handleChange}
                    className="rounded-lg cursor-pointer border p-3"
                    required
                >
                    <option value="">Select Department</option>

                    <option value="ENT (Ear, Nose & Throat)">
                        ENT (Ear, Nose & Throat)
                    </option>
                    <option value="Dental">Dental</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pulmonology (Chest & Respiratory)">
                        Pulmonology (Chest & Respiratory)
                    </option>
                    <option value="General Physician / OPD">
                        General Physician / OPD
                    </option>
                    <option value="Dermatology (Skin)">
                        Dermatology (Skin)
                    </option>
                </select>


                <input
                    name="Date"
                    type="date"
                    value={form.Date}
                    onChange={handleChange}
                    className="rounded-lg border p-3 cursor-pointer"
                    required
                />

                <select
                    name="time_slot"
                    value={form.time_slot}
                    onChange={handleChange}
                    className="rounded-lg border p-3 cursor-pointer"
                    required
                >
                    <option value="">Select Time Slot</option>

                    <optgroup label="Morning">
                        <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                        <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                        <option value="12:00 PM - 12:30 PM">12:00 PM - 12:30 PM</option>
                        <option value="12:30 PM - 01:00 PM">12:30 PM - 01:00 PM</option>
                        <option value="01:00 PM - 01:30 PM">01:00 PM - 01:30 PM</option>
                        <option value="01:30 PM - 02:00 PM">01:30 PM - 02:00 PM</option>
                    </optgroup>

                    <optgroup label="Evening">
                        <option value="05:00 PM - 05:30 PM">05:00 PM - 05:30 PM</option>
                        <option value="05:30 PM - 06:00 PM">05:30 PM - 06:00 PM</option>
                        <option value="06:00 PM - 06:30 PM">06:00 PM - 06:30 PM</option>
                        <option value="06:30 PM - 07:00 PM">06:30 PM - 07:00 PM</option>
                        <option value="07:00 PM - 07:30 PM">07:00 PM - 07:30 PM</option>
                        <option value="07:30 PM - 08:00 PM">07:30 PM - 08:00 PM</option>
                    </optgroup>
                </select>

                <div className="flex gap-3 md:col-span-3">
                    <button className="rounded-lg cursor-pointer bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
                        {editingId ? "Update Patient" : "Add Patient"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={() => {
                                setForm(emptyForm);
                                setEditingId(null);
                            }}
                            className="rounded-lg cursor-pointer border px-6 py-3"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form></>
    )
}

export default PatientForm