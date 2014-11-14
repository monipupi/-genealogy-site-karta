<?php
session_start();

define('URL_PREFIX', '');

include('usermanagement_class.php');
include_once('include/form.php');
include_once('include/mailer.php');
include_once('site.php');

class Invitation {

	var $database;
	var $form;
	var $mailer;
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
	
    function Invitation($database, $form, $mailer, $usermanagement, $site) {
	
		$this->database = $database;
		$this->formError = $form;
		$this->mailer = $mailer;
		$this->usermanagement = $usermanagement;
		$this->site = $site;
		$this->time = time();
		$this->setSessionVariables();
		
		$this->template = array(
            'sitename'      => 'Karta',
            'pagetitle'     => 'Pakvieskite prisijungti',
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
		
		if (isset($_GET['individual'])) {
			$this->inviteid = $_GET['individual'];
			if ($_POST['invite-'.$this->inviteid]) {
				$this->inviteToRegister();
			}
		}
		
		$this->displayInviteList($this->getCurrentUserID($this->username));
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
		/* Update users last active timestamp */ 
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
	* getCurrentUserID
	* Gets currently active user's ID form individuals table
	*/
	function getCurrentUserID($username) {
		 
		$username = $this->site->cleanOutput($username);

		$q = "SELECT individual_id FROM ".TBL_INDIVIDUALS." WHERE individual_username = '$username'";

		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
	
		list($individualid) = mysql_fetch_array($result);

		return $individualid;
	}
	/**
	* displayInviteList
	* Displays family members in list. Used for inviting unregistered members to join the site.
	*/
    function displayInviteList($individualid) {
        
		$individualid =  $this->site->cleanOutput($individualid);
		
		$this->displayHeader();
        
		// Get list of relationships that can be deleted
        $q = "SELECT individual_id, fname, lname, mname, avatar
                FROM ".TBL_INDIVIDUALS."
                WHERE individual_family = (
					SELECT individual_family
					FROM ".TBL_INDIVIDUALS."
					WHERE individual_id = '$individualid'
				)
				AND individual_id NOT IN (
					SELECT invitation_individual 
					FROM ".TBL_INVITATIONS."
				)
				AND death_date = '0000-00-00'
				AND individual_username is NULL";
		
		$result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		$familyMembers = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$familyMembers[] = $row;
			}
		}
		?>
		<div class="invite_panel">
			<table class="invite_list">
				<thead>
					<tr>
						<th><p>#</p></th>
						<th><p>Vardas, pavardė</p></th>
						<th><p>El. pašto adresas</p></th>
					</tr>
				</thead>
				<tbody>
		<?php
		$counter = 0;
		
        foreach ($familyMembers as $familyMember) {
			$counter++;
			if (!empty($familyMember['mname'])) {
				$name = $familyMember['fname'].' '.$familyMember['lname'].' ('.$familyMember['mname'].')';
			}
			else {
				$name = $familyMember['fname'].' '.$familyMember['lname'];
			}
			$id = 	$familyMember['individual_id'];
			$emailField = sprintf('email-%s', $id);
			?>
			<tr>
				<td><p><?php echo $counter; ?></p></td>
				<td>
					<img class="news avatar" src='uploads/avatars/small/<?php echo $familyMember['avatar']; ?>' alt=""/><p class="name"><?php echo $name; ?></p>
				</td>
				<td>
					<form class="invite-form" method="post" action="invitation.php?individual=<?php echo $id; ?>">
						<div id="invite-info-<?php echo $id; ?>">
							<input id="email-<?php echo $id; ?>" type="text" name="email-<?php echo $id; ?>" value= "<?php echo $this->formError->value($emailField); ?>" placeholder="Įveskite el. pašto adresą"/>
							<?php echo $this->formError->error($emailField); ?>
							<input type="submit" id="invite-<?php echo $id; ?>" name="invite-<?php echo $id; ?>" value="Kviesti"/>
						</div>
					</form>
				</td>
			</tr>
			<?php
        }
		?>
				</tbody>
			</table>
			<div class="invite_desc">
				<p>
				Nematote giminaičio sąraše? <a id="tree" href="familytree.php#menu">Pridėkite daugiau žmonių į savo medį</a>
				</p>
				<p>
				<b>Pastaba:</b> Pakviesti nariai turės pilną prieigą prie svetainės ir šeimos medžio. <a class="meaning_link" href="javascript: void(0)">Ką tai reiškia?</a>
				</p>
			</div>
			<div class="meaning_desc" title="Ką tai reiškia?" style="display:none">
				<p>
					Kai Jūs giminaičius pakviečiate tapti Jūsų šeimos svetainės nariais, jiems yra leista pridėti tokį turinį, kaip nuotraukos, įvykiai, komentarai. 
				</p>
				<p>
					Nariai Tai pat gali pridėti asmenis į šeimos medį ir kviesti kitus asmenis tapti Jūsų svetainės nariais.
				</p>
				<p>
					Pagrindiniame puslapyje esanti skiltis „<i>Naujienos</i>“ rodo, kai kuris nors narys atnaujina svetainę.
				</p>
			</div>
		</div>
		<script type="text/javascript">
		//<![CDATA[
			$(document).ready(function() {
				$(".meaning_desc").dialog({autoOpen: false}); 
				
				$(".meaning_link").click(function(e){ 
					$(".meaning_desc").dialog({
						modal:true,
						draggable: false,
						resizable: false,
						width: 400,
						height: "auto",
						position: [e.clientX, e.clientY],
						buttons: {
							Gerai: function() {
							  $( this ).dialog( "close" );
							}
						  }
					});
					$(".meaning_desc").dialog("open");
				});
				$(".meaning_desc").click(function(e){ 
					$(".meaning_desc").dialog("close");
				});
			}); 
		//]]>
		</script>
		<?php
				
		$this->displayFooter();
    }
	/**
	* inviteToRegister
	* Validates the given email then if everything is fine, an invitation code is generated and emailed to the given address.
	*/
	function inviteToRegister() {
		
		$template = $this->template;
		$sitename = $template['sitename'];
		$url = $this->site->getDomainAndDir();

		/* Email error checking */
		$individualid = $_GET['individual'];
		$emailField = sprintf('email-%s', $individualid);
		$email = $_POST[$emailField];
		$field = $emailField;  //Use field name for email

		if (!$email || strlen($email = trim($email)) == 0 ) {
			$this->formError->setError($field, "* Neįvestas el. pašto adresas");
		} 
		else {
			/* Check if valid email address */
			if(preg_match("/^[a-zA-Z]\w+(\.\w+)*@\w+(\.[0-9a-zA-Z]+)*\.[a-zA-Z]{2,4}$/", $email) == 0) {
				$this->formError->setError($field, "* Klaidingas el. pašto adresas");
			}
			/* Check if email is already in use */ 
			else if ($this->usermanagement->emailTaken(null, $email)) {
				$this->formError->setError($field, "* El. pašto adresas užimtas");
			}
			$individualid = $this->site->cleanOutput($individualid);
			$email = $this->site->cleanOutput($email);
		}

		/* Errors exist, have user correct them */
		if ($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: invitation.php");
		}
		/* Generate new password and email it to user */
		else {
			/* Generate invitation code */
			$invitationCode = $this->getRandomString(32);

			/* Get current username */
			$username = $this->site->cleanOutput($this->username);

			/* Attempt to send the email with new password */
			if($this->mailer->sendInvitation($username, $email, $invitationCode, $sitename, $url)){

				/* Email sent, update database */
				$q = "INSERT INTO ".TBL_INVITATIONS."(
						invitation_individual, email, invitation_code, invitation_username
						) 
						VALUES 
							('$individualid', '$email', '$invitationCode', '$username')";

				$result = $this->database->query($q);

				if ($result == false) {
					$result .= die(mysql_error());
					return;
				}
			}
			else {
				echo "<div class='notice'><p>Kvietimo išsiųsti nepavyko, bandykite dar kartą.</p></div>";
			}
			header("Location: $this->referrer");
		}
	}
	/**
	* getRandomString
	* Generates random invitation code from given symbols
	*/
	function getRandomString($length) {
		
		$invitationCode = '';
		$characters = '0123456789abcdefghijklmnopqrstuvwxyz';
		
		for ($i = 0; $i < $length; $i++) {
			$invitationCode .= $characters[mt_rand(0, strlen($characters))];
		}
		
		return $invitationCode;
	}
};
$invitation = new Invitation($database, $form, $mailer, $usermanagement, $site); 
?>
