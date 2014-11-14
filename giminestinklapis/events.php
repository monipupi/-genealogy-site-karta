<?php
session_start();

define('URL_PREFIX', '');

include('events_class.php');
include('usermanagement_class.php');
include_once('site.php');

class EventsPage {

	var $database;
	var $form;
	var $events;
	var $usermanagement;
	var $site;
	var $template;
	var $username;     				
    var $userid;       				
    var $userlevel;
    var $time;         				
    var $logged_in;    				
	var $num_new_msg;
	var $url; 
	var $referrer; 
    
    function EventsPage($database, $form, $events, $usermanagement, $site) {
	
		$this->database = $database;
		$this->events = $events;
		$this->formError = $form;
		$this->usermanagement = $usermanagement;
		$this->site = $site;
		$this->time = time();
		$this->setSessionVariables();
		
		$this->template = array(
            'sitename'      => 'Karta',
            'pagetitle'     => 'Kalendorius',
            'path'          => URL_PREFIX,
			'username'    	=> $this->username,
			'userlevel'     => $this->userlevel,
			'numTrees'		=> $this->site->getNumTrees(),
			'numMembers'	=> $this->site->getNumMembers(),
			'numActive'		=> $this->site->num_active_users,
			'numGuests'		=> $this->site->num_active_guests,
			'numMessages'	=> $this->num_new_msg,
            'year'          => date('Y')
        );
		
		if (!$this->logged_in){
			header("Location: usermanagement.php?register");
			return;
		}
		
		$this->familyCategories = $this->events->getFamilyCategoriesIds($this->username);
		$this->familyEvents = $this->events->getFamilyEventsIds($this->username);
			
        if (isset($_GET['add-event']))
        {
            $this->displayAddForm();
        }
        elseif (isset($_POST['add-event']))
        {
            $this->addEvent();
        }
        elseif (isset($_GET['edit-event']))
        {
			if (!empty($_GET['edit-event']) && !in_array($_GET['edit-event'], $this->familyEvents)) {
				header("Location: events.php");
				return;
			}
            $this->displayEditForm();
        }
        elseif (isset($_POST['edit-event']))
        {
            $this->editEvent();
        }
		elseif (isset($_GET['event']))
        {	
			if (!empty($_GET['event']) && !in_array($_GET['event'], $this->familyEvents)) {
				header("Location: events.php");
				return;
			}
            $this->displayEventForm();
        }
		elseif (isset($_GET['birthday']))
        {
			if (!empty($_GET['birthday']) && !in_array($_GET['birthday'], $this->familyEvents)) {
				header("Location: events.php");
				return;
			}
            $this->displayBirthdayForm();
        }
		elseif (isset($_GET['anniversary']))
        {
			if (!empty($_GET['anniversary']) && !in_array($_GET['anniversary'], $this->familyEvents)) {
				header("Location: events.php");
				return;
			}
            $this->displayAnniversaryForm();
        }
		else if (isset($_POST['delete-event']) && !isset($_POST['confirm-event-delete'])) {
			$this->displayConfirmDelete();
		}
		else if (isset($_POST['confirm-event-delete'])) {
			$this->deleteEventSubmit();
		}
		else if (isset($_GET['add-category']))
        {
            $this->displayAddCategoryForm();
        }
        elseif (isset($_POST['add-category']))
        {
            $this->addCategory();
        }
        elseif (isset($_GET['edit-category']))
        {
			if (!empty($_GET['edit-category']) && !in_array($_GET['edit-category'], $this->familyCategories)) {
				header("Location: events.php");
				return;
			}
            $this->displayEditCategoryForm();
        }
        elseif (isset($_POST['edit-category']))
        {
            $this->editCategory();
        }
        else if (isset($_POST['delete-category']) && !isset($_POST['confirm-category-delete'])) {
			$this->displayConfirmDelete();
		}
		else if (isset($_POST['confirm-category-delete'])) {
			$this->deleteCategorySubmit();
		}
        else
        {
            $this->displayCalendar();
        }
    }
	/**
     * setUserStats - Determines if the the user has logged in already,
	 * and sets the variables accordingly. Also takes advantage of 
	 * the page load to update the active visitors tables.
     */
    function setSessionVariables() {
		
		/* Determine if user is logged in */
        $this->logged_in = $this->checkLogin();
		
		/**
		 * Set guest value to users not logged in, and update
		 * active guests table accordingly.
		 */
		if (!$this->logged_in) {
			$this->username = $_SESSION['username'] = GUEST_NAME;
			$this->userlevel = GUEST_LEVEL;
			$this->usermanagement->addActiveGuest($_SERVER['REMOTE_ADDR'], $this->time);
		}
		else {
			$this->username = $_SESSION['username'];
			$this->usermanagement->addActiveUser($this->username, $this->time);
			// Calculate number of new messages
			$this->num_new_msg = $_SESSION['newmsg'] = $this->getNumNewMessages($this->username);
		}
		/* Remove inactive visitors from database */
		$this->usermanagement->removeInactiveUsers();
		$this->usermanagement->removeInactiveGuests();
		
		/* Set referrer page */
        if (isset($_SESSION['url'])) {
            $this->referrer = $_SESSION['url'];
        } 
		else {
            $this->referrer = "index.php";
        }

        /* Set current url */
        $this->url = $_SESSION['url'] = $_SERVER['REQUEST_URI'];
        
    }
    /**
     * checkLogin - Checks if the user has already previously
     * logged in, and a session with the user has already been
     * established. Also checks to see if user has been remembered.
     * If so, the database is queried to make sure of the user's 
     * authenticity. Returns true if the user has logged in.
     */
    function checkLogin() {
        /* Check if user has been remembered */
        if (isset($_COOKIE['cookname']) && isset($_COOKIE['cookid'])) {
            $this->username = $_SESSION['username'] = $_COOKIE['cookname'];
            $this->userid = $_SESSION['userid'] = $_COOKIE['cookid'];
        }
        /* Username and userid have been set and not guest */
        if (isset($_SESSION['username']) && isset($_SESSION['userid']) &&
                $_SESSION['username'] != GUEST_NAME) {
            /* Confirm that username and userid are valid */
            if ($this->usermanagement->confirmUserID($_SESSION['username'], $_SESSION['userid']) != 0) {
                /* Variables are incorrect, user not logged in */
                unset($_SESSION['username']);
                unset($_SESSION['userid']);
                return false;
            }
            /* User is logged in, set class variables */
            $this->userinfo = $this->usermanagement->getUserInfo($_SESSION['username']);
            $this->username = $this->userinfo['username'];
            $this->userid = $this->userinfo['userid'];
            $this->userlevel = $this->userinfo['userlevel'];
			
			return true;
        }
        /* User not logged in */ 
		else {
            return false;
        }
    }
	/**
    * getNumNewMessages - Returns the number of the new messages received. 
    */
   function getNumNewMessages($username) {
	 $q = "SELECT * 
			FROM ".TBL_MESSAGES."
			WHERE `recipient` = '$username'
			AND `read` = '0'";
	 $result = $this->database->query($q);
	 $num_new_messages = mysql_numrows($result);
	 
	 return $num_new_messages;
   }
	 /**
     * displayHeader 
     */
    function displayHeader() {
        
		$template = $this->template;
		
		require_once $template['path'].'include/header.php';

    }
	/**
     * displayFooter 
     */
    function displayFooter() {
		
		$template = $this->template;

        require_once $template['path'].'include/footer.php';
				
    }
	/**
     * displayAddForm 
     * 
     * @return void
     */
    function displayAddForm() {
	
		$username = $this->username;
		$date = $_GET['add-event'];
		
        $this->displayHeader();
        $this->events->displayAddEventForm($username, $date);
        $this->displayFooter();
    }
	/**
     * displayEditForm 
     */
    function displayEditForm() {
	
		$username = $this->username;
		$eventid = $_GET['edit-event'];
		
        $this->displayHeader();
        $this->events->displayEditEventForm($username, $eventid);
        $this->displayFooter();
    }
	/**
     * displayEventForm 
     */
    function displayEventForm() {
	
		$username = $this->username;
		$eventid = $_GET['event'];
		
        $this->displayHeader();
        $this->events->displayEventForm($username, $eventid);
        $this->displayFooter();
    }
	/**
     * displayBirthdayForm 
     */
    function displayBirthdayForm() {
	
		$username = $this->username;
		$birthdayid = $_GET['birthday'];
		
        $this->displayHeader();
        $this->events->displayBirthdayForm($username, $birthdayid);
        $this->displayFooter();
    }
	/**
     * displayAnniversaryForm 
     */
    function displayAnniversaryForm() {
	
		$username = $this->username;
		$anniversaryid = $_GET['anniversary'];
		
        $this->displayHeader();
        $this->events->displayAnniversaryForm($username, $anniversaryid);
        $this->displayFooter();
    }
	/**
     * displayAddCategoryForm 
     */
    function displayAddCategoryForm() {
        
		$username = $this->username;
		
        $this->displayHeader();
        $this->events->displayAddCategoryForm($username);
        $this->displayFooter();
    }
	/**
     * displayEditCategoryForm 
     */
    function displayEditCategoryForm() {
        
		$username = $this->username;
		$categoryid = $_GET['edit-category'];
		
        $this->displayHeader();
        $this->events->displayEditCategoryForm($username, $categoryid);
        $this->displayFooter();
    }
	/**
     * addEvent 
     */
    function addEvent() {
        
		$username = $this->username;
		$title  = $_POST['title'];
        $description  =  $_POST['description'];
		$category = $_POST['category'];
		$repeat = isset($_POST['repeat']) ? '1' : '0';
		$date = $_POST['date'];
		$timestamp = time(); 
		$path = $this->referrer;
		
		if (strpos($path,'?add-event') == true) {
			$path = substr($path, 0, strpos($path, '?add-event'));
		}
		else if (strpos($path,'&add-event') == true){
			$path = substr($path, 0, strpos($path, '&add-event'));
		}
		
		/* Error checking */
		$field = "title";  
		
		if(!$title || strlen($title = trim($title)) == 0){
			$this->formError->setError($field, "* Pavadinimas neįvestas");
		}
		else if (strlen($title) < 2) {
			$this->formError->setError($field, "* Pavadinimas per trumpas");
		}
		else if (strlen($title) > 50) {
			$this->formError->setError($field, "* Pavadinimas per ilgas");
		}
		else if (preg_match("/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:']+$/", $title) == 0) {
			$this->formError->setError($field, "* Netinkamas simbolis pavadinime");
		}
		$field = "description";  
	
		if(!empty($description)) {
			if (strlen($description) > 255) {
				$this->formError->setError($field, "* Aprašymas per ilgas");
			}
			else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:']+$/", $description) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis aprašyme");
			}
		}
		/* Errors exist, have user correct them */
		if($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: $this->referrer");
			
			return;
		}
		
		$username = $this->site->cleanOutput($this->username);
		$title  = $this->site->cleanOutput($title);
        $description  =  $this->site->cleanOutput($description);
		$category = $this->site->cleanOutput($category);
		$date = $this->site->cleanOutput($date);
		
        $q = "INSERT INTO ".TBL_EVENTS." (
				`title`, `description`, `event_date`, `event_user`, `event_category`, `repeat`, `timestamp`
				) 
                VALUES 
                    ('$title', '$description', '$date', '$username', '$category', '$repeat', '$timestamp')";
        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

         header("Location: $path");
    }
    /**
     * editEvent
     */
    function editEvent() {
		 
        $eventid  = $_POST['event-id'];
        $title  = $_POST['title'];
        $description  =  $_POST['description'];
		$category = $_POST['category'];
		$repeat = isset($_POST['repeat']) ? '1' : '0';
		$date = $_POST['event-date'];
		$path = $this->referrer;
		
		if (strpos($path,'?edit-event') == true) {
			$path = substr($path, 0, strpos($path, '?edit-event'));
		}
		else if (strpos($path,'&edit-event') == true){
			$path = substr($path, 0, strpos($path, '&edit-event'));
		}
		
		$field = "title";  
		
		if(!$title || strlen($title = trim($title)) == 0){
			$this->formError->setError($field, "* Pavadinimas neįvestas");
		}
		else if (strlen($title) < 2) {
			$this->formError->setError($field, "* Pavadinimas per trumpas");
		}
		else if (strlen($title) > 50) {
			$this->formError->setError($field, "* Pavadinimas per ilgas");
		}
		else if (preg_match("/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:']+$/", $title) == 0) {
			$this->formError->setError($field, "* Netinkamas simbolis pavadinime");
		}
		$field = "description";  
	
		if(!empty($description)){
			if (strlen($description) > 255) {
				$this->formError->setError($field, "* Aprašymas per ilgas");
			}
			else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:']+$/", $description) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis aprašyme");
			}
		}
		$field = "event-date";  
	
		if (!$date || strlen($date = trim($date)) == 0) {
            $this->formError->setError($field, "* Data neįvesta");
        } 
		else if(preg_match("/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/", $date) == 0){
			$this->formError->setError($field, "* Datos formatas YYYY-MM-DD");
		}
		
		/* Errors exist, have user correct them */
		if($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: $this->referrer");
			
			return;
		}
		
		$eventid = $this->site->cleanOutput($eventid);
		$title  = $this->site->cleanOutput($title);
        $description  =  $this->site->cleanOutput($description);
		$category = $this->site->cleanOutput($category);
		$date = $this->site->cleanOutput($date);
		
        $q = "UPDATE ".TBL_EVENTS." 
				SET `title` = '$title', `description` = '$description', `event_date` = '$date', `event_category` = '$category', `repeat` = '$repeat'
				WHERE `event_id` = '$eventid'";

        $result = $this->database->query($q);
				
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

        header("Location: $path");
    }
	/**
     * displayConfirmDelete 
     */
    function displayConfirmDelete() {
        
		?>
		<div id="delete-calendar" style="display:none">
		<?php
		if (isset($_POST['delete-event'])) {
			$eventid = $_POST['event-id'];
			$confirmMessage = "Ar tikrai norite ištrinti šį įvykį?";
			$path = "events.php?edit-event=".$eventid;
			?>
			<form action="events.php" method="post">
				<div>
					<input type="hidden" id="confirm-event" name="confirm-event" value="<?php echo $eventid; ?>"/>
					<input type="hidden" id="confirm-event-delete" name="confirm-event-delete"/>
				</div>
			</form>
		<?php
		}
		if (isset($_POST['delete-category'])) {
			$categoryid = $_POST['category-id'];
			$confirmMessage = "Ar tikrai norite ištrinti šią kategoriją?";
			$path = "events.php?edit-category=".$categoryid;
			?>
			<form action="events.php" method="post">
				<div>
					<input type="hidden" name="confirm-category" value="<?php echo $categoryid; ?>"/>
					<input type="hidden" id="confirm-category-delete" name="confirm-category-delete"/>
				</div>
			</form>
		<?php
		}
		?>
		</div>
		<script type="text/javascript">
				var deleteConfirm = confirm("<?php echo $confirmMessage; ?>");
					if (deleteConfirm == true) {
					  document.forms[0].submit();
					}
					else {
					  window.location.href = "<?php echo $path; ?>";
					}
		</script>
		<?php
    }
	/**
     * deleteEventSubmit 
     */
    function deleteEventSubmit() {
	
		$eventid = $this->site->cleanOutput($_POST['confirm-event']);
		$path = $this->referrer;
		
		if (strpos($path,'?edit-event') == true) {
			$path = substr($path, 0, strpos($path, '?edit-event'));
		}
		else if (strpos($path,'&edit-event') == true){
			$path = substr($path, 0, strpos($path, '&edit-event'));
		}
		
        $q = "DELETE FROM ".TBL_EVENTS." WHERE `event_id` = '$eventid'";
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
        header("Location: $path");
    }
    /**
     * addCategory
     */
    function addCategory() {
		
		$username = $this->username;
		$name   = $_POST['name'];
        $color = $_POST['color'];
		$path = $this->referrer;
		
		if (strpos($path,'?add-category') == true) {
			$path = substr($path, 0, strpos($path, '?add-category'));
		}
		else if (strpos($path,'&add-category') == true){
			$path = substr($path, 0, strpos($path, '&add-category'));
		}
		
		/* Error checking */
		$field = "name";  
		
		if(!$name || strlen($name = trim($name)) == 0){
			$this->formError->setError($field, "* Pavadinimas neįvestas");
		}
		else if (strlen($name) < 2) {
			$this->formError->setError($field, "* Pavadinimas per trumpas");
		}
		else if (strlen($name) > 50) {
			$this->formError->setError($field, "* Pavadinimas per ilgas");
		}
		else if (preg_match("/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:']+$/", $name) == 0) {
			$this->formError->setError($field, "* Netinkamas simbolis pavadinime");
		}
		
		/* Errors exist, have user correct them */
		if($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: $this->referrer");
			
			return;
		}
		
		$username = $this->site->cleanOutput($username);
		$name   = $this->site->cleanOutput($name);
        $color = $this->site->cleanOutput($color);
		
        $q = "INSERT INTO ".TBL_EVENTS_CATEGORY." (
				`category_name`, `category_color`, `category_user`
				) 
                VALUES 
                    ('$name', '$color', '$username')";
					
        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		header("Location: $path");
    }

    /**
     * editCategory
     */
    function editCategory() {
		
		$categoryid  = $_POST['category-id'];
		$name   = $_POST['name'];
        $color = $_POST['color'];
		$path = $this->referrer;
		
		if (strpos($path,'?edit-category') == true) {
			$path = substr($path, 0, strpos($path, '?edit-category'));
		}
		else if (strpos($path,'&edit-category') == true){
			$path = substr($path, 0, strpos($path, '&edit-category'));
		}
		
		/* Error checking */
		$field = "name";  
		
		if(!$name || strlen($name = trim($name)) == 0){
			$this->formError->setError($field, "* Pavadinimas neįvestas");
		}
		else if (strlen($name) < 2) {
			$this->formError->setError($field, "* Pavadinimas per trumpas");
		}
		else if (strlen($name) > 50) {
			$this->formError->setError($field, "* Pavadinimas per ilgas");
		}
		else if (preg_match("/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:']+$/", $name) == 0) {
			$this->formError->setError($field, "* Netinkamas simbolis pavadinime");
		}
		
		/* Errors exist, have user correct them */
		if($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: $this->referrer");
			
			return;
		}
		
		$categoryid = $this->site->cleanOutput($categoryid);
		$name   = $this->site->cleanOutput($name);
        $color = $this->site->cleanOutput($color);

        $q = "UPDATE ".TBL_EVENTS_CATEGORY." 
				SET `category_name` = '$name', `category_color` = '$color'
				WHERE `category_id` = '$categoryid'";

        $result = $this->database->query($q);
				
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		header("Location: $path");
    }
    /**
     * deleteCategorySubmit 
     */
    function deleteCategorySubmit() {
	
		$categoryid = $this->site->cleanOutput($_POST['confirm-category']);
		$path = $this->referrer;
		
		if (strpos($path,'?edit-category') == true) {
			$path = substr($path, 0, strpos($path, '?edit-category'));
		}
		else if (strpos($path,'&edit-category') == true){
			$path = substr($path, 0, strpos($path, '&edit-category'));
		}
		
        $q = "DELETE FROM ".TBL_EVENTS." WHERE `event_category` = '$categoryid'";
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		$q = "DELETE FROM ".TBL_EVENTS_CATEGORY." WHERE `category_id` = '$categoryid'";
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
        header("Location: $path");
    }
	/**
     * displayCalendar 
     */
    function displayCalendar () {
		
		$username = $this->username;
		
		$this->displayHeader();
        
        if (isset($_GET['year']) && isset($_GET['month']) && isset($_GET['day'])) {
            $year  = $_GET['year'];
            $month = $_GET['month']; 
            $month = str_pad($month, 2, "0", STR_PAD_LEFT);
            $day   = $_GET['day'];
            $day   = str_pad($day, 2, "0", STR_PAD_LEFT);

            $this->events->displayCalendar($username, $year, $month, $day);
        }
        
        else {
           $this->events->displayCalendar($username);
        }

        $this->displayFooter();
    }
};
$eventsPage = new EventsPage($database, $form, $events, $usermanagement, $site);