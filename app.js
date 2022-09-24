const express = require('express');
const app = express();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

app.use(express.json());

app.get('/', function (req, res) {
  res.send('Hello World')
});

app.post('/verification/aadhaar/otp', (req,res)=>{

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("growpital");
        var aadhaar_number = req.body.aadhaarNumber;
        dbo.collection("users").findOne({aadhaar_number: aadhaar_number}, function(err, result) {
          if (err) throw err;
          if(result!=null){
            var otp = Math.floor(100000 + Math.random() * 900000);
            var myquery = { aadhaar_number: aadhaar_number };
            var newvalues = { $set: {otp: otp.toString()} };
            dbo.collection("users").updateOne(myquery, newvalues, function(err, resultt) {
                if (err) throw err;
                res.json({status: "SUCCESS", message: "OTP sent successfully", ref_id: result.ref_id, otp: otp.toString()});
                db.close();
              });
          } else {
            res.json({ref_id: "208", status: "INVALID", message: "Invalid Aadhaar Card"});
            db.close();
          }
        });
      });
});

app.post('/verification/aadhaar/verify', (req,res)=>{
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("growpital");
        var otp = req.body.otp;
        dbo.collection("users").findOne({otp: otp}, function(err, result) {
          if (err) throw err;
          if(result!=null){
            result.status = "VALID";
            result.message = "Aadhaar Card Exits";
            res.json(result);
            db.close();
          } else {
            res.json({ status: "INVALID", message: "Aadhaar Card Doesn't Exists" });
            db.close();
          }
        });
      });
});

var port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Server started at http://localhost:${port}`);
});
