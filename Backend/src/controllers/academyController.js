const AcademyModel = require("../models/academyModel");
const { v4: isUUID } = require("uuid"); // Import UUID validator
const sql = require("mssql");
const { pool, poolConnect } = require("../config/database"); // Import database connection

// Register a new academy
const registerAcademy = async (req, res) => {
  const {
    name,
    location,
    Contact_email,
    Contact_phone,
    city,
    description,
    website_url,
    specialization,
  } = req.body;

  const academyData = {
    name,
    location,
    Contact_email,
    Contact_phone,
    city,
    description,
    website_url,
    specialization,
  };

  try {
    await AcademyModel.create(academyData);
    res.status(201).json({ message: "Academy registered successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error registering academy", error: error.message });
  }
};

// Get academy details by email
const getAcademyByEmail = async (req, res) => {
  const { email: Contact_email } = req.params;

  try {
    const academy = await AcademyModel.findByEmail(Contact_email);
    if (academy) {
      res.status(200).json({ academy });
    } else {
      res.status(404).json({ message: "Academy not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching academy", error: error.message });
  }
};

// Get academy details by ID (updated for UUID format)
const getAcademyById = async (req, res) => {
  const { id } = req.params;

  // Validate UUID format using isUUID from the 'uuid' package
  if (!isUUID(id)) {
    return res.status(400).json({ message: "Invalid UUID format." });
  }

  try {
    await poolConnect; // Ensure DB connection is established

    const result = await pool
      .request()
      .input("id", sql.NVarChar, id)
      .query("SELECT * FROM Academies WHERE Academy_id = @id");

    if (result.recordset.length > 0) {
      res.status(200).json({ academy: result.recordset[0] });
    } else {
      res.status(404).json({ message: "Academy not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching academy", error: error.message });
  }
};

// Update academy information
const updateAcademy = async (req, res) => {
  const { id } = req.params;
  const academyData = req.body;

  // Ensure data is provided to update
  if (Object.keys(academyData).length === 0) {
    return res.status(400).json({ message: "No data provided for update" });
  }

  try {
    await AcademyModel.update(id, academyData);
    res.status(200).json({ message: "Academy updated successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating academy", error: error.message });
  }
};

// Deactivate an academy
const deactivateAcademy = async (req, res) => {
  const { id } = req.params;

  try {
    await AcademyModel.delete(id);
    res.status(200).json({ message: "Academy deactivated successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deactivating academy", error: error.message });
  }
};

const getAcademyByCity = async (req, res) => {
  const { city } = req.params;

  try {
    const academies = await AcademyModel.findByCity(city);
    res.status(200).json({ academies });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching academies by city",
      error: error.message,
    });
  }
};

module.exports = {
  registerAcademy,
  getAcademyByEmail,
  getAcademyById,
  updateAcademy,
  deactivateAcademy,
  getAcademyByCity,
};
