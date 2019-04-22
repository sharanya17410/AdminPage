const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('hbs');
const request =require('request');
const multer=require('multer');

const fs=require('fs');
const fileUpload = require('express-fileupload');


// default options


var nodemailer = require('nodemailer');
var http = require('http');
var url = require('url');

const app = express();

//app.engine('handlebars',exphbs());
app.set('view engine','hbs');
exphbs.registerPartials(__dirname+'/views/partials')
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('./multer'));
app.use('/public',express.static(path.join(__dirname,'public')));

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './multer/uploads/',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  // Init Upload
  const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('myImage');
  
  // Check File Type
  function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
  }
  

//static folder

app.get('/',(req,res)=>{
    res.render('contact');
});

// app.get('/gallery',(req,res)=>{
//   res.render('gallery');
// });




//const os =require('os');
//const _=require('lodash');
const yargs = require('yargs');

const albums=require('./notes.js');

const argv=yargs.argv;
var command = process.argv[2];
var albumArray=[];
console.log(command);
if (command === 'add') {
  console.log('Adding new album');
  var album=albums.addalbum(argv.title,argv.body);
  //if (typeof(album) !== 'undefined'){
    if(album){
      console.log('album Created');
      console.log('--');
      console.log(`Title: ${album.title} Body: ${album.body}`);
  }
  else{
    console.log('album title taken');
  }
} else if (command === 'list') {
    console.log('Listing all albums');
    albumArray = albums.getAll();
    console.log(JSON.stringify(albumArray,undefined,2));
    //albumArray.forEach((album)=>{albums.logalbum(album)});
} else if (command === 'read') {
  console.log('Reading album');
 var album= albums.getalbum(argv.title);
  if(album){
    console.log('album has been fetched--');
    albums.logalbum(album);
}
else{
  console.log('album not found');
}
} else if (command === 'remove') {
  console.log('Removing album');
  var bool = albums.removealbum(argv.title);
  var message = bool ? 'album was removed':'album not found';
  console.log(message);
} else {
  console.log('Command not recognized');
}

// const user=os.userInfo();

// var res = notes.add(9,-2);
// console.log(res);
// console.log('Yaaaaay');
// // console.log(user);

// // fs.appendFile('greetings.txt',`Hello ${user.username} You are  ${notes.age}`,function(err){
// //     if(err){
// //     console.log('Unable to upload the file !');}
// // });

app.get('/admin',(req,res)=>{
    albumArray = albums.getAll();
    console.log('Admin--------------------------------------------------------');
    res.render('admin',{
        albums : albumArray
    });

 
});
app.get('/addPictures/:id',(req,res)=>{
  albumArray = albums.getAll();
  console.log('Admin--------------------------------------------------------');
  fs.writeFileSync('albums_id.txt',req.params.id);
  res.render('addPictures');


});



app.post('/upload', function(req, res) {

  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }
  
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
console.log(sampleFile.name);
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('E:/Web Dev/mailernode/public/img/imgur-file-upload/'+sampleFile.name, function(err) {
    if (err)
      return res.status(500).send(err);

    //joining path of directory 
const directoryPath = path.join(__dirname, '/public/img/imgur-file-upload/');
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        request.post({
          headers: { 'Authorization': 'Client-ID ' + 'c2049e40de14fa8'},
          url:     'https://api.imgur.com/3/image',
          formData:    { image:  fs.createReadStream(`./public/img/imgur-file-upload/${file}`)},
      }, function(err, response, body){
          if(err){
              console.log(err);
          }

          console.log('Image:'+JSON.parse(body).data.link);
          var image_deletehash= JSON.parse(body).data.deletehash;
          var album_id=fs.readFileSync('./albums_id.txt','utf8');
          console.log('checking type:'+typeof album_id);
          console.log('Uploading pics , album id : '+album_id);
          var album_info=albums.getalbum(album_id);
          var album_deletehash = album_info[0].deletehash;
          console.log('albums del hash:'+album_deletehash);
          request.post({
            headers: { 'Authorization': 'Client-ID ' + 'c2049e40de14fa8'},
            url:     `https://api.imgur.com/3/album/${album_deletehash}/add`,
            formData: {'deletehashes[]':image_deletehash},
        }, function(err, response, body){
            if(err){
                console.log(err);
            }
            console.log('uploaded!!!!-body:'+JSON.stringify(body,2,0));
           // console.log('uploaded!!!!-response:'+JSON.parse(response));
            
          });
        }); 
        console.log('inside: '+file); 
    });
});
    res.send('File uploaded!');
  });
});

// app.post('/anyurl/', (req, res) => {
//   app.post('/createEmp', function(req, res){  
//     //now req.body will be populated with the object you sent
//     console.log(req.body.name); //prints john
//     });  // send the response in the form of json
// })
///----------------------here------------------------------------

app.get('/create/:id', (req, res) => {
  var id = (req.params.id);
  console.log(`AT server ${id}`);
  console.log(req.params);
  var title = albums.getalbum(id);
  console.log('title',title[0].albumtitle);
  var array = [];
  request({
    headers: { 'Authorization': 'Client-ID ' + 'c2049e40de14fa8'},
    url:`https://api.imgur.com/3/account/sharanya17410/album/${id}`,
  },(error,response,body)=>{
     if(!error && response.statusCode=== 200){
           console.log('bhjbkhbk:'+JSON.parse(body).data);
           var images=JSON.parse(body).data.images;
           console.log('check1:'+JSON.parse(body).data);
           console.log(JSON.stringify(images,0,2));
           for(var i =0;i<images.length;i++){
           console.log(images[i].link);
           console.log(images[i].id);
           array.push({ imagelink : images[i].link,imageid : images[i].id});
           
           
          }
          console.log('before render');
          //array.push('imagelink : '+title.albumtitle);
         // console.log(title.id);
          array.push({title : title[0].albumtitle});
          array.push({description : title[0].description});
          array.push({id : title[0].id});
          
          //res.params("title" :title.albumtitle, "description" : title.description, "album":array);
          res.send({album:array});
          console.log('after render');
        }else{
            console.log('Unable to fetch album info');
        }
    });

    
});

app.get('/view-albums', (req, res) => {
  res.render('admin',{
    albums : albumArray
});
});

app.post('/test/upload', (req, res) => {
    upload(req, res, (err) => {
      if(err){
        res.render('admin', {
          msg: err
        });
      } else {
        if(req.file == undefined){
          res.render('admin', {
            msg: 'Error: No File Selected!'
          });
        } else {
         var imageLink="";
         //Upload album's cover image to imgur and get the image Link  
            request.post({
                            headers: { 'Authorization': 'Client-ID ' + 'c2049e40de14fa8'},
                            url:     'https://api.imgur.com/3/image',
                            formData:    { image:  fs.createReadStream(`./multer/uploads/${req.file.filename}`)},
                        }, function(err, response, body){
                            if(err){
                                console.log(err);
                            }
            //console.log(JSON.parse(body).data);
                        //   var response = JSON.parse(body);
                        
       // var album=albums.addalbum(response.data.id,response.data.deletehash,req.body.name,req.body.desc);
        imageLink=JSON.parse(body).data.link;
       // console.log(JSON.parse(body).data.link);
        //console.log(album);
                            
    request.post({
        headers: { 'Authorization': 'Client-ID ' + 'c2049e40de14fa8'},
        url:     'https://api.imgur.com/3/album',
        form:    { title: req.body.name, description:req.body.desc},
      }, function(err, response, body){
        if(err){
            console.log(err);
        }
         var response = JSON.parse(body);
        // console.log(response.data.id,response.data.deletehash,req.body.name,req.body.desc,imageLink);
         albums.addalbum(response.data.id,response.data.deletehash,req.body.name,req.body.desc,imageLink);
      //   console.log(JSON.parse(body).data.id);
        // console.log(album);
  
  
      });
      
     });

     //Create an album by sending necessary details to imgur album creation endpoint
     albumArray = albums.getAll();
     console.log('Upload--------------------------------------------------------');
     console.log(albumArray);
          res.render('admin', {
            albums : albumArray
            // ,
            // msg: 'File Uploaded!',
            // file: `uploads/${req.file.filename}`
          });
        // res.redirect('back');
      //    console.log(req.file.filename);
         // res.send(albumArray);
        }
      }
    });
  });  



  app.post('/check', (req, res) => {
      console.log(albumArray);
  });
   

app.post('/send',(req,res)=>{
    console.log(req.body);
    const output = `
    <p> You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>
        <li>Name : ${req.body.name}</li>
        <li>Company : ${req.body.company}</li>
        <li>Email : ${req.body.email}</li>
        <li>Phone : ${req.body.phone}</li>        
    </ul>
    <h3>Message</h3>
    <p> ${req.body.message}</p>
    `;
    console.log("Creating Transport")
var transporter = nodemailer.createTransport( {
    service: "hotmail",
    //host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    auth: {
        user: "abc@outlook.com",
        pass: "xxxxx"
    },
    tls: {
        ciphers:'SSLv3'
    },
    tls: { rejectUnauthorized: false }
});
var mailOptions = {
    from:'Node mailer Contact <sharanya.siddharth@outlook.com>',
    to: 'sharanya.siddharth@gmail.com',
    subject: 'Node contact request',
    text:'TgK',
    html : output

}
console.log("Sending mail")
transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
        res.render('contact',{msg:'Email has been sent'});
    }
});

});



// app.post('/create',(req,res)=>{
    
//     console.log(req);
  
    
//     // request.post({
//     //   headers: { 'Authorization': 'Client-ID ' + 'c2049e40de14fa8'},
//     //   url:     'https://api.imgur.com/3/album',
//     //   form:    { title: req.body.name, description:req.body.desc},
//     // }, function(err, response, body){
//     //   if(err){
//     //       console.log(err);
//     //   }
//     // //   var response = JSON.parse(body);
    
//     // //   var album=albums.addalbum(response.data.id,response.data.deletehash,req.body.name,req.body.desc);
//     // //   console.log(JSON.parse(body).data.id);
//     // //   console.log(album);


//     // });
//    // res.send(file)
//     // request.post({
//     //     headers: { 'Authorization': 'Client-ID ' + 'c2049e40de14fa8'},
//     //     url:     'https://api.imgur.com/3/image',
//     //     form:    { image: UPLOADDIR+file},
//     //   }, function(err, response, body){
//     //     if(err){
//     //         console.log(err);
//     //     }
//     //     console.log(JSON.parse(body).data);
//     //   //   var response = JSON.parse(body);
      
//       //   var album=albums.addalbum(response.data.id,response.data.deletehash,req.body.name,req.body.desc);
//       //   console.log(JSON.parse(body).data.id);
//       //   console.log(album);
  
      
// //      });
//     });
    
    


app.listen(3000,()=>{
    console.log('Server is up and running on port 3000');
});

