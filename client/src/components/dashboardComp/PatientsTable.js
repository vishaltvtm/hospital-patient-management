import React from 'react'
import { useRouter } from "next/navigation";

function PatientsTable({ patients, handleEdit, handleDelete, updateStatus }) {
        const router = useRouter();
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3">Queue No.</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Age</th>
                            <th className="p-3">Contact</th>
                            <th className="p-3">Department</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Time</th>
                            <th className="p-3">Actions</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">OPD</th>
                        </tr>
                    </thead>

                    <tbody>
                        {patients.map((patient, index) => (
                            <tr key={patient._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{patient.virtual_queue}</td>
                                <td className="p-3">{patient.name}</td>
                                <td className="p-3">{patient.age}</td>
                                <td className="p-3">{patient.contact}</td>
                                <td className="p-3">{patient.Department}</td>
                                <td className="p-3">
                                    {patient?.Date
                                        ? new Date(patient?.Date).toLocaleDateString()
                                        : ""}
                                </td>
                                <td className="p-3">{patient.time_slot}</td>
                                <td className="p-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(patient._id)}
                                            className="rounded cursor-pointer bg-amber-100 px-3 py-1 text-amber-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(patient._id)}
                                            className="rounded cursor-pointer bg-amber-100 px-3 py-1 text-amber-800"
                                        >
                                            delete
                                        </button>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <select
                                        value={patient.Status || "Pending"}
                                        onChange={(e) => updateStatus(patient._id, e.target.value)}
                                        className={`rounded-lg border p-2 cursor-pointer text-sm ${patient.Status === "Attended"
                                            ? "bg-green-100 text-green-700"
                                            : patient.Status === "Cancelled"
                                                ? "bg-red-100 text-red-700"
                                                : patient.Status === "Not Attended"
                                                    ? "bg-gray-200 text-gray-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Attended">Attended</option>
                                        <option value="Not Attended">Not Attended</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="p-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { router.push('/dashboard/opd_entry') }}
                                            className="rounded text-xs bg-yellow-200 p-2 text-amber-800 cursor-pointer"
                                        >
                                            OPD Entry
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default PatientsTable