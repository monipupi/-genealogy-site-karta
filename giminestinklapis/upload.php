<?php
session_start();

define('URL_PREFIX', '');

include('upload_class.php');
include('usermanagement_class.php');
include_once('site.php');

class UploadPage {
	
	var $database;
    var $form;
	var $upload;
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
	
    function UploadPage($database, $form, $upload, $usermanagement, $site) {
	
		$this->database = $database;
		$this->formError = $form;
		$this->upload = $upload;
		$this->usermanagement = $usermanagement;
		$this->site = $site;
		$this->time = time();
		$this->setSessionVariables();
		
		$this->template = array(
            'sitename'      => 'Karta',
            'pagetitle'     => '',
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
		
		$this->familyMembers = $this->upload->getCurrentUserFamily($this->username);
		$this->familyCategories = $this->upload->getFamilyCategories($this->username);
		
		/* Upload photo form */
		if (isset($_GET['photo'])) {
			if (!empty($_GET['photo']) && !in_array($_GET['photo'], $this->familyCategories)) {
				header("Location: ".$this->referrer);
				return;
			}
			$this->displayUploadPhotoForm();
		}
		/* Upload avatar form */
		else if (isset($_GET['avatar'])) {
			if (!empty($_GET['avatar']) && !in_array($_GET['avatar'], $this->familyMembers)) {
				header("Location: ".$this->referrer);
				return;
			}
			$this->displayUploadAvatarForm();
		}
		else if (isset($_POST['submit-photo'])) {
			$this->uploadPhoto();
		}
		else if (isset($_POST['submit-avatar'])) {
			$this->uploadAvatar();
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
	* displayUploadPhotoForm
	*/
	function displayUploadPhotoForm() {
		
		$categoryid   = $_GET['photo'];
		$this->displayHeader();
		$this->upload->displayUploadPhotoForm($categoryid);
		$this->displayFooter();
	}
	/**
	* displayUploadAvatarForm
	*/
	function displayUploadAvatarForm() {
	
		$individualid   = $_GET['avatar'];
		$this->displayHeader();
		$this->upload->displayUploadAvatarForm($individualid);
		$this->displayFooter();
	}
	/**
	* uploadPhoto
	*/
	function uploadPhoto() {
		
		$username   = $this->username;
		$cid = $_POST['category'];
		$photo = $_FILES['photo']['name'];
		$tmp_photo = $_FILES['photo']['tmp_name'];
		$caption = $_POST['caption'];
		$path = "photogallery.php?cid=$cid";
		
		$this->displayHeader();
		$this->upload->uploadPhoto($username, $cid, $photo, $tmp_photo, $caption);
		$this->displayFooter();
		
		/* Errors exist, have user correct them */
		if($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: $this->referrer");
			
			return;
		}
		
		header("Location: $path");
	}
	/**
	* uploadAvatar
	*/
	function uploadAvatar() {
	
		$individualid   = $_POST['individualid'];
		$avatar = $_FILES['avatar']['name'];
		$tmp_avatar = $_FILES['avatar']['tmp_name'];
		$path = "familytree.php?tree=$individualid";
		
		$this->displayHeader();
		$this->upload->uploadAvatar($individualid, $avatar, $tmp_avatar);
		$this->displayFooter();
		
		/* Errors exist, have user correct them */
		if($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: $this->referrer");
			
			return;
		}
		
		header("Location: $path");
	}
 };
$uploadPage = new UploadPage($database, $form, $upload, $usermanagement, $site);
?>