const request = require("supertest");

// Mock the client service
jest.mock("../services/clientService");

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
