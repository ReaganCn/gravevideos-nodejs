const mongoose = require('mongoose');

let categorySchema = mongoose.Schema({
  category: String,
  subCategories: Array
})

const categoryModel = mongoose.model("Category", categorySchema);

module.exports = categoryModel;