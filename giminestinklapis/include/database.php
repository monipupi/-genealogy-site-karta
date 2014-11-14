<?php
include("constants.php");

class MySQLDB {
   
   var $connection;         //The MySQL database connection

   /* Class constructor */
   function MySQLDB() {
      
	  /* Makes connection to database */
      $this->connection = mysql_connect(DB_SERVER, DB_USER, DB_PASS)
                or die(mysql_error());
				mysql_select_db(DB_NAME, $this->connection)
                or die(mysql_error());
	 /* Synchronizes PHP and MySQL timezones */
	 $this->query("SET time_zone = 'TIMEZONE'");
   }
   /**
    * query - Performs the given query on the database and
    * returns the result, which may be false, true or a
    * resource identifier.
    */
   function query($query){
      return mysql_query($query, $this->connection);
   }
};
/* Create database connection */
$database = new MySQLDB;
?>