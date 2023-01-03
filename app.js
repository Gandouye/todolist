//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = mongoose.Schema({
  name: {
        type: String,
        required:true
      },
  category: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy Food", category:"Default"}
);
const item2 = new Item({
  name: "Cook Food", category:"Default"}
);
const item3 = new Item({
  name:"Eat Food", category:"Default"}
);

const defaultItems = [item1, item2, item3];


/*
Item.insertMany(defaultItems, (err)=>{
  if(err){
      console.log(err);
  } else {
      console.log("Successgully saved 3 todo list items");
  }
});
*/

Item.find((err, foundItems)=>{
  if(err){
     console.log(err);
  } else {

    foundItems.forEach((item)=>{
      console.log(item.name);
     })
     
  }
});




//const workItems = [];

app.get("/", function(req, res) {
  let listCategory = "";
  if(req.params.listCategory){
    listCategory = req.params.listCategory;
  } else {
    listCategory = "Default";
  }
  console.log(listCategory);

  Item.find({category: listCategory}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, (err)=>{
        if(err){
            console.log(err);
        } else {
            console.log("Successgully saved 3 todo list items");
        }
      });
      res.redirect("/");
    } else {
        Item.find().distinct("category", function(err, allCategories){
          if(err){
          console.log(err);
          } else {
            res.render("list", {listTitle: listCategory, allCategories:allCategories, newListItems: foundItems});
          }
        });
    }
  });

});

app.get("/:listCategory", function(req, res) {
  listCategory = req.params.listCategory;

  Item.find({category: listCategory}, function(err, foundItems){
    if(foundItems.length === 0){
      res.redirect("/");
    } else {
        Item.find().distinct("category", function(err, allCategories){
         if(err){
          console.log(err);
         } else {
           res.render("list", {listTitle: listCategory, allCategories:allCategories, newListItems: foundItems});
         }
        });
        
    }
  });

});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listCategory = req.body.listCategory;

  const newItem = new Item({
    name: itemName,
    category:listCategory}
  );
  newItem.save();
  res.redirect("/"+ listCategory);
});

app.post("/delete", function(req, res){
  itemToDelete = req.body.checkBox;
  const listCategory = req.body.listCategory;

  Item.deleteOne({_id:itemToDelete}, (err)=>{
    if(err){
        console.log();
    } else {
        console.log("successfully deleted the item");
    }
  });
  res.redirect("/"+ listCategory);
})

/*
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

*/

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
