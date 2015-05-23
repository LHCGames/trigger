// This is an object for managing the trigger.  It takes numbers of muons and electrons.
// It also sends the results of the event to the server.

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
      // bandwidth.
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
    // This can probably be made a lot more elegant.  For now this will do.
    var X1 = 0.4*w  ;
    var X2 = 0.5*w  ;
    var X3 = 0.4*w  ;
    var Y  = 0.55*h ;
    var leptons = [] ;
    for(var i=0 ; i<nEl ; i++) leptons.push('electron') ;
    for(var i=0 ; i<nMu ; i++) leptons.push('muon'    ) ;
    if(leptons.length==1){
      draw_particle_head(context, X2, Y, 10, particle_settings[leptons[0]].color, particle_settings[leptons[0]].symbol) ;
    }
    else if(leptons.length=2){
      draw_particle_head(context, X1, Y, 10, particle_settings[leptons[0]].color, particle_settings[leptons[0]].symbol) ;
      draw_particle_head(context, X3, Y, 10, particle_settings[leptons[1]].color, particle_settings[leptons[1]].symbol) ;
    }
  }
}

var ee_trigger = new trigger_object(2, 0, 'at least two electrons.'            ) ;
var  e_trigger = new trigger_object(1, 0, 'at least one electron.'             ) ;
var mm_trigger = new trigger_object(0, 2, 'at least two muons.'                ) ;
var  m_trigger = new trigger_object(0, 1, 'at least one muon.'                 ) ;
var em_trigger = new trigger_object(1, 1, 'at least one electron and one muon.') ;

var all_triggers = [] ;
all_triggers.push(ee_trigger) ;
all_triggers.push( e_trigger) ;
all_triggers.push(mm_trigger) ;
all_triggers.push( m_trigger) ;
all_triggers.push(em_trigger) ;

// function to get a random trigger.  This should be edited to be tweakable in the
// settings, based on difficulty, age range etc
function random_trigger(){
  var index = Math.floor(random()*all_triggers.length) ;
  var trg = all_triggers[index] ;
  return trg ;
}

function fire_trigger(){ current_trigger.fire() ; }
