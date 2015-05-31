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

function pick_team(evt){
  // This is a little messy, so maybe rewrite this (along with the draw functions) to make
  // it easier to change.
  
  // First get the position of the mouse on the canvas.
  // Check this for cross browser compatibility!  It's okay for Firefox, Safari, Chrome.
  var x = evt.pageX - evt.target.offsetLeft ;
  var y = evt.pageY - evt.target.offsetTop  ;
  
  // See if the user hit a target.
  var team_names = ['ATLAS','CMS'] ;
  for(var i=0 ; i<team_names.length ; i++){
    var click = (teams[team_names[i]].box.contains(x,y)) ;
    if(click){
      game.team_name = team_names[i] ;
      game.state = 'shift_start' ;
      game.start_shift() ;
    }
  }
  teams[game.team_name].apply_style() ;
  Get('div_teamname').innerHTML = 'Team ' + teams[game.team_name].title ;
}
