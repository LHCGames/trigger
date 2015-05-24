// Classes etc for handling the beam collisions.  A collision gives rise to jets, tracks,
// and other particles (so far just electrons and muons.)

var collision_object = function(){
  // Particles in the collision.
  this.jets    = [] ;
  this.tracks  = [] ;
  this.leptons = [] ;
  
  this.topology = [] ;
  this.seed = floor(1e9*random()) ;
  
  // Random number of jets.
  this.nJet = nJet_min + Math.floor(random()*(nJet_max-nJet_min)) ;
  
  // If the event is a Higgs event, give it a mass and set the flag.
  this.hMass = 0 ;
  this.isHiggs = false ;
  
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
<<<<<<< HEAD
    for(var i=0 ; i<topology.length ; i++){
=======
    var lepton_names = [] ;
    for(var i=0  ; i<this.topology.length ; i++) lepton_names.push(this.topology[i]) ;
    for(var i=0 ; i<lepton_names.length ; i++){
>>>>>>> origin/master
      phi = (i%2==1) ? (0.5+random())*pi+phi : 2*pi*random() ;
      this.leptons.push(new particle_object(topology[i], charge, 30, phi)) ;
      charge *= -1 ;
    }
  }
}

//multi lepton topology
var multi_lepton_topology = function() {

 this.split_boson = function(part) {
    this.part = part;
    this.prob_tot = 0;
    this.particle_array = [];
    for(var i=0;i<this.part.length;i++) {
      this.name = this.part[i][0];
      this.prob = this.part[i][1];
      this.prob_tot += this.prob;
      for (var j=0;j<this.prob;j++) {
        this.particle_array = this.particle_array.concat(name);
      } 
    }
    this.rnd = Math.floor(Math.random()*prob_tot);
    this.particle_array = this.particle_array[this.rnd];
    this.split = this.particle_array.split(",");
    for(var k=0;k<this.split.length;k++) {
       this.topology.push(this.split[k]);
    }
    this.particle_array = [];
  }

  this.decay_boson = function(boson) {
    if (boson == "z") {
    this.part = z_particles;
    split_boson(this.part);
    } else if (boson == "w") {
      this.part = w_particles;
    split_boson(this.part);
    }
    }

  this.getLeptons = function() {
    this.bosons = ["n","w","z"];
    this.boson = bosons[Math.floor(Math.random() * bosons.length)];
    decay_boson(boson);
  }
  
  this.topology = [];
  this.getLeptons();
  this.getLeptons();
  return this.topology;
}

function make_collision(){
  // Generate a random event, populating it with leptons.
  var r = random() ;
  if(r<cumulative_probability['H']){
    return make_Higgs_collision(126) ;
  }
  else{
    var ev = new collision_object() ;
    ev.topology = multi_lepton_topology();
    return ev ;
  }
}
function make_Higgs_collision(mass){
  // This just sets the Higgs flag in the event.
  var ev = new collision_object() ;
  ev.isHiggs = true ;
  ev.topology = Higgs4L_topologies[Math.floor(Math.random() * Higgs4L_topologies.length)] ;
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
