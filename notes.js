console.log('Starting albums.js');

// module.exports.age=24;

// module.exports.add = (a , b)=>{
//     console.log('Adding Numbers');
//     return a+b;
// };
// console.log(module);

const fs =require('fs');

var fetchalbums= ()=>{
    try{
        console.log('Fetching albums');
        var albumsString=fs.readFileSync('albums.json','utf8');
        //console.log(JSON.parse(albumsString));
        return JSON.parse(albumsString);
      }  catch(e){
        return [];
      }
    
};

var savealbums=(albums)=>{
    fs.writeFileSync('albums.json',JSON.stringify(albums));
};
var addalbum = (id,deletehash,albumtitle,description,imagelink) =>{
 // console.log('Adding album ',id,body);
  var albums=fetchalbums();
  var album={
      id,
      deletehash,
      albumtitle,
      description,
      imagelink
  };
  
  var duplicatealbums =albums.filter((album)=>album.id===id);

  if(duplicatealbums.length ==0){
    
        albums.push(album);

        savealbums(albums);
        return album;

  }
};

var getAll=()=>{
    console.log('Getting all nodes');
    var albums=fetchalbums();
    
    
    return albums;
};

var getalbum=(id)=>{
    console.log('Getting the album',id);
    var albums=fetchalbums();
   
    var duplicatealbums =albums.filter((album)=>album.id===id);
   // console.log('album info',duplicatealbums);
   // console.log(`Title ${duplicatealbums[0].title} Body ${duplicatealbums[0].body}`);
    return duplicatealbums;
};

var removealbum=(id)=>{
    console.log('Removing the album',id);
     
    var albums=fetchalbums();
    var duplicatealbums =albums.filter((album)=>album.id!== id);
    savealbums(duplicatealbums);
    return albums.length !== duplicatealbums.length;
    
    
 
};

var logalbum= (album)=>{
    debugger;
    console.log('--');
    console.log(`ID: ${album.id} Deletehash: ${album.deletehash} Title ${album.albumtitle} Description : ${album.description} Link : ${album.imagelink}`);
}
module.exports={
    addalbum ,
    getAll,
    getalbum,
    removealbum,
    logalbum
};

