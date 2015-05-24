// Classes etc for handling the beam collisions.  A collision gives rise to jets, tracks,
// and other particles (so far just electrons and muons.)

var collision_object = function(){
  // Particles in the collision.
  this.jets    = [] ;
  this.tracks  = [] ;
  this.leptons = [] ;
  
  this.topology = [] ;
  
  // Used for triggers.  Should be refactored into an array or something.
  this.nMu = 0 ;
  this.nEl = 0 ;
  
  // Random number of jets.
  this.nJet = nJet_min + Math.floor(random()*(nJet_max-nJet_min)) ;
  
  // If the event is a Higgs event, give it a mass and set the flag.
  this.hMass = 0 ;
  this.isHiggs = false ;
  
  // Long winded functions to add leptons, that can be refactored quite simply, I'm sure.
  this.add_four_leptons  = function(){
    if(random()<0.5){
      this.nMu += 2 ;
      this.topology.push('muon') ;
      this.topology.push('muon') ;
      if(random()<0.5){
        this.nMu += 2;
        this.topology.push('muon') ;
        this.topology.push('muon') ;
      }
      else{
        this.nEl += 2 ;
        this.topology.push('electron') ;
        this.topology.push('electron') ;
      }
    }
    else{
      this.nEl += 2
      this.topology.push('electron') ;
      this.topology.push('electron') ;
      if(random()<0.5){
        this.nMu += 2 ;
        this.topology.push('muon') ;
        this.topology.push('muon') ;
      }
      else{
        this.nEl += 2 ;
        this.topology.push('electron') ;
        this.topology.push('electron') ;
      }
    }
  }
  this.add_three_leptons = function(){
    if(random()<0.5){
      this.nMu += 2 ;
      this.topology.push('muon') ;
      this.topology.push('muon') ;
      if(random()<0.5){
        this.nMu += 1;
        this.topology.push('muon') ;
      }
      else{
        this.nEl += 1 ;
        this.topology.push('electron') ;
      }
    }
    else{
      this.nEl += 2
      this.topology.push('electron') ;
      this.topology.push('electron') ;
      if(random()<0.5){
        this.nMu += 1 ;
        this.topology.push('muon') ;
      }
      else{
        this.nEl += 1 ;
        this.topology.push('electron') ;
      }
    }
  }
  this.add_two_leptons   = function(){
    if(random()<0.5){
      this.nMu += 2 ;
      this.topology.push('muon') ;
      this.topology.push('muon') ;
    }
    else{
      this.nEl += 2
      this.topology.push('electron') ;
      this.topology.push('electron') ;
    }
  }
  this.add_one_leptons   = function(){
    if(random()<0.5){
      this.nMu += 1 ;
      this.topology.push('muon') ;
    }
    else{
      this.nEl += 1 ;
      this.topology.push('electron') ;
    }
  }
  this.purge = function(){
    // If we ever store events, this can be used to minimise memory use.
    this.jets    = [] ;
    this.tracks  = [] ;
    this.leptons = [] ;
  }
  this.make_particles = function(){
    // Random assign particles their kinematic properties.  This should be changed to
    // generate pseudorandom numbers using a seed instead, so that the spy mode sees
    // exactly the same events as they players by passing a single number around.
    // These variables should be stored in settings.js.
    for(var i=0 ; i<0 ; i++){
      var q = (random()<0.5) ? -1 : 1 ;
      var pt  = 10 + 90*random() ;
      var phi = 2*pi*random() ;
      var color = track_color ;
      var track = new trackObject(q, mPi, pt, phi, color, 'pion') ;
      this.tracks.push(track) ;
    }
    for(var i=0 ; i<this.nJet ; i++){
      var pt = 50 + 150*random() ;
      var phi = 2*pi*random() ;
      var color = random_color(100) ;
      var jet = new jet_object(pt, phi, color) ;
      this.jets.push(jet) ;
    }
    var charge = (random()<0.5) ? -1 : 1 ;
    var phi = 0 ;
    var lepton_names = [] ;
    for(var i=0 ; i<this.nEl ; i++) lepton_names.push('electron') ;
    for(var i=0 ; i<this.nMu ; i++) lepton_names.push('muon'    ) ;
    for(var i=0 ; i<lepton_names.length ; i++){
      phi = (i%2==1) ? (0.5+random())*pi+phi : 2*pi*random() ;
      this.leptons.push(new particle_object(lepton_names[i], charge, 30, phi)) ;
      charge *= -1 ;
    }
  }
}

function make_collision(){
  // Generate a random event, populating it with leptons.
  var r = random() ;
  if(r<cumulative_probability['H']){
    return make_Higgs_collision(126) ;
  }
  else if(r<cumulative_probability['4L']){
    var ev = new collision_object() ;
    ev.add_four_leptons() ;
    ev.hMass = 100 + 50*random() ;
    return ev ;
  }
  else if(r<cumulative_probability['3L']){
    var ev = new collision_object() ;
    ev.add_three_leptons() ;
    return ev ;
  }
  else if(r<cumulative_probability['2L']){
    var ev = new collision_object() ;
    ev.add_two_leptons() ;
    return ev ;
  }
  else if(r<cumulative_probability['1L']){
    var ev = new collision_object() ;
    ev.add_one_leptons() ;
    return ev ;
  }
  else{
    var ev = new collision_object() ;
    return ev ;
  }
}
function make_Higgs_collision(mass){
  // This just sets the Higgs flag in the event.
  var ev = new collision_object() ;
  ev.isHiggs = true ;
  ev.add_four_leptons() ;
  ev.hMass = mass ;
  return ev ;
}

function collision_thread(){
  // Okay, now things get a bit tricky again.
  if(collision_counter>collisions_per_shift){
    // This is needed to ensure we capture the final event of the shift properly.
    // As usual, move variables to the settings.js so they are not hardcoded.
    window.setTimeout(end_shift, 50) ;
    
    // Reset the collision counter.
    collision_counter = 0 ;
    return ;
  }
  if(paused){
    // Why do we reset the delay here?  I forget...
    collision_delay = collision_delay_max ;
  }
  else{
    // Update the states.
    current_trigger.update_table() ;
    
    // Update all the detector segments so they light up properly.
    current_collision = process_collision() ;
    
    // Draw things.  This is expensive!
    draw_eventDisplay(current_collision, context) ;
    
    // Speed up the event as the run continues.
    var dDelay = 0.5*(collision_delay - collision_delay_min) ;
    collision_delay = collision_delay - dDelay ;
    
    // Reset the trigger flags.
    current_trigger.start_collision() ;
    
    // Increment the counter.
    collision_counter++ ;
    
    // Single player mode only.
    if(collision_counter<collisions_per_shift) Get('span_eventNumber').innerHTML = collision_counter ;
    
    update_score() ;
  }
  // Make the next collision.
  window.setTimeout(collision_thread, collision_delay) ;
}

function process_collision(){
  // Reset all the cells and segments so we can analyse the event.
  for(var i=0 ; i<cells_linear.length ; i++){
    cells_linear[i].start_collision() ;
  }
  for(var i=0 ; i<segments.length ; i++){
    segments[i].start_collision() ;
  }
  
  // Now make a new collision and light up the detector.
  var ev = make_collision() ;
  ev.make_particles() ;
  for(var i=0 ; i<cells_linear.length ; i++){
    cells_linear[i].update_segments() ;
  }
  
  // Saving events- add an option to turn this off to reduce memory usage!
  collision_list.push(ev) ;
  return ev ;
}
