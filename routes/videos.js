const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { getVideoDurationInSeconds } = require("get-video-duration");

const videoModel = require("../models/videoModel");

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// {"fieldname":"myVideo","originalname":"samplevideo.mp4",
//"encoding":"7bit","mimetype":"video/mp4","destination":"uploads"
//,"filename":"myVideo-1591781735659.mp4"
//,"path":"uploads/myVideo-1591781735659.mp4","size":318465}

/*Handle File Upload*/
const getFileExtension = filename => {
  return filename.split(".").pop();
};

//Helper functions
//-format time
const adjust = (time) => {
  time = Math.round(time)
  if (time < 10){
    return `0${time}`
  }else {
    return time
  }
}

const formatDuration = (dur) => {
  let seconds = Math.round(dur);
  const format = "HH:MM:SS"
  const toMinAndSeconds = (secs)=> {
      let min = secs / 60
      let s = secs % 60
      return {
        min: min,
        s: s
      }
  }
  const toHrsAndMins = (mins) => {
    let hr = mins / 60
    let min = mins % 60
    return {
      hr: hr,
      min: min
    }
  }
  if (seconds < 60 ) {
      return `00:${adjust(seconds)}`
  }else if ( seconds > 59 && seconds < 3600) {
    return `${adjust(toMinAndSeconds(seconds).min)}:${adjust(toMinAndSeconds(seconds).s)}`
  } else if ( seconds > 3599) {
      const min = toMinAndSeconds(seconds).min
      const s =toMinAndSeconds(seconds).s
    return  `${adjust(toHrsAndMins(min).hr)}:${adjust(toHrsAndMins(min).min)}:${adjust(s)}`
  }
}



//Multer setup

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "." +
        getFileExtension(file.originalname)
    );
  }
});

var upload = multer({ storage: storage });

const getFileUrl = filename => {
  return "https://gravel-videos-api-reagan.glitch.me/" + filename;
};

//CREATE - Put/Post

router.post("/upload", upload.single("myVideo"), (req, res, next) => {
  const newDate = new Date();
  /*Upload Video*/
  const file = req.file;

  const videoDuration = async () => {
    const result = await getVideoDurationInSeconds(
      getFileUrl(file.filename)
    ).then(duration => duration);
    return result;
  };

  //Upload Video Handler - you can use any other async/promises here

  /*Save Entered data to database*/

  videoModel
    .findOne({ title: req.body.title })
    .then(doc => {
      if (!doc || doc.length === 0) {
        if (!file) {
          const error = new Error("Please upload a file");
          error.httpStatusCode = 400;
          next(error);
        }
        const uploadVideo = async () => {
          /*Get video duration*/
          const duration = await videoDuration();

          let newVideo = new videoModel({
            title: req.body.title,
            description: req.body.description,
            creator: req.body.creator,
            category: req.body.category,
            uploadedat: newDate,
            views: 0,
            duration: duration,
            videourl: getFileUrl(file.filename),
            formattedDuration: formatDuration(duration)
          })
            .save()
            .then(doc => {
              if (!doc || doc.length === 0) {
                res.status(500).send(doc);
              } else {
                res.status(201).send(doc);
              }
            })
            .catch(err => {
              res.status(500).json(err);
              console.log("Ran into an error : " + err);
            });
        };
        uploadVideo();
      } else {
        //Update the current document
        videoModel
          .findOneAndUpdate({ title: req.body.title }, req.body, {
            new: true
          })
          .then(doc => res.status(200).send(doc))
          .catch(err => res.status(500).json(err));
      }
    })
    .catch(err => res.status(500).json(err));

  // res.send(file)
});

//READ

router.get("/", (req, res) => {
  videoModel
    .find({})
    .then(doc => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(500).send(doc);
      }
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

//UPDATE PUT/POST -- This can be commented out, Post Method handles it
router.put("/", (req, res) => {
  const newDate = new Date();
  videoModel
    .findOneAndUpdate({ title: req.query.title }, req.body, {
      new: true
    })
    .then(doc => {
      if (!doc || doc.length === 0) {
        let newVideo = new videoModel({
          title: req.query.title,
          description: req.body.description,
          creator: req.body.creator,
          category: req.body.category,
          uploadedat: newDate,
          views: 0
        })
          .save()
          .then(doc => {
            if (!doc || doc.length === 0) {
              res.status(500).send(doc);
              console.log("Received an empty body");
            } else {
              res.status(201).send(doc);
              console.log("Saved successfully");
            }
          })
          .catch(err => {
            res.status(500).json(err);
            console.log("Ran into an error : " + err);
          });
      } else {
        res.status(200).send(doc);
        console.log("Saved successfully");
      }
    })
    .catch(err => res.status(500).json(err));
});

//DELETE

router.delete("/", (req, res) => {
  videoModel
    .findOneAndRemove({ title: req.query.title })
    .then(doc => res.status(200).json({ msg: "Deleted: ", doc }))
    .catch(err => res.status(500).json(err));
});

module.exports = router;
