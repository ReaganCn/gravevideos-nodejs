const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const creatorsModel = require("../models/creatorsModel");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//CREATE - POST/PUT
router.post("/new", (req, res) => {
  creatorsModel.findOne({ email: req.body.email } || { email: req.query.email }).then(doc => {
    if (!doc || doc.length === 0) {
      let newCreator = new creatorsModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email || req.query.email,
        password: req.body.password
      })
        .save()
        .then(doc => {
          if (!doc || doc.length === 0) {
            return res.status(500).send(doc);
          }
          res.status(201).send(doc);
        })
        .catch(err => res.status(500).json(err));
    } else {
      creatorsModel.findOneAndUpdate({ email: req.body.email }, req.body, {new: true})
      .then(doc => res.status(200).json(doc))
      .catch(err => res.status(500).json(err))
    }
  });
});

//READ
router.get("/", (req, res) => {
  creatorsModel
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

  
//UPDATE - post handles this
// router.put("/", (req, res)=> {
// })


//DELETE
router.delete("/", (req, res) => {
  creatorsModel
    .findOneAndRemove({ email: req.query.email })
    .then(doc => res.status(200).json({ msg: "Deleted: ", doc }))
    .catch(err => res.status(500).json(err));
});

module.exports = router;