// src/models/playerModel.js
const { pool, poolConnect } = require("../config/database");
const sql = require("mssql");

class PlayerModel {
  // Existing create and findByEmail methods remain the same...
  static async create(playerData) {
    try {
      await poolConnect;
      const request = pool.request();
      console.log("Creating player with data:", playerData);

      // Define SQL types for all fields in the Players table
      const sqlTypes = {
        Full_Name: sql.NVarChar,
        Email: sql.NVarChar,
        Password: sql.NVarChar,
        State: sql.NVarChar, // Ensure these are included
        City: sql.NVarChar,
        Address: sql.NVarChar,
        Gender: sql.NVarChar,
        Dob: sql.Date,
        Contact_number: sql.NVarChar,
        Skill_level: sql.NVarChar,
        Language: sql.NVarChar,
      };
      console.log("Creating player with data:", playerData);

      // Bind each field explicitly
      Object.keys(sqlTypes).forEach((key) => {
        request.input(key, sqlTypes[key], playerData[key] || null);
      });

      const query = `
      INSERT INTO Players (
        Full_Name,
        Email,
        Password,
        State,
        City, 
        Address, 
        Gender, 
        Dob, 
        Contact_number, 
        Skill_level,
        Language
      ) VALUES (
        @Full_Name, 
        @Email, 
        @Password, 
        @State, 
        @City, 
        @Address, 
        @Gender, 
        @Dob, 
        @Contact_number, 
        @Skill_level,
        @Language
      )
    `;
      console.log("Creating player with data:", playerData);

      return await request.query(query);
    } catch (error) {
      console.error("Database error in create:", error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      await poolConnect;
      const result = await pool
        .request()
        .input("Email", sql.NVarChar, email)
        .query("SELECT * FROM Players WHERE Email = @Email");

      return result.recordset[0];
    } catch (error) {
      console.error("Database error in findByEmail:", error);
      throw error;
    }
  }

  static async findById(playerId) {
    try {
      await poolConnect;
      const result = await pool
        .request()
        .input("Player_id", sql.UniqueIdentifier, playerId)
        .query("SELECT * FROM Players WHERE Player_id = @Player_id");

      return result.recordset[0];
    } catch (error) {
      console.error("Database error in findById:", error);
      throw error;
    }
  }

  static async update(playerId, updateData) {
    try {
      await poolConnect;
      const request = pool.request();

      // Add player ID parameter
      request.input("Player_id", sql.UniqueIdentifier, playerId);

      // Define valid column names that exist in the database
      const validColumns = [
        "Full_Name",
        "Email",
        "Password",
        "State",
        "City",
        "Address",
        "Gender",
        "Dob",
        "Contact_number",
        "Skill_level",
        "Language",
        "Preferred_position",
      ];

      // Filter updateData to only include valid columns
      const filteredData = Object.entries(updateData)
        .filter(([key]) => validColumns.includes(key))
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});

      // If nothing valid to update, return early
      if (Object.keys(filteredData).length === 0) {
        console.warn("No valid fields to update");
        return { rowsAffected: [0] };
      }

      // Build dynamic update query with only valid fields
      const updateFields = Object.keys(filteredData)
        .map((key) => `${key} = @${key}`)
        .join(", ");

      // Add parameters for each field being updated
      Object.entries(filteredData).forEach(([key, value]) => {
        // Determine SQL type based on field name (simplified version)
        let sqlType;
        if (key === "Dob") {
          sqlType = sql.Date;
        } else {
          sqlType = sql.NVarChar;
        }
        request.input(key, sqlType, value);
      });

      const query = `
      UPDATE Players 
      SET ${updateFields}
      WHERE Player_id = @Player_id
    `;

      console.log("Executing update query:", query);
      return await request.query(query);
    } catch (error) {
      console.error("Database error in update:", error);
      throw error;
    }
  }

  static async delete(playerId) {
    try {
      await poolConnect;
      return await pool
        .request()
        .input("Player_id", sql.UniqueIdentifier, playerId)
        .query("DELETE FROM Players WHERE Player_id = @Player_id");
    } catch (error) {
      console.error("Database error in delete:", error);
      throw error;
    }
  }

  static async findBySkillSet(skillSet) {
    try {
      await poolConnect;
      const result = await pool
        .request()
        .input("Skill_level", sql.NVarChar, skillSet)
        .query("SELECT * FROM Players WHERE Skill_level = @Skill_level");

      return result.recordset;
    } catch (error) {
      console.error("Database error in findBySkillSet:", error);
      throw error;
    }
  }

  static async getCalendarEvents(playerId) {
    try {
      await poolConnect;
      const result = await pool
        .request()
        .input("Player_id", sql.UniqueIdentifier, playerId).query(`
          SELECT * FROM Calendar 
          WHERE Player_id = @Player_id 
          AND Event_date >= GETDATE()
          ORDER BY Event_date
        `);

      return result.recordset;
    } catch (error) {
      console.error("Database error in getCalendarEvents:", error);
      throw error;
    }
  }

  static async getAcademyUpdates() {
    try {
      await poolConnect;
      const result = await pool.request().query(`
          SELECT * FROM AcademyUpdates 
          WHERE Publish_date >= DATEADD(month, -1, GETDATE())
          ORDER BY Publish_date DESC
        `);

      return result.recordset;
    } catch (error) {
      console.error("Database error in getAcademyUpdates:", error);
      throw error;
    }
  }

  static async getUpcomingTournaments() {
    try {
      await poolConnect;
      const result = await pool.request().query(`
          SELECT * FROM Tournaments 
          WHERE Tournament_date >= GETDATE()
          ORDER BY Tournament_date
        `);

      return result.recordset;
    } catch (error) {
      console.error("Database error in getUpcomingTournaments:", error);
      throw error;
    }
  }
}

module.exports = PlayerModel;
