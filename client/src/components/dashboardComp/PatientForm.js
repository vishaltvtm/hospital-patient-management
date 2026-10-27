
import React from "react";

const emptyForm = {
    name: "",
    age: "",
    contact: "",
    Department: "",
    Date: "",
    time_slot: "",
};

function PatientForm({
    form,
    handleChange,
    handleSubmit,
    editingId,
    saving,
    setForm,
    setEditingId,
}) {
    function handleCancel() {
        setForm(emptyForm);
        setEditingId(null);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-3"
        >
            <input
                name="name"
                placeholder="Patient name"
                value={form.name}
                onChange={handleChange}
                className="rounded-lg border p-3"
                required
                disabled={saving}
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
                disabled={saving}
            />

            <input
                name="contact"
                placeholder="Contact number"
                value={form.contact}
                onChange={handleChange}
                className="rounded-lg border p-3"
                required
                disabled={saving}
            />

            <select
                name="Department"
                value={form.Department}
                onChange={handleChange}
                className="cursor-pointer rounded-lg border p-3"
                required
                disabled={saving}
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
                className="cursor-pointer rounded-lg border p-3"
                required
                disabled={saving}
            />

            <select
                name="time_slot"
                value={form.time_slot}
                onChange={handleChange}
                className="cursor-pointer rounded-lg border p-3"
                required
                disabled={saving}
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
                <button
                    type="submit"
                    disabled={saving}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}

                    {saving
                        ? "Saving..."
                        : editingId
                            ? "Update Patient"
                            : "Add Patient"}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="cursor-pointer rounded-lg border px-6 py-3 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

export default PatientForm;
