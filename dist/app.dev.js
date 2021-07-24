"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express["static"]("public"));
mongoose.connect("mongodb+srv://admin-simpola:admin-simpola@cluster0.taysu.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
var itemSchema = {
  name: {
    type: String,
    require: true
  }
};
var Item = mongoose.model("Item", itemSchema);
var item1 = new Item({
  name: "make food"
});
var item2 = new Item({
  name: "cook food"
});
var item3 = new Item({
  name: "eat food"
});
var defaultItems = [item1, item2, item3];
var listSchema = {
  name: String,
  items: [itemSchema]
};
var List = mongoose.model("List", listSchema);
app.get("/", function (req, res) {
  Item.find({}, function (err, results) {
    if (results.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: results
      });
    }
  });
});
app.post("/", function (req, res) {
  var itemName = req.body.newItem;
  var listName = req.body.list;
  var item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", function (req, res) {
  var checkedItemId = req.body.checkbox;
  var listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        res.redirect("/");
        console.log("Successfully removed");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});
app.get("/:customListName", function (req, res) {
  var customListName = req.params.customListName;
  List.findOne({
    name: customListName
  }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //Creating a new dynamic list
        var list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //showing existing lists
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

function ignoreFavicon(req, res, next) {
  if (req.originalUrl.includes('favicon.ico')) {
    res.status(204).end();
  }

  next();
}

app.use(ignoreFavicon);
app.get("/about", function (req, res) {
  res.render("about");
});
var port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server's Up");
});