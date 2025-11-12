import mysql from "mysql2";
import dotenv from "dotenv";
import { query } from "express";
dotenv.config();

const HOST = process.env.HOST;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const DATABASE = process.env.DATABASE;
const instance = null;

const pool = mysql
  .createPool({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
  })
  .promise();

class DatabaseService {
  static createNewInstance() {
    return instance ? instance : new DatabaseService();
  }

  async getCustomerData() {
    try {
      const query = "SELECT * FROM CUSTOMER;";
      const [rows, fields] = await pool.query(query);
      return rows;
    } catch (error) {
      console.log(error);
    }
  }

  async insertCustomerData({ name, email, contactinfo, password }) {
    try {
      const query = `INSERT INTO Customer (name, email, contactinfo, password) VALUES (?,?,?,?)`;
      const [results] = await pool.query(query, [
        name,
        email,
        contactinfo,
        password,
      ]);
      return results;
    } catch (error) {
      console.log(error);
    }
  }

  async getAdminData() {
    try {
      const query = "SELECT * FROM Employees WHERE Designation = 'Manager'";
      const [rows, fields] = await pool.query(query);
      return rows;
    } catch (error) {
      console.log(error);
    }
  }

  async getMallData() {
    try {
      const query = "SELECT * FROM mall;";
      const [rows, fields] = await pool.query(query);
      return rows;
    } catch (error) {
      console.log(error);
    }
  }

  async getShopData(id) {
    try {
      const queryOne =
        "SELECT * FROM shops S LEFT JOIN (SELECT ShopID, ROUND(AVG(Rating),1) AS AVG_Rating FROM REVIEW GROUP BY ShopID) R ON S.ShopID = R.ShopID WHERE mallid = ?";
      const queryTwo =
        "SELECT c.Name, r.ShopID, r.comments , r.rating from customer c join review r on r.customerid = c.CustomerID join (select shopid , mallId from shops ) s on r.ShopID = s.shopid where s.mallid = ?;";
      const [rowsOne, fieldsOne] = await pool.query(queryOne, [id]);
      const [rowsTwo, fieldsTwo] = await pool.query(queryTwo, [id]);
      const rows = { shopData: rowsOne, reviews: rowsTwo };
      return rows;
    } catch (error) {
      console.log(error);
    }
  }

  async getCustomerReviews(id) {
    try {
      const query =
        "SELECT R.* , S.ShopName FROM REVIEW R JOIN (SELECT SHOPID,ShopName FROM SHOPS) S ON S.SHOPID = R.SHOPID WHERE CUSTOMERID = ?";
      const [rows, fields] = await pool.query(query, [id]);
      return rows;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteCustomerReviews(shopId, customerId) {
    try {
      const query = "DELETE FROM Review WHERE ShopID = ? AND CustomerID = ?";
      const [results] = await pool.query(query, [shopId, customerId]);
      return results;
    } catch (error) {
      console.log(error);
    }
  }

  async insertCustomerReview({ shopId, comments, rating, CustomerID }) {
    try {
      const insertQuery =
        "INSERT INTO review (CustomerID,ShopID,rating,Comments) VALUES (?,?,?,?);";
      const [results, fields] = await pool.query(insertQuery, [
        CustomerID,
        shopId,
        rating,
        comments,
      ]);
      return results;
    } catch (error) {
      console.log("Incorrect Shop ID during inserting review ", error);
    }
  }

  async getCustomerTransactions(id) {
    try {
      const query =
        "SELECT T.* , S.ShopName FROM transaction T JOIN (SELECT ShopID,ShopName FROM SHOPS) S ON S.ShopID = T.ShopID WHERE T.CustomerID = ?;";
      const [results, fields] = await pool.query(query, [id]);
      return results;
    } catch (error) {
      console.log(error);
    }
  }

  async getShopDetailsForAdmin(mallId) {
    try {
      const query1 =
        "SELECT S.*, P.ProfitAmount FROM SHOPS S LEFT JOIN PROFIT P ON S.ShopID = P.ShopID WHERE S.MallID = ?";
      const query2 =
        "SELECT * FROM transaction where ShopID IN (SELECT SHOPID FROM SHOPS WHERE MALLID = ?);";
      const query3 =
        "SELECT M.* , S.NumberOfShops FROM MALL M JOIN ( SELECT COUNT(*) AS NumberOfShops , MallID FROM Shops GROUP BY MallID) S ON M.MALLID = S.MALLID WHERE M.MALLID = ?;";
      const [results1, fields1] = await pool.query(query1, [mallId]);
      const [results2, fields2] = await pool.query(query2, [mallId]);
      const [results3, fields3] = await pool.query(query3, [mallId]);
      const results = {
        mallDetails: results3,
        shopsDetails: results1,
        shopsTransactions: results2,
      };
      return results;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteShop(shopId) {
    try {
      const query1 = "delete from review where ShopID = ?;";
      const query2 = "delete from transaction where ShopID = ?;";
      const query3 = "delete from profit where ShopID = ?;";
      const query4 = "delete from shops where ShopID = ?;";
      const [res1] = await pool.query(query1, [shopId]);
      const [res2] = await pool.query(query2, [shopId]);
      const [res3] = await pool.query(query3, [shopId]);
      const [res4] = await pool.query(query4, [shopId]);
      return [res1,res2,res3,res4]
    } catch (error) {
      console.log(error);
    }
  }

  async addShop({shopName,category,contactInfo,rentAmount,description,mallId}){
    const query = "INSERT INTO shops (ShopName, MallID, Category, ContactInfo, Description, RentAmount) VALUES (?,?,?,?,?,?)";
    const [results,fields] = await pool.query(query,[shopName,mallId,category,contactInfo,description,rentAmount]);
    return results;
  }
}

export default DatabaseService;
