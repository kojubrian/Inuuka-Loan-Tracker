const loanService = require("../services/loanService");

async function showRegistrationForm(req, res) {
  try {
    const clients = await loanService.getAllClients();

    return res.render("loans/register", {
      clients,
      error: null,
      success: null,
      formData: {},
    });
  } catch (error) {
    console.error("Error loading clients:", error);

    return res.status(500).send("Unable to load the loan registration page.");
  }
}

async function registerLoan(req, res) {
  const { loanReference, clientId, loanAmount, totalAmountDue } = req.body;

  const formData = {
    loanReference: loanReference?.trim() || "",
    clientId: clientId || "",
    loanAmount: loanAmount || "",
    totalAmountDue: totalAmountDue || "",
  };

  // Validate required fields
  if (
    !formData.loanReference ||
    !formData.clientId ||
    !formData.loanAmount ||
    !formData.totalAmountDue
  ) {
    return renderRegistrationError(
      res,
      400,
      "All fields are required.",
      formData,
    );
  }

  // Validate numeric values
  const amount = Number(formData.loanAmount);
  const totalDue = Number(formData.totalAmountDue);
  const selectedClientId = Number(formData.clientId);

  if (!Number.isSafeInteger(selectedClientId) || selectedClientId <= 0) {
    return renderRegistrationError(
      res,
      400,
      "Please select a valid client.",
      formData,
    );
  }

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(totalDue) ||
    amount <= 0 ||
    totalDue <= 0
  ) {
    return renderRegistrationError(
      res,
      400,
      "Loan amounts must be valid positive numbers.",
      formData,
    );
  }

  if (
    !/^\d+(\.\d{1,2})?$/.test(formData.loanAmount) ||
    !/^\d+(\.\d{1,2})?$/.test(formData.totalAmountDue)
  ) {
    return renderRegistrationError(
      res,
      400,
      "Amounts must have no more than two decimal places.",
      formData,
    );
  }

  if (totalDue < amount) {
    return renderRegistrationError(
      res,
      400,
      "Total amount due cannot be less than the loan amount.",
      formData,
    );
  }

  try {
    const loan = await loanService.createLoan(
      formData.loanReference,
      selectedClientId,
      amount.toFixed(2),
      totalDue.toFixed(2),
    );

    return res.status(201).render("loans/register", {
      clients: await loanService.getAllClients(),
      error: null,
      success: `Loan ${loan.loanReference} registered successfully.`,
      formData: {},
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return renderRegistrationError(
        res,
        409,
        "This loan reference already exists.",
        formData,
      );
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return renderRegistrationError(
        res,
        400,
        "The selected client does not exist.",
        formData,
      );
    }

    console.error("Loan registration error:", error);

    return renderRegistrationError(
      res,
      500,
      "Something went wrong while registering the loan.",
      formData,
    );
  }
}

// Reusable helper for displaying validation errors
async function renderRegistrationError(res, statusCode, message, formData) {
  try {
    const clients = await loanService.getAllClients();

    return res.status(statusCode).render("loans/register", {
      clients,
      error: message,
      success: null,
      formData,
    });
  } catch (error) {
    console.error("Error reloading clients:", error);

    return res
      .status(500)
      .send("Unable to process the loan registration request.");
  }
}

module.exports = {
  showRegistrationForm,
  registerLoan,
};
