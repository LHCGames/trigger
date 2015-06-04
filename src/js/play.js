// Objects for the canvases we draw onto.
var canvas  = null ;
var context = null ;

// Detector parts.
var detector = new detector_object() ;

// A histogram to draw the final results.
var histogram = null ;

// Variables to control the game.
var heartbeat_counter = 0 ;

var game = new game_object() ;

// Phone home!  We may refactor this to something more friendly (eg jQuery.)
var xmlhttp = GetXmlHttpObject() ;


function start(){
  // Set the global variables.
  canvas = Get('canvas_eventDisplay') ;
  context = canvas.getContext('2d') ;
  //context.translate(0.5,0.5) ;
  context.lineCap = 'round' ;
  
  home_screen() ;
  
  // Add eventListeners.
  document.addEventListener('keydown'   , keyDown          ) ;
  canvas  .addEventListener('mousedown' , eventDisplayClick) ;
  canvas  .addEventListener('touchstart', eventDisplayClick) ;
  
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
  
  // Add the music player.
  create_music_playlist() ;
  add_music_eventListeners() ;
  draw_music_canvases() ;
  sounds_mute_off() ;
  Get('div_header').appendChild(Get('table_music_player')) ;
  
  // Make a histogram and trigger for use later.
  histogram = new four_lepton_mass_histogram(canvas) ;
  
  heartbeat() ;
  
  Get('input_name').value = game.player.name ;
  
  window.setTimeout(begin, 10) ;
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
