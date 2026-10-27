const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    contact: { type: String, required: true },
    Department: { type: String, required: true },
    Date: { type: String, required: true },
    time_slot: { type: String, required: true },
    appointment_number: { type: String },
    virtual_queue: { type: String },
    Status: { type: String, default: "Pending", enum: ["Pending", "Attended", "Not Attended", "Cancelled"] },
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", PatientSchema);