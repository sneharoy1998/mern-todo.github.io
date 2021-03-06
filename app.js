
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const date = require(__dirname + "/date.js");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/mytodolistDB", {useNewUrlParser: true} ,{ useUnifiedTopology: true });
const itemsSchema= {
    name: String
};
const Item=mongoose.model("Item", itemsSchema);
const item1=new Item({
    name: "here is your todolist!"
});
const item2=new Item({
    name: "Hit The Button to Add!"
});
const item3=new Item({
    name: "Hit Here For the Delete."
});
const defaultItems=[item1, item2, item3];
const listSchema ={
    name: String,
    items: [itemsSchema]
};
const List=mongoose.model("List", listSchema);
app.get("/", function(req, res)
{  
    Item.find({}, function(err, foundItems)
    {
        const day = date.getDate();
        if(foundItems.length===0)
        {
            Item.insertMany(defaultItems, function(err){
                if(err) {
                    console.log(err);
            
                } else {
                    console.log("Your Data is Sucessfully Saved");
                }
            });
            res.redirect("/");

        } else {
    
        res.render("list", {listTitle: day, newListItems: foundItems});
        }

    });
});
app.get("/:customListName", function(req, res)
{
    const customListName=req.params.customListName;
    List.findOne({name: customListName}, function(err, foundList){
        if (!err){
            if(!foundList){
                const list=new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" +customListName)

            } else {
               res.render("list", {listTitle: foundList.name, newListItems: foundList.items}); //here we are shwoing existing page 
            }
        }
    });
})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const item=new Item({
      name: itemName
  });
  item.save();
  res.redirect("/");


  
});
app.post("/delete", function(req, res){
    const checkedItemId=req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId, function(err){
        if(!err)
        {
            console.log("your Data Is Deleted");
            res.redirect("/")
        }
    })
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
