const pool = require("../config/db");

async function createClient(clientNumber, clientName) {
  const sql = `
        INSERT INTO clients (client_number, client_name)
        VALUES (?, ?)
    `;

  const [result] = await pool.execute(sql, [clientNumber, clientName]);

  return {
    id: result.insertId,
    clientNumber,
    clientName,
  };
}

module.exports = {
  createClient,
};
