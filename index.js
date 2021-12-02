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

const MONGO_URL=process.env.MONGO_URL;  
const PORT= process.env.PORT;

   
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
    
 //////////////////////////login
//  "name":"Raji",
//  "password":"nopassword"
app.post("/login",async(req,res)=>{ 
  const{emailId,password}=req.body;
  const value=await searchedUser(emailId);

    if(value!=null)
    {
      const passindb=value.password;
      const passinlogin=password;
      const ispasstrue=await bcrypt.compare(passinlogin,passindb);
 
    
   
   if(ispasstrue)
      {
       const token=jwt.sign({id:value._id},process.env.UNIQUE_KEY);
         res.send({token:token,id:value._id});
   }
      else{
        res.send({msg:"invalid login"});
      }
    }   
      else
    {    
      res.send({msg:"wrong user"});
    
    }
})
////////////////////////signup

app.post("/signup",async(req,res)=>{

  const {userName,userPassword,emailId} =req.body;
  const value=await searchedUser(emailId);
  if(!value){
    const hashedpassword=await genpassword(userPassword);
    const client = await createConnection();
          const result = await client
            .db("mobile")
            .collection("userlog")
            .insertOne({
              name: userName,
              email:emailId,
              password: hashedpassword,
              avatar:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIy2vRwSRoUACatub962auO36Uo5OjNQ5wCQ&usqp=CAU" 
                 });
                }
else{
res.send({msg:"existing mailid"})
}
  
})

async function searchedUser(userEmailId)
{
  const client = await createConnection();
  const result = await client 
                 .db("mobile")
                 .collection("userlog")
                 .findOne({"email":userEmailId});
               return result;
}
  /////user
  app.get("/user",async (request,response)=>
  {
   
     const client = await createConnection();
      const result = await client
        .db("mobile")
        .collection("user")
        .find({})
        .toArray();
       
    response.send(result);
  });
////////////////////company


    app.get("/company",async (request,response)=>
    {
     
       const client = await createConnection();
        const result = await client
          .db("mobile")
          .collection("company")
          .find({})
          .toArray();
         
      response.send(result);
    });

    

 
////////////////////////questions    
    app.post("/question",async (request,response)=>
    {
      const {title,body,userid,tags,moment} =request.body;  
      const client = await createConnection();
        const result = await client
          .db("mobile")
          .collection("question")
          .insertOne({ vote:0,title:title,body:body,answers:[],tag:tags,createdby:userid,time:moment})
  });
  
    app.put("/question/answers",async (request,response)=>
    {
     const {answer,questionid,userid,moment} =request.body;
     const client = await createConnection();

     const obj={answer:answer,userid:userid,time:moment}
 
        const result = await client
          .db("mobile")
          .collection("question")
          .updateOne({_id:ObjectId(questionid)}, {$push:{answers:obj}});
     
    });

    app.get("/question",async (request,response)=>
    {
     
       const client = await createConnection();
        const result = await client
          .db("mobile")
          .collection("question")
          .find({})
          .toArray();
       
      response.send(result);
    });


   app.listen(PORT,()=> console.log("started"));
























