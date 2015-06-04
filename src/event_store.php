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
    
    // Escape strings to prevent SQL injection.
    $team    = $mysqli->real_escape_string($_GET['team'   ]) ;
    $trigger = $mysqli->real_escape_string($_GET['trigger']) ;
    $seeds   = $mysqli->real_escape_string($_GET['seeds'  ]) ;
    
    // Create query to add row.
    $query = 'INSERT INTO trigger_collisions (team, triggerName, seeds, seen) VALUES ("' . $team . '","' . $trigger . '", "' . $seeds . '",0)' ;
    $mysqli->query($query) or die(mysql_error() . ' - ' . $query) ;
  }
  else if($_GET['task']=='get_latest_collision_id'){
    $query_read = 'SELECT id FROM trigger_collisions ORDER BY id DESC LIMIT 1' ;
    $result_read = $mysqli->query($query_read) or die($mysqli->error . '  (' . $query_read . ')') ;
      
    // Take the oldest result.  Perhaps we want to take the youngest, or apply a time
    // window instead?
    while($row = $result_read->fetch_assoc()){
      print $row['id'] ;
      break ;
    }
  }
  else if($_GET['task']=='get_collisions'){
    // Escape strings to prevent SQL injection.
    $team = $mysqli->real_escape_string($_GET['team']) ;
    $id   = $mysqli->real_escape_string($_GET['id'  ]) ;
    $wait = $mysqli->real_escape_string($_GET['wait']) ;
    $wait = intval($_GET['wait']) ;
    $wait = max($wait, 1) ;
    
    // Create query to read rows.
    $query_read = 'SELECT * FROM trigger_collisions WHERE team="' . $team . '" AND seen=0 AND seeds!="" AND id>' . $id . ' ORDER BY id ASC LIMIT 1' ;
    
    // Make multiple attempts to read from the table.
    $success = false ;
    for($i=0 ; $i<$wait ; $i++){
      $result_read = $mysqli->query($query_read) or die($mysqli->error . '  (' . $query_read . ')') ;
      
      // Take the oldest result consistent with the id.
      while($row = $result_read->fetch_assoc()){
        // Return the events, the trigger name and the id for the next query.
        echo $row['seeds'] , ';' , $row['triggerName'] , ';' , $row['id'] ;
        $success = true ;
      }
      if($success) break ;
      sleep(1) ;
    }
    if($success==false){
      // Default behaviour is to return nothing.
      echo '-1;NONE' ;
    }
  }
  else if($_GET['task']=='add_new_user'){
    // Escape strings to prevent SQL injection.
    $username    = $mysqli->real_escape_string($_GET['username'   ]) ;
    $facebook_id = $mysqli->real_escape_string($_GET['facebook_id']) ;
    
    // Create query to read rows.
    $query_read = 'SELECT username FROM trigger_usernames' ;
    $result_read = $mysqli->query($query_read) or die($mysqli->error) ;
    
    // Check to see if the username is already taken.
    $success = true ;
    while($row = $result_read->fetch_assoc()){
      $username_from_db = $mysqli->htmlentities($row['username']) ;
      if($username_from_db==$uername){
        $success = false ;
        break ;
      }
    }
    if($success){
      // The username does not exist yet, so insert a new row.
      $query_add = 'INSERT INTO trigger_usernames (username, facebook_id) VALUES ("' . $username . '","' . $facebook_id . '")' ;
      $mysqli->query($query_change) or die($mysqli->error) ;
    }
    else{
      // The username already exists, so report the error.
      echo 'Error: Username already exists.' ;
    }
  }
  else if($_GET['task']=='add_facebookId'){
    // Escape strings to prevent SQL injection.
    $username    = $mysqli->real_escape_string($_GET['username'   ]) ;
    $facebook_id = $mysqli->real_escape_string($_GET['facebook_id']) ;
    
    // Create query to read rows.
    $query_read = 'SELECT * FROM trigger_usernames' ;
    $result_read = $mysqli->query($query_read) or die($mysqli->error) ;
    
    // Check to see if the username exists.
    $success = false ;
    while($row = $result_read->fetch_assoc()){
      $username_from_db = $mysqli->htmlentities($row['username']) ;
      if($username_from_db==$uername){
        $success = true ;
        break ;
      }
    }
    if($success){
      // The username has been found, so update the table.
      $query_change = 'UPDATE trigger_usernames SET facebook_id="' . $facebook_id . '" WHERE username="' . $username . '"' ;
      $mysqli->query($query_change) or die($mysqli->error) ;
    }
    else{
      // Can't find that username, so report the error.
      echo 'Error: Could not find that username.' ;
    }
  }
  else if($_GET['task']=='add_score'){
    // Escape strings to prevent SQL injection.
    $username = $mysqli->real_escape_string($_GET['username']) ;
    $score    = $mysqli->real_escape_string($_GET['score'   ]) ;
    $mode     = $mysqli->real_escape_string($_GET['mode'    ]) ;
    
    // Create query to add row.
    $query = 'INSERT INTO trigger_scores (username, score, mode) VALUES ("' . $username . '",' . $score . ', "' . $mode . '")' ;
    $mysqli->query($query) or die(mysql_error() . ' - ' . $query) ;
  }
  else if($_GET['task']=='read_scores'){
    // Escape strings to prevent SQL injection.
    $mode  = $mysqli->real_escape_string($_GET['mode' ]) ;
    $nDays = $mysqli->real_escape_string($_GET['nDays']) ;
    
    // Create query to read rows.
    $query_read = 'SELECT * FROM trigger_scores WHERE mode="' . $mode . '" ORDER BY score DESC LIMIT 10' ;
    $result_read = $mysqli->query($query_read) or die($mysqli->error) ;
    $string = array() ;
    while($row = $result_read->fetch_assoc()){
      $string [] = $row['username'] . ':' . $row['score'] ;
    }
    echo implode(',',$string) ;
  }
}

?>

