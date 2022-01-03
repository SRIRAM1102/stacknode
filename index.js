import express, { response } from "express";
import bcrypt, { compare } from "bcrypt";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();

app.use(express.json());
app.use(cors());
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

//Mongodb Connect
export async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  return await client.connect();
}

//Hashing Password
async function genpassword(password) {
  const salt = await bcrypt.genSalt(10);
  const haspassword = await bcrypt.hash(password, salt);
  return haspassword;
}

//Search Mail
async function searchedUser(userEmailId) {
  const client = await createConnection();
  const result = await client
    .db("mobile")
    .collection("userlog")
    .findOne({ email: userEmailId });
  return result;
}

//login
app.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  const value = await searchedUser(emailId);

  if (value != null) {
    const passindb = value.password;
    const passinlogin = password;
    const ispasstrue = await bcrypt.compare(passinlogin, passindb);

    if (ispasstrue) {
      const token = jwt.sign({ id: value._id }, 'UNIQUEKEY');
      res.send({ token: token, id: value._id });
    } else {
      res.send({ msg: "invalid login" });
    }
  } else {
    res.send({ msg: "wrong user" });
  }
});

//signup
app.post("/signup", async (req, res) => {
  const { userName, userPassword, emailId,country,createdat } = req.body;
  const value = await searchedUser(emailId);
  if (!value) {
    const hashedpassword = await genpassword(userPassword);
    const client = await createConnection();
    const result = await client.db("mobile").collection("userlog").insertOne({
      name: userName,
      email: emailId,
      password: hashedpassword,
      createdat:createdat,
      country:country
    });
  } else {
    res.send({ msg: "existing mailid" });
  }
});

//Get User
app.get("/user", async (request, response) => {
  const client = await createConnection();
  const result = await client
    .db("mobile")
    .collection("userlog")
    .find({})
    .toArray();

  response.send(result);
});

//Company Database
app.get("/company", async (request, response) => {
  const client = await createConnection();
  const result = await client
    .db("mobile")
    .collection("company")
    .find({})
    .toArray();

  response.send(result);
});
//Get Tags
app.get("/tags", async (request, response) => {
  const client = await createConnection();
  const result = await client
    .db("mobile")
    .collection("tags")
    .find({_id:ObjectId('61d122747d4aead1b003387d')})
    .toArray();
    var unique = result[0].tagcollection.filter((v, i, a) => a.indexOf(v) === i); 

  response.send(unique);
});
//Post Questions
app.post("/question", async (request, response) => {
  const { title, body, userid, tags, moment } = request.body;
  const client = await createConnection();
  const result = await client
    .db("mobile")
    .collection("question")
    .insertOne({
      vote: 0,
      title: title,
      body: body,
      answers: [],
      tag: tags,
      createdby: userid,
      time: moment,
      votersid:[]
    });
});

//Update Question
app.put("/question/answers", async (request, response) => {
  const { answer, questionid, userid, moment } = request.body;
  const client = await createConnection();

  const obj = { answer: answer, userid: userid, time: moment };

  const result = await client
    .db("mobile")
    .collection("question")
    .updateOne({ _id: ObjectId(questionid) }, { $push: { answers: obj } });
}); 
//Update Vote
app.put("/question/vote", async (request, response) => {
  const { id,vote,userid } = request.body;
  const client = await createConnection();

  const result = await client
    .db("mobile")
    .collection("question")
    .updateMany({ _id: ObjectId(id) }, {$set:{vote:vote},$push:{votersid:userid}} );
});
//Get Question
app.get("/question", async (request, response) => {
  const client = await createConnection();
  const result = await client
    .db("mobile")
    .collection("question")
    .find({})
    .toArray();

    const user = await client
    .db("mobile")
    .collection("userlog")
    .find({})
    .toArray();
 
  response.send({result:result,user:user});
});

app.listen(PORT, () => console.log("started"));
