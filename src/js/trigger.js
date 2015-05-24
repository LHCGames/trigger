// This is an object for managing the trigger.  It takes numbers of muons and electrons.
// It also sends the results of the event to the server.

function trigger_object(topology, description, name){
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
    var request = '?task=add_collisions&trigger=' + this.name + '&team=' + team_name + '&seeds=' ;
    for(var i=0 ; i<this.collisions.length ; i++){
      if(i>0) request += ',' ;
      request += this.collisions[i].seed ;
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
      var Higgsy = match_topologies(current_collision, signal_topologies) ;
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

var ee_trigger = new trigger_object(['electron','electron'] , 'at least two electrons.'            , 'ee') ;
var  e_trigger = new trigger_object(['electron'           ] , 'at least one electron.'             , 'e' ) ;
var mm_trigger = new trigger_object(['muon','muon'        ] , 'at least two muons.'                , 'mm') ;
var  m_trigger = new trigger_object(['muon'               ] , 'at least one muon.'                 , 'm' ) ;
var em_trigger = new trigger_object(['electron','muon'    ] , 'at least one electron and one muon.', 'em') ;

var all_triggers = [] ;
all_triggers.push(ee_trigger) ;
all_triggers.push( e_trigger) ;
all_triggers.push(mm_trigger) ;
all_triggers.push( m_trigger) ;
all_triggers.push(em_trigger) ;

// function to get a random trigger.  This should be edited to be tweakable in the
// settings, based on difficulty, age range etc
function random_trigger(){
  return all_triggers[Math.floor(random()*all_triggers.length)] ;
}

function fire_trigger(){ current_trigger.fire() ; }
