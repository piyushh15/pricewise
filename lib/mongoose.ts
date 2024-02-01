import mongoose, { mongo } from 'mongoose';

let isConnected =false; //variable to track connection status


export const connectToDB=async()=>{
    //to strict unknown queries
    mongoose.set('strictQuery',true)

    if(!process.env.MONGODB_URI)return console.log('MONGODB_URI is not defined');

    if(isConnected)return console.log('=>using existing database connection');

    try{
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected=true;
        console.log('MONGODB connected')

    }catch(error){
        console.log(error);
    }
}