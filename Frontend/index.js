import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv"
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const db_port = process.env.DB_PORT || 8081;
let isLoggedIn = false;
let loggedInCustomer = null;

//Function to fetch customer data
async function getCustomerData() {
  try {
    let response = await fetch(`http://localhost:${db_port}/customer-data`);
    const customerData = await response.json();
    return Array.from(customerData);
  } catch (error) {
    console.log(error);
  }
}

//Function to fetch admin data
async function getAdminData() {
  try {
    let response = await fetch(`http://localhost:${db_port}/admin/details`);
    const adminData = await response.json();
    return Array.from(adminData);
  } catch (error) {
    console.log(error);
  }
}

//get customer reviews
async function getCustomerReviews(id) {
  try {
    let response = await fetch(
      `http://localhost:${db_port}/customer/${id}/reviews`
    );
    return Array.from(await response.json());
  } catch (error) {
    console.log(error);
  }
}

async function getCustomerTransactions(id) {
  try {
    const response = await fetch(
      `http://localhost:${db_port}/customer/${id}/transactions`
    );
    const customerTransactions = await response.json();
    return Array.from(customerTransactions);
  } catch (error) {
    console.log(error);
  }
}

async function getShopDetailsForAdmin(mallId) {
  try {
    const response = await fetch(
      `http://localhost:${db_port}/admin/${mallId}/shops`
    );
    const shopsDetails = await response.json();
    return shopsDetails;
  } catch (error) {
    console.log(error);
  }
}

//Function to check if Password is correct
function checkPasswordCustomers(customerData, customerId, password) {
  for (const data of customerData) {
    if (
      data.CustomerID.toString() === customerId &&
      data.Password === password
    ) {
      isLoggedIn = true;
      loggedInCustomer = {
        id: data.CustomerID,
        name: data.Name,
        email: data.Email,
        contactInfo: data.ContactInfo,
        adminDetails: false,
      };
      return true;
    }
  }
  return false;
}

//Function to check if Password is correct
function checkPasswordAdmin(adminData, adminId, password) {
  for (const data of adminData) {
    if (data.EmployeeId.toString() === adminId && data.Password === password) {
      isLoggedIn = true;
      loggedInCustomer = {
        id: data.EmployeeId,
        name: data.Name,
        email: data.Email,
        contactInfo: data.ContactInfo,
        adminDetails: {
          MallId: data.MallId,
          Salary: data.Salary,
        },
      };
      return true;
    }
  }
  return false;
}

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//Home Page
app.get("/", async (req, res) => {
  try {
    res.render("index.ejs", { loggedInCustomer, logStatus: isLoggedIn });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
//Login Page
app.get("/login", (req, res) => {
  res.render("login.ejs", { loggedInCustomer, logStatus: isLoggedIn });
});
//Sign Up Page
app.get("/sign-up", (req, res) => {
  res.render("sign-up.ejs", { loggedInCustomer, logStatus: isLoggedIn });
});
//about Page
app.get("/about", (req, res) => {
  res.render("about.ejs", { loggedInCustomer, logStatus: isLoggedIn });
});
//Contact Page
app.get("/contact", (req, res) => {
  res.render("contact.ejs", { loggedInCustomer, logStatus: isLoggedIn });
});
//Sign Up submit page
app.post("/sign-up/submit", async (req, res) => {
  const { name, email, contactinfo, password, confirmPassword } = req.body;
  if (password === confirmPassword) {
    const response = await fetch(
      `http://localhost:${db_port}/customer/sign-up`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const insertedCustomerData = await response.json();
    const inputData = {
      customerId: insertedCustomerData.insertId,
      name: name,
      email: email,
      contactinfo: contactinfo,
    };

    res.redirect(
      `/sign-up/success?customerDetails=${JSON.stringify(inputData)}`
    );
  } else {
    res.status(400).render("sign-up.ejs", {
      loggedInCustomer,
      logStatus: isLoggedIn,
      isValid: false,
    });
  }
});
// Sign Up Success
app.get("/sign-up/success", (req, res) => {
  const customerDetailsString = req.query.customerDetails;
  const customerDetails = JSON.parse(customerDetailsString);

  res.render("sign-up-success.ejs", {
    loggedInCustomer,
    logStatus: isLoggedIn,
    customerDetails,
  });
});

//Login Customer
app.post("/login/submit", async (req, res) => {
  const customerData = await getCustomerData();
  const { customerId, password } = req.body;

  if (checkPasswordCustomers(customerData, customerId, password)) {
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

//Login Admin
app.post("/login/admin/submit", async (req, res) => {
  const adminData = await getAdminData();
  const { adminId, password } = req.body;

  if (checkPasswordAdmin(adminData, adminId, password)) {
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.get("/malls", (req, res) => {
  let mallData;
  async function getMallData() {
    try {
      const response = await fetch(`http://localhost:${db_port}/malls`);
      const dbData = await response.json();
      mallData = dbData;
      res.render("malls.ejs", {
        loggedInCustomer,
        logStatus: isLoggedIn,
        mallData: mallData,
      });
    } catch (error) {
      console.log(error);
    }
  }
  getMallData();
});

app.get("/mall/:mallNumber/shops", (req, res) => {
  const mallNumber = req.params.mallNumber;
  let allShopData;
  async function getShopData() {
    try {
      const shopDb = await fetch(
        `http://localhost:${db_port}/mall/${mallNumber}/shops`
      );
      allShopData = await shopDb.json();
      res.render("shops.ejs", {
        loggedInCustomer,
        logStatus: isLoggedIn,
        allShopData: allShopData,
      });
    } catch (error) {
      console.log(error);
    }
  }
  getShopData();
});

app.get("/dashboard", async (req, res) => {
  if (isLoggedIn) {
    if (loggedInCustomer.adminDetails) {
      const adminMallDetails = await getShopDetailsForAdmin(
        loggedInCustomer.adminDetails.MallId
      );
      res.render("dashboard.ejs", {
        loggedInCustomer,
        logStatus: isLoggedIn,
        adminMallDetails: adminMallDetails,
      });
    } else {
      const customerReviews = await getCustomerReviews(loggedInCustomer.id);
      const customerTransactions = await getCustomerTransactions(
        loggedInCustomer.id
      );
      res.render("dashboard.ejs", {
        loggedInCustomer,
        logStatus: isLoggedIn,
        customerReviews: customerReviews,
        customerTransactions: customerTransactions,
      });
    }
  } else {
    res.redirect("/");
  }
});

app.get("/delete/review", async (req, res) => {
  try {
    const shopId = req.query.shopId;
    const customerId = req.query.customerId;

    const response = await fetch(
      `http://localhost:${db_port}/delete/review?shopId=${shopId}&customerId=${customerId}`,
      {
        method: "DELETE",
      }
    );

    res.render("success.ejs", {
      loggedInCustomer,
      logStatus: isLoggedIn,
      deletedData: "Review",
      action: "delet",
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/review/insert", async (req, res) => {
  try {
    const customerId = req.query.CustomerId;
    const reviewData = req.body;

    const data = { ...reviewData, CustomerID: customerId };

    const response = await fetch(`http://localhost:${db_port}/review/insert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    res.render("success.ejs", {
      loggedInCustomer,
      logStatus: isLoggedIn,
      deletedData: "Review",
      action: "insert",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/sign-out", (req, res) => {
  isLoggedIn = false;
  loggedInCustomer = null;
  res.redirect("/");
});

app.get("/delete/shop/:shopID", async (req, res) => {
  try {
    const response = await fetch(
      `http://localhost:${db_port}/delete/shop/${req.params.shopID}`,
      { method: "DELETE" }
    );

    res.render("success.ejs", {
      loggedInCustomer,
      logStatus: isLoggedIn,
      deletedData: "Shop",
      action: "delet",
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/add-shop", async (req, res) => {
  try {
    const mallId = loggedInCustomer.adminDetails.MallId;
    const data = { ...req.body, mallId };
    const response = await fetch(`http://localhost:${db_port}/add-shop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    res.render("success.ejs", {
      loggedInCustomer,
      logStatus: isLoggedIn,
      deletedData: "Review",
      action: "insert",
    });
  } catch (error) {
    console.log(error);
  }
});
