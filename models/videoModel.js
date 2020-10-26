const mongoose = require('mongoose');

let videoSchema = mongoose.Schema({
  title: String,
  description: String,
  creator: String,
  rating: Number,
  views: Number,
  duration: Number,
  //thumbnailurl: String,
  category: String,
  subCategory: String,
  videourl: String,
  uploadedat: String,
  formattedDuration: String
});

const videoModel = mongoose.model("Video", videoSchema);

module.exports = videoModel;

