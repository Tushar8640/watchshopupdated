const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vqk54.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("Assignment12");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");

    // get all products api

    app.get("/allproducts", async (req, res) => {
      const data = productsCollection.find({});
      const result = await data.toArray();
      res.send(result);
    });

    // delete a product api

    app.delete("/deleteproducts/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    // get only six products api

    app.get("/homeproducts", async (req, res) => {
      const data = productsCollection.find({}).limit(6);
      const result = await data.toArray();

      res.send(result);
    });
    // get single products
    app.get("/singleproducts/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);

      res.send(result);
    });

    // add product api
    app.post("/addproduct", async (req, res) => {
      const data = req.body;
      const result = await productsCollection.insertOne(data);
      res.send(result);

      console.log(result);
    });

    // place order api
    app.post("/placeorder", async (req, res) => {
      const data = req.body;
      const result = await ordersCollection.insertOne(data);
      console.log(result);
    });

    // customers orders by email
    app.get("/userorders/:email", async (req, res) => {
      const email = req.params.email;
      const result = await ordersCollection
        .find({ userEmail: email })
        .toArray();
      res.send(result);
    });

    // manage all orders
    app.get("/allorder", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    });
    // approve  orders
    app.put("/approveorder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateDoc = req.body;
      const updateStatus = { $set: updateDoc };
      const result = await ordersCollection.updateOne(query, updateStatus);
      res.json(result);
      console.log(result);
    });

    // order cancle api
    app.delete("/cancleorder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);

      console.log(result);
    });
    // took users from client site
    app.post("/users", async (req, res) => {
      const users = req.body;
      const result = await usersCollection.insertOne(users);
      console.log(result);
    });
    // took users from client site
    app.put("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // make admin api

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };

      const updateInfo = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateInfo);
      console.log(result);
    });

    // check admin api
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // USERS REVIEW POST API
    app.post("/postreview", async (req, res) => {
      console.log(req.body);
      const data = req.body;
      const result = await reviewsCollection.insertOne(data);
      res.send(result);
      console.log(result);
    });

    // get all  USERS REVIEW  API
    app.get("/allreview", async (req, res) => {
      const data = reviewsCollection.find({});
      const result = await data.toArray();
      res.send(result);
      console.log(result);
    });

    console.log("database connected successfully");
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Assignment 12!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
