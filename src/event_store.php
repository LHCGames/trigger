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
  if($_GET['task']=='add_collisions'){
    // format: ?task=add_event&team=ATLAS&trigger=ee&seeds=seed;seed;seed
    $team    = $mysqli->real_escape_string($_GET['team'   ]) ;
    $trigger = $mysqli->real_escape_string($_GET['trigger']) ;
    $seeds   = $mysqli->real_escape_string($_GET['seeds'  ]) ;
    $query = 'INSERT INTO trigger_collisions (team, triggerName, seeds, seen) VALUES ("' . $team . '","' . $trigger . '", "' . $seeds . '",0)' ;
    $mysqli->query($query) or die(mysql_error() . ' - ' . $query) ;
  }
  else if($_GET['task']=='get_collisions'){
    $team = $mysqli->real_escape_string($_GET['team']) ;
    $query_read = 'SELECT * FROM trigger_collisions WHERE team="' . $team . '" AND seen=0 ORDER BY id ASC LIMIT 1' ;
    $result_read = $mysqli->query($query_read) or die($mysqli->error) ;
    $success = false ;
    while($row = $result_read->fetch_assoc()){
      echo $row['seeds'] , ';' , $row['triggerName'] ;
      $query_change = 'UPDATE trigger_collisions SET seen=1 WHERE id=' . $row['id'] ;
      $mysqli->query($query_change) or die($mysqli->error) ;
      $success = true ;
    }
    if($success==false){
      echo -1 , ',' , -1 , ',NONE' ;
    }
  }
}

?>

