const request = require("supertest");

// Mock the client service
jest.mock("../services/clientService");
jest.mock("../services/loanService");

const loanService = require("../services/loanService");

const clientService = require("../services/clientService");
const app = require("../server");

describe("Health Check", () => {
  test("GET /health should return successful response", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
  });
});

describe("Client Registration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /clients/register should display registration form", async () => {
    const response = await request(app).get("/clients/register");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Register New Client");
  });

  test("Should register a valid client", async () => {
    clientService.createClient.mockResolvedValue({
      id: 1,
      clientNumber: "INU-001",
      clientName: "John Kamau",
    });

    const response = await request(app).post("/clients/register").send({
      clientNumber: "INU-001",
      clientName: "John Kamau",
    });

    expect(response.statusCode).toBe(201);

    expect(response.text).toContain(
      "Client John Kamau registered successfully.",
    );

    expect(clientService.createClient).toHaveBeenCalledWith(
      "INU-001",
      "John Kamau",
    );
  });

  test("Should reject missing client information", async () => {
    const response = await request(app).post("/clients/register").send({
      clientNumber: "",
      clientName: "",
    });

    expect(response.statusCode).toBe(400);

    expect(response.text).toContain(
      "Client number and client name are required.",
    );

    expect(clientService.createClient).not.toHaveBeenCalled();
  });

  test("Should reject duplicate client numbers", async () => {
    clientService.createClient.mockRejectedValue({
      code: "ER_DUP_ENTRY",
    });

    const response = await request(app).post("/clients/register").send({
      clientNumber: "INU-001",
      clientName: "Jane Wanjiku",
    });

    expect(response.statusCode).toBe(409);

    expect(response.text).toContain(
      "This client number is already registered.",
    );
  });

  test("Should handle unexpected database errors", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    clientService.createClient.mockRejectedValue(
      new Error("Database unavailable"),
    );

    const response = await request(app).post("/clients/register").send({
      clientNumber: "INU-003",
      clientName: "Peter Kiptoo",
    });

    expect(response.statusCode).toBe(500);

    expect(response.text).toContain("Something went wrong. Please try again.");

    consoleSpy.mockRestore();
  });
});

describe("Loan Registration", () => {
  const mockClients = [
    {
      id: 1,
      client_number: "INU-001",
      client_name: "John Kamau",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    loanService.getAllClients.mockResolvedValue(mockClients);
  });

  test("GET /loans/register should display the registration form", async () => {
    const response = await request(app).get("/loans/register");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Register New Loan");
    expect(response.text).toContain("John Kamau");
  });

  test("Should register a valid loan", async () => {
    loanService.createLoan.mockResolvedValue({
      id: 1,
      loanReference: "LOAN-001",
      clientId: 1,
      loanAmount: "10000.00",
      totalAmountDue: "12000.00",
    });

    const response = await request(app).post("/loans/register").send({
      loanReference: "LOAN-001",
      clientId: "1",
      loanAmount: "10000",
      totalAmountDue: "12000",
    });

    expect(response.statusCode).toBe(201);

    expect(response.text).toContain("Loan LOAN-001 registered successfully.");

    expect(loanService.createLoan).toHaveBeenCalledWith(
      "LOAN-001",
      1,
      "10000.00",
      "12000.00",
    );
  });

  test("Should reject missing loan information", async () => {
    const response = await request(app).post("/loans/register").send({
      loanReference: "",
      clientId: "",
      loanAmount: "",
      totalAmountDue: "",
    });

    expect(response.statusCode).toBe(400);

    expect(response.text).toContain("All fields are required.");

    expect(loanService.createLoan).not.toHaveBeenCalled();
  });

  test("Should reject total amount due below loan amount", async () => {
    const response = await request(app).post("/loans/register").send({
      loanReference: "LOAN-002",
      clientId: "1",
      loanAmount: "10000",
      totalAmountDue: "8000",
    });

    expect(response.statusCode).toBe(400);

    expect(response.text).toContain(
      "Total amount due cannot be less than the loan amount.",
    );

    expect(loanService.createLoan).not.toHaveBeenCalled();
  });

  test("Should reject zero or negative loan amounts", async () => {
    const response = await request(app).post("/loans/register").send({
      loanReference: "LOAN-003",
      clientId: "1",
      loanAmount: "0",
      totalAmountDue: "12000",
    });

    expect(response.statusCode).toBe(400);

    expect(loanService.createLoan).not.toHaveBeenCalled();
  });

  test("Should reject amounts with more than two decimal places", async () => {
    const response = await request(app).post("/loans/register").send({
      loanReference: "LOAN-004",
      clientId: "1",
      loanAmount: "10000.123",
      totalAmountDue: "12000",
    });

    expect(response.statusCode).toBe(400);

    expect(response.text).toContain(
      "Amounts must have no more than two decimal places.",
    );
  });

  test("Should reject duplicate loan references", async () => {
    loanService.createLoan.mockRejectedValue({
      code: "ER_DUP_ENTRY",
    });

    const response = await request(app).post("/loans/register").send({
      loanReference: "LOAN-001",
      clientId: "1",
      loanAmount: "10000",
      totalAmountDue: "12000",
    });

    expect(response.statusCode).toBe(409);

    expect(response.text).toContain("This loan reference already exists.");
  });

  test("Should reject nonexistent clients", async () => {
    loanService.createLoan.mockRejectedValue({
      code: "ER_NO_REFERENCED_ROW_2",
    });

    const response = await request(app).post("/loans/register").send({
      loanReference: "LOAN-005",
      clientId: "99",
      loanAmount: "10000",
      totalAmountDue: "12000",
    });

    expect(response.statusCode).toBe(400);

    expect(response.text).toContain("The selected client does not exist.");
  });
});
