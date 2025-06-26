require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_RACK}:${process.env.KEY}@app.759oy5v.mongodb.net/?retryWrites=true&w=majority&appName=app`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const recipeBookCollection = client
      .db("recipeBookCollection")
      .collection("recipe");

    app.post("/userData", async (req, res) => {
      const data = req.body;

      const { like, ...rest } = data;
      const finalData = { ...rest, like: parseInt(like) };
      const result = await recipeBookCollection.insertOne(finalData);
      res.send(result);
    });

    app.get("/userData", async (req, res) => {
      const result = await recipeBookCollection.find().toArray();
      res.send(result);
    });

    app.get("/userData/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = { _id: new ObjectId(id) };
      const result = await recipeBookCollection.findOne(objectId);
      res.send(result);
    });

 app.get("/sorted", async (req, res) => {
  const sortParam = req.query.sort; 
  let sortOption = {};

  if (sortParam === "asc") {
    sortOption = { like: 1 };  
  } else if (sortParam === "dsc") {
    sortOption = { like: -1 }; 
  } else {
    sortOption = { _id: -1 };  
  }

    const data = await recipeBookCollection
      .find()
      .sort(sortOption)
      .toArray();

    res.send(data)
 });

    app.get("/userData/recipe/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await recipeBookCollection.find(query).toArray();

      res.send(result);
    });

    app.patch("/userData", async (req, res) => {
      const id = req.body._id;

      const { _id, ...rest } = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: false };
      const updateDoc = {
        $set: rest,
      };
      const result = await recipeBookCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.patch("/userData/:id", async (req, res) => {
      const id = req.params.id;
      const { like } = req.body;
      const convertedLike = parseInt(like);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: false };
      const updateDoc = {
        $set: { like: convertedLike },
      };

      const result = await recipeBookCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.delete("/userData/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recipeBookCollection.deleteOne(query);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("the fusionCrave server is running now");
});

app.listen(port, () => console.log(` the server is running on port ${port}`));
