const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const {protect} = require("../middleware/authMiddleware");

router.post("/", patientController.createPatient);
router.get("/", patientController.getPatients);
router.get("/todays", patientController.getTodaysPatients);
router.get("/tomorrow", patientController.getTomorrowPatients);
router.post('/getPatient_todays_appointment',protect, patientController.getPatient_todays_appointment)
router.get("/:id", patientController.getPatient);
router.put("/:id", protect, patientController.updatePatient);
router.delete("/:id",protect , patientController.deletePatient);

module.exports = router;