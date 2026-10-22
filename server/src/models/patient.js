const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    contact: { type: String, required: true },
    Department: { type: String, required: true },
    Date: { type: String, required: true },
    time_slot: { type: String, required: true },
    Status: { type: String, default: "Pending" , enum: ["Pending", "Completed", "Not Attended", "Cancelled"]},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", PatientSchema);