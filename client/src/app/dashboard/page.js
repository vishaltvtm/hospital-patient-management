"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

const emptyForm = {
    name: "",
    age: "",
    contact: "",
    Department: "",
    Date: "",
    time_slot: "",
};

export default function Dashboard() {
    const router = useRouter();
    const [patients, setPatients] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    function getHeaders() {
        const token = localStorage.getItem("token");

        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    async function fetchPatients() {
        try {
            const res = await fetch(`${API}/patients`, {
                headers: getHeaders(),
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                router.replace("/");
                return;
            }

            if (!res.ok) throw new Error("Failed to load patients");

            const data = await res.json();
            setPatients(data);
        } catch (err) {
            setError(err.message || "Could not connect to server");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            router.replace("/");
            return;
        }

        fetchPatients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            const url = editingId
                ? `${API}/patients/${editingId}`
                : `${API}/patients`;

            const res = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    ...form,
                    age: Number(form.age),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Unable to save patient");
            }

            setForm(emptyForm);
            setEditingId(null);
            await fetchPatients();
        } catch (err) {
            setError(err.message || "Unable to save patient");
        }
    }

    async function handleEdit(id) {
        setError("");

        try {
            const res = await fetch(`${API}/patients/${id}`, {
                headers: getHeaders(),
            });

            const patient = await res.json();

            if (!res.ok) {
                throw new Error(patient.message || "Unable to load patient");
            }

            setForm({
                name: patient.name || "",
                age: patient.age ?? "",
                contact: patient.contact || "",
                Department: patient.Department || "",
                Date: patient.Date ? patient.Date.slice(0, 10) : "",
                time_slot: patient.time_slot || "",
            });

            setEditingId(id);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            setError(err.message);
        }
    }
    async function updateStatus(id, Status) {
  try {
    const res = await fetch(`${API}/patients/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ Status }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to update status");
    }

    // Update the patient in the frontend immediately
    setPatients((prev) =>
      prev.map((patient) =>
        patient._id === id ? { ...patient, ...data } : patient
      )
    );
  } catch (err) {
    setError(err.message || "Failed to update status");
  }
}

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this patient?")) {
            return;
        }

        setError("");

        try {
            const res = await fetch(`${API}/patients/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Unable to delete patient");
            }

            await fetchPatients();
        } catch (err) {
            setError(err.message || "Unable to delete patient");
        }
    }

    function handleLogout() {
        localStorage.removeItem("token");
        router.replace("/");
    }

    return (
        <main className="min-h-screen bg-gray-100">
            <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <h1 className="text-xl font-bold text-blue-700">
                    Patient Management
                </h1>

                <button
                    onClick={handleLogout}
                    className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                    Logout
                </button>
            </header>

            <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
                <section className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold">
                        {editingId ? "Update Patient" : "Add New Patient"}
                    </h2>

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

                        <input
                            name="Department"
                            placeholder="Department"
                            value={form.Department}
                            onChange={handleChange}
                            className="rounded-lg border p-3"
                            required
                        />

                        <input
                            name="Date"
                            type="date"
                            value={form.Date}
                            onChange={handleChange}
                            className="rounded-lg border p-3"
                            required
                        />

                        <select
                            name="time_slot"
                            value={form.time_slot}
                            onChange={handleChange}
                            className="rounded-lg border p-3"
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
                            <button className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
                                {editingId ? "Update Patient" : "Add Patient"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForm(emptyForm);
                                        setEditingId(null);
                                    }}
                                    className="rounded-lg border px-6 py-3"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Patients</h2>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                            Total: {patients.length}
                        </span>
                    </div>

                    {error && (
                        <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
                            {error}
                        </p>
                    )}

                    {loading ? (
                        <p className="text-gray-500">Loading patients...</p>
                    ) : patients.length === 0 ? (
                        <p className="text-gray-500">No patients found. Add your first patient.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Age</th>
                                        <th className="p-3">Contact</th>
                                        <th className="p-3">Department</th>
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Time</th>
                                        <th className="p-3">Actions</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {patients.map((patient) => (
                                        <tr key={patient._id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{patient.name}</td>
                                            <td className="p-3">{patient.age}</td>
                                            <td className="p-3">{patient.contact}</td>
                                            <td className="p-3">{patient.Department}</td>
                                            <td className="p-3">
                                                {patient.Date
                                                    ? new Date(patient.Date).toLocaleDateString()
                                                    : ""}
                                            </td>
                                            <td className="p-3">{patient.time_slot}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(patient._id)}
                                                        className="rounded bg-amber-100 px-3 py-1 text-amber-800"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(patient._id)}
                                                        className="rounded bg-red-100 px-3 py-1 text-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <select
                                                    value={patient.Status || "Pending"}
                                                    onChange={(e) => updateStatus(patient._id, e.target.value)}
                                                    className={`rounded-lg border p-2 text-sm ${patient.Status === "Completed"
                                                            ? "bg-green-100 text-green-700"
                                                            : patient.Status === "Cancelled"
                                                                ? "bg-red-100 text-red-700"
                                                                : patient.Status === "Not Attended"
                                                                    ? "bg-gray-200 text-gray-700"
                                                                    : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Not Attended">Not Attended</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}