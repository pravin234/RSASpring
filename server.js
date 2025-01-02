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

// GET an employee by ID
app.get("/employees/id/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the path parameter

    // Read the employee data
    const data = await readJSONFile("employee.json");

    // Find employee by ID
    const employee = data.employees.find((emp) => emp.id == id);

    if (employee) {
      res.status(200).json({
        status: 200,
        message: "Employee retrieved successfully",
        data: employee,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: `Employee with ID ${id} not found.`,
        data: null,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error reading employee data",
      error: err.message,
    });
  }
});

// === Employee Routes ===
// GET all employees
app.get("/employees", async (req, res) => {
  try {
    const data = await readJSONFile("employee.json");
    res.status(200).json({
      status: 200,
      message: "Employees retrieved successfully",
      data: data.employees,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error reading employee data",
      error: err.message,
    });
  }
});

app.post("/employees", async (req, res) => {
  try {
    const newEmployee = req.body;

    // Add a unique ID to the new employee (optional for resource tracking)
    newEmployee.id = Date.now();

    // Read the existing employee data
    const data = await readJSONFile("employee.json");

    // Add the new employee to the data
    data.employees.push(newEmployee);

    // Write the updated data back to the file
    await writeJSONFile("employee.json", data);

    // Respond with a status code, a message, and the newly created resource
    res.status(201).json({
      status: 201,
      message: "Employee created successfully",
      data: newEmployee,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error adding employee",
      error: err.message,
    });
  }
});

// PUT: Update an employee by ID
app.put("/employees/:id", async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const updatedData = req.body;

    // Read the existing employee data
    const data = await readJSONFile("employee.json");

    // Find the employee to update
    const employeeIndex = data.employees.findIndex(
      (emp) => emp.id === employeeId
    );
    if (employeeIndex === -1) {
      return res.status(404).json({
        status: 404,
        message: "Employee not found",
        data: null,
      });
    }

    // Update the employee details
    data.employees[employeeIndex] = {
      ...data.employees[employeeIndex],
      ...updatedData,
    };

    // Write the updated data back to the file
    await writeJSONFile("employee.json", data);

    // Respond with the updated employee data
    res.status(200).json({
      status: 200,
      message: "Employee updated successfully",
      data: data.employees[employeeIndex],
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error updating employee",
      error: err.message,
    });
  }
});

// Route to delete an employee
app.delete("/employees/:id", async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);

    // Read the existing employee data
    const data = await readJSONFile("employee.json");

    // Find and remove the employee
    const employeeIndex = data.employees.findIndex(
      (emp) => emp.id === employeeId
    );
    if (employeeIndex === -1) {
      return res.status(404).json({
        status: 404,
        message: "Employee not found",
        data: null,
      });
    }

    // Remove the employee from the array
    const deletedEmployee = data.employees.splice(employeeIndex, 1);

    // Write the updated data back to the file
    await writeJSONFile("employee.json", data);

    // Respond with the deleted employee data
    res.status(200).json({
      status: 200,
      message: "Employee deleted successfully",
      data: deletedEmployee[0],
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error deleting employee",
      error: err.message,
    });
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

    // Check if required fields are present in the body
    if (
      !newCustomer.firstName ||
      !newCustomer.lastName ||
      !newCustomer.address
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: firstName, lastName, and address are required.",
      });
    }

    // Read current data from the customer.json file
    const data = await readJSONFile("customer.json");

    // Add the new customer to the customers array
    data.customers.push(newCustomer);

    // Write the updated data back to the file
    await writeJSONFile("customer.json", data);

    // Send a success response with status 201 Created
    return res.status(201).json({
      message: "Customer added successfully",
      customer: newCustomer, // Optionally, include the added customer object in the response
    });
  } catch (err) {
    // Handle unexpected errors and respond with a 500 Internal Server Error
    console.error("Error adding customer:", err); // Log detailed error
    return res.status(500).json({
      message: "Error adding customer",
      error: err.message || err, // Include error message in response for debugging
    });
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

// GET all employees
app.get("/employees", async (req, res) => {
  try {
    const data = await readJSONFile("employee.json");
    res.json(data);
  } catch (err) {
    res.status(500).send("Error reading employee data");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
