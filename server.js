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

// GET an employee by ID
app.get("/employees/id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readJSONFile("employee.json");
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

// POST a new employee
app.post("/employees", async (req, res) => {
  try {
    const newEmployee = req.body;
    newEmployee.id = Date.now(); // Assign unique ID
    const data = await readJSONFile("employee.json");
    data.employees.push(newEmployee);
    await writeJSONFile("employee.json", data);
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
    const data = await readJSONFile("employee.json");
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

    data.employees[employeeIndex] = {
      ...data.employees[employeeIndex],
      ...updatedData,
    };

    await writeJSONFile("employee.json", data);
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

// DELETE an employee
app.delete("/employees/:id", async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const data = await readJSONFile("employee.json");
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

    const deletedEmployee = data.employees.splice(employeeIndex, 1);
    await writeJSONFile("employee.json", data);

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
    res.status(200).json({
      status: 200,
      message: "Customers retrieved successfully",
      data: data.customers,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error reading customer data",
      error: err.message,
    });
  }
});

// GET a customer by ID
app.get("/customers/id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readJSONFile("customer.json");
    const customer = data.customers.find((cust) => cust.id == id);

    if (customer) {
      res.status(200).json({
        status: 200,
        message: "Customer retrieved successfully",
        data: customer,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: `Customer with ID ${id} not found.`,
        data: null,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error reading customer data",
      error: err.message,
    });
  }
});

// POST a new customer
app.post("/customers", async (req, res) => {
  try {
    const newCustomer = req.body;

    if (
      !newCustomer.cust_fName ||
      !newCustomer.cust_lName ||
      !newCustomer.cust_billingAddress
    ) {
      return res.status(400).json({
        status: 400,
        message:
          "Missing required fields: cust_fName, cust_lName, and cust_billingAddress are required.",
        data: null,
      });
    }

    newCustomer.id = Date.now(); // Assign unique ID
    const data = await readJSONFile("customer.json");
    data.customers.push(newCustomer);
    await writeJSONFile("customer.json", data);

    res.status(201).json({
      status: 201,
      message: "Customer added successfully",
      data: newCustomer,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error adding customer",
      error: err.message,
    });
  }
});

// PUT: Update a customer by ID
app.put("/customers/:id", async (req, res) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    const updatedCustomer = req.body;
    const data = await readJSONFile("customer.json");

    const index = data.customers.findIndex((cust) => cust.id === customerId);

    if (index !== -1) {
      data.customers[index] = { ...data.customers[index], ...updatedCustomer };
      await writeJSONFile("customer.json", data);

      res.status(200).json({
        status: 200,
        message: "Customer updated successfully",
        data: data.customers[index],
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Customer not found",
        data: null,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error updating customer",
      error: err.message,
    });
  }
});

// DELETE: Remove a customer by ID
app.delete("/customers/:id", async (req, res) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    const data = await readJSONFile("customer.json");

    const customerIndex = data.customers.findIndex(
      (cust) => cust.id === customerId
    );

    if (customerIndex === -1) {
      return res.status(404).json({
        status: 404,
        message: "Customer not found",
        data: null,
      });
    }

    const deletedCustomer = data.customers.splice(customerIndex, 1);
    await writeJSONFile("customer.json", data);

    res.status(200).json({
      status: 200,
      message: "Customer deleted successfully",
      data: deletedCustomer[0],
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error deleting customer",
      error: err.message,
    });
  }
});

// GET customers by search query (search by any field)
app.get("/customers/search", async (req, res) => {
  try {
    const query = req.query; // Accessing query parameters from the URL
    const data = await readJSONFile("customer.json");

    // Filtering customers based on query parameters
    const filteredCustomers = data.customers.filter((customer) => {
      return Object.keys(query).every((key) => {
        // Check if the key exists in the customer object and compare values
        if (customer[key]) {
          return customer[key]
            .toString()
            .toLowerCase()
            .includes(query[key].toLowerCase());
        }
        return false;
      });
    });

    if (filteredCustomers.length > 0) {
      res.status(200).json({
        status: 200,
        message: "Customers found",
        data: filteredCustomers,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "No customers match the search criteria.",
        data: [],
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error searching customers",
      error: err.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
