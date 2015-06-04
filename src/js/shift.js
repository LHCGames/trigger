function shift_object(PNG){
  this.collisions = [] ;
  this.collision_counter = 0 ;
  this.trigger = random_trigger(PNG) ;
  
  // Statistics about the collisions.
  this.statistics = new statistics_object() ;

  this.score = 0 ;
  
  this.start = function(){
    // Draw the shift start screen.
    game.shift_counter++ ;
    if(game.shift_counter>shifts_per_game && shifts_per_game>0){
      // This code never gets called with the current settings.  It's for the "end game"
      // (eg single player mode) so we should make something cool happen here instead, such
      // as adding the player's name to a leaderboard.
      var score = game.update_score() ;
    
      // This is the only place where we use the histgoram.
      animate_histogram() ;
      return ;
    }
    
    // Update the trigger text.
    game.current_shift.trigger.update_text() ;
    
    // Reset the game state.
    game.state = 'shift_start' ;
    game.paused = true ;
    game.can_click = false ;
    window.setTimeout(game.enable_click, delay_enable_click) ;
  
    game.reset_statistics() ;
  }
  this.end = function(context){
    // Send results to the server.
    game.current_shift.trigger.send_results_to_server() ;
  
    // Draw the shift end screen.
    set_header_and_footer_images() ;
    Get('div_header').appendChild(Get('table_music_player')) ;
    game.current_shift.draw_end_screen(context) ;
    game.state = 'shift_end' ;
    game.paused = true ;
    game.can_click = false ;
    window.setTimeout(game.enable_click, delay_enable_click) ;
  }
  
  this.draw_start_screen = function(context){
    // This is the screen the player sees between shifts.  It's loaded many times during
    // the course of a game and we call this function many times to animate the spokes.
    context.save() ;
    clear_canvas(context) ;
    
    spokes.draw(context) ;
    
    // Some more hard coded stuff that should probably be cleaned up.
    context.fillStyle = text_color ;
    context.textAlign = 'center' ;
    context.font = '80px arial' ;
    context.fillText('NEW SHIFT!', 0.5*cw, 0.15*ch) ;
    
    context.font = '40px arial' ;
    context.fillText('Fire the trigger (click) for', 0.5*cw,  0.33*ch) ;
    context.fillText('events that contain:', 0.5*cw, 0.4*ch) ;
    
    // Better function name for this?
    game.current_shift.trigger.draw_topology_on_shift_start_screen(cw, ch) ;
    
    context.fillText(game.current_shift.trigger.description, 0.5*cw, 0.65*ch) ;
    
    if(game.can_click){
      context.fillText('Click to begin.', 0.5*cw, 0.9*ch) ;
    }
    
    context.restore() ;
  }
  this.draw_end_screen = function(context){
    // This shows the player their "score" which isn't used at the moment, but could be sent
    // to the server for analysis.  As usual we call this many times to animate the spokes.
    context.save() ;
    clear_canvas(context) ;
    
    spokes.draw(context) ;
    
    // We should probably write some simple function to write text on screen so we don't
     // need to hard code so much stuff like this.  We have plenty of space on the canvas
    // and we can play around with different statistics etc.
    // Consider adding some "friendly" graphics to say things like "Good job!" with a
    // smiley person.
    context.fillStyle = text_color ;
    context.textAlign = 'center' ;
    context.font = '80px arial' ;
    context.fillText('Shift summary:', 0.5*cw, 0.15*ch) ;
    
    context.font = '40px arial' ;
    context.fillText('Events saved: '       + this.statistics.values['total_savedEvents'] , 0.5*cw, 0.25*ch) ;
    context.fillText('Correct clicks: '     + this.statistics.values['true_positives'   ] , 0.5*cw, 0.32*ch) ;
    context.fillText('Incorrect clicks: '   + this.statistics.values['false_positives'  ] , 0.5*cw, 0.39*ch) ;
    context.fillText('Collisions missed: '  + this.statistics.values['false_negatives'  ] , 0.5*cw, 0.46*ch) ;
    //context.fillText('Collisions ignored: ' + this.statistics.values['true_negatives'   ] , 0.5*cw, 0.53*ch) ;
    context.font = '75px arial' ;
    context.fillText('Score: ' + ((100/collisions_per_shift)*this.statistics.score()).toPrecision(3) + '%' , 0.5*cw, 0.62*ch) ;
    
    context.font = '30px arial' ;
    context.fillText('Thank you for contributing to science!'       , 0.5*cw, 0.72*ch) ;
    context.fillText('With your help we\'ll find the Higgs boson!'  , 0.5*cw, 0.77*ch) ;
    
    if(game.can_click){
      // Finish with instructions about how to pass on to the next player, if this is
      // needed.
      // We can add different modes (multiplayer etc.)
      context.font = '40px arial' ;
      context.fillText('Click to start the next shift.', 0.5*cw, 0.9*ch) ;
      context.font = '20px arial' ;
      context.fillText('(Feel free to pass to the next player when you are ready)', 0.5*cw, 0.95*ch) ;
    }
    context.restore() ;
  }
}
