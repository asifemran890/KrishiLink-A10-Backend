require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dayjs = require("dayjs");

const app = express();
const port = process.env.PORT || 5000;

// ✅ Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5000",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());

// ✅ MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ian57aj.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("krishilink");
    const productCollections = db.collection("products");
    const interestCollections = db.collection("interests");

    console.log("✅ Successfully connected to MongoDB!");

    // ================= PRODUCTS =================

    app.get("/products", async (req, res) => {
      const email = req.query.email;

      if (email) {
        console.log("Email query:", email);
      }

      const query = email ? { "owner.ownerEmail": email } : {};

      const result = await productCollections
        .find(query)
        .sort({ created_at: -1 })
        .toArray();

      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProduct = req.body;

      newProduct.created_at = new Date();
      newProduct.created_at_display = dayjs().format("MMM D, YYYY h:mm A");

      const result = await productCollections.insertOne(newProduct);
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await productCollections.findOne({
          _id: new ObjectId(id),
        });

        res.send(result);
      } catch (error) {
        res.status(400).send({ error: "Invalid ID format" });
      }
    });

    app.get("/latest-products", async (req, res) => {
      const result = await productCollections
        .find()
        .sort({ created_at: -1 })
        .limit(8)
        .toArray();

      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      try {
        const result = await productCollections.deleteOne({
          _id: new ObjectId(req.params.id),
        });
        res.send(result);
      } catch {
        res.status(400).send({ error: "Invalid ID" });
      }
    });

    app.put("/products/:id", async (req, res) => {
      try {
        const updateProduct = req.body;

        const result = await productCollections.updateOne(
          { _id: new ObjectId(req.params.id) },
          {
            $set: {
              name: updateProduct.name,
              type: updateProduct.type,
              quantity: updateProduct.quantity,
              unit: updateProduct.unit,
              price: updateProduct.price,
              description: updateProduct.description,
              address: updateProduct.address,
              image: updateProduct.image,
            },
          },
        );

        res.send(result);
      } catch {
        res.status(400).send({ error: "Invalid ID" });
      }
    });

    // ================= INTERESTS =================

    app.post("/interests", async (req, res) => {
      const { cropId, name, email, quantity, units, message, cropTitle } =
        req.body;

      if (!cropId || !quantity) {
        return res.status(400).send({ message: "Missing required fields" });
      }

      const newInterest = {
        cropId: new ObjectId(cropId),
        name,
        email,
        quantity,
        units,
        message,
        cropTitle,
        status: "pending",
        createdAt: dayjs().format("MMM D, YYYY h:mm A"),
      };

      const result = await interestCollections.insertOne(newInterest);
      res.send(result);
    });

    app.get("/interests", async (req, res) => {
      const email = req.query.email;

      const query = email ? { email } : {};

      const result = await interestCollections
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      res.send(result);
    });

    app.get("/all-interests/:cropId", async (req, res) => {
      try {
        const result = await interestCollections
          .find({ cropId: new ObjectId(req.params.cropId) })
          .sort({ createdAt: -1 })
          .toArray();

        res.send(result);
      } catch {
        res.status(400).send({ error: "Invalid cropId" });
      }
    });

    app.patch("/interests/:id", async (req, res) => {
      try {
        const { status } = req.body;

        const result = await interestCollections.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { status } },
        );

        res.send({ success: true, result });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });
  } finally {
    // keep connection alive
  }
}

run().catch(console.dir);

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("Your server is ready");
});

// ================= START SERVER =================
app.listen(port, () => {
  console.log(`Server running : ${port}`);
});
