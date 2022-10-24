
const  path = require('path'),
       fs = require('fs'),
       os = require('os'),
       { exec } = require('child_process');
       request = require('request');

// REPO ////////////////////////////////////////////////////////////////////////
var {aappuser} = require('./bin/repo/ds/users/vogel-users.js');
var {app,ipcMain,BrowserWindow,viewtools} = require('./bin/repo/tools/box/electronviewtool.js');
var {loginroutes}=require('./bin/repo/gui/js/modules/login.js');
////////////////////////////////////////////////////////////////////////////////

//Midleware //////////////////////////
var controlsroot = path.join(__dirname,'/controllers/'); //dir path to views
var au = require('./bin/appuser.js'); //initialize the app user object
var appset = require(path.join(au.auser.cuser.spdrive,'Vogel - Office Documents/IM Tools/Widget/settings.json'));//appset.dev.on = true; './app/settings.json';
var {navroutes}=require('./bin/routes.js');
/////////////////////////////////////
var mainv; //holds the main BrowserWindow
var winh = 160;
var winw = 200;
require('dns').resolve('www.google.com',(err)=>{ //test for internet connection
  if(err){//is not connected
  }
  else{//is connected
  }
});

/* LANDING PAGE
    The landing page will more often be the login screen
    This login screen can be skipped by editing the
    appset.dev.on = true. This will default to main.html
    If the developer wants to skip to a page, the
    appset.dev.page = '' can have a desired page file
    name
*/
app.on('ready',(eve)=>{
  if(!appset.dev.on){
    console.log(au.auser);
    if(appset.users[au.auser.uname]==undefined){
      mainv = viewtools.loader(controlsroot + 'login.html',1080,750,false,false,'hidden',true);
    }else{
      try{//attempt to open users default page
        mainv = viewtools.loader(controlsroot + appset.groups[au.auser.config.group].main,winw,winh,false,false,'hidden',true);
        mainv.transparent = true;
      }catch{mainv = viewtools.loader(controlsroot + 'login.html',1080,750,false,false,'hidden',true);}
    }
    mainv.on('close',(eve)=>{ //any app closing code below
    });
  }else{appset.dev.page==''?mainv = viewtools.loader(controlsroot+'main.html',winw,winh,false,false,'hidden',true):mainv=viewtools.loader(controlsroot+appset.dev.page,winw,winh,false,false,'hidden',true)}
});


/* APP login
    data:{
      user:'',
      pswrd:''
    }

    Recieve a user name and password from login form AND
    attach the application auth code to it. The api is
    queried to check both the auth code and the user
    credentials.

    If the access/login to the api is a success, the
    appset.users is checked for a match to the user name.

    If the user is found in appset.users, that users group
    view (appset.groups.main) 'dash' is loaded
*/
ipcMain.on(loginroutes.submit,(eve,data)=>{
  if(au.SETUPappuser(appset.users,data.uname,data.pswrd)){ //check to see if username matches app settings
    viewtools.swapper(mainv,controlsroot + appset.groups[au.auser.config.group].main,winw,winh);
  }else{eve.sender.send(loginroutes.submit,{status:false,msg:'Not an app user',user:null})}
});

// Titlebar Request
ipcMain.on('view-minimize',(eve,data)=>{
  BrowserWindow.getFocusedWindow().minimize();
});

// Request login screen
ipcMain.on(navroutes.gotologin,(eve,data)=>{
  au.RESETappuser();
  viewtools.swapper(mainv,controlsroot + 'login.html',1080,750);
});


ipcMain.on('setup-apps',(eve,data)=>{
  if(appset.users[data]!=undefined){
    eve.sender.send('setup-apps',{
      buttonlist:appset.groups[appset.users[data].group].apps,
      applist:appset.applist
    });
  }else{eve.sender.send('setup-apps',null);}
});
//Open a VA
ipcMain.on('open-app',(eve,data)=>{
  if(appset.applist[data]!=undefined){
    console.log(data);
    exec(path.join(au.auser.cuser.spdrive,appset.applist[data].path).replace(/ /g,'^ '));//use electron.shell.openfile
    eve.sender.send('open-app',{success:true,msg:'App is Opening'});
  }else{eve.sender.send('open-app',{success:false,msg:'App is not setup'});}
});
