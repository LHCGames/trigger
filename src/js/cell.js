// To save CPU time a map of cells is made in (r,phi) space.  The detector components are
// mapped onto these cells.  As the particles pass through the detector they pass through
// the cells and these light up the detector components.

// We populate two arrays of cells.
// A two dimensional array is used for looping over r and phi.
// A one dimensional array is used for single line loops (eg to reset all cells easily.)
function make_cells(){
  for(var u=0 ; u<NR ; u++){
    cells.push([]) ;
    var r = u*cellSizeR ;
    for(var v=0 ; v<NPhi ; v++){
      var phi = v*cellSizePhi ;
      var cell = new cell_object(r, phi) ;
      cells[u].push(cell) ;
      cells_linear.push(cell) ;
    }
  }
}

// This should only be used for debugging purposes, as it is very expensive!
function draw_cells(context){
  for(var u=1 ; u<cells.length ; u++){
    for(var v=0 ; v<cells[u].length ; v++){
      cells[u][v].draw(context) ;
    }
  }
}


function cell_object(r, phi){
  this.rMid   = r   + 0.5*cellSizeR   ;
  this.phiMid = phi + 0.0*cellSizePhi ;
  this.r1   = r   - 0.0*cellSizeR   ;
  this.r2   = r   + 1.0*cellSizeR   ;
  this.phi1 = phi - 0.5*cellSizePhi ;
  this.phi2 = phi + 0.5*cellSizePhi ;
  
  // General settings.
  // Set is_touched to false at the start of each event, and true when a particle hits it.
  this.is_touched = false ;
  // Some cells don't match up to detector components, so don't bother with them.
  this.is_in_acceptance = false ;
  
  // Each cell can belong to at least one subdetector segment.
  this.segment = null ;
  this.particle_types = [] ;
  this.particle_types['electron'] = false ;
  this.particle_types['muon'    ] = false ;
  this.particle_types['pion'    ] = false ;
  this.particle_types['photon'  ] = false ;
  this.touch = function(particle_type){
    this.is_touched = true ;
    this.particle_types[particle_type] = true ;
  }
  this.start_collision = function(){
    this.is_touched = false ;
    this.particle_types = [] ;
  }
  this.add_segment = function(segment){
    this.is_in_acceptance = true ;
    this.segment = segment ;
  }
  this.draw = function(context){
    //if(this.is_in_acceptance==false) return ;
    
    context.save() ;
    
    var CX = X_from_x(0) ;
    var CY = Y_from_y(0) ;
    var R1 = X_from_x(this.r1) - X_from_x(0) ;
    var R2 = X_from_x(this.r2) - Y_from_y(0) ;
    
    var X1 = X_from_x(this.r1*cos(this.phi1)) ;
    var Y1 = Y_from_y(this.r1*sin(this.phi1)) ;
    var X2 = X_from_x(this.r2*cos(this.phi1)) ;
    var Y2 = Y_from_y(this.r2*sin(this.phi1)) ;
    var X3 = X_from_x(this.r1*cos(this.phi2)) ;
    var Y3 = Y_from_y(this.r1*sin(this.phi2)) ;
    var X4 = X_from_x(this.r2*cos(this.phi2)) ;
    var Y4 = Y_from_y(this.r2*sin(this.phi2)) ;
    
    context.lineWidth = 1 ;
    context.strokeStyle = '#00aaff' ;
    context.fillStyle   = '#ff00ff' ;
    var direction = (this.phi1>this.phi2) ;
    context.beginPath() ;
    context.moveTo(X1, Y1) ;
    context.arc(CX, CY, R1, this.phi1, this.phi2,  direction) ;
    context.lineTo(X4, Y4) ;
    context.arc(CX, CY, R2, this.phi2, this.phi1, !direction) ;
    context.lineTo(X1, Y1) ;
    if(this.is_touched) context.fill() ;
    context.stroke() ;
    
    context.restore() ;
  }
  this.update_segments = function(){
    if(this.is_touched && this.segment){
      this.segment.touch(this.particle_types) ;
    }
  }
}
