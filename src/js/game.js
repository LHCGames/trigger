// This object keeps track of the game so we don't have as many global variables flying
// around as we used to.

function statistics_object(){
  // This object holds all the useful information about the numbers of successes etc.
  this.fields = ['true_positives', 'true_negatives', 'false_positives', 'false_negatives', 'total_events', 'higgsy_events', 'total_savedEvents', 'total_deliveredEvents'] ;
  this.values = [] ;
  this.reset = function(){
    for(var i=0 ; i<this.fields.length ; i++){
      this.values[this.fields[i]] = 0 ;
    }
  }
  this.reset() ;
  
  this.add_statistics = function(other){
    for(var i=0 ; i<this.fields.length ; i++){
      this.values[this.fields[i]] += other.values[this.fields[i]] ;
    }
  }
  
  this.score = function(){
    var result = this.values['true_positives']+this.values['true_negatives'] - 0.5*(this.values['false_positives']+this.values['false_negatives']) ;
    if(result<0) result = 0 ;
    return result ;
  }
}

function game_object(){
  this.state = 'preamble' ;
  this.mode = 'collaborative' ;
  this.difficulty = 'easy' ;
  
  this.paused = true ;
  this.muted  = true ;
  this.can_click = true ;
  this.team_name = 'neutral' ;
  
  this.seed = floor(1e9*random()) ;
  this.PNG = new psuedorandom_number_generator() ;
  this.PNG.set_seed(this.seed) ;
  this.current_shift = null ;
  this.shift_counter = 0 ;
  this.shifts = [] ;
  
  // For debugging, show the cells on the canvas.
  this.underlay_cells = false ;
  this. overlay_cells = false ;
  
  // Statistics about the collisions.
  this.statistics = new statistics_object() ;

  this.score = 0 ;
  
  this.reset_statistics = function(){
    this.statistics.reset() ;
  }
  
  this.update_statistics = function(){
    this.reset_statistics() ;
    for(var i=0 ; i<this.shifts.length ; i++){
      this.statistics.add_statistics(this.shifts[i].statistics) ;
    }
  }
  
  this.update_score = function(){
    this.update_statistics() ;
    this.score = this.statistics.score() ;
    Get('td_score').innerHTML = this.score ;
    return this.score ;
  }
  
  this.write_statistics = function(){
    this.update_statistics() ;
    for(var i=0 ; i<this.statistics.fields.length ; i++){
      if(Get('span_'+this.statistics.fields[i])){
        Get('span_'+this.statistics.fields[i]).innerHTML = this.statistics.values[this.statistics.fields[i]] ;
      }
    }
  }
  
  this.toggle_pause = function(){ this.paused = !this.paused ; }
  this.toggle_mute  = function(){ this.muted  = !this.muted  ; }
  
  this.start_shift = function(){
    game.current_shift = new shift_object(this.PNG) ;
    game.current_shift.start(context) ;
  }
  this.end_shift = function(){
    game.current_shift.end(context) ;
    game.shifts.push(game.current_shift) ;
  }
  this.enable_click = function(){ game.can_click = true ; }
  
  this.draw_game_over_screen = function(){
    draw_eventDisplay(this.current_shift.current_collision, context) ;
    //this.current_shift.trigger.draw_failure(context) ;
    context.fillStyle = '#ffffff' ;
    context.textAlign = 'center' ;
    context.font = '70px arial' ;
    context.fillText('Game over!', 0.5*cw, 0.27*ch) ;
    
    context.lineWidth = 1 ;
    context.font = '30px arial' ;
    context.fillText(this.game_over_message, 0.5*cw,  0.40*ch) ;
    
    this.update_statistics() ;
    context.font = '70px arial' ;
    context.fillText('Final score: ' + this.statistics.score(), 0.5*cw,  0.70*ch) ;
  }
}

function team_object(title, color, box_x, box_y, box_w, box_h){
  this.title = title  ;
  this.color = color ;
  
  this.nSigma = 0 ;
  
  this.apply_style = function(){
    // Just change some colours to make everything "branded".
    // This should probably be changed to something cooler later on.
    // Also the border widths should be stored in settings.js.
    canvas.style.borderTop    = '9px solid ' + this.color ;
    canvas.style.borderBottom = '9px solid ' + this.color ;
    Get('div_gameWrapper').style.border = '9px solid ' + this.color ;
    Get('div_teamname'   ).style.backgroundColor = this.color ;
    Get('div_header'     ).style.border = '1px solid ' + this.color ;
    Get('div_footer'     ).color = this.color ;
    document.body.style.background = this.color ;
  }
  this.box = new experiment_box(box_x, box_y, box_w, box_h) ;
  this.draw_experiment_box = function(context, image_name){
    this.box.draw(context, this.title, this.color, image_name) ;
  }
}

function experiment_box(x, y, w, h){
  this.x = x ;
  this.y = y ;
  this.w = w ;
  this.h = h ;
  
  this.draw = function(context, name, color, image_name){
    // This just write some text and an image.  At the moment it draws things to the
    // canvas, but let's not completely discount the idea of using the HTML DOM- it could
    // be cheaper.
    context.save() ;
    context.font = '40px arial' ;
    context.fillStyle = color ;
    context.fillRect(x, y, w, h) ;
    context.strokeRect(x, y, w, h) ;
    
    // Hard coded values!  These should be changed.
    context.fillStyle = 'white'
    context.fillText('Team', x+0.5*w, y+50) ;
    context.fillText(name  , x+0.5*w, y+100) ;
    context.drawImage(Get(image_name),  x+6, y+h-173) ;
    
    context.restore() ;
  }
  this.contains = function(x, y){
    return (x>=this.x && x<=this.x+this.w && y>=this.y && y<=this.y+this.h) ;
  }
}

var teams = [] ;
teams['neutral'] = new team_object('CERN' , 'rgb(  0,  0,  0)',      -1,     -1,       0,      0) ;
teams['ATLAS'  ] = new team_object('ATLAS', 'rgb(236,103, 29)', 0.05*cw, 0.5*ch, 0.35*cw, 0.4*ch) ;
teams['CMS'    ] = new team_object('CMS'  , 'rgb( 17,133,193)', 0.60*cw, 0.5*ch, 0.35*cw, 0.4*ch) ;

function heartbeat(){
  // A heartbeat for periodic updates.
  // Maybe reset this after a huge number so we don't get int overflow?
  heartbeat_counter++ ;
  
  // Call the next heartbeat
  window.setTimeout(heartbeat, delay) ;
  
  // Draw the various screens depending on the state of the game.
  if(game.state=='shift_end'   && game.current_shift) game.current_shift.draw_end_screen(context)   ;
  if(game.state=='shift_start' && game.current_shift) game.current_shift.draw_start_screen(context) ;
  if(game.state=='game_start') draw_game_start_screen(context)  ;
}

function start_collaborative_game(){
  game.mode = 'collaborative' ;
  game.state = 'game_start' ;
  Get('div_hidden'   ).appendChild(Get('navcontainer')) ;
  Get('div_hidden'   ).appendChild(Get('table_play'  )) ;
  Get('div_playSpace').appendChild(Get('canvas_eventDisplay')) ;
}

function start_suddenDeath_game(){
  game.mode = 'suddenDeath' ;
  game.state = 'game_start' ;
  Get('div_hidden'   ).appendChild(Get('navcontainer')) ;
  Get('div_hidden'   ).appendChild(Get('table_play'  )) ;
  Get('div_playSpace').appendChild(Get('canvas_eventDisplay')) ;
}

function start_pro_game(){
  game.mode = 'suddenDeath' ;
  game.difficulty = 'pro' ;
  game.state = 'game_start' ;
  Get('div_hidden'   ).appendChild(Get('navcontainer')) ;
  Get('div_hidden'   ).appendChild(Get('table_play'  )) ;
  Get('div_playSpace').appendChild(Get('canvas_eventDisplay')) ;
}

function start(){
  // Set the global variables.
  canvas = Get('canvas_eventDisplay') ;
  context = canvas.getContext('2d') ;
  //context.translate(0.5,0.5) ;
  context.lineCap = 'round' ;
  
  // Add eventListeners.  Originally only the canvas was clickable, but now the user does
  // not know where the canvas ends, so the document is clickable instead.
  document.addEventListener('keydown'   , keyDown          ) ;
  canvas  .addEventListener('mousedown' , eventDisplayClick) ;
  canvas  .addEventListener('touchstart', eventDisplayClick) ;
  //document.addEventListener('mousedown', eventDisplayClick) ;
  
  Get('button_playCollaborative').addEventListener('click', start_collaborative_game) ;
  Get('button_playSuddenDeath'  ).addEventListener('click', start_suddenDeath_game  ) ;
  Get('button_playPro'          ).addEventListener('click', start_pro_game          ) ;
  
  Get('input_name' ).addEventListener('change', checkPlayerName ) ;
  Get('button_name').addEventListener('click' , changePlayerName) ;
  
  // These are not visible, and are mainly there so we can make them visible for single
  // player mode.
  Get('span_eventsPerShift').innerHTML = collisions_per_shift ;
  Get('span_shiftsPerGame' ).innerHTML = shifts_per_game ;
  
  // Apply the style to be neutral.  This is done so that we only need to set a single
  // colour in settings.js and make the style function as complex as we like.
  teams['neutral'].apply_style() ;
  set_header_and_footer_images() ;
  
  // Make a histogram and trigger for use later.
  histogram = new four_lepton_mass_histogram() ;
  
  heartbeat() ;
  
  window.setTimeout(begin, 10) ;
}

function changePlayerName(){} ;

function checkPlayerName(){
  var name = Get('input_name').value ;
  if(name.length>nCharsPerName){
    name = name.substr(0,nCharsPerName-1) ;
  }
}

function begin(){
  // Now do the expensive stuff.
  make_detector() ;
  
  // This is CPU intensive, so do it last
  detector.make_cells() ;
  for(var i=0 ; i<detector.segments.length ; i++){
    detector.segments[i].activate_cells() ;
  }
  
  make_eventDisplay_base() ;
}

