import  jwt  from "jsonwebtoken";
export const auth=(request,response,next)=>{
    try{
        const token=request.header("x-auth-token");
       jwt.verify(token,process.env.UNIQUE_KEY);
       next();
    }
    catch (err){
            response.send({message:err.message});
    }
  
}