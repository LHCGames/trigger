// Objects for the canvases we draw onto.
var canvas  = null ;
var context = null ;

// Cells used for matching tracks to detector segments.
var cells = [] ;
var cells_linear = [] ;

// Store the current collision and trigger here.
var current_collision = null ;
var current_trigger   = null ;

// Store all collisions here (may be removed to save memory.)
var collision_list = [] ;

// Detector parts.
var subdetectors = [] ;
var segments     = [] ;

// A histogram to draw the final results.
var histogram = null ;

// Variables to control the game.
var paused = true ;
var shift_counter     = 0 ;
var collision_counter = 0 ;
var heartbeat_counter = 0 ;

var game_state = 'game_start' ;
var team_name  = 'CERN'  ;

// Bookkeeping for statistics and game metrics.
var true_positives  = 0 ;
var false_positives = 0 ;
var false_negatives = 0 ;
var total_events    = 0 ;

var higgsy_events         = 0 ;
var total_savedEvents     = 0 ;
var total_deliveredEvents = 0 ;

var score = 0 ;

// Phone home!  We may refactor this to something more friendly (eg jQuery.)
var xmlhttp = GetXmlHttpObject() ;

// Controls to pause the game.
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
  // A heartbeat for periodic updates.
  
  // Maybe reset this after a huge number so we don't get int overflow?
  heartbeat_counter++ ;
  
  // Call the next heartbeat
  window.setTimeout(heartbeat, delay) ;
  
  // Draw the various screens depending on the state of the game.
  if(game_state=='shift_end'  ) draw_shift_end_screen()   ;
  if(game_state=='shift_start') draw_shift_start_screen() ;
  if(game_state=='game_start' ) draw_game_start_screen()  ;
}

function end_shift(){
  // Draw the shift end screen.
  set_header_and_footer_images() ;
  draw_shift_end_screen() ;
  game_state = 'shift_end' ;
  paused = true ;
  current_trigger = random_trigger() ;
  current_trigger.update_text() ;
}

function start_shift(){
  // Draw the shift start screen.
  shift_counter++ ;
  if(shift_counter>shifts_per_game && shifts_per_game>0){
    // This code never gets called with the current settings.  It's for the "end game"
    // (eg single player mode) so we should make something cool happen here instead, such
    // as adding the player's name to leaderboard.
    var score = update_score() ;
    
    // This is the only place where we use the histgoram.
    animate_histogram() ;
    return ;
  }
  
  // Update the trigger to something new.
  current_trigger = random_trigger() ;
  current_trigger.update_text() ;
  
  // Reset the game state.
  game_state = 'shift_start' ;
  paused = true ;
}

function start(){
  // Set the global variables.
  canvas = document.getElementById('canvas_eventDisplay') ;
  context = canvas.getContext('2d') ;
  context.translate(0.5,0.5) ;
  context.lineCap = 'round' ;
  
  // Add eventListeners.  Originally only the canvas was clickable, but now the user does
  // not know where the canvas ends, so the document is clickable instead.
  document.addEventListener('keydown', keyDown          ) ;
  //canvas  .addEventListener('mousedown', eventDisplayClick) ;
  document.addEventListener('mousedown', eventDisplayClick) ;
  
  // These are not visible, and are mainly there so we can make them visible for single
  // player mode.
  Get('span_eventsPerShift').innerHTML = collisions_per_shift ;
  Get('span_shiftsPerGame' ).innerHTML = shifts_per_game ;
  
  // Apply the style to be neutral.  This is done so that we only need to set a single
  // colour in settings.js and make the style function as complex as we like.
  apply_experiment_style(neutral_color) ;
  set_header_and_footer_images() ;
  
  // Make a histogram and trigger for use later.
  histogram = new four_lepton_mass_histogram() ;
  current_trigger = random_trigger() ;
  current_trigger.update_text() ;
  
  window.setTimeout(begin, 10) ;
}

function begin(){
  // Now do the expensive stuff.
  make_detector() ;
  heartbeat() ;
  
  // This is CPU intensive, so do it last
  make_cells() ;
  for(var i=0 ; i<segments.length ; i++){
    segments[i].activate_cells() ;
  }
}

function pick_team(evt){
  // This is a little messy, so maybe rewrite this (along with the draw functions) to make
  // it easier to change.
  
  // First get the position of the mouse on the canvas.
  // Check this for cross browser compatibility!  It's okay for Firefox, Safari, Chrome.
  var x = evt.pageX - Get('canvas_eventDisplay').offsetLeft ;
  var y = evt.pageY - Get('canvas_eventDisplay').offsetTop  ;
  
  // See if the user hit a target.
  var ATLAS_click = (x>ATLAS_box[0] && x<ATLAS_box[0]+ATLAS_box[2] && y>ATLAS_box[1] && y<ATLAS_box[1]+ATLAS_box[3]) ;
  var CMS_click   = (x>  CMS_box[0] && x<  CMS_box[0]+  CMS_box[2] && y>  CMS_box[1] && y<  CMS_box[1]+  CMS_box[3]) ;
  
  // Then pick a team based on the name.  This was done in a rush, so refactor etc.
  var team_color = neutral_color ;
  if(ATLAS_click){
    team_name = 'ATLAS' ;
    team_color = ATLAS_color ;
    game_state = 'shift_start' ;
  }
  if(CMS_click){
    team_name = 'CMS' ;
    team_color = CMS_color ;
    game_state = 'shift_start' ;
  }
  apply_experiment_style(team_color) ;
  Get('div_teamname').innerHTML = 'Team ' + team_name ;
  document.body.style.background = team_color ;
}

function eventDisplayClick(evt){
  // This function detects a click and repsonds appropriately.
  // Keep careful track of the game state- there may be a bug where the final click of a
  // shift doesn't trigger an event!
  if(game_state=='game_start'){
    pick_team(evt) ;
  }
  else if(game_state=='shift_end'){
    game_state = 'shift_start' ;
  }
  else if(game_state=='shift_start'){
    Get('span_shiftNumber').innerHTML = shift_counter ;
    //set_header_events_summary_table() ;
    set_footer_toplogy() ;
    
    // Start the collision thread to deliver new events
    collision_thread() ;
    game_state = 'playing' ;
    
    // Make sure we are not paused.  Explicitly setting paused=false might be simpler.
    if(paused) toggle_pause() ;
    
    // Reset everything
    true_positives        = 0 ;
    false_positives       = 0 ;
    false_negatives       = 0 ;
    total_events          = 0 ;
    higgsy_events         = 0 ;
    total_savedEvents     = 0 ;
    total_deliveredEvents = 0 ;
    
    return ;
  }
  if(paused){
    // Wake the game up.  Is this counterintuitive for the player?  Best ask them!
    toggle_pause() ;
    return ;
  }
  else if(game_state=='playing'){
    // Play the game.
    fire_trigger() ;
  }
}

function update_score(){
  // Dead simple.  Calculate the score and update the DOM.
  score = true_positives - 0.5*(false_positives+false_negatives) ;
  if(score<0) score = 0 ;
  Get('td_score').innerHTML = score ;
  return score ;
}


