// Physical constants.
var SoL = 3e8     ; // Speed of light.
var CoE = 1.6e-19 ; // Charge of electron.
var pi = Math.PI ;

var shifts_per_game      = -2 ;
var collisions_per_shift = 10 ;

// Control over the speed of the game.
var collision_delay_min =  800 ;
var collision_delay_max = 1000 ;
var collision_delay = collision_delay_max ;
var collision_breath = 250 ;

var nCharsPerName = 32 ;

// Colours.
var text_color = 'black' ;
var eventDisplay_fillColor = '#000000' ;
var collision_matched_color    ='rgba(0,255,0,0.8)' ; 
var collision_notMatched_color ='rgba(255,0,0,0.8)' ;

// probabilities for each kind of collision.
var probability_Higgs = 0.1 ;

// Used for the histograms
var mass_min = 100 ;
var mass_max = 150 ;
var histogram_nBins = 25 ;
var histogram_drawStyle = 'rect' ;
histogram_drawStyle = 'pe' ;
var histogram_xAxisLAbelFrequency = 5 ;
var time_animate_histogram = 5000 ;

// Used for the heartbeat (eg for drawing animations).
var delay = 50 ;
var delay_animate_histogram = 50 ;
var delay_enable_click = 500 ;

// Dimensions of the detector and canvas
// "S" refers to the detector.
// Sr is the maximal width of the detector in real life (eg cavern walls).
// SR is the maximal width of the detector on the canvas.
// cw and ch and canvas width and height.
var Sr =  10 ;
var SR = 375 ;
var cw = 2*SR ;
var ch = 2*SR ;

// Number of slices in R and phi for the cells.
var NR   =  50 ;
var NPhi = 250 ;

var cellSizeR   =   Sr/NR   ;
var cellSizePhi = 2*pi/NPhi ;

// Functions used to map real coordinates to canvas coordinates.
var xMax = Sr ;
var yMax = Sr ;

// Settings for the jets:
// How much spread the jet is allowed to have per track


// Colours for the particles:
var track_color = 'rgb(200,200,200)' ;
