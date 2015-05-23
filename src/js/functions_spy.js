// This file is a total mess at the moment!  This was written last minute to give us
// some additional functionality on the day, so we can completely scrap this and start
// again if we need to.

// Objects for the canvases we draw onto
var canvas_ATLAS  = null ;
var canvas_CMS    = null ;
var context_ATLAS = null ;
var context_CMS   = null ;
var canvas        = null ;
var context       = null ;

// Cells used for matching tracks to detector segments
var cells = [] ;
var cells_linear = [] ;

// Detector parts
var subdetectors = [] ;
var segments     = [] ;

var ATLAS_histogram = null ;
var   CMS_histogram = null ;
var histogram = null ;
var frozen = false ;

// Variables to control the game
var paused = false ;
var heartbeat_counter = 0 ;

SR = 250 ;

var total_sigma = 0 ;

var ATLAS_n4L = 0 ;
var   CMS_n4L = 0 ;

var ATLAS_n4L_0 = 60 ;
var   CMS_n4L_0 = 60 ;

var ATLAS_xmlhttp = GetXmlHttpObject() ;
var   CMS_xmlhttp = GetXmlHttpObject() ;

var ATLAS_sigma = 0 ;
var   CMS_sigma = 0 ;

function freeze(){
  // This function stops the detectors accumulating more events.
  frozen = true ;
  Get('button_analyse_ATLAS').style.display = 'inline' ;
  Get('button_analyse_CMS'  ).style.display = 'inline' ;
  Get('button_freeze').style.display = 'none' ;
   
   Get('th_ATLAS_nSigma').style.background = ATLAS_color ;
   Get('th_CMS_nSigma'  ).style.background = CMS_color ;
}

// The following functions are called using the window.setTimeout method to make it look
// like things are actually happening.  Very low tech and a bit cheesy, but it got some
// laughs on the day!
// We should refactor this to something more streamlined.
function add_combo_row_1(){
  var tr = Create('tr') ;
  var th = Create('th') ;
  th.className = 'combo' ;
  th.innerHTML = 'Step 1) Calibrating leptons' ;
  tr.appendChild(th) ;
  Get('tbody_combo').appendChild(tr) ;
}
function add_combo_row_2(){
  var tr = Create('tr') ;
  var th = Create('th') ;
  th.className = 'combo' ;
  th.innerHTML = 'Step 2) Asking difficult questions' ;
  tr.appendChild(th) ;
  Get('tbody_combo').appendChild(tr) ;
}
function add_combo_row_3(){
  var tr = Create('tr') ;
  var th = Create('th') ;
  th.className = 'combo' ;
  th.innerHTML = 'Step 3) Making coffee' ;
  tr.appendChild(th) ;
  Get('tbody_combo').appendChild(tr) ;
}
function add_combo_row_4(){
  var tr = Create('tr') ;
  var th = Create('th') ;
  th.className = 'combo' ;
  th.innerHTML = 'Step 4) Talking to professors' ;
  tr.appendChild(th) ;
  Get('tbody_combo').appendChild(tr) ;
}
function add_combo_row_5(){
  var tr = Create('tr') ;
  var th = Create('th') ;
  th.className = 'combo' ;
  th.innerHTML = 'Step 5) Avoiding the press' ;
  tr.appendChild(th) ;
  Get('tbody_combo').appendChild(tr) ;
}

// This allows the user to pause the spy mode, for whatever reason.  Perhaps in case the
// host sees an event they like?  It doesn't seem to change anything at the moment!
function toggle_pause(){ paused = !paused ; }

function keyDown(evt){
  var keyDownID = window.event ? event.keyCode : (evt.keyCode != 0 ? evt.keyCode : evt.which) ;
  if(keyDownID==8) evt.preventDefault ;
  switch(keyDownID){
    case 32: // Space
      evt.preventDefault() ;
      toggle_pause() ;
      break ;
  }
}

function heartbeat(){
  heartbeat_counter++ ;
  window.setTimeout(heartbeat, delay) ;
}

// These two functions ping the server to collect events.  Two change need to happen:
// 1- Refactor into a single function.
// 2- Receive several events at once to reduce the load on the server.
function ATLAS_get_event(){
  ATLAS_xmlhttp.onreadystatechange = ATLAS_process_event ;
  var uri = 'event_store.php?task=get_event&team=ATLAS&sid=' + Math.random() ;
  ATLAS_xmlhttp.open('GET', uri, true) ;
  ATLAS_xmlhttp.send(null) ;
}

function CMS_get_event(){
  CMS_xmlhttp.onreadystatechange = CMS_process_event ;
  var uri = 'event_store.php?task=get_event&team=CMS&sid=' + Math.random() ;
  CMS_xmlhttp.open('GET', uri, true) ;
  CMS_xmlhttp.send(null) ;
}

// Similarly these functions read the events and draw them on screen.  They should be
// refactored into a single event.
function ATLAS_process_event(){
  if(frozen) return ;
  var realEvent = true ;
  if(ATLAS_xmlhttp.readyState!=4) return ;
  if(ATLAS_xmlhttp.responseText.indexOf('Warning')!=-1) realEvent = false ;
  var responses = ATLAS_xmlhttp.responseText.split(',')
  var nEl = parseInt(responses[0]) ;
  var nMu = parseInt(responses[1]) ;
  
  if(nEl==-1 || realEvent==false){
    nEl = 0 ; //Math.floor(3*random()) ;
    nMu = 0 ; //Math.floor(3*random()) ;
    realEvent = false ;
  }
  
  if(realEvent){
    if(nEl==4 && nMu==0) ATLAS_n4L++ ;
    if(nEl==2 && nMu==2) ATLAS_n4L++ ;
    if(nEl==0 && nMu==4) ATLAS_n4L++ ;
  }
  
  var collision = new collision_object() ;
  collision.nEl = nEl ;
  collision.nMu = nMu ;
  collision.make_particles() ;
  if(!paused) draw_eventDisplay(collision, context_ATLAS) ;
  window.setTimeout(ATLAS_get_event, 1200) ;
}

function CMS_process_event(){
  if(frozen) return ;
  var realEvent = true ;
  if(CMS_xmlhttp.readyState!=4) return ;
  if(CMS_xmlhttp.responseText.indexOf('Warning')!=-1) realEvent = false ;
  var responses = CMS_xmlhttp.responseText.split(',')
  var nEl = parseInt(responses[0]) ;
  var nMu = parseInt(responses[1]) ;
  
  if(nEl==-1 || realEvent==false){
    nEl = 0 ; //Math.floor(3*random()) ;
    nMu = 0 ; //Math.floor(3*random()) ;
    realEvent = false ;
  }
  
  if(realEvent){
    if(nEl==4 && nMu==0) CMS_n4L++ ;
    if(nEl==2 && nMu==2) CMS_n4L++ ;
    if(nEl==0 && nMu==4) CMS_n4L++ ;
  }
  
  var collision = new collision_object() ;
  collision.nEl = nEl ;
  collision.nMu = nMu ;
  collision.make_particles() ;
  if(!paused) draw_eventDisplay(collision, context_CMS) ;
  window.setTimeout(CMS_get_event, 1300) ;
}

function clear_header(){
  var hiddenDiv = Get('div_hidden') ;
  var headerDiv = Get('div_header') ;
  while(headerDiv.childNodes.length>0){ hiddenDiv.appendChild(headerDiv.childNodes[0]) ; }
}

function analyse_experiment(n4L, histo, context_in, canvas_in){
  // This is a bit messy.
  // First we divide the amount of time we want to spending drawing by the number of
  // events so that we're no waiting around too short/too long.
  delay_animate_histogram = Math.max(1,Math.floor(time_animate_histogram/n4L)) ;
  
  // Now set the global variables for the canvas and context.  Yuck.
  context = context_in ;
  canvas  = canvas_in  ;
  
  // Then assign the masses for the Higgs-like events.
  // I should check the random sampling from a Gaussian to make sure it works.  I took it
  // from a previous project (aDetector) but still...
  for(var i=0 ; i<n4L ; i++){
    var mass = (random()<0.3) ? -1 : mass_min + random()*(mass_max-mass_min) ;
    if(mass<0){
      mass = 122.5 + random_gaussian(10) ;
    }
    histo.add_mass(mass) ;
  }
  
  // Set another global variable.  Double yuck.
  histogram = histo ;
  
  // Animate the histogram.  This is why there is no getting around the global variable
  // problem.
  animate_histogram() ;
}

// These are rather straightforward but should be refactored into a single function.
function analyse_ATLAS(){
  Get('button_analyse_ATLAS').style.display = 'none' ;
  var n4L = Math.max(ATLAS_n4L, ATLAS_n4L_0) ;
  analyse_experiment(n4L, ATLAS_histogram, context_ATLAS, canvas_ATLAS) ;
  if(Get('button_analyse_CMS').style.display=='none') Get('button_combine').style.display = 'inline' ;
}

function analyse_CMS(){
  Get('button_analyse_CMS'  ).style.display = 'none' ;
  var n4L = Math.max(CMS_n4L, CMS_n4L_0) ;
  analyse_experiment(n4L, CMS_histogram, context_CMS, canvas_CMS) ;
  if(Get('button_analyse_ATLAS').style.display=='none') Get('button_combine').style.display = 'inline' ;
}

function combine_results(){
  // This was very much last minute and can be vastly improved.
  
  // First remove the things we don't want to look at anymore.
  Get('canvas_ATLAS'  ).style.display = 'none' ;
  Get('canvas_CMS'    ).style.display = 'none' ;
  Get('button_combine').style.display = 'none' ;
  Get('button_freeze' ).style.display = 'none' ;
  
  // Show the combo table which has been hiding until now.
  Get('table_combo'   ).style.display = 'block' ;
  
  // Show how many sigmas we got.
  Get('span_ATLAS_nSigma').innerHTML = ATLAS_sigma.toPrecision(2) + 'σ' ;
  Get('span_CMS_nSigma'  ).innerHTML = CMS_sigma  .toPrecision(2) + 'σ' ;
  
  // Now "animate" the table.
  window.setTimeout(add_combo_row_1, 1000) ;
  window.setTimeout(add_combo_row_2, 2000) ;
  window.setTimeout(add_combo_row_3, 3000) ;
  window.setTimeout(add_combo_row_4, 4000) ;
  window.setTimeout(add_combo_row_5, 5000) ;
  
  // Add sigmas in quadrature and write the final result.
  total_sigma = sqrt(pow(ATLAS_sigma,2)+pow(CMS_sigma,2)) ;
  window.setTimeout(write_final_result, 8000) ;
}

function write_final_result(){
  // Fairly trivial, so we should improve it.  Add some fireworks and happy faces
  // instead of a smiley.
  var tr = Create('tr') ;
  var th = Create('th') ;
  th.id = 'th_final_result' ;
  th.innerHTML = total_sigma.toPrecision(2) + 'σ discovery!<br />Party time :)' ;
  tr.appendChild(th) ;
  Get('tbody_combo').appendChild(tr) ;
}

function start(){
  // Add a really cool background!
  document.body.style.backgroundImage = 'url(images/ATLAS_eventDisplay.png)' ;
  
  // Set some global parameters.  Yuck.
  canvas_ATLAS = document.getElementById('canvas_ATLAS') ;
  canvas_CMS   = document.getElementById('canvas_CMS'  ) ;
  context_ATLAS = canvas_ATLAS.getContext('2d') ;
  context_CMS   = canvas_CMS  .getContext('2d') ;
  context_ATLAS.translate(0.5,0.5) ;
  context_CMS  .translate(0.5,0.5) ;
  context_ATLAS.lineCap = 'round' ;
  context_CMS  .lineCap = 'round' ;
  
  // Add event listeners.  These are fairly straightforward.
  document.addEventListener('keydown', keyDown) ;
  Get('button_freeze').addEventListener('click', freeze) ;
  Get('button_analyse_ATLAS').addEventListener('click', analyse_ATLAS) ;
  Get('button_analyse_CMS'  ).addEventListener('click', analyse_CMS  ) ;
  Get('button_combine'      ).addEventListener('click', combine_results  ) ;
  
  // Set styles to be consistent with the players for "brand awareness".
  Get('h2_team_ATLAS').style.background = ATLAS_color ;
  Get('h2_team_CMS'  ).style.background =   CMS_color ;
  
  Get('canvas_ATLAS').style.border = '5px solid ' + ATLAS_color ;
  Get('canvas_CMS'  ).style.border = '5px solid ' +   CMS_color ;
  
  // More global variables for the histograms.
  ATLAS_histogram = new four_lepton_mass_histogram() ;
  CMS_histogram   = new four_lepton_mass_histogram() ;
  ATLAS_histogram.color = ATLAS_color ;
  CMS_histogram  .color = CMS_color   ;
  
  // Then do the CPU intensive stuff.
  make_detector() ;
  heartbeat() ;
  
  // This is CPU intensive, so do it last.
  make_cells() ;
  for(var i=0 ; i<segments.length ; i++){
    segments[i].activate_cells() ;
  }
  
  // Finally start the threads that retrieve the events from the server.
  ATLAS_get_event() ;
  CMS_get_event() ;
}

function update_score(){
  // I'm pretty sure this isn't needed for the spy mode.
  score = true_positives - 0.5*(false_positives+false_negatives) ;
  if(score<0) score = 0 ;
  Get('td_score').innerHTML = score ;
  return score ;
}


