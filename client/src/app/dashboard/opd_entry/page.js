
"use client";

import { useEffect, useState } from "react";

const emptyPatient = {
  patientId: "",
  patientName: "",
  age: "",
  sex: "",
  guardName: "",
  relationship: "",
  contactNumber: "",
  patientAddress: "",
  city: "",
  state: "",
  occupation: "",
  emailId: "",
  amount: "",
  validUpto: "",
  doctorName: "",
  patientType: "",
};

const fields = [
  { key: "patientId", label: "Patient ID" },
  { key: "patientName", label: "Patient Name" },
  { key: "age", label: "Age", type: "number" },
  {
    key: "sex",
    label: "Sex",
    options: ["Male", "Female", "Other"],
  },
  { key: "guardName", label: "Guard Name" },
  {
    key: "relationship",
    label: "Relationship",
    options: ["Father", "Mother", "Spouse", "Guardian", "Other"],
  },
  { key: "contactNumber", label: "Contact Number", type: "tel" },
  { key: "patientAddress", label: "Patient Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "occupation", label: "Occupation" },
  { key: "emailId", label: "Email ID", type: "email" },
  { key: "amount", label: "Amount", type: "number" },
  { key: "validUpto", label: "Valid Upto", type: "date" },
  { key: "doctorName", label: "Doctor Name" },
  {
    key: "patientType",
    label: "Type of Patient",
    options: ["General", "ECHS", "ESI", "Private", "Other"],
  },
];

export default function OPDRegistration() {
  const [patient, setPatient] = useState(emptyPatient);
  const [records, setRecords] = useState([]);
  const [clock, setClock] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const updateClock = () => setClock(new Date().toLocaleString());
    updateClock();

    const timer = setInterval(updateClock, 1000);

    try {
      const saved = localStorage.getItem("opd-patients");
      if (saved) setRecords(JSON.parse(saved));
    } catch {
      setMessage("Unable to load saved records.");
    }

    return () => clearInterval(timer);
  }, []);

  function saveRecords(nextRecords) {
    setRecords(nextRecords);

    try {
      localStorage.setItem("opd-patients", JSON.stringify(nextRecords));
      setMessage("Patient record saved successfully.");
    } catch {
      setMessage("Unable to save record in browser storage.");
    }
  }

  function handleChange(key, value) {
    setPatient((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  }

  function handleNew() {
    setPatient({
      ...emptyPatient,
      patientId: `OPD-${Date.now().toString().slice(-8)}`,
    });
    setMessage("");
  }

  function handleUpdate() {
    if (!patient.patientId.trim() || !patient.patientName.trim()) {
      alert("Please enter Patient ID and Patient Name.");
      return;
    }

    const exists = records.some(
      (record) => record.patientId === patient.patientId
    );

    const nextRecords = exists
      ? records.map((record) =>
          record.patientId === patient.patientId
            ? { ...patient }
            : record
        )
      : [...records, { ...patient }];

    saveRecords(nextRecords);
  }

  function handleLoad() {
    const id = prompt("Enter Patient ID:");

    if (!id) return;

    const record = records.find(
      (item) => item.patientId === id.trim()
    );

    if (!record) {
      alert("Patient record not found.");
      return;
    }

    setPatient({ ...record });
    setMessage("Patient record loaded.");
  }

  function handlePrint(echs = false) {
    if (!patient.patientName.trim()) {
      alert("Please enter Patient Name before printing.");
      return;
    }

    document.body.dataset.printMode = echs ? "echs" : "normal";
    window.print();
    setTimeout(() => {
      delete document.body.dataset.printMode;
    }, 1000);
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border bg-white shadow-lg">
        {/* Header */}
        <header className="grid grid-cols-1 items-center gap-3 bg-blue-900 px-5 py-5 text-white md:grid-cols-3">
          <div className="text-center text-sm md:text-left">
            <p className=" text-blue-200">Patient ID: <span className="font-bold text-white">1</span> </p>
          
          </div>

          <h1 className="text-center text-2xl font-bold sm:text-3xl">
            OPD Registration
          </h1>

          <div className="text-center text-sm md:text-right">
            <p className="text-xs text-blue-200">Current Date and Time</p>
            <p>{clock}</p>
          </div>
        </header>

        <div className="p-4 sm:p-7">
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Patient Registration Form
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Enter the patient information below.
          </p>

          {/* Form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {fields.map((field) => (
              <div
                key={field.key}
                className={
                  field.key === "patientAddress" ? "sm:col-span-2" : ""
                }
              >
                <label
                  htmlFor={field.key}
                  className="block text-sm font-medium text-slate-700"
                >
                  {field.label}
                </label>

                {field.options ? (
                  <select
                    id={field.key}
                    value={patient[field.key]}
                    onChange={(e) =>
                      handleChange(field.key, e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.key}
                    type={field.type || "text"}
                    min={
                      ["age", "amount"].includes(field.key)
                        ? 0
                        : undefined
                    }
                    value={patient[field.key]}
                    onChange={(e) =>
                      handleChange(field.key, e.target.value)
                    }
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </form>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-3 border-t pt-6 print:hidden">
            <button
              onClick={() => handlePrint(false)}
              className="rounded-md bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Print
            </button>

            <button
              onClick={handleUpdate}
              className="rounded-md bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
            >
              Update 
            </button>

            <button
              onClick={handleNew}
              className="rounded-md bg-slate-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              New
            </button>

            <button
              onClick={handleLoad}
              className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-gray-50"
            >
              Find Patient
            </button>
          </div>

          {message && (
            <p className="mt-4 text-sm font-medium text-blue-700">
              {message}
            </p>
          )}

          {/* Saved records */}
          <section className="mt-8 border-t pt-5 print:hidden">
            <h3 className="mb-3 font-semibold text-slate-800">
              Saved Patient Records ({records.length})
            </h3>

            {records.length === 0 ? (
              <p className="text-sm text-slate-500">
                No records saved yet. Click New, fill in the form,
                and click Update to save the patient.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3">Patient ID</th>
                      <th className="px-4 py-3">Patient Name</th>
                      <th className="px-4 py-3">Age</th>
                      <th className="px-4 py-3">Sex</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Doctor</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr
                        key={record.patientId}
                        className="border-t hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">{record.patientId}</td>
                        <td className="px-4 py-3">{record.patientName}</td>
                        <td className="px-4 py-3">{record.age}</td>
                        <td className="px-4 py-3">{record.sex}</td>
                        <td className="px-4 py-3">{record.contactNumber}</td>
                        <td className="px-4 py-3">{record.city}</td>
                        <td className="px-4 py-3">{record.validUpto}</td>
                        <td className="px-4 py-3">{record.doctorName}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setPatient({ ...record })}
                            className="font-semibold text-blue-700 hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Printable registration document */}
      <section
        id="print-document"
        className="mx-auto mt-6 hidden max-w-4xl bg-white p-8 text-black print:mt-0 print:block print:max-w-none print:p-0"
      >
        <div className="border-b-2 border-black pb-4 text-center">
          <h1 className="text-2xl font-bold">
            {typeof document !== "undefined" &&
            document.body.dataset.printMode === "echs"
              ? "ECHS PATIENT REGISTRATION"
              : "OPD PATIENT REGISTRATION"}
          </h1>
          <p className="mt-2 text-sm">Patient Registration Details</p>
          <p className="mt-1 text-sm">Printed: {clock}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          {fields.map((field) => (
            <div
              key={field.key}
              className="break-words border-b border-gray-300 pb-2"
            >
              <p className="text-xs font-semibold uppercase text-gray-600">
                {field.label}
              </p>
              <p className="mt-1 text-sm">
                {patient[field.key] || "—"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 gap-12 text-center text-sm">
          <div className="border-t border-black pt-2">
            Patient / Guardian Signature
          </div>
          <div className="border-t border-black pt-2">
            Authorized Signature
          </div>
        </div>
      </section>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body * {
            visibility: hidden;
          }

          #print-document,
          #print-document * {
            visibility: visible;
          }

          #print-document {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white;
            color: black;
          }
        }
      `}</style>
    </main>
  );
}
