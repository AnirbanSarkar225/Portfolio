(function(){
'use strict';

var cur=document.getElementById('cursor'),ring=document.getElementById('cursor-ring');
var mx=0,my=0,rx=0,ry=0;
if(cur){document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;cur.style.transform='translate('+mx+'px,'+my+'px) translate(-50%,-50%)';});}
if(ring){(function loop(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;ring.style.transform='translate('+rx+'px,'+ry+'px) translate(-50%,-50%)';requestAnimationFrame(loop);})();}

document.getElementById('year').textContent=new Date().getFullYear();

var lastScroll=0;
var nav=document.querySelector('nav');
window.addEventListener('scroll',function(){
  var st=window.scrollY;
  if(st>lastScroll&&st>100)nav.classList.add('hide');
  else nav.classList.remove('hide');
  lastScroll=st;
},{passive:true});

var hamburger=document.querySelector('.hamburger');
var menu=document.getElementById('nav-menu');
if(hamburger){
  hamburger.addEventListener('click',function(){
    menu.classList.toggle('open');
    var spans=hamburger.querySelectorAll('span');
    if(menu.classList.contains('open')){
      spans[0].style.transform='rotate(45deg) translate(4px,4px)';
      spans[1].style.opacity='0';
      spans[2].style.transform='rotate(-45deg) translate(4px,-4px)';
    }else{
      spans[0].style.transform='none';
      spans[1].style.opacity='1';
      spans[2].style.transform='none';
    }
  });
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){menu.classList.remove('open');var spans=hamburger.querySelectorAll('span');spans[0].style.transform='none';spans[1].style.opacity='1';spans[2].style.transform='none';});});
}

var observer=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting)return;
    var el=e.target;
    var delay=el.dataset.delay||0;
    setTimeout(function(){
      el.classList.add('visible');
      el.querySelectorAll('.skill-progress').forEach(function(f){f.style.width=f.dataset.w+'%';});
      el.querySelectorAll('.focus-bar').forEach(function(f){setTimeout(function(){f.style.width=f.dataset.w+'%';},100);});
      var rp=el.querySelector('#radar-polygon');
      if(rp){rp.style.opacity='1';el.querySelectorAll('.radar-dot').forEach(function(d){d.style.opacity='1';});}
    },delay*1);
    observer.unobserve(el);
  });
},{threshold:0.08});
document.querySelectorAll('[data-animate]').forEach(function(el){observer.observe(el);});

var loader=document.getElementById('loader');
var lFill=document.getElementById('loader-fill');
var lStatus=document.getElementById('loader-status');
function setProgress(p,t){lFill.style.width=p+'%';lStatus.textContent=t;}
function hideLoader(){loader.classList.add('done');}

var GH='AnirbanSarkar225';
var CACHE_KEY='portfolio_gh_'+GH;
var TTL=30*60*1000;

function apiCall(path){
  return fetch('https://api.github.com/'+path,{headers:{Accept:'application/vnd.github.v3+json'}}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});
}

function loadCache(){
  try{var raw=localStorage.getItem(CACHE_KEY);if(!raw)return null;var obj=JSON.parse(raw);if(Date.now()-obj.ts<TTL)return obj.data;}catch(e){}
  return null;
}
function saveCache(data){
  try{localStorage.setItem(CACHE_KEY,JSON.stringify({ts:Date.now(),data:data}));}catch(e){}
}

function fetchGitHub(){
  var cached=loadCache();
  if(cached)return Promise.resolve(cached);
  setProgress(20,'FETCHING PROFILE...');
  return apiCall('users/'+GH).then(function(user){
    setProgress(45,'LOADING REPOSITORIES...');
    return apiCall('users/'+GH+'/repos?per_page=100&sort=updated').then(function(repos){
      setProgress(65,'ANALYZING LANGUAGES...');
      var top=repos.filter(function(r){return !r.fork;}).sort(function(a,b){return b.stargazers_count-a.stargazers_count;}).slice(0,8);
      var langPromises=top.map(function(repo){
        return apiCall('repos/'+GH+'/'+repo.name+'/languages').then(function(langs){repo._langs=langs;}).catch(function(){repo._langs={};});
      });
      return Promise.all(langPromises).then(function(){
        var data={user:user,repos:repos};
        saveCache(data);
        return data;
      });
    });
  });
}

function setText(id,v){var el=document.getElementById(id);if(el)el.textContent=v;}

function countUp(id,target){
  var el=document.getElementById(id);
  if(!el)return;
  var io2=new IntersectionObserver(function(entries){
    if(!entries[0].isIntersecting)return;
    io2.disconnect();
    var start=null,dur=1200;
    function step(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/dur,1);
      var ease=1-Math.pow(1-p,3);
      el.textContent=Math.round(ease*target);
      if(p<1)requestAnimationFrame(step);
      else el.textContent=target;
    }
    requestAnimationFrame(step);
  });
  io2.observe(el);
}

function applyUser(user,repos){
  var stars=repos.reduce(function(s,r){return s+r.stargazers_count;},0);
  setText('gh-display-name',user.name||GH);
  setText('gh-bio-text',user.bio||'Full-Stack Developer from Kolkata, India');
  setText('gh-repo-count',user.public_repos||'—');
  setText('gh-follower-count',user.followers||'—');
  setText('gh-star-count',stars);
  setText('meta-repos',user.public_repos||'—');
  setText('meta-stars',stars);
  setText('meta-followers',user.followers||'—');
  countUp('stat-repos',user.public_repos||0);
  countUp('stat-stars',stars);
  countUp('stat-followers',user.followers||0);
  countUp('stat-following',user.following||0);
  var now=new Date();
  setText('fetch-time','FETCHED: '+now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})+' · '+now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}));
  setText('footer-stats',(user.public_repos||'—')+' REPOS · '+stars+' STARS · '+GH);
}

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

var PROJ_META={
  'AlphaRail':{desc:'Full-stack Railway Management System — FastAPI backend, JavaScript frontend, real-time scheduling, booking flows, admin dashboards, and REST API architecture.',tags:['FastAPI','Python','JavaScript','REST API']},
  'inventory-management':{desc:'Maven-based Java Swing desktop app with SQLite persistence, role-based authentication, and 8 operational modules.',tags:['Java','Swing','SQLite','Maven']}
};
var FALLBACK=[
  {name:'AlphaRail',description:'Full-stack Railway Management System with FastAPI + JavaScript.',language:'Python',stargazers_count:0,html_url:'https://github.com/'+GH,updated_at:'2025-01-01'},
  {name:'Inventory Management',description:'Maven Java Swing desktop app with SQLite and role-based auth.',language:'Java',stargazers_count:0,html_url:'https://github.com/'+GH,updated_at:'2025-01-01'},
  {name:'OpenEnv AI Agent',description:'Custom AI agent training environment for Meta PyTorch Hackathon.',language:'Python',stargazers_count:0,html_url:'https://github.com/'+GH,updated_at:'2025-01-01'},
  {name:'Competitive Programming',description:'Algorithmic solutions — binary search, graphs, peak-finding.',language:'Python',stargazers_count:0,html_url:'https://github.com/'+GH,updated_at:'2025-01-01'}
];

function buildProjects(repos){
  var grid=document.getElementById('projects-grid');
  var loading=document.getElementById('projects-loading');
  if(loading)loading.remove();
  var list=repos.length?repos.filter(function(r){return !r.fork;}).sort(function(a,b){return(b.stargazers_count-a.stargazers_count)||(new Date(b.updated_at)-new Date(a.updated_at));}).slice(0,6):FALLBACK;
  list.forEach(function(repo,i){
    var meta=PROJ_META[repo.name]||{};
    var card=document.createElement('div');
    card.className='project-card';
    card.setAttribute('data-animate','');
    card.setAttribute('data-delay',String(i*80));
    var tags=(meta.tags||(repo.language?[repo.language]:[])).filter(Boolean);
    var stars=repo.stargazers_count||0;
    var updated=repo.updated_at?new Date(repo.updated_at).toLocaleDateString('en-IN',{month:'short',year:'numeric'}):'';
    card.innerHTML='<div class="project-index">// 00'+(i+1)+'</div><div class="project-name">'+esc(repo.name||'')+'</div><p class="project-desc">'+esc(meta.desc||repo.description||'A project by Anirban Sarkar.')+'</p><div class="project-tags">'+tags.map(function(t){return '<span class="project-tag">'+esc(t)+'</span>';}).join('')+'</div>'+(stars||updated?'<div class="project-stars">'+(stars?'★ '+stars+' stars':'')+(stars&&updated?' · ':'')+(updated?'Updated '+updated:'')+'</div>':'')+'<a href="'+esc(repo.html_url||'https://github.com/'+GH)+'" target="_blank" class="project-link">VIEW ON GITHUB →</a>';
    grid.appendChild(card);
    setTimeout(function(){observer.observe(card);},40*i);
  });
}

var LANG_COLORS={Java:'#7c6eff',Python:'#00f5c4',JavaScript:'#ff6b6b',HTML:'#ffd93d',CSS:'#4dd0e1',C:'#a8b3ff',Shell:'#ff9f43','C++':'#f06292',TypeScript:'#4fc3f7',Kotlin:'#e91e63'};

function buildDonut(repos){
  var agg={};
  repos.filter(function(r){return !r.fork;}).forEach(function(r){
    if(r._langs)Object.entries(r._langs).forEach(function(e){agg[e[0]]=(agg[e[0]]||0)+e[1];});
    else if(r.language)agg[r.language]=(agg[r.language]||0)+1000;
  });
  var total=Object.values(agg).reduce(function(s,v){return s+v;},0)||1;
  var top=Object.entries(agg).sort(function(a,b){return b[1]-a[1];}).slice(0,5);
  var pcts=top.map(function(e){return {l:e[0],p:Math.round(e[1]/total*100)};});
  var svg=document.getElementById('donut-chart');
  var R=50,cx=65,cy=65,C=2*Math.PI*R;
  var off=-C/4;
  pcts.forEach(function(item,i){
    if(!item.p)return;
    var arc=C*(item.p/100);
    var c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',cx);c.setAttribute('cy',cy);c.setAttribute('r',R);
    c.setAttribute('fill','none');
    c.setAttribute('stroke',LANG_COLORS[item.l]||'hsl('+(i*72+20)+',70%,62%)');
    c.setAttribute('stroke-width','18');
    c.setAttribute('stroke-dasharray',arc+' '+(C-arc));
    c.setAttribute('stroke-dashoffset',-off);
    svg.insertBefore(c,svg.querySelector('text'));
    off+=arc;
  });
  document.getElementById('donut-label').textContent=top.length+' LANG'+(top.length!==1?'S':'');
  var ll=document.getElementById('lang-list');
  ll.innerHTML='';
  pcts.forEach(function(item,i){
    var color=LANG_COLORS[item.l]||'hsl('+(i*72+20)+',70%,62%)';
    var d=document.createElement('div');
    d.className='lang-entry';
    d.innerHTML='<div class="lang-color" style="background:'+color+'"></div><span class="lang-name">'+esc(item.l)+'</span><span class="lang-percent">'+item.p+'%</span>';
    ll.appendChild(d);
  });
}

function buildContrib(){
  var w=document.getElementById('contrib-container');
  w.innerHTML='';
  var WEEKS=52;
  for(var wk=0;wk<WEEKS;wk++){
    var col=document.createElement('div');
    col.className='contrib-col';
    for(var d=0;d<7;d++){
      var base=wk<8?.08:wk<20?.25:wk<35?.45:wk<45?.62:.78;
      var r=Math.random();
      var lv=r<base*.2?4:r<base*.45?3:r<base*.65?2:r<base*.8?1:0;
      var cell=document.createElement('div');
      cell.className='contrib-cell lv'+lv;
      col.appendChild(cell);
    }
    w.appendChild(col);
  }
  setTimeout(function(){w.scrollLeft=w.scrollWidth;},60);
}

function fallbackDonut(){
  buildDonut([{_langs:{Java:38000,Python:32000,JavaScript:20000,HTML:10000},fork:false}]);
}

async function main(){
  setProgress(5,'INITIALISING...');
  buildContrib();
  try{
    var data=await fetchGitHub();
    setProgress(85,'RENDERING...');
    applyUser(data.user,data.repos);
    buildProjects(data.repos);
    buildDonut(data.repos);
  }catch(err){
    console.warn('GitHub API unavailable:',err.message);
    setProgress(85,'OFFLINE MODE...');
    applyUser({name:'Anirban Sarkar',bio:'Full-Stack Developer · VP @ Build2Hack · Kolkata, India',public_repos:10,followers:5,following:10},[]);
    buildProjects([]);
    fallbackDonut();
  }
  setProgress(100,'READY');
  await new Promise(function(r){setTimeout(r,400);});
  hideLoader();
  document.querySelectorAll('[data-animate]').forEach(function(el){observer.observe(el);});
}
main();

setInterval(function(){
  localStorage.removeItem(CACHE_KEY);
  fetchGitHub().then(function(data){applyUser(data.user,data.repos);}).catch(function(){});
},TTL);

})();
