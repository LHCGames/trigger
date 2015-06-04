var canvas    = null ;
var game      = null ;
var spy       = null ;
var histogram = null ;
var experiments = [] ;

// Detector parts.
var detector = new detector_object() ;

function spy_object(){
  this.frozen = false ;
  this.draw_delay = 2500 ;
  this.freeze = function(){
    spy.frozen = true ;
    Get('button_freeze'       ).style.display = 'none' ;
    Get('button_analyse_ATLAS').style.display = ''     ;
  }
  this.analyse_ATLAS = function(){
    spy.current_team_name = 'ATLAS' ;
    Get('button_analyse_'  +spy.current_team_name).style.display = 'none' ;
    Get('canvas_collision_'+spy.current_team_name).style.display = 'none' ;
    Get('canvas_histogram_'+spy.current_team_name).style.display = ''     ;
    experiments[spy.current_team_name].analyse() ;
  }
  this.analyse_CMS = function(){
    spy.current_team_name = 'CMS' ;
    Get('button_analyse_'  +spy.current_team_name).style.display = 'none' ;
    Get('canvas_collision_'+spy.current_team_name).style.display = 'none' ;
    Get('canvas_histogram_'+spy.current_team_name).style.display = ''     ;
    experiments[spy.current_team_name].analyse() ;
  }
  this.combine_results = function(){
    Get('button_combine').style.display = 'none' ;
  }
  this.animate_histogram = function(){
    experiments[spy.current_team_name].histogram.animate() ;
  }
  this.combine_results = function(){
    // This was very much last minute and can be vastly improved.
  
    // First remove the things we don't want to look at anymore.
    experiments['ATLAS'].histogram_canvas.style.display = 'none' ;
    experiments['CMS'  ].histogram_canvas.style.display = 'none' ;
    Get('h2_team_ATLAS').style.display = 'none' ;
    Get('h2_team_CMS'  ).style.display = 'none' ;
    Get('button_combine').style.display = 'none' ;
    Get('button_freeze' ).style.display = 'none' ;
  
    // Show the combo table which has been hiding until now.
    Get('table_combo'   ).style.display = 'block' ;
    
    // Show how many sigmas we got.
    Get('span_ATLAS_nSigma').innerHTML = experiments['ATLAS'].nSigma.toPrecision(2) + 'σ' ;
    Get('span_CMS_nSigma'  ).innerHTML = experiments['CMS'  ].nSigma.toPrecision(2) + 'σ' ;
  
    // Now "animate" the table.
    window.setTimeout(spy.add_combo_row_1, 1000) ;
    window.setTimeout(spy.add_combo_row_2, 2000) ;
    window.setTimeout(spy.add_combo_row_3, 3000) ;
    window.setTimeout(spy.add_combo_row_4, 4000) ;
    window.setTimeout(spy.add_combo_row_5, 5000) ;
    window.setTimeout(spy.add_combo_row_6, 6000) ;
    window.setTimeout(spy.add_combo_row_7, 7000) ;
    window.setTimeout(spy.add_combo_row_8, 8000) ;
    window.setTimeout(spy.add_combo_row_9, 9000) ;
    
    // Add sigmas in quadrature and write the final result.
    spy.nSigma = sqrt(pow(experiments['ATLAS'].nSigma,2)+pow(experiments['CMS'].nSigma,2)) ;
    window.setTimeout(spy.write_final_result, 13000) ;
    window.setTimeout(spy.sound_success     , 13000) ;
  }
  
  this.add_combo_row = function(number, text){
    var tr = Create('tr') ;
    tr.className = (number%2==0) ? 'odd' : 'even' ;
    var th = Create('th') ;
    th.className = 'combo combo_left' ;
    th.innerHTML = 'Step ' + number + ')' ;
    tr.appendChild(th) ;
    
    th = Create('th') ;
    th.className = 'combo combo_right' ;
    th.innerHTML = text ;
    tr.appendChild(th) ;
    Get('tbody_combo').appendChild(tr) ;
  }
  this.add_combo_row_1 = function(){ spy.add_combo_row(1, 'Calibrating leptons'       ) ; }
  this.add_combo_row_2 = function(){ spy.add_combo_row(2, 'Asking difficult questions') ; }
  this.add_combo_row_3 = function(){ spy.add_combo_row(3, 'Making coffee'             ) ; }
  this.add_combo_row_4 = function(){ spy.add_combo_row(4, 'Talking to professors'     ) ; }
  this.add_combo_row_5 = function(){ spy.add_combo_row(5, 'Running simulations'       ) ; }
  this.add_combo_row_6 = function(){ spy.add_combo_row(6, 'Downloading data'          ) ; }
  this.add_combo_row_7 = function(){ spy.add_combo_row(7, 'Recalibrating detectors'   ) ; }
  this.add_combo_row_8 = function(){ spy.add_combo_row(8, 'Cross checking facts'      ) ; }
  this.add_combo_row_9 = function(){ spy.add_combo_row(9, 'Avoiding the press'        ) ; }
  
  this.sound_success = function(){  
    Get('audio_tada').play() ;
  }
  this.write_final_result = function(){
    var tbody = Get('tbody_combo') ;
    tbody.innerHTML = '' ;
    var tr = Create('tr') ;
    var th = Create('th') ;
    th.id = 'th_final_result' ;
    var img = Create('img') ;
    img.src = 'images/seminar2.jpg' ;
    img.style.border = '1px solid black' ;
    img.style.padding = '2px' ;
    th.appendChild(img) ;
    tr.appendChild(th ) ;
    tbody.appendChild(tr) ;
    
    // Fairly trivial, so we should improve it.  Add some fireworks and happy faces
    // instead of a smiley.
    var tr = Create('tr') ;
    var th = Create('th') ;
    th.id = 'th_final_result' ;
    th.innerHTML = spy.nSigma.toPrecision(2) + 'σ discovery!<br />Party time :)' ;
    tr.appendChild(th) ;
    Get('tbody_combo').appendChild(tr) ;
  }
}

function experiment_object(name){
  this.name = name ;
  
  // Wait up to ten seconds for a response.
  this.wait = 10 ;
  
  this.nSigma = -1 ;
  this.n4L = 50 ;
  this.n2L =  0 ;
  
  // Get the canvas etc.
  this.collision_canvas  = Get('canvas_collision_'+this.name) ;
  this.collision_context = this.collision_canvas.getContext('2d') ;
  this.histogram_canvas  = Get('canvas_histogram_'+this.name) ;
  this.histogram_context = this.collision_canvas.getContext('2d') ;
  
  // Information about the collisions from the server.
  this.seeds = [] ;
  this.collision_id = -1 ;
  
  this.is_running_minimumBias = true ;
  
  this.histogram = new four_lepton_mass_histogram(this.histogram_canvas) ;
  this.histogram.color = teams[this.name].color ;
  
  // xmlhttp request functions.
  this.xmlhttp = GetXmlHttpObject() ;
  this.run_minimumBias = function(){
    return ;
    if(this.is_running_minimumBias==false) return ;
    var callback = (this.name=='ATLAS') ? ATLAS_run_minimumBias : CMS_run_minimumBias ;
    this.draw_minimumbias_collision() ;
    window.setTimeout(callback, spy.draw_delay) ;
  }
  this.request_collision_id_from_server = function(){
    var request = '?task=get_latest_collision_id' ;
    var uri = 'event_store.php'+request+'&sid=' + Math.random() ;
    this.xmlhttp.open('GET', uri, true) ;
    var callback = (this.name=='ATLAS') ? ATLAS_receive_collision_id_from_server : CMS_receive_collision_id_from_server ;
    this.xmlhttp.onreadystatechange = callback ;
    this.xmlhttp.send(null) ;
  }
  this.receive_collision_id_from_server = function(){
    if(this.xmlhttp.readyState!=4) return ;
    this.collision_id = parseInt(this.xmlhttp.responseText) ;
  }
  this.request_collisions_from_server = function(){
    var request = '?task=get_collisions&team=' + this.name + '&id=' + this.collision_id + '&wait=' + this.wait ;
    var uri = 'event_store.php'+request+'&sid=' + Math.random() ;
    this.xmlhttp.open('GET', uri, true) ;
    var callback = (this.name=='ATLAS') ? ATLAS_receive_collisions_from_server : CMS_receive_collisions_from_server ;
    this.xmlhttp.onreadystatechange = callback ;
    this.xmlhttp.send(null) ;
    this.is_running_minimumBias = true ;
    this.draw_minimumbias_collision() ;
  }
  this.receive_collisions_from_server = function(){
    if(this.xmlhttp.readyState!=4) return ;
    var responseText = this.xmlhttp.responseText ;
    var seeds   = responseText.split(';')[0].split(',') ;
    var trigger = responseText.split(';')[1] ;
    if(seeds.length==1){
      if(parseInt(seeds[0])==-1){
        this.request_collisions_from_server() ;
        return ;
      }
    }
    this.seeds = seeds ;
    if(seeds.length>0) this.is_running_minimumBias = false ;
    this.draw_collision_from_seed() ;
  }
  this.draw_collision_from_seed = function(){
    this.is_running_minimumBias = false ;
    if(spy.frozen==true){
      draw_eventDisplay_base(this.collision_context) ;
      return ;
    }
    if(this.seeds.length==0){
      this.request_collisions_from_server() ;
      return ;
    }
    var seed = this.seeds.splice(0,1) ;
    detector.start_collision() ;
    var collision = new collision_object() ;
    if(game.mode=='cosmics') collision.isCosmic = true ;
    collision.remake_generator(seed) ;
    collision.topology = decay_scheme.recursively_decay(collision.PNG) ;
    collision.make_particles() ;
    
    detector.process_collision(collision) ;
    if(match_topologies(collision.topology, decay_scheme['HBoson'].final_state_topologies)){
      this.n4L++ ;
    }
    
    draw_eventDisplay(collision, this.collision_context) ;
    var callback = (this.name=='ATLAS') ? ATLAS_draw_collision : CMS_draw_collision ;
    window.setTimeout(callback, spy.draw_delay) ;
  }
  this.draw_minimumbias_collision = function(){
    // "Minimum bias" just means no leptons etc.
    detector.start_collision() ;
    var collision = new collision_object() ;
    if(game.mode=='cosmics') collision.isCosmic = true ;
    collision.topology = [] ;
    collision.make_particles() ;
    detector.process_collision(collision) ;
    draw_eventDisplay_base(this.collision_context) ;
    draw_eventDisplay(collision, this.collision_context) ;
  }
  this.set_style = function(){
    Get('h2_team_'       +this.name).style.background = teams[this.name].color ;
    Get('button_analyse_'+this.name).style.background = teams[this.name].color ;
    Get('th_'+this.name+'_nSigma'  ).style.background = teams[this.name].color ;
  }
  
  this.analyse = function(){
    // This is a bit messy.
    // First we divide the amount of time we want to spending drawing by the number of
    // events so that we're no waiting around too short/too long.
    this.n4L = max(this.n4L, 10) ;
    delay_animate_histogram = Math.max(1,Math.floor(time_animate_histogram/this.n4L)) ;
    
    // Then assign the masses for the Higgs-like events.
    // I should check the random sampling from a Gaussian to make sure it works.  I took it
    // from a previous project (aDetector) but still...
    for(var i=0 ; i<this.n4L ; i++){
      var mass = (random()<0.3) ? -1 : mass_min + random()*(mass_max-mass_min) ;
      if(mass<0){
        mass = 122.5 + random_gaussian(10) ;
      }
      this.histogram.add_mass(mass) ;
    }
    
    // Animate the histogram.  This is why there is no getting around the global variable
    // problem.
    spy.animate_histogram() ;
  }
}

// These are callbacks.  These are necessary to use the "this" keyword in a nice and
// consistent way.
function ATLAS_receive_collision_id_from_server(){ experiments['ATLAS'].receive_collision_id_from_server() ; }
function   CMS_receive_collision_id_from_server(){ experiments['CMS'  ].receive_collision_id_from_server() ; }
function ATLAS_receive_collisions_from_server(){ experiments['ATLAS'].receive_collisions_from_server() ; }
function CMS_receive_collisions_from_server  (){ experiments['CMS'  ].receive_collisions_from_server() ; }
function ATLAS_draw_collision(){ experiments['ATLAS'].draw_collision_from_seed() ; }
function CMS_draw_collision  (){ experiments['CMS'  ].draw_collision_from_seed() ; }
function start_CMS  (){ experiments['CMS'  ].request_collisions_from_server() ; }
function start_ATLAS(){ experiments['ATLAS'].request_collisions_from_server() ; }
function ATLAS_run_minimumBias(){ experiments['ATLAS'].run_minimumBias() ; }
function   CMS_run_minimumBias(){ experiments['CMS'  ].run_minimumBias() ; }

function start(){
  Get('button_analyse_ATLAS'  ).style.display = 'none' ;
  Get('button_analyse_CMS'    ).style.display = 'none' ;
  Get('button_combine'        ).style.display = 'none' ;
  Get('canvas_histogram_ATLAS').style.display = 'none' ;
  Get('canvas_histogram_CMS'  ).style.display = 'none' ;

  // Set the global variables.
  experiments['ATLAS'] = new experiment_object('ATLAS') ;
  experiments['CMS'  ] = new experiment_object('CMS'  ) ;
  
  experiments['ATLAS'].request_collision_id_from_server() ;
  experiments['CMS'  ].request_collision_id_from_server() ;
  
  game = new game_object() ;
  spy  = new  spy_object() ;
  
  // Resize the canvas objects.
  SR = 175 ;
  cw = 2*SR ;
  ch = 2*SR ;
  
  // Apply the style to be neutral.  This is done so that we only need to set a single
  // colour in settings.js and make the style function as complex as we like.
  teams['neutral'].apply_style() ;
  set_header_and_footer_images() ;
  
  make_detector() ;
  
  Get('button_freeze'       ).addEventListener('click', spy.freeze         ) ;
  Get('button_analyse_ATLAS').addEventListener('click', spy.analyse_ATLAS  ) ;
  Get('button_analyse_CMS'  ).addEventListener('click', spy.analyse_CMS    ) ;
  Get('button_combine'      ).addEventListener('click', spy.combine_results) ;
  
  // This is CPU intensive, so do it last
  detector.make_cells() ;
  for(var i=0 ; i<detector.segments.length ; i++){
    detector.segments[i].activate_cells() ;
  }
  
  make_eventDisplay_base() ;
  var team_names = ['ATLAS','CMS'] ;
  for(var i=0 ; i<team_names.length ; i++){
    experiments[team_names[i]].set_style() ;
    experiments[team_names[i]].draw_minimumbias_collision() ;
  }
  
  var ATLAS_delay = (random()<0.5) ? 0.25*spy.draw_delay : 0.75*spy.draw_delay ;
  var CMS_delay = 1.0*spy.draw_delay - ATLAS_delay ;
  window.setTimeout(start_ATLAS, ATLAS_delay) ;
  window.setTimeout(start_CMS  , CMS_delay  ) ;
}



