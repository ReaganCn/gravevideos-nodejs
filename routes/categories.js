const express = require("express");
const mongoose = require("mongoose");

const categoryModel = require("../models/categoryModel");
const videoModel = require("../models/videoModel");

//categories/${java} - list all videos under java category
//categories/ - list all categories

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// FUNCTIONS
/*Array manipulation*/
const updateArray = (option, array, newItems) => {
  switch (option) {
    case "add":
      let array2 = [];
      for (let item of newItems) {
        if (array.indexOf(item.trim()) === -1) {
          array2.push(item.trim());
        }
      }
      return [...array, ...array2];
    case "delete":
      const newArray = array.filter(element => {
        return element !== newItems;
      });
      return newArray;
    default:
      return array;
  }
};

/* Trim strings in an array */
const trimStrings = array => array.map(item => item.trim());


//CREATE - post/put

router.post("/add", (req, res) => {
  const subCategoriesArray = req.body.subCategories.split(",");

  categoryModel
    .findOne({ category: req.body.category })
    .then(doc => {
      if (!doc || doc.length === 0) {
        let newCategory = new categoryModel({
          category: req.body.category,
          subCategories: trimStrings(subCategoriesArray)
        })
          .save()
          .then(doc => {
            if (!doc || doc.length === 0) {
              return res.status(500).send(doc);
            }
            res.status(201).send(doc);
          })
          .catch(err => {
            res.status(500).json(err);
          });
      } else {
        categoryModel
          .findOneAndUpdate(
            { category: req.body.category },
            {
              subCategories: updateArray(
                "add",
                doc.subCategories,
                subCategoriesArray
              )
            },
            {
              new: true
            }
          )
          .then(doc => res.status(200).send(doc))
          .catch(err => res.status(500).json(err));
      }
    })
    .catch(err => res.status(500).json(err));
});

//READ - Categories

router.get("/", (req, res) => {
  categoryModel
    .find({})
    .then(doc => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(500).send(doc);
      }
    })
    .catch(err => res.status(500).json(err));
});

//READ - Videos within category
// Fix -  Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client

router.get("/:category", (req, res) => {
  videoModel
    .find({ category: req.params.category })
    .then(doc => {
      if (!doc || doc.length === 0) {
        res.status(500).send(doc);
      }
      res.status(201).json(doc);
    })
    .catch(err => res.status(500).json(err));
});

//PUT - put/post

router.put("/", (req, res) => {
  categoryModel.findOne({ category: req.query.category }).then(doc => {
    if (doc || doc.length > 0) {
      categoryModel
        .findOneAndUpdate(
          { category: req.query.category },
          {
            subCategories: updateArray(
              "add",
              doc.subCategories,
              req.body.subCategories.split(",")
            )
          },
          {
            new: true
          }
        )
        .then(doc => res.status(200).send(doc))
        .catch(err => res.status(400).json(err));
    } else {
      let newCategory = new categoryModel({
        category: req.body.category,
        subCategories: trimStrings(req.body.subCategories.split(","))
      })
        .save()
        .then(doc => {
          if (!doc || doc.length === 0) {
            return res.status(500).send(doc);
          }
          res.status(201).send(doc);
        })
        .catch(err => {
          res.status(500).json(err);
        });
    }
  });
});

//DELETE
//Fix deleting/updating a subcategory
router.delete("/delete", (req, res) => {
  categoryModel
    .findOneAndRemove({ category: req.query.category })
    .then(doc => res.status(200).json({ msg: "Deleted: ", doc }))
    .catch(err => res.status(500).json(err));
});

module.exports = router;
