// This is an object for managing the trigger.  It takes numbers of muons and electrons.
// It also sends the results of the event to the server.

function trigger_object2(topology, description, name){
  // topology is n array, eg ['electron','muon'].
  this.topology = topology ;
  
  this.name = name ;
  
  // Flags to keep track of the status of the trigger.
  this.fired = false ;
  this.match_collision = false ;
  this.touched = false ;
  
  // Description of the trigger to remind the user when to fire.
  this.description = description ;
  this.update_text = function(){
    Get('span_trigger_description').innerHTML = this.description ;
  }
  
  this.collisions = [] ;
    
  this.start_collision = function(){
    // Set this flag to false- the user hasn't clicked yet
    this.fired = false ;
    
    // Check to see if the event topology matches the trigger topology.
    this.match_collision = match_topologies(current_collision, [this.topology]) ;
    
    // Touch the trigger so that we know the game has "seen" the trigger.
    this.touched = true ;
  }
  this.fire = function(){
    // Don't allow the user to fire more than once.
    if(this.fired) return ;
    
    // Now fire the trigger and draw the result on the screen
    this.fired = true ;
    draw_success() ;
    
    // Return whether or not the trigger matches the event.  (Is this ever used?)
    return (this.match_collision) ;
  }
  this.send_results_to_server = function(){
    var request = '?task=add_collisions&trigger=' + this.name + '&team=' + team_name + '&events=' ;
    for(var i=0 ; i<this.collisions.length ; i++){
      request += this.collisions[i].seed + ';' ;
    }
    var uri = 'event_store.php'+request+'&sid=' + Math.random() ;
    xmlhttp.open('GET', uri, true) ;
    xmlhttp.send(null) ;
  }
  this.update_table = function(){
    // Check to see if the game knows about this trigger yet.
    if(this.touched==false) return ;
    
    // Follow the logic to update the statistics correctly.  It's fairly straightforward.
    if(this.fired){
      if(this.match_collision){
        // Hurray!  The user fired the trigger properly and has a true positive.
        true_positives++ ;
        this.collisions.push(current_collision) ;
      }
      else{
        // Oops!  The user fired the trigger for an irrelevant event.
        false_positives++ ;
      }
      // Whatever the result, this event gets saved and so contributes to the trigger
      // budget.
      total_savedEvents++ ;
      
      // Check to see if the event is "Higgslike" or not.
      var Higgsy = match_topologies(current_collision, Higgs4L_topologies) ;
      if(Higgsy){
        higgsy_events++ ;
        histogram.add_mass(current_collision.hMass) ;
      }
    }
    else{
      if(this.match_collision){
        // Oops!  The user missed an event.
        false_negatives++ ;
      }
    }
    // Update the number of events we've seen, whether or not we saved them.
    total_deliveredEvents++ ;
    
    update_stats() ;
  }
  this.draw_topology_on_shift_start_screen = function(w, h){
    var Y  = 0.55*h ;
    var dX = 0.2*w  ;
    var DX = (this.topology.length-1)*dX ;
    
    for(var i=0 ; i<this.topology.length ; i++){
      var X = (this.topology.length==1) ? 0.5*w : 0.5*w - 0.5*DX + DX*i/(this.topology.length-1) ;
      draw_particle_head(context, X, Y, 10, particle_settings[this.topology[i]].color, particle_settings[this.topology[i]].symbol) ;
    }
  }
}

var Higgs4L_topologies = [
  ['electron','electron','electron','electron'] ,
  ['electron','electron','muon','muon'] ,
  ['muon','muon','muon','muon']
] ;

function match_topologies(collision, target_topologies){
  // This function compares the topology of a collision to the signal topologies.  It
  // compares the topologies one at a time, removing items from the target topology as
  // they are matched.
  var topology = collision.topology ;
  for(var i=0 ; i<target_topologies.length ; i++){
    var target = target_topologies[i] ;
    
    // First make an array of matches and fill it with false
    var matches = [] ;
    for(var j=0 ; j<target.length ; j++){
      matches.push(false) ;
    }
    
    // Now compare the topologies.
    for(var j=0 ; j<topology.length ; j++){
      for(var k=0 ; k<target.length ; k++){
        if(matches[k]) continue ;
        if(topology[j]==target[k]){
          matches[k] = true ;
          break ;
        }
      }
    }
    
    // At this point we have an array of matches for the target, so just run over the
    // array of matches.  Assume success until we see a failure to match.
    var success = true ;
    for(var j=0 ; j<matches.length ; j++){
      if(matches[j]==false){
        success = false ;
        break ;
      }
    }
    if(success) return true ;
  }
  // If we get this far then none of the topologies were matched.
  return false ;
}

function update_stats(){
  Get('td_true_positives'          ).innerHTML = true_positives ;
  Get('td_false_positives'         ).innerHTML = false_positives ;
  Get('span_total_events_saved'    ).innerHTML = total_savedEvents ;
  Get('td_higgsy_events'           ).innerHTML = higgsy_events ;
  Get('td_false_negatives'         ).innerHTML = false_negatives ;
  Get('span_total_events_delivered').innerHTML = total_deliveredEvents ;
}

function trigger_object(nEl, nMu, description){
  // Number of particle species.  This should be refactored into an array so we can add
  // arbitrary particles more easily.
  this.nEl = nEl ;
  this.nMu = nMu ;
  
  // Flags to keep track of the status of the trigger.
  this.fired = false ;
  this.match_collision = false ;
  this.touched = false ;
  
  // Description of the trigger to remind the user when to fire.
  this.description = description ;
  this.update_text = function(){
    Get('span_trigger_description').innerHTML = this.description ;
  }
  
  this.start_collision = function(){
    // Set this flag to false- the user hasn't clicked yet
    this.fired = false ;
    
    // Check to see if the event topology matches the trigger topology.
    var ev = current_collision ;
    this.match_collision = (ev.nEl>=this.nEl && ev.nMu>=this.nMu) ;
    
    // Touch the trigger so that we know the game has "seen" the trigger.
    this.touched = true ;
  }
  this.fire = function(){
    // Don't allow the user to fire more than once.
    if(this.fired) return ;
    
    // Now fire the trigger and draw the result on the screen
    this.fired = true ;
    draw_success() ;
    
    // Return whether or not the trigger matches the event.  (Is this ever used?)
    return (this.match_collision) ;
  }
  this.update_table = function(){
    // Check to see if the game knows about this trigger yet.
    if(this.touched==false) return ;
    
    // Follow the logic to update the statistics correctly.  It's fairly straightforward.
    if(this.fired){
      if(this.match_collision){
        // Hurray!  The user fired the trigger properly and has a true positive.
        true_positives++ ;
        Get('td_true_positives').innerHTML = true_positives ;
        
        // Send the event to the server.
        // This should probably be done when the trigger is constructed to save some CPU time.
        var triggerName = '' ;
        for(var i=0 ; i<this.nEl ; i++){ triggerName += 'e' ; }
        for(var i=0 ; i<this.nMu ; i++){ triggerName += 'm' ; }
        var request = '?task=add_event&team='+team_name + '&events='+current_collision.nMu+','+current_collision.nEl+','+triggerName ;
        var uri = 'event_store.php'+request+'&sid=' + Math.random() ;
        xmlhttp.open('GET', uri, true) ;
        xmlhttp.send(null) ;
      }
      else{
        // Oops!  The user fired the trigger for an irrelevant event.
        false_positives++ ;
        Get('td_false_positives').innerHTML = false_positives ;
      }
      // Whatever the result, this event gets saved and so contributes to the trigger
      // budget.
      total_savedEvents++ ;
      Get('span_total_events_saved').innerHTML = total_savedEvents ;
      
      // Check to see if the event is "Higgslike" or not.  For now this means four lepton
      // in a 4 or 2+2 topology.
      var Higgsy = false ;
      if(current_collision.nMu==4 && current_collision.nEl==0) Higgsy = true ;
      if(current_collision.nMu==2 && current_collision.nEl==2) Higgsy = true ;
      if(current_collision.nMu==0 && current_collision.nEl==4) Higgsy = true ;
      if(Higgsy){
        higgsy_events++ ;
        Get('td_higgsy_events').innerHTML = higgsy_events ;
        histogram.add_mass(current_collision.hMass) ;
      }
    }
    else{
      if(this.match_collision){
        // Oops!  The user missed an event.
        false_negatives++ ;
        Get('td_false_negatives').innerHTML = false_negatives ;
      }
    }
    // Update the number of events we've seen, whether or not we saved them.
    total_deliveredEvents++ ;
    Get('span_total_events_delivered').innerHTML = total_deliveredEvents ;
  }
  this.draw_topology_on_shift_start_screen = function(w, h){
    var leptons = [] ;
    for(var i=0 ; i<nEl ; i++) leptons.push('electron') ;
    for(var i=0 ; i<nMu ; i++) leptons.push('muon'    ) ;
    
    var Y  = 0.55*h ;
    var dX = 0.2*w  ;
    var DX = (leptons.length-1)*dX ;
    
    for(var i=0 ; i<leptons.length ; i++){
      var X = 0.5*w - 0.5*DX + DX*i/(leptons.length-1) ;
      draw_particle_head(context, X, Y, 10, particle_settings[leptons[i]].color, particle_settings[leptons[i]].symbol) ;
    }
    return ;
  }
}

var ee_trigger = new trigger_object2(['electron','electron'] , 'at least two electrons.'            , 'ee') ;
var  e_trigger = new trigger_object2(['electron'           ] , 'at least one electron.'             , 'e' ) ;
var mm_trigger = new trigger_object2(['muon','muon'        ] , 'at least two muons.'                , 'mm') ;
var  m_trigger = new trigger_object2(['muon'               ] , 'at least one muon.'                 , 'm' ) ;
var em_trigger = new trigger_object2(['electron','muon'    ] , 'at least one electron and one muon.', 'em') ;

var all_triggers = [] ;
all_triggers.push(ee_trigger) ;
all_triggers.push( e_trigger) ;
all_triggers.push(mm_trigger) ;
all_triggers.push( m_trigger) ;
all_triggers.push(em_trigger) ;

// function to get a random trigger.  This should be edited to be tweakable in the
// settings, based on difficulty, age range etc
function random_trigger(){
  return all_triggers[1] ;
  return all_triggers[Math.floor(random()*all_triggers.length)] ;
}

function fire_trigger(){ current_trigger.fire() ; }
