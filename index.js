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
    const cropsCollection = krishiLink.collection("crops");
    const PostCollection = krishiLink.collection("post");
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

    // find
    app.get("/post", async (req, res) => {
      const result = await PostCollection.find().toArray();
      res.send(result);
    });
    app.post("/post", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await PostCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

     // latest  1 crops
    app.get("/latest-postOne", async (req, res) => {
      const result = await PostCollection
        .find()
        .sort({
          created_at: "desc",
        })
        .limit(1)
        .toArray();
      console.log(result);
      res.send(result);
    });

    app.get("/post/:id", async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const result = await PostCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send({ success: true, result });
    });

    //delete
    app.delete("/post/:id", async (req, res) => {
      const id = req.params;
      console.log(id);
      const result = await PostCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send({ success: true, result });
    });
    //  Search
    app.get("/search", async (req, res) => {
      const search_text = req.query.search;
      const result = await PostCollection.find({
        name: { $regex: search_text, $options: "i" },
      }).toArray();
      res.send(result);
    });

    // app.delete("/post/:id", async (req, res) => {
    //   try {
    //     await connectDB();
    //     const { id } = req.params;
    //     console.log(id);
    //     const result = await userPostCollection.deleteOne({
    //       _id: new ObjectId(id),
    //     });
    //     res.json(result);
    //   } catch (error) {
    //     res.status(500).json({ error: error.message });
    //   }
    // });

    // latest  6 crops
    app.get("/latest-post", async (req, res) => {
      const result = await PostCollection
        .find()
        .sort({
          created_at: "desc",
        })
        .limit(6)
        .toArray();
      console.log(result);
      res.send(result);
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
