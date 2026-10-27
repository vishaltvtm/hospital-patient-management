"use client";

import { useEffect, useState } from "react";

import PatientForm from "@/components/dashboardComp/PatientForm";
import PatientsTable from "@/components/dashboardComp/PatientsTable";
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
    const [activeTab, setActiveTab] = useState("today");
    const [TodaysPatients, setTodaysPatients] = useState([]);
    const [TomorrowPatients, setTomorrowPatients] = useState([]);
    const [AllPatients, setAllPatients] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    function getHeaders() {
        const token = localStorage.getItem("token");

        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    async function fetchTodaysPatients() {
        try {
            const res = await fetch(`${API}/patients/todays`, {
                headers: getHeaders(),
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                router.replace("/");
                return;
            }

            if (!res.ok) throw new Error("Failed to load patients");

            const data = await res.json();
            setTodaysPatients(data);
        } catch (err) {
            setError(err.message || "Could not connect to server");
        } finally {
            setLoading(false);
        }
    }

    async function fetchTomorrowPatients() {
        try {
            const res = await fetch(`${API}/patients/tomorrow`, {
                headers: getHeaders(),
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                router.replace("/");
                return;
            }

            if (!res.ok) throw new Error("Failed to load patients");

            const data = await res.json();
            setTomorrowPatients(data);
        } catch (err) {
            setError(err.message || "Could not connect to server");
        } finally {
            setLoading(false);
        }
    }
    async function fetchAllPatients() {
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
            setAllPatients(data);
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

        async function loadPatients() {
            setLoading(true);

            try {
                await Promise.all([
                    fetchTodaysPatients(),
                    fetchTomorrowPatients(),
                    fetchAllPatients(),
                ]);
            } finally {
                setLoading(false);
            }
        }

        loadPatients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (saving) return;

        setError("");
        setSaving(true);

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

            await Promise.all([
                fetchTodaysPatients(),
                fetchTomorrowPatients(),
                fetchAllPatients(),
            ]);
        } catch (err) {
            setError(err.message || "Unable to save patient");
        } finally {
            setSaving(false);
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
            alert("Status is Updated")
            // Update the patient in the frontend immediately
            setAllPatients((prev) =>
                prev.map((patient) =>
                    patient._id === id ? { ...patient, ...data } : patient
                )
            );
            setTodaysPatients((prev) =>
                prev.map((patient) =>
                    patient._id === id ? { ...patient, ...data } : patient
                )
            );
            setTomorrowPatients((prev) =>
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

            await fetchTodaysPatients();
            await fetchTomorrowPatients();
            await fetchAllPatients();
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

            <div className="mx-auto max-w-7xl space-y-6 p-2 md:p-2">
                <section className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold">
                        {editingId ? "Update Patient" : "Add New Patient"}
                    </h2>
                    <>
                        <PatientForm
                            form={form}
                            handleChange={handleChange}
                            handleSubmit={handleSubmit}
                            editingId={editingId}
                            saving={saving}
                            setForm={setForm}
                            setEditingId={setEditingId}
                        />
                    </>
                    {/* Error */}
                    {error && (
                        <p className="mb-4 mt-4 rounded-lg bg-red-50 p-3 text-red-600">
                            {error}
                        </p>
                    )}
                </section>


                <section className="rounded-xl bg-white p-6 shadow-sm">
                    {/* Tabs */}
                    <div className="mb-6 flex flex-wrap gap-3">
                        <button
                            onClick={() => setActiveTab("today")}
                            className={`rounded-lg px-4 py-2 font-medium transition ${activeTab === "today"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Today Patients ({TodaysPatients.length})
                        </button>

                        <button
                            onClick={() => setActiveTab("tomorrow")}
                            className={`rounded-lg px-4 py-2 font-medium transition ${activeTab === "tomorrow"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Tomorrow Patients ({TomorrowPatients.length})
                        </button>

                        <button
                            onClick={() => setActiveTab("all")}
                            className={`rounded-lg px-4 py-2 font-medium transition ${activeTab === "all"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            All Patients ({AllPatients.length})
                        </button>
                    </div>

                    {/* Heading */}
                    <h2 className="mb-5 text-xl font-semibold">
                        {activeTab === "today"
                            ? "Today's Patients"
                            : activeTab === "tomorrow"
                                ? "Tomorrow's Patients"
                                : "All Patients"}
                    </h2>



                    {/* Patient table */}
                    {loading ? (
                        <div className="flex items-center justify-center gap-3 py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                            <p className="text-gray-500">Loading patients...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === "today" && (
                                TodaysPatients.length === 0 ? (
                                    <p className="text-gray-500">
                                        No patients scheduled for today.
                                    </p>
                                ) : (
                                    <PatientsTable
                                        patients={TodaysPatients}
                                        handleEdit={handleEdit}
                                        handleDelete={handleDelete}
                                        updateStatus={updateStatus}
                                    />
                                )
                            )}

                            {activeTab === "tomorrow" && (
                                TomorrowPatients.length === 0 ? (
                                    <p className="text-gray-500">
                                        No patients scheduled for tomorrow.
                                    </p>
                                ) : (
                                    <PatientsTable
                                        patients={TomorrowPatients}
                                        handleEdit={handleEdit}
                                        handleDelete={handleDelete}
                                        updateStatus={updateStatus}
                                    />
                                )
                            )}

                            {activeTab === "all" && (
                                AllPatients.length === 0 ? (
                                    <p className="text-gray-500">
                                        No patients found.
                                    </p>
                                ) : (
                                    <PatientsTable
                                        patients={AllPatients}
                                        handleEdit={handleEdit}
                                        handleDelete={handleDelete}
                                        updateStatus={updateStatus}
                                    />
                                )
                            )}
                        </>
                    )}
                </section>

            </div>
        </main>
    );
}