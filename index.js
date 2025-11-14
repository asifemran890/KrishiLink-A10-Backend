const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 3000;
app.use(cors());
app.use(express.json());
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ian57aj.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const krishiLink = client.db("KrishiLink");
    const homeCollection = krishiLink.collection("home");
    const cropsCollection = krishiLink.collection("crops");
    const userPostCollection = krishiLink.collection("post");
    const interestsCollection = krishiLink.collection("interests");
    // find
    app.get("/interests", async (req, res) => {
      const result = await interestsCollection.find().toArray();
      res.send(result);
    });
    // find
    app.get("/crops", async (req, res) => {
      const result = await cropsCollection.find().toArray();
      res.send(result);
    });

    // latest  6 crops
    app.get("/latest-crops", async (req, res) => {
      const result = await cropsCollection
        .find()
        .sort({
          created_at: "desc",
        })
        .limit(6)
        .toArray();
      console.log(result);
      res.send(result);
    });

    app.get("/crops/:id", async (req, res) => {
      const id = req.params;
      console.log(id.id);
      const result = await cropsCollection.findOne({
        _id: new ObjectId(id.id),
      });
      res.send({ success: true, result });
    });

    // find
    app.get("/post", async (req, res) => {
      const result = await userPostCollection.find().toArray();
      res.send(result);
    });
    app.post("/post", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await userPostCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
