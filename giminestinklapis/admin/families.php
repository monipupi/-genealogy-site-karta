<?php 
session_start();

define('URL_PREFIX', '../');

include('../usermanagement_class.php');
include_once('../include/form.php');
include_once('../site.php');

class Families {

	var $database;
	var $form;
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
	
	/* Class constructor */
	function Families($database, $form, $usermanagement, $site) {
	  
		$this->database = $database;
		$this->formError = $form;
		$this->usermanagement = $usermanagement;
		$this->site = $site;
		$this->time = time();
		$this->setSessionVariables();

		$this->template = array(
			'sitename'      => 'Karta',
			'pagetitle'     => 'Tvarkyti svetaines',
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
		
		/* Make sure administrator is accessing page */
		if($this->username != ADMIN_NAME || $this->userlevel != ADMIN_LEVEL){
			header("Location: ../index.php");
			return;
		}
		
		if (isset($_GET['delete-family']) && !isset($_POST['confirm-delete-family'])) {
			$this->displayConfirmDelete();
		}
		else if (isset($_POST['confirm-delete-family'])) {
			$this->deleteFamilySubmit();
		}
		else {
			$this->displayFamilies();
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
	 * displayFamilies - Displays the list of all the families
	 * existing in the site in a nicely formatted html table.
	 */
	function displayFamilies() {
	   
	   $this->displayHeader();
	   
	   $q = "SELECT family_id, family_created, family_name, timestamp, (
					SELECT COUNT(manager_username) 
					FROM ".TBL_MANAGERS.", ".TBL_INDIVIDUALS."
					WHERE manager_family = family_id
					AND manager_username = individual_username
					AND individual_username is not NULL
				) AS managers
				FROM ".TBL_FAMILY."				
				ORDER BY timestamp DESC";
				
	   $result = $this->database->query($q);
	   
	   if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		$trees = array();
		
		if ($num_rows <= 0) {
            echo "<div class='notice'><p>Šeimos medžių nėra.</p></div>";
            return;
        }
		else {
			while ($row = mysql_fetch_assoc($result)) {
				$trees[] = $row;
			}
			?>
			<div class="admin_panel">
				<table class="families_list">
					<thead>
						<tr>
							<th><p>#</p></th>
							<th><p>Medis</p></th>
							<th><p>Sukūrė</p></th>
							<th><p>Valdytojai</p></th>
							<th><p>Data</p></th>
						</tr>
					</thead>
					<tbody>
				<?php
				$counter = 0;
				
				foreach ($trees as $tree) {
					$counter++;
					
					$id = $tree['family_id'];
					$name = $tree['family_name'].' šeimos medis';
					$firstManager = $tree['family_created'];
					$date = date('Y-m-d H:i', $tree['timestamp']);
					$managers = $tree['managers'];
					?>
					<tr>
						<td><p><?php echo $counter; ?></p></td>
						<td><p class="name"><?php echo $name; ?></p></td>
						<td><p><?php echo $firstManager; ?></p></td>
						<td><p><?php echo $managers; ?></p></td>
						<td>
							<p><?php echo $date; ?></p>
							<a href="?delete-family=<?php echo $id; ?>#menu">Trinti</a>
						</td>
					</tr>
					<?php
				}
				?>
					</tbody>
				</table>
			</div>
			<?php
			}
		$this->displayFooter();	
	}
	/**
     * displayConfirmDelete 
     */
    function displayConfirmDelete() {       
		?>
		<div id="delete-families" style="display:none">
		<?php
		if (isset($_GET['delete-family'])) {
			$familyid = $_GET['delete-family'];
			$confirmMessage = "Ar tikrai norite trinti šią šeimą?";
			$path = "families.php#menu";
			?>
			<form action="families.php" method="post">
				<div>
					<input type="hidden" id="confirm-family" name="confirm-family" value="<?php echo $familyid; ?>"/>
					<input type="hidden" id="confirm-delete-family" name="confirm-delete-family"/>
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
	* deleteFamilySubmit - deletes all the information of the family from the database.
	*/
	function deleteFamilySubmit() {
	  
		$familyid = $this->site->cleanOutput($_POST['confirm-family']);		 
		$individualids = $this->getFamilyIndividuals($familyid);
		$managers = $this->getFamilyManagers($familyid);
		$galleryCategories = $this->getGalleryCategories($managers);
		$galleryPhotos = $this->getGalleryPhotos($managers);
		$eventCategories = $this->getEventCategories($managers);	
		
		$this->deleteFamilyTree($individualids, $managers);
		$this->deleteGallery($galleryCategories, $galleryPhotos);
		$this->deleteEvents($eventCategories);
		$this->deleteMessages($managers);
		$this->deleteInvitations($managers);		
		
		header("Location: families.php");
	}
	/**
	* getFamilyIndividuals - gets the ids of all the individuals of given family.
	*/
	function getFamilyIndividuals($familyid) {
	  
		$familyid = $this->site->cleanOutput($familyid);
		
		$q = "SELECT individual_id FROM ".TBL_INDIVIDUALS." WHERE individual_family = '$familyid'";
		
		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		$individualids = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$individualids[] = $row['individual_id'];
			}
		}
		return $individualids;
	}
	/**
	* getFamilyManagers - gets the managers of given family.
	*/
	function getFamilyManagers($familyid) {
	  
		$familyid = $this->site->cleanOutput($familyid);
		
		$q = "SELECT manager_username FROM ".TBL_MANAGERS." WHERE manager_family = '$familyid'";
		
		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		$managers = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$managers[] = $row['manager_username'];
			}
		}
		return $managers;
	}
	/**
	* getGalleryCategories - gets the ids of all the categories of the gallery created by the members of given family.
	*/
	function getGalleryCategories($managers) {
	  
		$managers = $this->site->cleanOutput($managers);
		$managersString = '"' .implode('","', array_values($managers)). '"';
		
		$q = "SELECT `category_id`
				FROM ".TBL_GALLERY_CATEGORY." 
				WHERE `category_user` IN ($managersString)";
		
		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		$categories = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$categories[] = $row['category_id'];
			}
		}
		return $categories;
	}
	/**
	* getGalleryPhotos - gets the ids of all the photos of the gallery uploaded by the members of given family.
	*/
	function getGalleryPhotos($managers) {
	  
		$managers = $this->site->cleanOutput($managers);
		$managersString = '"' .implode('","', array_values($managers)). '"';
		
		$q = "SELECT `photo_id`
				FROM ".TBL_GALLERY_PHOTOS." 
				WHERE `photo_user` IN ($managersString)";
		
		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		$photos = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$photos[] = $row['photo_id'];
			}
		}
		return $photos;
	}
	/**
	* getEventCategories - gets the ids of all the categories of the events created by the members of given family.
	*/
	function getEventCategories($managers) {
	  
		$managers = $this->site->cleanOutput($managers);
		$managersString = '"' .implode('","', array_values($managers)). '"';
		
		$q = "SELECT `event_category` 
				FROM ".TBL_EVENTS." 
				WHERE `event_user` IN ($managersString)";
		
		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		$categories = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$categories[] = $row['event_category'];
			}
		}
		return $categories;
	}
	/**
	* deleteFamilyTree - deletes family tree of the given family.
	*/
	function deleteFamilyTree($individualids, $managers) {
	  
		$managers = $this->site->cleanOutput($managers);
		$individualids = $this->site->cleanOutput($individualids);

		foreach ($individualids as $individualid) {		
			unlink("../uploads/avatars/small/".$individualid);
			unlink("../uploads/avatars/large/".$individualid);
		}
		
		$managersString = '"' .implode('","', array_values($managers)). '"';
		$individualidsString = '"' .implode('","', array_values($individualids)). '"';
		
		$q = "DELETE FROM ".TBL_INDIVIDUALS." WHERE `individual_id` IN ($individualidsString)";
		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
	
		$q = "DELETE FROM ".TBL_RELATIONSHIPS." 
				WHERE `individual` IN ($individualidsString) 
				OR `relationship_individual` IN ($individualidsString)";
		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$q = "DELETE FROM ".TBL_FAMILY." WHERE family_created IN ($managersString)";
		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		$q = "DELETE FROM ".TBL_MANAGERS." WHERE manager_username IN ($managersString)";
		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
	}
	/**
	* deleteGallery - deletes photo gallery of the given family.
	*/
	function deleteGallery($categories, $photos) {
	  
		$categories = $this->site->cleanOutput($categories);
		$categoriesString = '"' .implode('","', array_values($categories)). '"';
		$photos = $this->site->cleanOutput($photos);
		
		foreach ($photos as $photo) {		
			unlink("../uploads/photos/".$photo);
			unlink("../uploads/photos/thumbs/"."thumb_".$photo);
		}
		
		$photosString = '"' .implode('","', array_values($photos)). '"';
			
		$q = "DELETE FROM ".TBL_GALLERY_PHOTOS." WHERE `photo_id` IN ($photosString)"; 
		$result = $this->database->query($q);
		 
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		  
		$q = "DELETE FROM ".TBL_GALLERY_CATEGORY." WHERE `category_id` IN ($categoriesString)";
		$result = $this->database->query($q);
		 
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$q = "DELETE FROM ".TBL_GALLERY_COMMENTS." WHERE `comment_category` IN ($categoriesString)";
		$result = $this->database->query($q);
		 
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$q = "DELETE FROM ".TBL_GALLERY_VOTES." WHERE `vote_category` IN ($categoriesString)";
		$result = $this->database->query($q);
		 
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
	}
	/**
	* deleteEvents - deletes all the events of the given family.
	*/
	function deleteEvents($categories) {
	  
		$categories = $this->site->cleanOutput($categories);
		$categoriesString = '"' .implode('","', array_values($categories)). '"';
		
		$q = "DELETE FROM ".TBL_EVENTS." WHERE `event_category` IN ($categoriesString)";
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		$q = "DELETE FROM ".TBL_EVENTS_CATEGORY." WHERE `category_id` IN ($categoriesString)";
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
	}
	/**
	* deleteMessages - deletes all the messages sent and received by the members of the given family.
	*/
	function deleteMessages($managers) {
	  
		$managers = $this->site->cleanOutput($managers);
		$managersString = '"' .implode('","', array_values($managers)). '"';
		
		$q = "DELETE FROM ".TBL_MESSAGES." WHERE `sender` IN ($managersString) 
				OR `recipient` IN ($managersString)";
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
	}
	/**
	* deleteInvitations - deletes all the invitations sent and received by the members of the given family.
	*/
	function deleteInvitations($managers) {
	  
		$managers = $this->site->cleanOutput($managers);
		$managersString = '"' .implode('","', array_values($managers)). '"';
		
		$q = "DELETE FROM ".TBL_INVITATIONS." WHERE `invitation_username` IN ($managersString)";
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
	}
};
$families = new Families($database, $form, $usermanagement, $site);
?>
