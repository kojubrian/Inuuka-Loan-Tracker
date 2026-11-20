const clientService = require("../services/clientService");

async function showRegistrationForm(req, res) {
  res.render("clients/register", {
    error: null,
    success: null,
    formData: {},
  });
}

async function registerClient(req, res) {
  const { clientNumber, clientName } = req.body;

  const formData = {
    clientNumber: clientNumber?.trim() || "",
    clientName: clientName?.trim() || "",
  };

  // Validate required fields
  if (!formData.clientNumber || !formData.clientName) {
    return res.status(400).render("clients/register", {
      error: "Client number and client name are required.",
      success: null,
      formData,
    });
  }

  try {
    const client = await clientService.createClient(
      formData.clientNumber,
      formData.clientName,
    );

    return res.status(201).render("clients/register", {
      error: null,
      success: `Client ${client.clientName} registered successfully.`,
      formData: {},
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).render("clients/register", {
        error: "This client number is already registered.",
        success: null,
        formData,
      });
    }

    console.error("Client registration error:", error);

    return res.status(500).render("clients/register", {
      error: "Something went wrong. Please try again.",
      success: null,
      formData,
    });
  }
}

module.exports = {
  showRegistrationForm,
  registerClient,
};
