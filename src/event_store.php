<?php

include_once('mysql.php') ;

// Connect to database
$mySQL_connection = mysql_connect('localhost', $mysql_username, $mysql_password) or die('Could not connect: ' . mysql_error()) ;
mysql_select_db($mysql_database) or die('Could not select database') ;

if(isset($_GET['task'])){
  if($_GET['task']=='add_event'){ // format: ?task=add_event&team=ATLAS&events=nMu,nEl,trigger;nMu,nEl,trigger
    $team = mysql_real_escape_string($_GET['team']) ;
    $events_raw = $_GET['events'] ;
    $events_array = explode(';',$events_raw) ;
    foreach($events_array as $event){
      $parts = explode(',',$event) ;
      $nMu = intval($parts[0]) ;
      $nEl = intval($parts[1]) ;
      $trigger = mysql_real_escape_string($parts[2]) ;
      $query = 'INSERT INTO trigger_events (team, nMu, nEl, triggerName, seen) VALUES ("' . $team . '",' . $nMu . ',' . $nEl . ',"' . $trigger . '", 0)' ;
      mysql_query($query) or die(mysql_error()) ;
    }
  }
  else if($_GET['task']=='get_event'){
    $team = mysql_real_escape_string($_GET['team']) ;
    $query_read = 'SELECT * FROM trigger_events WHERE team="' . $team . '" AND seen=0 ORDER BY uid ASC LIMIT 1' ;
    $result_read = mysql_query($query_read) or die(mysql_error()) ;
    $success = false ;
    while($row = mysql_fetch_assoc($result_read)){
      echo $row['nEl'] , ',' , $row['nMu'] , ',' , $row['triggerName'] ;
      $query_change = 'UPDATE trigger_events SET seen=1 WHERE id=' . $row['id'] ;
      mysql_query($query_change) or die(mysql_error()) ;
      $success = true ;
    }
    if($success==false){
      echo -1 , ',' , -1 , ',NONE' ;
    }
  }
}

?>

