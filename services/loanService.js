const pool = require("../config/db");

// Retrieve all registered clients
async function getAllClients() {
  const sql = `
        SELECT id, client_number, client_name
        FROM clients
        ORDER BY client_name ASC
    `;

  const [rows] = await pool.execute(sql);

  return rows;
}

// Register a new loan
async function createLoan(loanReference, clientId, loanAmount, totalAmountDue) {
  const sql = `
        INSERT INTO loans (
            loan_reference,
            client_id,
            loan_amount,
            total_amount_due
        )
        VALUES (?, ?, ?, ?)
    `;

  const [result] = await pool.execute(sql, [
    loanReference,
    clientId,
    loanAmount,
    totalAmountDue,
  ]);

  return {
    id: result.insertId,
    loanReference,
    clientId,
    loanAmount,
    totalAmountDue,
  };
}

module.exports = {
  getAllClients,
  createLoan,
};
