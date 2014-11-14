<?php 
session_start();

define('URL_PREFIX', '');

include('usermanagement_class.php');
include_once('include/form.php');
include_once('include/mailer.php');
include_once('site.php');
    
class PrivateMessages {

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
	
    function PrivateMessages($database, $form, $mailer, $usermanagement, $site) {
	
		$this->database = $database;
		$this->formError = $form;
		$this->mailer = $mailer;
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
		
		$this->currentUserMessages = $this->getCurrentUserMessages($this->username);
		
		if (isset($_GET['compose']))
        {
            $this->displayComposeForm();
        }
        elseif (isset($_POST['submit']))
        {
            $this->sendPrivateMessage();
        }
        elseif (isset($_GET['pm']))
        {	
			if (!empty($_GET['pm']) && !in_array($_GET['pm'], $this->currentUserMessages)) {
				header("Location: privatemsg.php");
				return;
			}
            $this->displayPrivateMessage();
        }
		
        elseif (isset($_GET['sent']))
        {
			if (!empty($_GET['sent']) && !in_array($_GET['sent'], $this->currentUserMessages)) {
				header("Location: privatemsg.php");
				return;
			}
            $this->displaySentMessage();
        }
        elseif (isset($_GET['folder']))
        {
            $this->displaySentFolder();
        }
		else if (isset($_POST['delete']) && !isset($_POST['confirm-delete']))
        {
            $this->displayConfirmDelete();
        }
        elseif (isset($_POST['confirm-delete']))
        {
            $this->deleteMessageSubmit();
        }
        else
        {
            $this->displayInbox();
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
			// Calculate number of private messages
			$this->num_msg = $this->getNumMessages($this->username);
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
     * displayMessagesHeader 
     */ 
    function displayMessagesHeader() {
		
		$username = $this->username;
        $header = 'Gautieji';

		if ($this->getNumMessages($username) > 0) {
			$header = sprintf('Gautieji (%d)', $this->getNumMessages($username));
		}
		?>
		<div class="pm_panel">
			<div class="pm_left">
				<div class="pm_side">
					<div class="pm_menu">
						<h1>Pašto dėžutė</h1>
						<ul>
							<li>
								<p>
									<a class="pm_inbox_icon" href="privatemsg.php#menu"><?php echo $header; ?></a>
								</p>
							</li>
							<li>
								<p>
									<a class="pm_sent_icon" href="privatemsg.php?folder=sent#menu">Išsiųsti</a>
								</p>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="pm_right">
				<div class="pm_composeBtn">
					<a href="?compose=new#menu">Nauja žinutė</a>
				</div>
		<?php
    }
	/**
     * displayMessagesFooter 
     */
    function displayMessagesFooter() {		 
		?>
		 </div>
	</div>
	<?php
    }
	/**
     * getCurrentUserMessages
     * 
     * Used to get ids array of all the messages of the user. 
     */
	function getCurrentUserMessages($username) {
		 
		 $username = $this->site->cleanOutput($username);
		 
		$q = "SELECT `message_id` 
			FROM ".TBL_MESSAGES."
			WHERE `recipient` = '$username'
			OR `sender` = '$username'";
		
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		$userMessages = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$userMessages[] = $row['message_id'];
			}
		}
		return $userMessages;
	}
    /**
     * displayComposeForm 
     */
    function displayComposeForm() {
        
        $subject = '';
		$username = $this->username;
		$username = $this->site->cleanOutput($username);
		$this->displayHeader();
		$this->displayMessagesHeader();

        if (isset($_GET['subject'])) {
            $subject = sprintf('RE: %s', $_GET['subject']);
        }

		$q = "SELECT fname, lname, individual_username
                FROM ".TBL_INDIVIDUALS."
                WHERE individual_family = (
					SELECT individual_family 
					FROM ".TBL_INDIVIDUALS." 
					WHERE individual_username = '$username'
				)
				AND individual_username is not NULL";
		
		$result = $this->database->query($q);
		
		if ($result === false) {
			$result .= die(mysql_error());
			return;
		}
			
		$num_rows = mysql_num_rows($result);
		$relatives = array();
			
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$relatives[] = $row;
			}
		}
		?>
		<div class="pm_form_container">
			<div class="form">
				<h1>Nauja žinutė</h1>
				<form method="post" id="newpmform" action="privatemsg.php">
					<div class="form_section subject">
						<h3>Tema</h3>
						<input type="text" id="subject" name="subject" value="<?php echo $subject; ?>" placeholder="Rašykite temą čia"/>
						<?php echo $this->formError->error("subject"); ?>
					</div>
					<div class="form_section recipient">
						<h3>Gavėjas</h3>
						<select name="recipient">
							<?php
							if (count($relatives) > 0) {
								foreach ($relatives as $relative) {
									?>
									<option value="<?php echo $relative['individual_username']; ?>"><?php echo $relative['fname'].' '.$relative['lname']; ?></option>
									<?php
								}
							}
							?>	
						</select>
					</div>
					<div class="form_section message">
						<h3>Žinutė</h3>
						<textarea name="message" id="message" type="text" placeholder="Rašykite žinutę čia"><?php echo $this->formError->value("message"); ?></textarea>
						<?php echo $this->formError->error("message"); ?>
					</div>
					<p class="submit">
						<input class="first-btn" type="submit" name="submit" value="Siųsti"/> &nbsp;
						<label>arba</label>&nbsp;
						<a href="privatemsg.php#menu">Atšaukti</a>
					</p>
				</form>
			</div>
		</div>
		<?php
		$this->displayMessagesFooter();
		$this->displayFooter();
    }

    /**
     * sendPrivateMessage 
     */
    function sendPrivateMessage() {
        
		$username = $this->username;
		$template = $this->template;
		$recipient    = $_POST['recipient']; 
        $subject = $_POST['subject'];
        $message   = $_POST['message'];
		$read = 0; 
		$timestamp = time();
		$sitename = $template['sitename'];
		$url = $this->site->getDomainAndDir();
		
		/* subject error checking */
        $field = "subject";
		
		if (!$subject || strlen($subject = trim($subject)) == 0) {
            $this->formError->setError($field, "* Tema neįvesta");
        } 
		else {
			if (strlen($subject) > 255) {
				$this->formError->setError($field, "* Įvedėte per daug simbolių");
			}
			else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:'()]+$/", $subject) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
		}	
		/* Check message body */
		$field = "message";
		
		if(!empty($message)) {
			if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:'()]+$/", $message) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
		}	
		
		if ($this->formError->num_errors > 0) {
            $_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: ".$this->referrer);
			return;
        } 
		
		$username = $this->site->cleanOutput($username);
		$recipient    = $this->site->cleanOutput($recipient); 
		$subject = $this->site->cleanOutput($subject);
        $message   = $this->site->cleanOutput($message);
		
		$q = "INSERT INTO ".TBL_MESSAGES." (
				`sender`, `recipient`, `subject`, `message`, `read`, `timestamp`
				) 
                VALUES 
                     ('$username', '$recipient', '$subject', '$message', '$read', '$timestamp')";
        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

        // Email the PM to the user
        $q = "SELECT `email` 
				FROM ".TBL_USERS." 
                WHERE `username` = '$recipient'";

        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		list($email) = mysql_fetch_array($result);  
		
		$this->mailer->sendPrivateMessage($username, $email, $subject, $message, $sitename, $url);

        header("Location: privatemsg.php");
    }

    /**
     * displayConfirmDelete 
     */
    function displayConfirmDelete() {
        
		?>
		<div id="delete-message" style="display:none">
			<form name="delMessage" action="privatemsg.php" method="post">
				<div>
				<?php
				foreach ($_POST['del'] as $messageid) {
					?>
					<input type="hidden" name="del[]" value="<?php echo $messageid; ?>"/>
					<?php
				}
			?>
					<input type="hidden" id="confirm-delete" name="confirm-delete" value="confirm-delete"/>
				</div>
			</form>
		</div>
		
	<script type="text/javascript">
			var deleteConfirm = confirm("Ar tikrai norite ištrinti šią žinutę?");
				if (deleteConfirm == true) {
				  document.delMessage.submit();
				}
				else {
				  window.location.href = "privatemsg.php";
				}
	</script>
	<?php
    }

    /**
     * deleteMessageSubmit 
     */
    function deleteMessageSubmit() {
        
		if (isset($_POST['del']) && strlen($_POST['del']) <= 0) {
			foreach ($_POST['del'] as $messageid) {
				$messageid = $this->site->cleanOutput($messageid);
				$q = "DELETE FROM ".TBL_MESSAGES." 
						WHERE `message_id` = '$messageid'";

				$result = $this->database->query($q);
			
				if ($result == false) {
					$result .= die(mysql_error());
					return;
				}
			}
		}
        header("Location: privatemsg.php");
    }

    /**
     * displayPrivateMessage 
     */
    function displayPrivateMessage() {
        
		$messageid = $this->site->cleanOutput($_GET['pm']);
		$username = $this->username;
		
		$this->displayHeader();
		$this->displayMessagesHeader();
		
		$q = "SELECT m.`message_id`, m.`sender`, m.`recipient`, m.`subject`, m.`message`, m.`read`,
				m.`timestamp`, i.`individual_id`, i.`individual_username`, i.`avatar`
                FROM ".TBL_MESSAGES." AS m
                LEFT JOIN ".TBL_INDIVIDUALS." AS i 
				ON m.`sender` = i.`individual_username`
                WHERE `recipient` = '$username'
				AND m.`message_id` = '$messageid'
                ORDER BY `timestamp` DESC";
		
		$result = $this->database->query($q);
		
		if ($result === false) {
			$result .= die(mysql_error());
			return;
		}
			
		$num_rows = mysql_num_rows($result);
		$privateMessages = array();
			
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$privateMessages[] = $row;
			}
		}
		
		$q = "UPDATE ".TBL_MESSAGES." 
                SET `read` = '1' 
                WHERE `message_id` = '$messageid'";

        $result = $this->database->query($q);
		
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
        foreach ($privateMessages as $privateMessage) {
			$message_id = $privateMessage['message_id'];
            $date = date('Y-m-d H:i', $privateMessage['timestamp']);
			$individual_id = $privateMessage['individual_id'];
            $avatar = $privateMessage['avatar'];
            $sender  = $privateMessage['sender'];
			$subject = $privateMessage['subject'];
			$message = $privateMessage['message'];

			?>
				<div class="pm_msg">
					<div class="user">
						<img src="uploads/avatars/large/<?php echo $avatar; ?>" alt="<?php echo $sender; ?>" title="<?php echo $sender; ?>"/>
						<h2><?php echo $subject; ?></h2>
						<p class="name">
							<a href="familytree.php?profile=<?php echo $individual_id; ?>#menu"><?php echo $sender; ?></a>
						</p>
						<p class="date"><?php echo $date; ?></p>
					</div>
					<p class="message">
						<?php echo $message; ?>
					</p>
					<div class="pm_msg_replyBtn">
						<a href="?compose=new&amp;id=<?php echo $sender.'&amp;subject='.$subject; ?>#menu">Atsakyti</a>
					</div>
				</div>
		<?php
		}
		$this->displayMessagesFooter();
		$this->displayFooter();
    }

    /**
     * displaySentMessage
     */
    function displaySentMessage() {
        
		$messageid = $this->site->cleanOutput($_GET['sent']);
		$username = $this->username;
		
		$this->displayHeader();
		$this->displayMessagesHeader();
		
		$q = "SELECT m.`message_id`, m.`sender`, m.`recipient`, m.`subject`, m.`message`, 
				m.`read`, m.`timestamp`, i.`individual_id`, i.`individual_username`, i.`avatar`
                FROM ".TBL_MESSAGES." AS m
                LEFT JOIN ".TBL_INDIVIDUALS." AS i 
				ON m.`recipient` = i.`individual_username`
                WHERE `sender` = '$username'
				AND m.`message_id` = '$messageid'
                ORDER BY `timestamp` DESC";
		
		$result = $this->database->query($q);
		
		if ($result === false) {
			$result .= die(mysql_error());
			return;
		}
			
		$num_rows = mysql_num_rows($result);
		$privateMessages = array();
			
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$privateMessages[] = $row;
			}
		}

        foreach ($privateMessages as $privateMessage) {
			$message_id = $privateMessage['message_id'];
            $date = date('Y-m-d H:i', $privateMessage['timestamp']);
			$individual_id = $privateMessage['individual_id'];
            $avatar = $privateMessage['avatar'];
            $recipient  = $privateMessage['recipient'];
			$subject = $privateMessage['subject'];
			$message = $privateMessage['message'];

			?>
				<div class="pm_msg">
					<div class="user">
						<img src="uploads/avatars/large/<?php echo $avatar; ?>" alt="<?php echo $recipient; ?>" title="<?php echo $recipient; ?>"/>
						<h2><?php echo $subject; ?></h2>
						<p class="name">
							<a href="familytree.php?profile=<?php echo $individual_id; ?>#menu"><?php echo $recipient; ?></a>
						</p>
						<p class="date"><?php echo $date; ?></p>
					</div>
					<p class="message">
						<?php echo $message; ?>
					</p>
				</div>
			<?php
		}
		$this->displayMessagesFooter();
		$this->displayFooter();
    }

    /**
     * displaySentFolder 
     */
    function displaySentFolder() {
        
		$username = $this->username;
		
		$this->displayHeader();
		$this->displayMessagesHeader();
		
		?>
                <table class="pm" cellpadding="0" cellspacing="0">
                    <tr>
                        <th><p>Gavėjas</p></th>
						<th><p>Tema</p></th>
						<th><p>Laikas</p></th>
                    </tr>
		<?php
		
		$q = "SELECT m.`message_id`, m.`sender`, m.`recipient`, m.`subject`, m.`message`, 
				m.`read`, m.`timestamp`, i.`individual_username`, i.`avatar`
                FROM ".TBL_MESSAGES." AS m
                LEFT JOIN ".TBL_INDIVIDUALS." AS i 
				ON m.`recipient` = i.`individual_username`
                WHERE `sender` = '$username'
                ORDER BY `timestamp` DESC";
		
		$result = $this->database->query($q);
		
		if ($result === false) {
			$result .= die(mysql_error());
			return;
		}
			
		$num_rows = mysql_num_rows($result);
		$privateMessages = array();
			
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$privateMessages[] = $row;
			}
		}

        foreach ($privateMessages as $privateMessage) {
			$message_id = $privateMessage['message_id'];
            $date = date('Y-m-d H:i', $privateMessage['timestamp']);
            $avatar = $privateMessage['avatar'];
            $recipient  = $privateMessage['recipient'];
			$subject = $privateMessage['subject'];

			?>
				<tr>
					<td>
						<div class="user">
							<img src="uploads/avatars/small/<?php echo $avatar; ?>" alt="<?php echo $recipient; ?>" title="<?php echo $recipient; ?>"/>
							<p class="name"><?php echo $recipient; ?></p>
						</div>
					</td>
					<td>
						<a href="?sent=<?php echo $message_id; ?>#menu"><?php echo $subject; ?></a>
					</td>
					<td>
						<p class="date"><?php echo $date; ?></p>
					</td>
				</tr>
			<?php
        }

		?>
				<tr><th colspan="5" class="pm_footer">&nbsp;</th></tr>
			</table>
		<?php
		$this->displayMessagesFooter();
		$this->displayFooter();
    }

    /**
     * displayInbox 
     */
    function displayInbox() {
		
		$username = $this->username;
		$username = $this->site->cleanOutput($username);
		$this->displayHeader();
		$this->displayMessagesHeader();
		
		?>
			<div class="pm_form">
				<form method="post" action="privatemsg.php">
					<table class="pm" cellpadding="0" cellspacing="0">
						<tr>
							<th><p>#</p></th>
							<th><p>Tema</p></th>
							<th><p>Žymėti</p></th>
						</tr>
		<?php

        $q = "SELECT m.`message_id`, m.`sender`, m.`recipient`, m.`subject`, m.`message`, 
				m.`read`, m.`timestamp`, i.`individual_username`, i.`avatar`
                FROM ".TBL_MESSAGES." AS m
                LEFT JOIN ".TBL_INDIVIDUALS." AS i 
				ON m.`sender` = i.`individual_username`
                WHERE `recipient` = '$username'
                ORDER BY `timestamp` DESC";
		
		$result = $this->database->query($q);
		
		if ($result === false) {
			$result .= die(mysql_error());
			return;
		}
			
		$num_rows = mysql_num_rows($result);
		$privateMessages = array();
			
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$privateMessages[] = $row;
			}
		}
		$counter = 0;
		
		foreach ($privateMessages as $privateMessage) {
			$counter++;
			$message_id = $privateMessage['message_id'];
			$date = date('Y-m-d H:i', $privateMessage['timestamp']);
			$avatar = $privateMessage['avatar'];
			$sender  = $privateMessage['sender'];
			$subject = $privateMessage['subject'];
			$rowClass   = '';
			$linkClass  = 'read';

			if ($privateMessage['read'] == 0) {
				$rowClass  = 'new';
				$linkClass = '';
			}
			?>
					<tr class="<?php echo $rowClass; ?>">
						<td><p><?php echo $counter; ?></p></td>
						<td>
							<div class="user">
								<img src="uploads/avatars/small/<?php echo $avatar; ?>" alt="<?php echo $sender; ?>" title="<?php echo $sender; ?>"/>
								<p class="name"><?php echo $sender; ?></p>
							</div>
							<a class="<?php echo $linkClass; ?>" href="?pm=<?php echo $message_id; ?>#menu"><?php echo $subject; ?></a>
							<p class="date"><?php echo $date; ?></p>
						</td>
						<td class="check"><input type="checkbox" name="del[]" value="<?php echo $message_id; ?>"/></td>
					</tr>
		<?php
		}
		?>
				</table>
				<p>
					<input type="submit" name="delete" value="Trinti pažymėtas"/>
				</p>
			</form>	
		</div>
	<?php
	$this->displayMessagesFooter();
	$this->displayFooter();
    }
	/**
    * getNumMessages - Returns the number of the received private messages. 
    */
   function getNumMessages($username) {
	 $q = "SELECT * 
			FROM ".TBL_MESSAGES."
			WHERE `recipient` = '$username'";
	 $result = $this->database->query($q);
	 $num_messages = mysql_numrows($result);
     
	 return $num_messages;
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
};
$privatemsg = new PrivateMessages($database, $form, $mailer, $usermanagement, $site);
?>