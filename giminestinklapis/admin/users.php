<?php 
session_start();

define('URL_PREFIX', '../');

include('../usermanagement_class.php');
include_once('../include/form.php');
include_once('../site.php');

class Users {

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
	function Users($database, $form, $usermanagement, $site) {
	  
		$this->database = $database;
		$this->formError = $form;
		$this->usermanagement = $usermanagement;
		$this->site = $site;
		$this->time = time();
		$this->setSessionVariables();

		$this->template = array(
			'sitename'      => 'Karta',
			'pagetitle'     => 'Tvarkyti vartotojus',
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
			
		if (isset($_GET['users-list'])) {
			$this->displayUsers();
		}
		else if (isset($_GET['ban-user']) && !isset($_POST['confirm-ban-user'])) {
			$this->displayConfirmDelete();
		}
		else if (isset($_POST['confirm-ban-user'])) {
			$this->banUserSubmit();
		}
		else if (isset($_GET['banned-list'])) {
			$this->displayBannedUsers();
		}
		else if (isset($_GET['delete-banned']) && !isset($_POST['confirm-delete-user'])){
			$this->displayConfirmDelete();
		}
		else if (isset($_POST['confirm-delete-user'])) {
			$this->deleteUserSubmit();
		}
		else if (isset($_GET['updlevel'])) {
			$this->upduser = $_GET['updlevel'];
			if ($_POST['sublevel-'.$this->upduser]) {
				$this->updateLevelSubmit();
			}
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
	* updateLevelSubmit - user's level is updated according to the admin's request.
	*/
	function updateLevelSubmit(){
	 
		$username = $_GET['updlevel'];
		$levelField = sprintf('updlevel-%s', $username);
		$level = $_POST[$levelField];
		$this->usermanagement->updateUserField($username, 'userlevel', $level);
		
		header("Location: users.php?users-list");
	}
	/**
	* banUserSubmit - the user is banned from the member system, which 
	* entails removing the username from the users table and adding
	* it to the banned users table.
	*/
	function banUserSubmit(){
	 
		$username = $this->site->cleanOutput($_POST['confirm-ban-username']);

		$q = "SELECT individual_id 
				FROM ".TBL_INDIVIDUALS." 
				WHERE `individual_username` = '$username'";
		
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
        }
		
		list($individualid) = mysql_fetch_array($result);
		
		$q = "DELETE FROM ".TBL_USERS." WHERE `username` = '$username'";
		
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());

        }
		else {	
			$q = "INSERT INTO ".TBL_BANNED_USERS." VALUES ('$username', $this->time)";
			$result = $this->database->query($q);
			
			if ($result == false) {
				$result .= die(mysql_error());
				return;
			}
			$this->usermanagement->updateIndividualField($individualid, 'individual_username', NULL);
		}
		header("Location: users.php?users-list");
	}
	/**
	* deleteUserSubmit - the user is deleted from the database.
	*/
	function deleteUserSubmit() {

		$username = $this->site->cleanOutput($_POST['confirm-delete-username']);
		
		$q = "DELETE FROM ".TBL_BANNED_USERS." WHERE `username` = '$username'";
		
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }	
		header("Location: users.php?banned-list");
	}
	/**
     * displayConfirmDelete 
     */
    function displayConfirmDelete() {
        
		?>
		<div id="delete-users" style="display:none">
		<?php
		if (isset($_GET['delete-banned'])) {
			$username = $_GET['delete-banned'];
			$confirmMessage = "Ar tikrai norite ištrinti šį vartotoją?";
			$path = "users.php?banned-list#menu";
			?>
			<form action="" method="post">
				<div>
					<input type="hidden" id="confirm-delete-username" name="confirm-delete-username" value="<?php echo $username; ?>"/>
					<input type="hidden" id="confirm-delete-user" name="confirm-delete-user"/>
				</div>
			</form>
		<?php
		}
		if (isset($_GET['ban-user'])) {
			$username = $_GET['ban-user'];
			$confirmMessage = "Ar tikrai norite blokuoti šį vartotoją?";
			$path = "users.php?users-list#menu";
			?>
			<form action="" method="post">
				<div>
					<input type="hidden" id="confirm-ban-username" name="confirm-ban-username" value="<?php echo $username; ?>"/>
					<input type="hidden" id="confirm-ban-user" name="confirm-ban-user"/>
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
	 * displayUsers - Displays the users database table in
	 * a nicely formatted html table.
	 */

	function displayUsers() {

		$this->displayHeader();
		
	   $q = "SELECT username, userlevel, timestamp 
				FROM ".TBL_USERS." 
				ORDER BY userlevel DESC, username";
	   
	   $result = $this->database->query($q);
	   
	   if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		$users = array();
		$levels = array();
		
		if ($num_rows <= 0) {
            echo "<div class='notice'><p>Užsiregistravusių vartotojų nėra</p></div>";
        }
		else {
			while ($row = mysql_fetch_assoc($result)) {
				$users[] = $row;
			}
			for ($i = 0; $i <= 2; $i++) {
				$name = '';
				if ($i == 0) {
					$name = 'Svečias';
				}
				else if ($i == 1) {
					$name = 'Vartotojas';
				}
				else {
					$name = 'Administratorius';
				}
				$levels[] = array("id"=>$i,"name"=>$name);
			}
			
			?>
			<div class="admin_panel">
				<table class="users_list">
					<thead>
						<tr>
							<th><p>#</p></th>
							<th><p>Vartotojo vardas</p></th>
							<th><p>Data</p></th>
							<th><p>Lygis</p></th>
						</tr>
					</thead>
					<tbody>
				<?php
				$counter = 0;
				
				foreach ($users as $user) {
					$counter++;
					
					$username = $user['username'];
					$userlevel = $user['userlevel'];
					$date = date('Y-m-d H:i', $user['timestamp']);
					?>
						<tr>
							<td><p><?php echo $counter; ?></p></td>
							<td><p class="name"><?php echo $username; ?></p></td>
							<td><p><?php echo $date; ?></p></td>
							<td>
								<div class="users_form">
									<form method="post" action="users.php?updlevel=<?php echo $username; ?>">
										<div id="updusers-<?php echo $username; ?>">
											<select id="updlevel-<?php echo $username; ?>" name="updlevel-<?php echo $username; ?>">
											<?php
											foreach ($levels as $level) {
												?>
												<option <?php if ($userlevel == $level['id']) echo 'selected="selected"'; ?> value="<?php echo $level['id']; ?>"><?php echo $level['name']; ?></option>
												<?php
											}
											?>
											</select>
											<input type="submit" id="sublevel-<?php echo $username; ?>" name="sublevel-<?php echo $username; ?>" value="Atnaujinti"/>&nbsp;
											<label>arba</label>&nbsp;
											<a href="users.php?ban-user=<?php echo $username; ?>#menu">Blokuoti</a>
										</div>
									</form>
								</div>
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
	 * displayBannedUsers - Displays the banned users
	 * database table in a nicely formatted html table.
	 */
	function displayBannedUsers() {
	   
	   $this->displayHeader();
	   
	   $q = "SELECT username, timestamp
				FROM ".TBL_BANNED_USERS." 
				ORDER BY username";
				
	   $result = $this->database->query($q);
	   
	   if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		$bannedUsers = array();
		
		if ($num_rows <= 0) {
            echo "<div class='notice'><p>Užblokuotų vartotojų nėra</p></div>";
        }
		else {
			while ($row = mysql_fetch_assoc($result)) {
				$bannedUsers[] = $row;
			}
		?>
		<div class="admin_panel">
			<table class="users_list">
				<thead>
					<tr>
						<th><p>#</p></th>
						<th><p>Vartotojo vardas</p></th>
						<th><p>Data</p></th>
					</tr>
				</thead>
				<tbody>
			<?php
			$counter = 0;
			
			foreach ($bannedUsers as $bannedUser) {
				$counter++;
				
				$username = $bannedUser['username'];
				$date = date('Y-m-d H:i:s', $bannedUser['timestamp']);
				?>
					<tr>
						<td><p><?php echo $counter; ?></p></td>
						<td><p class="name"><?php echo $username; ?></p></td>
						<td>
							<p><?php echo $date; ?></p>
							<div class="users_list_ban">
								<a href="users.php?delete-banned=<?php echo $username; ?>#menu">Trinti</a>
							</div>
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
};
$users = new Users($database, $form, $usermanagement, $site);
?>
