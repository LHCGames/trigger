// This is a class for handling a histogram of masses (or any variable of interest) and
// then animating it to show the results.  Its psychologically important to see it animate
// before the player's/audiences eyes!

function four_lepton_mass_histogram(canvas){
  this.nBins = histogram_nBins ;
  this.bins = [] ;
  this.binsInOrder_array = [] ;
  this.nHiggs = 0 ;
  for(var i=0 ; i<this.nBins ; i++){
    this.bins.push(0) ;
    this.binsInOrder_array.push(0) ;
  }
  this.drawStyle = histogram_drawStyle ;
  this.mass_min = mass_min ;
  this.mass_max = mass_max ;
  
  this.canvas = canvas ;
  this.context = this.canvas.getContext('2d') ;
  
  // Used for the animation.
  this.binsInOrder = [] ;
  this.binsInOrder_index = 0 ;
  
  // The colour of the histogram should match the experiment.
  this.color = teams['neutral'].color ;
  
  this.add_mass = function(mass){
    // This adds a mass to the histograms.  The lookup function is quite cheap.
    if(mass<this.mass_min) return ;
    if(mass>this.mass_max) return ;
    var index = Math.floor((this.nBins+0)*(mass-this.mass_min)/(this.mass_max-this.mass_min)) ;
    this.bins[index]++ ;
    this.binsInOrder.push(index) ;
  }
  this.add_Higgs = function(){
    this.nHiggs++ ;
  }
  this.max_height = function(){
    // Find the heigh of the highest bin so we can dynamically change the y-axis etc.
    var result = 0 ;
    for(var i=0 ; i<this.bins.length ; i++){
      if(this.bins[i]>result) result = 1*this.bins[i] ;
    }
    return result ;
  }
  this.nEvents = function(){
    // Sum up all the events stored.  It might be cheaper to increment a counter as we
    // fill the histogram.
    var total = 0 ;
    for(var i=0 ; i<this.bins.length ; i++){
      total += this.bins[i] ;
    }
    return total ;
  }
  this.draw = function(theBins){
    this.context.save() ;
  
    // Okay, now things get messy.
    
    // Margin around the histogram, in relative units (ie 15%.)
    var m = 0.15 ;
    var w = canvas.width  ;
    var h = canvas.height ;
    
    // Plot width and height.
    var pw = w*(1-2*m) ;
    var ph = h*(1-2*m) ;
    
    // Maximum height, which must take the error bars into account.
    var mh = this.max_height()+2*sqrt(this.max_height()) ;
    
    // Clear the plotting area.
    this.context.fillStyle = 'rgb(255,255,255)' ;
    this.context.fillRect(0,0,w,h) ;
    
    // Set colours etc.
    this.context.fillStyle = this.color ;
    this.context.strokeStyle = this.color ;
    this.context.textAlign = 'center' ;
    this.context.font = '20px arial' ;
    
    // Draw a nice border around the plot area.
    this.context.strokeRect(w*m,h*m,pw,ph) ;
    
    // Draw the axis titles.  A bit messy, but works.
    var x_xAxisTitle = w*0.6 ;
    var y_xAxisTitle = h - 0.1*m*h ;
    this.context.fillText('mass (four leptons) [GeV]', x_xAxisTitle, y_xAxisTitle) ;
    
    var x_yAxisTitle = w*m*0.8 ;
    var y_yAxisTitle = h*0.1 ;
    this.context.fillText('events', x_yAxisTitle, y_yAxisTitle) ;
    
    // Now draw the bins one by one, including tick marks.  Tick marks are a pain.
    var bin_width = pw/(theBins.length) ;
    for(var i=0 ; i<=theBins.length ; i++){
      // First get the value of the mass for the labels.
      var mass = Math.floor(this.mass_min + i*(this.mass_max-this.mass_min)/(theBins.length)) ;
      
      // Dimensions hardcoded?  What was I thinking?
      var x = w*m + (i+0.0)*bin_width ;
      var y = h - 0.5*m*h ;
      var tickLength = 0.1*m*h ;
      if(i%histogram_xAxisLAbelFrequency==0){
        // Now add a tick with a label.
        this.context.fillText(mass, x, y) ;
        tickLength *=2 ;
      }
      
      // Draw the tick mark.
      this.context.beginPath() ;
      this.context.moveTo(x, h-1*m*h-tickLength) ;
      this.context.lineTo(x, h-1*m*h+tickLength) ;
      this.context.stroke() ;
      this.context.closePath() ;
      
      // Check for an empty bin.  (Things can get tricky if you try to draw error bars on
      // a zero bin.)
      if(theBins[i]==0) continue ;
      
      // Draw the bin, depending on the style.
      if(this.drawStyle=='rect'){
        // Barchart.
        var x1 = w*m + i*bin_width ;
        var y1 = h - h*m ;
        this.context.fillRect(x1, y1, bin_width, -ph*theBins[i]/(1+mh)) ;
      }
      else{
        // Data points with error bars.
        var x2 = w*m + (i+0.5)*bin_width ;
        var y2 = h -h*m - ph*theBins[i]/(1+mh) ;
        this.context.beginPath() ;
        this.context.arc(x2,y2,5,0,2*pi,true) ;
        this.context.closePath() ;
        this.context.fill() ;
        var err = 0.5*ph*sqrt(theBins[i])/(1+mh) ;
        this.context.beginPath();
        this.context.moveTo(x2,y2-err) ;
        this.context.lineTo(x2,y2+err) ;
        this.context.stroke() ;
        this.context.closePath() ;
      }
    }
    
    // Now the y-axis.  The tick intervals should be handled more gracefully than this.
    this.context.beginPath() ;
    var di = 1 ;
    if(mh>=10  ) di =   2 ;
    if(mh>=20  ) di =  10 ;
    if(mh>=100 ) di =  10 ;
    if(mh>=200 ) di =  25 ;
    if(mh>=1000) di = 100 ;
    if(mh>=2000) di = 250 ;
    for(var i=0 ; i<=mh ; i+=di){
      var x = m*w ;
      var y = h-h*m-ph*i/(1+mh) ;
      this.context.moveTo(x-5,y) ;
      this.context.lineTo(x+5,y) ;
      this.context.fillText(i,0.5*m*w,y) ;
    }
    this.context.stroke() ;
    
    this.context.restore() ;
  }
  this.animate = function(){
    // Yuck, this needs to be tidied up.
    // Basically add events one by one.
    if(this.binsInOrder_index>=this.binsInOrder.length){
      // If we're on the final event, update the sigmas.  This should be done elsewhere.
      // But I was under a lot of time pressure.
      var w = this.canvas.width  ;
      var h = this.canvas.height ;
      this.context.font = 0.1*w + 'px arial' ;
      this.context.fillStyle = this.color ;
      var nSigma = 3.6 + random()*0.6 ;
      this.context.fillText(nSigma.toPrecision(2)+' \u03C3!', 0.7*w, 0.12*h) ;
      
      if(experiments['ATLAS'].nSigma<1){
        Get('button_analyse_CMS').style.display = '' ;
        experiments['ATLAS'].nSigma = nSigma ;
      }
      else if(experiments['CMS'  ].nSigma<1){
        Get('button_combine').style.display = '' ;
        experiments['CMS'  ].nSigma = nSigma ;
      }
      
      return ;
    }
    // Update the binsInOrder and redraw the histogram.
    this.binsInOrder_array[this.binsInOrder[this.binsInOrder_index]]++ ;
    this.draw(this.binsInOrder_array) ;
    this.binsInOrder_index++ ;
    
    // Send the signal for the next draw call.
    window.setTimeout(spy.animate_histogram, delay_animate_histogram) ;
  }
}

