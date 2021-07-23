const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();

app.set("view engine", "ejs"); 

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-simpola:admin-simpola@cluster0.taysu.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = {
    name: {
        type: String,
        require: true
    }
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "make food"
});

const item2 = new Item({
    name: "cook food"
});

const item3 = new Item({
    name: "eat food"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/",function(req, res){

  Item.find({},function(err,results){

    if(results.length === 0){   
    Item.insertMany(defaultItems,function(err){
    
    if(err){
        console.log(err);
    }else{
        console.log("Successfully added");
    }
}); 
    res.redirect("/");
    }  
   else{
    res.render("list",{ listTitle: "Today", newListItems: results });
   }
})});


 app.post("/",function(req,res){
   
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    
    const item = new Item({
       name: itemName   
    }); 
    
    if(listName === "Today"){
      item.save();
      res.redirect("/");
    }else{
        List.findOne({name:listName}, function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
 });

 app.post("/delete",function(req,res){
     const checkedItemId = req.body.checkbox;
     const listName = req.body.listName;

     if (listName === "Today"){
 
        Item.findByIdAndRemove(checkedItemId, function(err){
         if(!err){
             res.redirect("/");
             console.log("Successfully removed");
         }
     });
     }else{
        List.findOneAndUpdate({name: listName},{$pull:{items: {_id: checkedItemId}}}, function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
     }
 });
 
app.get("/:customListName",function(req,res){
    const customListName = req.params.customListName;
    
   List.findOne({name: customListName},function(err, foundList){
       if(!err){
           if(!foundList)
           {
             //Creating a new dynamic list
            const list = new List({
             name: customListName,
             items: defaultItems
            });  
            list.save();

            res.redirect("/" + customListName);

           }else{
            //showing existing lists
            res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
       }}
   })

});

app.get("/about",function(req,res){
    res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port,function(){
    console.log("The server is up and working at 3000");
})
