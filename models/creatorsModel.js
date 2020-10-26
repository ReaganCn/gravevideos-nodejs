const mongoose = require('mongoose');

const creatorsSchema = mongoose.Schema ({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
})

const creatorsModel = mongoose.model("Creator", creatorsSchema)

module.exports = creatorsModel;