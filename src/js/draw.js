// Simple function to clear the canvas.
function clear_canvas(context){
  context.fillStyle = eventDisplay_fillColor ;
  context.fillRect(0,0,cw,ch) ;
}

function draw_eventDisplay(collision, context){
  // Clear the canvas so we start with a clean black background.
  clear_canvas(context) ;
  
  // For debugging purposes, we can draw a mesh of cells.
  if(underlay_cells) draw_cells(context) ;
  
  // Draw the subdetectors from the centre out.
  for(var i=0 ; i<subdetectors.length ; i++){
    subdetectors[i].draw(context) ;
  }
  
  // Draw the tracks next.  So far these are only decorative.
  for(var i=0 ; i<collision.tracks.length ; i++){
    collision.tracks[i].draw(context) ;
  }
  
  // Now the jets.  These are just collections of tracks of the same colour and are also
  // decorative so far.
  for(var i=0 ; i<collision.jets.length ; i++){
    collision.jets[i].draw(context) ;
  }
  
  // Now draw the leptons last, as we need the player to see these very clearly.
  // We can add other particles (eg taus, photons) here as we need to.
  for(var i=0 ; i<collision.leptons.length ; i++){
    collision.leptons[i].draw(context) ;
  }
  
  // For debugging purposes, we can draw a mesh of cells again, this time on top of the
  // detector components and particles.
  if(overlay_cells) draw_cells(context) ;
}

// This function tells the player if they triggered correctly or not.
// So far it just draws a tick mark or cross on the screen.
function draw_success(){
  // Standard stuff for a new path.
  context.save() ;
  context.beginPath() ;
  
  // Define some variables to draw the circles etc.  We should probably put these
  // in settings.js.
  var w = canvas.width  ;
  var h = canvas.height ;
  var r = 0.4*w ;
  context.lineWidth = 0.05*w ;
  // Set the stroke colour.  We need better variable names for this!
  context.strokeStyle = (current_trigger.match_collision) ? collision_matched_color : collision_notMatched_color ;
  context.arc(0.5*w, 0.5*h, r, 0, 2*pi, true) ;
  
  if(current_trigger.match_collision){
    // Tick mark.
    context.moveTo(0.3*w,0.6*h) ;
    context.lineTo(0.5*w,0.7*h) ;
    context.lineTo(0.7*w,0.3*h) ;
  }
  else{
    // Cross mark.
    context.moveTo(0.3*w,0.7*h) ;
    context.lineTo(0.7*w,0.3*h) ;
    context.moveTo(0.3*w,0.3*h) ;
    context.lineTo(0.7*w,0.7*h) ;
  }
  
  // Finish things off.
  context.stroke() ;
  context.restore() ;
}

function draw_spokes(){
  // This function draw the light/dark green spinning "spokes" that appear in the
  // background between shifts.
  
  context.save() ;
  
  var w = canvas.width  ;
  var h = canvas.height ;
  
  // Fill the background with one colour, then draw triangles with the other.
  context.fillStyle = spoke_oddColor ;
  context.fillRect(0,0,w,h) ;
  
  context.fillStyle = spoke_evenColor ;
  
  // Advance phi0 so that the triangles get offset by a slightly different amount with
  // each heartbeat.
  var phi0 = spoke_rate*heartbeat_counter
  
  // Now loop over the spokes and draw triangles to complete the pattern.
  for(var i=0 ; i<nSpokes ; i+=2){
    var phi1 = phi0 + 2*pi*(i+0)/nSpokes ;
    var phi2 = phi0 + 2*pi*(i+1)/nSpokes ;
    
    // Would it cheaper to make only one path or several?
    context.beginPath() ;
    
    // Some boring maths stuff.  Yawn.
    context.moveTo(0.5*w, 0.5*h) ;
    context.lineTo(0.5*w+2*w*cos(phi1), 0.5*h+2*w*sin(phi1)) ;
    context.lineTo(0.5*w+2*w*cos(phi2), 0.5*h+2*w*sin(phi2)) ;
    context.lineTo(0.5*w, 0.5*h) ;
    context.closePath() ;
    context.fill() ;
  }
  
  context.restore() ;
}

function apply_experiment_style(color){
  // Just change some colours to make everything "branded".
  // This should probably be changed to something cooler later on.
  // Also the border widths should be stored in settings.js.
  canvas.style.borderTop    = '9px solid ' + color ;
  canvas.style.borderBottom = '9px solid ' + color ;
  Get('div_gameWrapper').style.border = '9px solid ' + color ;
  Get('div_teamname'   ).style.backgroundColor = color ;
  Get('div_header'     ).style.border = '1px solid ' + color ;
  Get('div_footer'     ).color = color ;
}

function draw_game_start_screen(){
  // Function to draw the first screen of the game.  This is screen is only seen once,
  // but we call this function many times to animate the spokes.
  
  context.save() ;
  clear_canvas(context) ;
  var w = canvas.width  ;
  var h = canvas.height ;
  
  draw_spokes() ;
  
  // Make some nice text boxes.  This was written last minute, so it should probably be
  // tided up and many variables moved to settings.js.
  context.strokeStyle = '#ffffff' ;
  context.lineWidth = 5 ;
  
  context.fillStyle = '#ffffff' ;
  context.textAlign = 'center' ;
  context.font = '70px arial' ;
  context.fillText('Welcome to the'   , 0.5*w, 0.15*h) ;
  context.fillText('Higgs Trigger Game!', 0.5*w, 0.27*h) ;
  
  context.font = '40px arial' ;
  context.fillText('Choose your team:', 0.5*w,  0.40*h) ;
  
  context.font = '60px arial' ;
  context.fillText('vs', 0.5*w,  0.7*h) ;
  
  // Aha, some consistency for once!  We should really have a function or class to
  // handle these text boxes.
  draw_experiment_box(context, ATLAS_box, 'ATLAS', ATLAS_color, 'img_ATLAS') ;
  draw_experiment_box(context,   CMS_box, 'CMS'  , CMS_color  , 'img_CMS'  ) ;
  
  context.restore() ;
}

function draw_experiment_box(context, box, name, color, image_name){
  // This just write some text and an image.  At the moment it draws things to the
  // canvas, but let's not completely discount the idea of using the HTML DOM- it could
  // be cheaper.
  context.save() ;
  
  var x = box[0] ;
  var y = box[1] ;
  var w = box[2] ;
  var h = box[3] ;
  context.font = '40px arial' ;
  context.fillStyle = color ;
  context.fillRect(x, y, w, h) ;
  context.strokeRect(x, y, w, h) ;
  
  // Hard coded values!  These should be changed.
  context.fillStyle = '#ffffff' ;
  context.fillText('Team', x+0.5*w, y+50) ;
  context.fillText(name  , x+0.5*w, y+100) ;
  context.drawImage(Get(image_name),  x+6, y+h-173) ;
  
  context.restore() ;
}

function draw_shift_start_screen(){
  // This is the screen the player sees between shifts.  It's loaded many times during
  // the course of a game and we call this function many times to animate the spokes.
  context.save() ;
  clear_canvas(context) ;
  var w = canvas.width  ;
  var h = canvas.height ;
  
  draw_spokes() ;
  
  // Some more hard coded stuff that should probably be cleaned up.
  context.fillStyle = '#ffffff' ;
  context.textAlign = 'center' ;
  context.font = '80px arial' ;
  context.fillText('NEW SHIFT!', 0.5*w, 0.15*h) ;
  
  context.font = '40px arial' ;
  context.fillText('Fire the trigger (click) for', 0.5*w,  0.38*h) ;
  context.fillText('events that contain:', 0.5*w, 0.45*h) ;
  
  // Better function name for this?
  current_trigger.draw_topology_on_shift_start_screen(w, h) ;
  
  context.fillText(current_trigger.description, 0.5*w, 0.70*h) ;
  
  context.fillText('Click to begin.', 0.5*w, 0.9*h) ;
  
  context.restore() ;
}

function draw_shift_end_screen(){
  // This shows the player their "score" which isn't used at the moment, but could be sent
  // to the server for analysis.  As usual we call this many times to animate the spokes.
  context.save() ;
  clear_canvas(context) ;
  var w = canvas.width  ;
  var h = canvas.height ;
  
  draw_spokes() ;
  
  // We should probably write some simple function to write text on screen so we don't
  // need to hard code so much stuff like this.  We have plenty of space on the canvas
  // and we can play around with different statistics etc.
  // Consider adding some "friendly" graphics to say things like "Good job!" with a
  // smiley person.
  context.fillStyle = '#ffffff' ;
  context.textAlign = 'center' ;
  context.font = '80px arial' ;
  context.fillText('Shift summary:', 0.5*w, 0.15*h) ;
  
  context.font = '40px arial' ;
  context.fillText('Events saved: '     + total_savedEvents                , 0.5*w, 0.25*h) ;
  context.fillText('Correct clicks: '   + true_positives                   , 0.5*w, 0.32*h) ;
  context.fillText('Incorrect clicks: ' + (false_positives+false_negatives), 0.5*w, 0.39*h) ;
  context.font = '75px arial' ;
  context.fillText('Score: '            + score                            , 0.5*w, 0.58*h) ;
  
  context.font = '30px arial' ;
  context.fillText('Thank you for contributing to science!'          , 0.5*w, 0.72*h) ;
  context.fillText('With your help we will discover the Higgs boson!', 0.5*w, 0.77*h) ;
  
  // Finish with instructions about how to pass on to the next player, if this is needed.
  // We can add different modes (multiplayer etc.)
  context.font = '40px arial' ;
  context.fillText('Click to start the next shift.', 0.5*w, 0.9*h) ;
  context.font = '20px arial' ;
  context.fillText('(Feel free to pass to the next player when you are ready)', 0.5*w, 0.95*h) ;
  
  context.restore() ;
}



