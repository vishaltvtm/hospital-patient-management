const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");



exports.createPatient = async (req, res) => {
  try {
    const {
      name,
      age,
      contact,
      Department,
      Date: appointmentDate,
      time_slot,
    } = req.body;

    // 1. Validate required fields
    if (
      !name?.trim() ||
      age === undefined ||
      age === null ||
      age === "" ||
      !contact?.trim() ||
      !Department?.trim() ||
      !appointmentDate ||
      !time_slot?.trim()
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }
    // Validate Indian mobile number
    const contactNumber = String(contact).trim();

    const contactRegex = /^[6-9]\d{9}$/;

    if (!contactRegex.test(contactNumber)) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit Indian mobile number",
      });
    }

    // 2. Validate age: must be an integer from 1 to 110
    const patientAge = Number(age);

    if (
      !Number.isInteger(patientAge) ||
      patientAge < 1 ||
      patientAge > 110
    ) {
      return res.status(400).json({
        message: "Age must be a whole number between 1 and 110",
      });
    }

    // 3. Validate appointment date
    // Accept YYYY-MM-DD or a valid ISO date string.
    const dateString = String(appointmentDate);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return res.status(400).json({
        message: "Invalid appointment date format. Use YYYY-MM-DD",
      });
    }

    const [year, month, day] = dateString.split("-").map(Number);

    // Construct date using local calendar components
    const requestedDate = new Date(year, month - 1, day);

    // Reject impossible dates such as 2026-02-30
    if (
      requestedDate.getFullYear() !== year ||
      requestedDate.getMonth() !== month - 1 ||
      requestedDate.getDate() !== day
    ) {
      return res.status(400).json({
        message: "Please provide a valid appointment date",
      });
    }

    // Today's date in the server's local timezone
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Reject previous dates; today and future dates are allowed
    if (requestedDate < today) {
      return res.status(400).json({
        message: "Appointment date cannot be in the past",
      });
    }

    // 4. Generate appointment number
    const appointment_number = Date.now().toString();

    // 5. Count appointments for the requested date
    const existingPatients = await Patient.countDocuments({
      Date: appointmentDate,
    });

    // 6. Generate virtual queue number
    const your_virtual_queue_number = existingPatients + 1;

    // 7. Prepare patient data
    const patientData = {
      name: name.trim(),
      age: patientAge,
      contact: contactNumber.trim(),
      Department: Department.trim(),
      Date: appointmentDate,
      time_slot,
      appointment_number,
      virtual_queue: String(your_virtual_queue_number),
    };

    // 8. Create patient
    const patient = await Patient.create(patientData);

    // 9. Send response
    return res.status(201).json({
      message: "Patient appointment created successfully",
      patient,
      appointment_number,
      your_virtual_queue_number,
    });
  } catch (error) {
    console.error("Create patient error:", error);

    return res.status(400).json({
      message: error.message,
    });
  }
};


// READ all Todays patients
exports.getTodaysPatients = async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Find today's appointment for this patient
    const patients = await Patient.find({
      Date: today,
    });
    // const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // READ all Tommarow patients
exports.getTomorrowPatients = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    const patients = await Patient.find({
      Date: tomorrowDate,
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // READ all patients
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// READ single patient - today's appointment
exports.getPatient_todays_appointment = async (req, res) => {
  try {
    let number;
    if (/^\d{10}$/.test(String(req.body.number))) {
      console.log("Number is OK");
      number = req.body.number
    } else {
      console.log("Number is not OK");
      number = req.body.number.slice(2)
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Find today's appointment for this patient
    const patient = await Patient.findOne({
      contact: number,
      Date: today,
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found for today's appointment",
      });
    }

    // Count patients attended today
    const attendedPatients = await Patient.countDocuments({
      Status: "Attended",
      Date: today,
    });

    // Current queue number
    const current_queue_number = attendedPatients + 1;

    // Return patient details and queue information
    return res.status(200).json({
      ...patient.toObject(),
      appointment_number: patient.appointment_number,
      your_virtual_queue_number: patient.virtual_queue,
      current_queue_number,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};



// READ single patient
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE patient

exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      age,
      contact,
      Department,
      Date: appointmentDate,
      time_slot,
      Status,
    } = req.body;

    // 1. Find patient
    const existingPatient = await Patient.findById(id);

    if (!existingPatient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    // 2. Validate name
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name is required",
        });
      }
      req.body.name = name.trim();
    }

    // 3. Validate age
    if (age !== undefined) {
      if (age === "" || age === null) {
        return res.status(400).json({
          message: "Age is required",
        });
      }

      const patientAge = Number(age);

      if (
        !Number.isInteger(patientAge) ||
        patientAge < 1 ||
        patientAge > 110
      ) {
        return res.status(400).json({
          message: "Age must be a whole number between 1 and 110",
        });
      }

      req.body.age = patientAge;
    }

    // 4. Validate Indian mobile number
    if (contact !== undefined) {
      if (typeof contact !== "string" && typeof contact !== "number") {
        return res.status(400).json({
          message: "Please enter a valid 10-digit Indian mobile number",
        });
      }

      const contactNumber = String(contact).trim();
      const contactRegex = /^[6-9]\d{9}$/;

      if (!contactRegex.test(contactNumber)) {
        return res.status(400).json({
          message: "Please enter a valid 10-digit Indian mobile number",
        });
      }

      req.body.contact = contactNumber;
    }

    // 5. Validate department
    if (Department !== undefined) {
      if (typeof Department !== "string" || !Department.trim()) {
        return res.status(400).json({
          message: "Department is required",
        });
      }

      req.body.Department = Department.trim();
    }

    // 6. Validate appointment date
    if (appointmentDate !== undefined) {
      if (
        typeof appointmentDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)
      ) {
        return res.status(400).json({
          message: "Invalid appointment date format. Use YYYY-MM-DD",
        });
      }

      const [year, month, day] = appointmentDate.split("-").map(Number);

      const requestedDate = new Date(year, month - 1, day);

      // Reject impossible dates
      if (
        requestedDate.getFullYear() !== year ||
        requestedDate.getMonth() !== month - 1 ||
        requestedDate.getDate() !== day
      ) {
        return res.status(400).json({
          message: "Please provide a valid appointment date",
        });
      }

      // Compare calendar dates using the server's local timezone
      const now = new Date();
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      if (requestedDate < today) {
        return res.status(400).json({
          message: "Appointment date cannot be in the past",
        });
      }
    }

    // 7. Validate time slot
    if (time_slot !== undefined) {
      if (typeof time_slot !== "string" || !time_slot.trim()) {
        return res.status(400).json({
          message: "Time slot is required",
        });
      }

      req.body.time_slot = time_slot.trim();
    }

    // 8. Validate patient status
    if (Status !== undefined) {
      const allowedStatuses = [
        "Pending",
        "Attended",
        "Not Attended",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(Status)) {
        return res.status(400).json({
          message:
            "Invalid status. Allowed values: Pending, Attended, Not Attended, Cancelled",
        });
      }
    }

    // 9. Protect system-generated fields from direct updates
    delete req.body.appointment_number;
    delete req.body.virtual_queue;
    delete req.body._id;
    delete req.body.createdAt;
    delete req.body.updatedAt;
    delete req.body.__v;

    // 10. Update patient
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Update patient error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid patient ID or field value",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// DELETE patient
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
