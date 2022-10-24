const $ = require('jquery');
var {ipcRenderer,BrowserWindow}=require('electron');
var {app,ipcMain,viewtools} = require('../bin/repo/tools/box/electronviewtool.js');
var {usersls,agreementsls}=require('../bin/gui/storage/lstore.js');
var RROOT='../bin/repo/';
var Titlebar = require('../bin/repo/gui/js/modules/vg-titlebar.js');
var {DropNote}=require('../bin/repo/gui/js/modules/vg-poppers.js');
var {navroutes}=require('../bin/routes.js');

var curruser = JSON.parse(localStorage.getItem(usersls.curruser));
console.log(curruser);
//  TITLE BAR //////////////////////////////////
try{
  document.getElementById(Titlebar.tbdom.info.username).innerText = JSON.parse(localStorage.getItem(usersls.curruser)).uname;
}catch{}
document.getElementById(Titlebar.tbdom.title).innerText = '';

let mactions={
  orgchart:{
    id:'org-chart-button',
    src:'../bin/repo/assets/icons/Org-Chart.png',
    title:'Organization Chart'
  }
}
let qactions={
}

let malist=Titlebar.CREATEactionbuttons(mactions);
let qalist=Titlebar.CREATEactionbuttons(qactions);

Titlebar.ADDmactions(malist);
Titlebar.ADDqactions(qalist);

document.getElementById(Titlebar.tbdom.page.user).addEventListener('click',(ele)=>{//GOTO LOGIN
  window.moveTo(0,0);
  ipcRenderer.send(navroutes.gotologin,'Opening Login...');
});
document.getElementById(mactions.orgchart.id).addEventListener('dblclick',(ele)=>{
  ipcRenderer.send('open-app','OC');
});
window.moveTo(0,0);

$(document.getElementById(Titlebar.tbdom.window.maxi)).hide();
$(document.getElementById(Titlebar.tbdom.page.print)).hide();
$(document.getElementById(Titlebar.tbdom.page.settings)).hide();

var agrid = document.getElementById('appgrid');

var SETappbuttons = (appbuttons,applist)=>{
  agrid.innerHTML = "";
  for(let x=0;x<appbuttons.length;x++){
    if(applist[appbuttons[x]]!=undefined){
      agrid.append(document.createElement('img'));
      agrid.lastChild.src = applist[appbuttons[x]].icon;
      agrid.lastChild.title = applist[appbuttons[x]].title;
      agrid.lastChild.alt = applist[appbuttons[x]].alt;
      agrid.lastChild.addEventListener('dblclick',(ele)=>{
        ipcRenderer.send('open-app',appbuttons[x]);
      });
    }
  }
}
ipcRenderer.send('setup-apps',curruser.uname);

ipcRenderer.on('open-app',(eve,data)=>{
  if(data){
    DropNote('tr','App HAS Opened','green');
  }else{DropNote('tr','App has NOT Opened','red',true)}
});
ipcRenderer.on('setup-apps',(eve,data)=>{
  if(data&&data.buttonlist&&data.applist){
    console.log(data)
    SETappbuttons(data.buttonlist,data.applist);
  }else{DropNote('tr','Bad applist','red')}
});
