function muon_object(charge, pt, phi){
  this.charge = charge ;
  this.pt  = pt  ;
  this.phi = phi ;
  this.track = new trackObject(this.charge, mMu, this.pt, this.phi, muon_color, 'muon') ;
  this.track.lineWidth = muon_lineWidth ;
  this.draw = function(context){
    this.track.draw(context) ;
    
    var xy = this.track.path[this.track.path.length-1] ;
    var X = X_from_x(xy[0]) ;
    var Y = Y_from_y(xy[1]) ;
    draw_particle_head(context, X, Y, 5, muon_color, '\u03BC') ;
  }
}
function electron_object(charge, pt, phi){
  this.charge = charge ;
  this.pt  = pt  ;
  this.phi = phi ;
  this.track = new trackObject(this.charge, mEl, this.pt, this.phi, electron_color, 'electron') ;
  this.track.lineWidth = electron_lineWidth ;
  this.draw = function(context){
    this.track.draw(context) ;
    var xy = this.track.path[this.track.path.length-1] ;
    var X = X_from_x(xy[0]) ;
    var Y = Y_from_y(xy[1]) ;
    draw_particle_head(context, X, Y, 5, electron_color, 'e') ;
  }
  
}
function jet_object(pt, phi, color){
  this.pt  = pt  ;
  this.phi = phi ;
  this.color = color ;
  this.tracks = [] ;
  var remaining_pt = pt ;
  var charge = (random()<0.5) ? 1 : -1 ;
  do{
    charge *= -1 ;
    var sign = -charge ;
    var pt_tmp  = 0.75*remaining_pt*random() ;
    var phi_tmp = this.phi + sign*random()*jet_track_dphi ;
    remaining_pt -= pt_tmp ;
    this.tracks.push(new trackObject(charge, mPi, pt_tmp, phi_tmp, this.color, 'pion')) ;
  } while(remaining_pt>jet_track_pt_threshold) ;
  for(var i=0 ; i<this.tracks.length ; i++){
    this.tracks[i].make_path() ;
  }
  this.draw = function(context){
    for(var i=0 ; i<this.tracks.length ; i++){
      this.tracks[i].draw(context) ;
    }
  }
}
function trackObject(charge, mass, pt, phi, color, particle_type){
  this.charge = charge ;
  this.mass = mass ;
  this.pt  =  pt ;
  this.phi = phi ;
  this.color = color ;
  this.particle_type = particle_type ;
  this.lineWidth = 1 ;
  this.path = [] ;
  
  this.make_path = function(){
    var k1 =  pow(SoL,2)*B1/(this.mass*1e9) ;
    var k2 = -pow(SoL,2)*B2/(this.mass*1e9) ;
    
    // Express v in ms^-1
    var gv = this.pt/this.mass ;
    var vt = SoL*sqrt(gv*gv/(gv*gv+1)) ;
    var vx = vt*cos(this.phi) ;
    var vy = vt*sin(this.phi) ;
    
    // Express t in s
    var dt = 1e-9 ;
    var x0 =  0 ;
    var y0 =  0 ;
    var x  = x0 ;
    var y  = y0 ;
    var sign = this.charge ;
    var k = k1 ;
    this.path.push([x,y]) ;
    for(var i=0 ; i<1000 ; i++){
      var b2 = (vx*vx+vy*vy)/(SoL*SoL) ;
      var g  = 1/sqrt(1-b2) ;
      
      // Careful!  We need to normalise vx and vy to make sure we don't violate the speed of light
      var dvx =  k*this.charge*vy*dt ;
      var dvy = -k*this.charge*vx*dt ;
      var vxTmp = vx + dvx ;
      var vyTmp = vy + dvy ;
      
      vx = vt*vxTmp/sqrt(vxTmp*vxTmp+vyTmp*vyTmp) ;
      vy = vt*vyTmp/sqrt(vxTmp*vxTmp+vyTmp*vyTmp) ;
      var dx = vx*dt ;
      var dy = vy*dt ;
      x += dx ;
      y += dy ;
      var r = sqrt(x*x+y*y) ;
      if(r<0.2*Sr){
        sign = this.charge ;
        k = k1 ;
      }
      if(r>0.51*Sr && this.particle_type=='electron'){
        break ;
      }
      if(r>0.2*Sr){
        sign = -this.charge ;
        k = k2 ;
      }
      if(r>0.45*Sr){
        sign = -this.charge ;
        k = 0 ;
      }
      if(r>0.95*Sr){
        break ;
      }
      this.path.push([x,y]) ;
    }
    for(var i=0 ; i<this.path.length ; i++){
      var xy = this.path[i] ;
      var x = xy[0] ;
      var y = xy[1] ;
      var r  = sqrt(x*x+y*y) ;
      var phi = atan2(y,x) ;
      if(phi<0   ) phi += 2*pi ;
      if(phi>2*pi) phi -= 2*pi ;
      var X = X_from_x(x) ;
      var Y = Y_from_y(y) ;
      var R = sqrt(x*x+y*y) ;
      var u = floor(  r/cellSizeR  ) ;
      var v = floor(phi/cellSizePhi) ;
      if(u<cells.length){
        if(v<cells[u].length){
          cells[u][v].touch(this.particle_type) ;
        }
      }
    }
    
    return ;
  }
  this.make_path() ;
  
  this.draw = function(context){
    context.save() ;
    context.beginPath() ;
    
    context.lineWidth = 2*this.lineWidth ;
    context.strokeStyle = 'rgb(255,255,255)' ;
    context.moveTo(X_from_x(this.path[0][0]),Y_from_y(this.path[0][1])) ;
    var rTmp = 0 ;
    for(var i=0 ; i<this.path.length ; i++){
      var xy = this.path[i] ;
      var r = sqrt( pow(xy[0],2) + pow(xy[1],2) ) ;
      if(r<rTmp) break ;
      rTmp = r ;
      if(r>0.3*Sr && this.particle_type!='muon' && this.particle_type!='electron') break ;
      context.lineTo(X_from_x(xy[0]),Y_from_y(xy[1])) ;
    }
    context.stroke() ;
    
    context.beginPath() ;
    context.lineWidth = this.lineWidth ;
    context.strokeStyle = this.color ;
    context.moveTo(X_from_x(this.path[0][0]),Y_from_y(this.path[0][1])) ;
    rTmp = 0 ;
    for(var i=0 ; i<this.path.length ; i++){
      var xy = this.path[i] ;
      var r = sqrt( pow(xy[0],2) + pow(xy[1],2) ) ;
      if(r<rTmp) break ;
      rTmp = r ;
      if(r>0.3*Sr && this.particle_type!='muon' && this.particle_type!='electron') break ;
      context.lineTo(X_from_x(xy[0]),Y_from_y(xy[1])) ;
    }
    context.stroke() ;
    
    context.restore() ;
  }
}
function draw_particle_head(context, X, Y, scale, color, text){
  context.save() ;
  context.beginPath() ;
  context.arc(X, Y, 5*scale, 0, 2*pi, true) ;
  context.fillStyle = color ;
  context.fill() ;
  context.fillStyle = 'rgb(255,255,255)' ;
  context.font = (6*scale) + 'px arial' ;
  context.textBaseline = 'middle' ;
  context.textAlign    = 'center' ;
  context.fillText(text, X, Y) ;
  context.restore() ;
}
