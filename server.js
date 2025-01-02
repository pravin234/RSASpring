const express = require("express");
const fs = require("fs");

const app = express();
const port = 3000;

// Middleware to parse JSON body
app.use(express.json());

// Utility function to read JSON files
const readJSONFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(JSON.parse(data));
    });
  });
};

// Utility function to write JSON files
const writeJSONFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// === Employee Routes ===
// GET all employees
app.get("/employees", async (req, res) => {
  try {
    const data = await readJSONFile("employee.json");
    res.json(data);
  } catch (err) {
    res.status(500).send("Error reading employee data");
  }
});

// POST: Add a new employee
app.post("/employees", async (req, res) => {
  try {
    const newEmployee = req.body;
    const data = await readJSONFile("employee.json");
    data.employees.push(newEmployee);
    await writeJSONFile("employee.json", data);
    res.status(201).send("Employee added successfully");
  } catch (err) {
    res.status(500).send("Error adding employee");
  }
});

// PUT: Update an employee by ID
app.put("/employees/:id", async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id, 10);
    const updatedEmployee = req.body;
    const data = await readJSONFile("employee.json");
    const index = data.employees.findIndex((emp, idx) => idx === employeeId);

    if (index !== -1) {
      data.employees[index] = updatedEmployee;
      await writeJSONFile("employee.json", data);
      res.send("Employee updated successfully");
    } else {
      res.status(404).send("Employee not found");
    }
  } catch (err) {
    res.status(500).send("Error updating employee");
  }
});

// DELETE: Remove an employee by ID
app.delete("/employees/:id", async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id, 10);
    const data = await readJSONFile("employee.json");
    data.employees = data.employees.filter((_, idx) => idx !== employeeId);
    await writeJSONFile("employee.json", data);
    res.send("Employee deleted successfully");
  } catch (err) {
    res.status(500).send("Error deleting employee");
  }
});

// === Customer Routes ===
// GET all customers
app.get("/customers", async (req, res) => {
  try {
    const data = await readJSONFile("customer.json");
    res.json(data);
  } catch (err) {
    res.status(500).send("Error reading customer data");
  }
});

// POST: Add a new customer
app.post("/customers", async (req, res) => {
  try {
    const newCustomer = req.body;
    const data = await readJSONFile("customer.json");
    data.customers.push(newCustomer);
    await writeJSONFile("customer.json", data);
    res.status(201).send("Customer added successfully");
  } catch (err) {
    res.status(500).send("Error adding customer");
  }
});

// PUT: Update a customer by ID
app.put("/customers/:id", async (req, res) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    const updatedCustomer = req.body;
    const data = await readJSONFile("customer.json");
    const index = data.customers.findIndex((cust, idx) => idx === customerId);

    if (index !== -1) {
      data.customers[index] = updatedCustomer;
      await writeJSONFile("customer.json", data);
      res.send("Customer updated successfully");
    } else {
      res.status(404).send("Customer not found");
    }
  } catch (err) {
    res.status(500).send("Error updating customer");
  }
});

// DELETE: Remove a customer by ID
app.delete("/customers/:id", async (req, res) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    const data = await readJSONFile("customer.json");
    data.customers = data.customers.filter((_, idx) => idx !== customerId);
    await writeJSONFile("customer.json", data);
    res.send("Customer deleted successfully");
  } catch (err) {
    res.status(500).send("Error deleting customer");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
