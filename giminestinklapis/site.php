<?php
include_once('include/database.php');

date_default_timezone_set(TIMEZONE);

class Site {
   
	var $database;
	var $num_active_users;   //Number of active users viewing site
	var $num_active_guests;  //Number of active guests viewing site
	var $num_members;        //Number of signed-up users
	var $num_trees;          //Number of family trees

   function Site($database) {  
   
	$this->database = $database;

      /**
       * Only query database to find out number of members
       * when getNumMembers() is called for the first time,
       * until then, default value set.
       */
      $this->num_members = -1;
	  
	  /* Number of trees */
	  $this->num_trees = -1;
      
      if(TRACK_VISITORS){
         /* Calculate number of users at site */
         $this->calcNumActiveUsers();
      
         /* Calculate number of guests at site */
         $this->calcNumActiveGuests();
      }
   } 
   /**
    * getNumMembers - Returns the number of signed-up users
    * of the website, banned members not included. The first
    * time the function is called on page load, the database
    * is queried, on subsequent calls, the stored result
    * is returned. This is to improve efficiency, effectively
    * not querying the database when no call is made.
    */
   function getNumMembers(){
      if($this->num_members < 0){
         $q = "SELECT * FROM ".TBL_USERS;
         $result = $this->database->query($q);
         $this->num_members = mysql_numrows($result);
      }
      return $this->num_members;
   }
   /**
    * getNumTrees - Returns the number of family trees
    * of the website. The first time the function is 
	* called on page load, the database is queried, 
	* on subsequent calls, the stored result is returned. 
	* This is to improve efficiency, effectively
    * not querying the database when no call is made.
    */
   function getNumTrees(){
      if($this->num_trees < 0){
         $q = "SELECT * FROM ".TBL_FAMILY;
         $result = $this->database->query($q);
         $this->num_trees = mysql_numrows($result);
      }
      return $this->num_trees;
   }
   /**
	* calcNumActiveUsers - Finds out how many active users
	* are viewing site and sets class variable accordingly.
	*/
	function calcNumActiveUsers(){
		/* Calculate number of users at site */
		$q = "SELECT * FROM ".TBL_ACTIVE_USERS;
		$result = $this->database->query($q);
		$this->num_active_users = mysql_numrows($result);
	}
	/**
	* calcNumActiveGuests - Finds out how many active guests
	* are viewing site and sets class variable accordingly.
	*/
	function calcNumActiveGuests(){
		/* Calculate number of guests at site */
		$q = "SELECT * FROM ".TBL_ACTIVE_GUESTS;
		$result = $this->database->query($q);
		$this->num_active_guests = mysql_numrows($result);
	}
	/*
	* cleanOutput - ensures safe data entry, and accepts either strings or arrays. 
	* If the array is multidimensional, it will recursively loop through the array 
	* and make all points of data safe for entry.
	*/
	function cleanOutput($array) {
		if(is_array($array)) {
			foreach($array as $key => $value) {
				if(is_array($array[$key])) {
					$array[$key] = $this->filterParameters($array[$key]);
				}
				if(is_string($array[$key])) {
					$array[$key] = mysql_real_escape_string($array[$key]);
				}
			}            
		}
		if(is_string($array)) {
			$array = mysql_real_escape_string($array);
		}
			return $array;
	}
	/**
	 * getDomainAndDir 
	 */
	function getDomainAndDir() {
		$pageURL = 'http';

		if (isset($_SERVER["HTTPS"])) {
			if ($_SERVER["HTTPS"] == "on") {
				$pageURL .= 's';
			}
		}

		$pageURL .= '://';

		if (isset($_SERVER["SERVER_PORT"])) {
			if ($_SERVER["SERVER_PORT"] != "80") {
				$pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
			}
			else {
				$pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
			}
		}
		// Return the domain and directories, but exlude the filename
		return substr($pageURL, 0, strripos($pageURL, '/')+1);
	}
};
$site = new Site($database);
?>