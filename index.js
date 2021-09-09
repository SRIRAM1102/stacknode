import express, { response } from "express";
import bcrypt, { compare } from "bcrypt";
import dotenv from "dotenv";
import {MongoClient,ObjectId} from "mongodb";
import cors from "cors";
import  jwt  from "jsonwebtoken";
import {auth} from "./middleware/auth.js"
const app=express();

app.use(express.json());//middle ware
app.use(cors());//middleware support cross 
dotenv.config();

    //  const PORT=4000;
     //  const MONGO_URL = "mongodb://localhost"; local path
    //   const MONGO_URL=" mongodb+srv://sriram1102:sri1102@cluster0.jw0oa.mongodb.net";
                  
const MONGO_URL=process.env.MONGO_URL;
const PORT= process.env.PORT;


app.get("/",auth,(request,response)=>
    {
      console.log("get done");
        response.send("hello guvi man");
    });
    
app.post("/us",async (request,response)=>
    {
      const userdata=request.body;
      console.log(userdata)
      response.send(userdata);
    });

    export async function createConnection()
{
  const client=new MongoClient(MONGO_URL);
  return await client.connect();
}


async function genpassword(password)
    {
      const salt= await bcrypt.genSalt(10);
       const haspassword=await bcrypt.hash(password,salt);
      return (haspassword);
    }
    
////////////////////////signup

    app.post("/user/signup",async (request,response)=>
    {
      const {name,password,avatar,dateofbirth,gender,profession} =request.body;
      const userdata=request.body;

     const hashedpassword=await genpassword(password);

    const client = await createConnection();
        const result = await client
          .db("mobile")
          .collection("userlog")
          .insertOne({
            name: name,
            password: hashedpassword,
            avatar: avatar,
            dateofbirth:dateofbirth,
            gender:gender,
            profession:profession,
            
          });
      response.send(userdata);
    });

    app.get("/user/signup",async (request,response)=>
    {
     
       const client = await createConnection();
        const result = await client
          .db("mobile")
          .collection("userlog")
          .find({})
          .toArray();
          console.log(result);
      response.send(result);
    });
    app.delete("/user/signup/:id",async (request,response)=>
    {
       const {id}=request.params;
       const client = await createConnection();
        const result = await client
          .db("mobile")
          .collection("userlog")
          .deleteOne({_id:ObjectId(id)});
        
          console.log(result);
      response.send(result);
    });

 //////////////////////////login
//  "name":"Raji",
//  "password":"nopassword"
    async function searchedUser(name)
    {
        const client = await createConnection();
        const result = await client
                       .db("mobile")
                       .collection("userlog")
                       .findOne({name:name});
                     return result;
    }

    app.post("/login",async (request,response)=>{
      const {name,password} =request.body;
      const value=await searchedUser(name);
   
      if(value!=null)
      {

        const passindb=value.password;
        const passinlogin=password;
        const ispasstrue=await bcrypt.compare(passinlogin,passindb);
      
      
      if(ispasstrue)
        {
          console.log(ObjectId(value._id));
          const token=jwt.sign({id:value._id},process.env.UNIQUE_KEY);
          response.send({msg:"sucessfull login",token:token});
        }
        else{
          response.send({msg:"invalid login"});
        }
      } 
        else
      {
        response.send({msg:"wrong user"});
      }
    })
  
////////////////////company
    app.post("/company",async (request,response)=>
    {
      const {logo,company,location,field,description} =request.body;
      const userdata=request.body;
      console.log(logo,company,location,field,description);
    
    const client = await createConnection();
        const result = await client
          .db("mobile")
          .collection("company")
          .insertOne({
            logo:logo,
            company:company,
            location:location,
            field:field,
            description:description
            
          });
          console.log(userdata)
      response.send(userdata);
    });

    app.get("/company",auth,async (request,response)=>
    {
     
       const client = await createConnection();
        const result = await client
          .db("mobile")
          .collection("company")
          .find({})
          .toArray();
          console.log(result);
      response.send(result);
    });
    app.delete("/company/:id",async (request,response)=>
    {
       const {id}=request.params;
       const client = await createConnection();
        const result = await client
          .db("mobile")
          .collection("company")
          .deleteOne({_id:ObjectId(id)});
        
          console.log(result);
      response.send(result);
    });
    
////////////////////////questions    
    app.post("/question",async (request,response)=>
    {
      const {question} =request.body;
      const userdata=request.body;
      console.log(question);
    
    const client = await createConnection();
        const result = await client
          .db("mobile")
          .collection("question")
          .insertOne({
            question:question,
            answer:[],
            vote:0,
            views:0
            });
      response.send(userdata);
    });
    // 
    app.put("/question/:id",async (request,response)=>
    {
      const {id}=request.params;
      const {ans,vote} =request.body;
      const userdata=request.body;
      const client = await createConnection();
        const result = await client
          .db("mobile")
          .collection("question")
          .updateOne({_id:ObjectId(id)},{$set:{vote: vote}}, {$push:{answer:ans}});
      response.send(userdata);
    });

    app.get("/question",async (request,response)=>
    {
     
       const client = await createConnection();
        const result = await client
          .db("mobile")
          .collection("question")
          .find({})
          .toArray();
          console.log(result);
      response.send(result);
    });


   app.listen(PORT,()=> console.log("started"));
























