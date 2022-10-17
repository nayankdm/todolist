//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const app = express()

const _ = require("lodash")

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const Items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

//mongoose
const mongoose = require("mongoose")
mongoose.connect('mongodb+srv://admin-nayan:nayan123@cluster0.lw4sygn.mongodb.net/todolist?retryWrites=true&w=majority')

const itemschema = new mongoose.Schema(
  {
    name:String
  })
const Item = mongoose.model("Item",itemschema)

const item1 = new Item ({
    name:"welcome to your todo list !"
  })

const item2 = new Item ({
    name : " Hit the + button to add new date"
  })
const item3 = new Item ({
    name : " Hit the <-- button to add new date"
  })


  const listschema = {
    name:String,
    items :[itemschema]
  }
  
  const List = mongoose.model("List",listschema)
  
  const defaultitemlist =  [item1,item2,item3]

   
app.get("/", function(req, res) {

  Item.find(function(err,data){
    if(data.length===0)
    {
       Item.insertMany(defaultitemlist,function(err)
  {
    if(err)
    {
      console.log("something wrong")
    }
    else
    {
      console.log("added succesfully")
    }
  })

    }
    else{   
      res.render("list", {listTitle: "Today", newListItems: data});
    }

 
  })
 


});

app.get("/:customlistname",function(req,res)
{
  
  const customlistparams = req.params.customlistname
  List.findOne({name:customlistparams},function(err,foundlist )
  {
    if(!err)
    {
      if(!foundlist)
      {
       
        const list = new List( {
             name:customlistparams,
          items :defaultitemlist
       })
        list.save()
        res.redirect("/"+customlistparams)
      }
      else{
        res.render("list", {listTitle: customlistparams, newListItems: foundlist.items});
      }
    }
  })
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listtitle = req.body.list
  const item = new Item({
    name:itemName
  })


  if(listtitle === "Today")
  {
    item.save()
    res.redirect("/")
  }
  else
  {
    List.findOne({name:listtitle},function(err,foundlist)
    {
        foundlist.items.push(item)
        foundlist.save()
        res.redirect("/"+listtitle)
      
     
    })
  }

  
 
});

app.post("/delete",function(req,res)
{
 const checkitemid = req.body.checkbox
 const listname = req.body.listname

 if(listname === "Today")
 {
  Item.findByIdAndRemove(checkitemid ,function(err)
  {
    if(!err)
    {
      res.redirect("/")
    }

  })
 
  
 }
 else{
  List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkitemid}}},function (err,foundlist) {

    if(!err)
    {
      res.redirect("/"+listname)
    }
    })
 }


})


  


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT ||3000, function() {
  console.log("Server started succesfully");
});


