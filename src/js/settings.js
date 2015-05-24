// Physical constants.
var SoL = 3e8     ; // Speed of light.
var CoE = 1.6e-19 ; // Charge of electron.
var pi = Math.PI ;

// Particle masses
var mEl = 0.10005 ;
var mMu = 0.105 ;
var mPi = 0.137 ;

var shifts_per_game      =  2 ;
var collisions_per_shift = 20 ;

// Control over the speed of the game.
var collision_delay_min =  600 ;
var collision_delay_max = 1000 ;
var collision_delay = collision_delay_max ;

// Colours.
var neutral_color = '#000000' ;
var ATLAS_color   = '#aa0000' ;
var   CMS_color   = '#0000aa' ;

var eventDisplay_fillColor = '#000000' ;

var collision_matched_color    ='rgba(0,255,0,0.8)' ; 
var collision_notMatched_color ='rgba(255,0,0,0.8)' ;


// Settings for the spinning spokes.
var nSpokes = 12 ;
var spoke_rate = 0.002*2*pi ;
var spoke_oddColor = '#335533' ;
var spoke_evenColor  = '#003300' ;

// probabilities for each kind of collision.
var topology_names = ['H' , '4L' , '3L' , '2L' , '1L' , '0L'] ;
var probability = [] ;
var cumulative_probability = [] ;
probability['H' ] = 0.1 ;
probability['4L'] = 0.2 ;
probability['3L'] = 0.2 ;
probability['2L'] = 0.2 ;
probability['1L'] = 0.2 ;
probability['0L'] = 0.1 ;

var sumProbs = 0 ;
var cumProbs = 0 ;
for(var i=0 ; i<topology_names.length ; i++){
  sumProbs += probability[topology_names[i]] ;
}
for(var i=0 ; i<topology_names.length ; i++){
  probability[topology_names[i]] /= sumProbs ;
  cumProbs += probability[topology_names[i]] ;
  cumulative_probability[topology_names[i]] = cumProbs ;
}

// Magnetic fields
var B1 = 0.1 ;
var B2 = 0.08 ;

var nJet_min =  2 ;
var nJet_max = 10 ;

// Used for the histograms
var mass_min = 100 ;
var mass_max = 150 ;
var histogram_nBins = 25 ;
var histogram_drawStyle = 'rect' ;
histogram_drawStyle = 'pe' ;
var histogram_xAxisLAbelFrequency = 5 ;
var time_animate_histogram = 5000 ;

var ATLAS_sigma = 0 ;
var   CMS_sigma = 0 ;



// Used for the heartbeat (eg for drawing animations).
var delay = 50 ;

var delay_animate_histogram = 50 ;

// Dimensions of the detector and canvas
// "S" refers to the detector.
// Sr is the maximal width of the detector in real life (eg cavern walls).
// SR is the maximal width of the detector on the canvas.
// cw and ch and canvas width and height.
var Sr =  10 ;
var SR = 375 ;
var cw = 2*SR ;
var ch = 2*SR ;

// Boxes for the user to pick their team at the start of the game.
var ATLAS_box = [0.05*cw, 0.5*ch, 0.35*cw, 0.4*ch] ;
var CMS_box   = [0.60*cw, 0.5*ch, 0.35*cw, 0.4*ch] ;

// Number of slices in R and phi for the cells.
var NR   = 250 ;
var NPhi = 250 ;

var cellSizeR   =   Sr/NR   ;
var cellSizePhi = 2*pi/NPhi ;

// For debugging, show the cells on the canvas.
var underlay_cells = false ;
var  overlay_cells = false ;

// Functions used to map real coordinates to canvas coordinates.
var xMax = Sr ;
var yMax = Sr ;

// Settings for the jets:
// How much spread the jet is allowed to have per track
var jet_track_dphi = 0.05*pi ;

// Minimum jet track pt.  The game is a bit buggy so this is irrelevant for now
var jet_track_pt_threshold = 30 ;

// Colours for the particles:
var track_color = 'rgb(200,200,200)' ;

function particle_settings_object(mass, color, symbol, lineWidth){
  this.mass      = mass   ;
  this.color     = color  ;
  this.symbol    = symbol ;
  this.lineWidth = lineWidth ;
}
var particle_settings = [] ;
particle_settings['muon'    ] = new particle_settings_object(mMu, 'rgb(  0,200,  0)', '\u03BC', 2) ;
particle_settings['electron'] = new particle_settings_object(mEl, 'rgb(255,100,100)', 'e'     , 2) ;

// Signal topologies
var Higgs4L_topologies = [
  ['electron','electron','electron','electron'] ,
  ['electron','electron','muon','muon'] ,
  ['electron','electron','muon','muon'] ,
  ['muon','muon','muon','muon']
] ;
var HiggsGG_topologies = [
  ['photon','photon'] 
] ;
var signal_topologies = Higgs4L_topologies ;

var z_particles = 
[
 [["electron","electron"],1],
 [["muon","muon"],1]
];

var w_particles = 
[
 [["electron"],1],
 [["muon"],1]
];