<?php

// Turn on error reporting
ini_set('display_startup_errors',1) ;
ini_set('display_errors',1) ;
error_reporting(-1) ;

include_once('mysql.php') ;

// Connect to database
$mysqli = new mysqli('localhost', $mysql_username, $mysql_password, $mysql_database) ;

if($mysqli->connect_errno){
  printf("Connect failed: %s\n", $mysqli->connect_error) ;
  exit() ;
}

if(isset($_GET['task'])){
  if($_GET['task']=='add_event'){
    // format: ?task=add_event&team=ATLAS&events=nMu,nEl,trigger;nMu,nEl,trigger
    $team = $mysqli->real_escape_string($_GET['team']) ;
    $events_raw = $_GET['events'] ;
    $events_array = explode(';',$events_raw) ;
    foreach($events_array as $event){
      $parts = explode(',',$event) ;
      $nMu = intval($parts[0]) ;
      $nEl = intval($parts[1]) ;
      $trigger = $mysqli->real_escape_string($parts[2]) ;
      $query = 'INSERT INTO trigger_events (team, nMu, nEl, triggerName, seen) VALUES ("' . $team . '",' . $nMu . ',' . $nEl . ',"' . $trigger . '", 0)' ;
      $mysqli->query($query) or die(mysql_error()) ;
    }
  }
  if($_GET['task']=='add_collisions'){
    // format: ?task=add_event&team=ATLAS&trigger=ee&seeds=seed;seed;seed
    $team    = $mysqli->real_escape_string($_GET['team'   ]) ;
    $trigger = $mysqli->real_escape_string($_GET['trigger']) ;
    $seeds   = $mysqli->real_escape_string($_GET['seeds'  ]) ;
    $query = 'INSERT INTO trigger_collisions (team, triggerName, seeds, seen) VALUES ("' . $team . '","' . $trigger . '", "' . $seeds . '",0)' ;
    $mysqli->query($query) or die(mysql_error() . ' - ' . $query) ;
  }
  else if($_GET['task']=='get_event'){
    $team = $mysqli->real_escape_string($_GET['team']) ;
    $query_read = 'SELECT * FROM trigger_events WHERE team="' . $team . '" AND seen=0 ORDER BY uid ASC LIMIT 1' ;
    $result_read = $mysqli->query($query_read) or die(mysql_error()) ;
    $success = false ;
    while($row = mysql_fetch_assoc($result_read)){
      echo $row['nEl'] , ',' , $row['nMu'] , ',' , $row['triggerName'] ;
      $query_change = 'UPDATE trigger_events SET seen=1 WHERE id=' . $row['id'] ;
      $mysqli->query($query_change) or die(mysql_error()) ;
      $success = true ;
    }
    if($success==false){
      echo -1 , ',' , -1 , ',NONE' ;
    }
  }
}

?>

