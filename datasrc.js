import { MongoClient, ServerApiVersion } from 'mongodb';
const {DBCON_INFO} = process.env

const uri = "mongodb+srv://"+DBCON_INFO+".hqtsl.mongodb.net/?retryWrites=true&w=majority&appName=wdb8088";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
let mdb

export default function mdbClient() {
  mdb = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
}
  
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await mdb.connect();
    // Send a ping to confirm a successful connection
    await mdb.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await mdb.close();
  }
}
run().catch(console.dir);