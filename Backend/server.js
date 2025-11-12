import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import DatabaseService from "./src/database.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const db = DatabaseService.createNewInstance();

//reading the data from mall
app.get("/malls", async (req, res) => {
  try {
    const data = await db.getMallData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/mall/:mallNumber/shops", async (req, res) => {
  const mallNumber = req.params.mallNumber;
  try {
    const data = await db.getShopData(mallNumber);
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

app.get("/customer-data", async (req, res) => {
  try {
    const data = await db.getCustomerData();
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

app.post("/customer/sign-up", async (req, res) => {
  try {
    const response = await db.insertCustomerData(req.body);
    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

app.get("/admin/details", async (req, res) => {
  try {
    const response = await db.getAdminData();
    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

app.get("/customer/:id/reviews", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await db.getCustomerReviews(id);
    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

app.get("/admin/:mallId/shops", async (req, res) => {
  try {
    const mallId = req.params.mallId;
    const response = await db.getShopDetailsForAdmin(mallId);
    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

app.delete("/delete/review", async (req, res) => {
  const shopId = req.query.shopId;
  const customerId = req.query.customerId;

  const response = await db.deleteCustomerReviews(shopId, customerId);
  res.json(response);
});

app.post("/review/insert", async (req, res) => {
  try {
    const response = await db.insertCustomerReview(req.body);
    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

app.post("/add-shop", async (req, res) => {
  try {
    const response = await db.addShop(req.body);
    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

app.get("/customer/:id/transactions", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await db.getCustomerTransactions(id);
    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

app.delete("/delete/shop/:shopID", async (req, res) => {
  const response = await db.deleteShop(req.params.shopID);
  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
