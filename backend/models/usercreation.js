const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const userSchema=new Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
          default:()=>{
        let cart={};
        for(let i=0;i<=300;i++){
            cart[i]=0;
        }
         return cart;
    },
},
    date:{
        type:Date,
        default:Date.now
    }


})

const User=mongoose.model("User",userSchema);
module.exports=User;