const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const Stripe = require("stripe");

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.za28cg0.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri);

let db;

async function connectToMongoDB() {
  if (!db) {
    await client.connect();

    console.log("Successfully connected to MongoDB!");

    db = client.db("E-Commerce");
  }

  return db;
}

const getCollections = async () => {
  const database = await connectToMongoDB();

  return {
    productsCollection: database.collection("products"),
    usersCollection: database.collection("users"),
    ordersCollection: database.collection("orders"),
    reviewsCollection: database.collection("reviews"),
  };
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================= HOME API =================

app.get("/", (req, res) => {
  res.send("E-Commerce Server is Running");
});

// ================= PRODUCT API =================

// Get all products

app.get("/products", async (req, res) => {
  try {
    const { productsCollection } = await getCollections();

    const products = await productsCollection.find().toArray();

    res.send(products);
  } catch (error) {
    console.error("Error loading products:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Get single product

app.get("/products/:id", async (req, res) => {
  try {
    const { productsCollection } = await getCollections();

    const id = req.params.id;

    const product = await productsCollection.findOne({
      _id: new ObjectId(id),
    });

    res.send(product);
  } catch (error) {
    console.error("Error loading product:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Add product

app.post("/products", async (req, res) => {
  try {
    const { productsCollection } = await getCollections();

    const product = req.body;

    const result = await productsCollection.insertOne(product);

    res.send(result);
  } catch (error) {
    console.error("Error adding product:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Update product

app.put("/products/:id", async (req, res) => {
  try {
    const { productsCollection } = await getCollections();

    const id = req.params.id;

    const updatedProduct = req.body;

    const result = await productsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          name: updatedProduct.name,
          price: Number(updatedProduct.price),
          category: updatedProduct.category,
          image: updatedProduct.image,
          stock: Number(updatedProduct.stock),
          description: updatedProduct.description,
        },
      },
    );

    res.send(result);
  } catch (error) {
    console.error("Error updating product:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Delete product

app.delete("/products/:id", async (req, res) => {
  try {
    const { productsCollection } = await getCollections();

    const id = req.params.id;

    const result = await productsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (error) {
    console.error("Error deleting product:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// ================= USER API =================

// Get user by email

app.get("/users", async (req, res) => {
  try {
    const { usersCollection } = await getCollections();

    const email = req.query.email;

    const user = await usersCollection.findOne({
      email: email,
    });

    res.send(user);
  } catch (error) {
    console.error("Error loading user:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Add user

app.post("/users", async (req, res) => {
  try {
    const { usersCollection } = await getCollections();

    const user = req.body;

    const result = await usersCollection.insertOne(user);

    res.send({
      success: true,
      insertedId: result.insertedId,
      message: "User saved successfully",
    });
  } catch (error) {
    console.error("Error saving user:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Get all users

app.get("/all-users", async (req, res) => {
  try {
    const { usersCollection } = await getCollections();

    const users = await usersCollection.find().toArray();

    res.send(users);
  } catch (error) {
    console.error("Error loading users:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// ================= STRIPE PAYMENT API =================

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { price } = req.body;

    const amount = Math.round(price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// ================= ORDER API =================

// Create order

app.post("/orders", async (req, res) => {
  try {
    const { productsCollection, ordersCollection } = await getCollections();

    const order = req.body;

    order.createdAt = new Date();

    // Check stock before creating order

    for (const product of order.products) {
      const productData = await productsCollection.findOne({
        _id: new ObjectId(product._id),
      });

      if (!productData) {
        return res.status(404).send({
          success: false,
          message: `Product not found: ${product.name}`,
        });
      }

      if (productData.stock < product.quantity) {
        return res.status(400).send({
          success: false,
          message: `Not enough stock for ${product.name}`,
        });
      }
    }

    // Save order

    const result = await ordersCollection.insertOne(order);

    // Decrease product stock

    for (const product of order.products) {
      await productsCollection.updateOne(
        {
          _id: new ObjectId(product._id),
        },
        {
          $inc: {
            stock: -product.quantity,
          },
        },
      );
    }

    res.send({
      success: true,
      insertedId: result.insertedId,
      message: "Order created and stock updated successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Get customer orders

app.get("/orders", async (req, res) => {
  try {
    const { ordersCollection } = await getCollections();

    const email = req.query.email;

    const orders = await ordersCollection
      .find({
        email: email,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    res.send(orders);
  } catch (error) {
    console.error("Error loading orders:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// ================= ADMIN ORDER API =================

// Get all orders

app.get("/admin/orders", async (req, res) => {
  try {
    const { ordersCollection } = await getCollections();

    const orders = await ordersCollection
      .find()
      .sort({
        createdAt: -1,
      })
      .toArray();

    res.send(orders);
  } catch (error) {
    console.error("Error loading admin orders:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Update order status

app.put("/orders/:id", async (req, res) => {
  try {
    const { ordersCollection } = await getCollections();

    const id = req.params.id;

    const { status } = req.body;

    const result = await ordersCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          status: status,
        },
      },
    );

    res.send(result);
  } catch (error) {
    console.error("Error updating order status:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// ================= REVIEW API =================

// Get reviews for a product

app.get("/reviews/:productId", async (req, res) => {
  try {
    const { reviewsCollection } = await getCollections();

    const productId = req.params.productId;

    const reviews = await reviewsCollection
      .find({
        productId: productId,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    res.send(reviews);
  } catch (error) {
    console.error("Error loading reviews:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Add review

app.post("/reviews", async (req, res) => {
  try {
    const { reviewsCollection } = await getCollections();

    const review = req.body;

    review.createdAt = new Date();

    const result = await reviewsCollection.insertOne(review);

    res.send({
      success: true,
      insertedId: result.insertedId,
      message: "Review added successfully",
    });
  } catch (error) {
    console.error("Error adding review:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// ================= SERVER =================

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
