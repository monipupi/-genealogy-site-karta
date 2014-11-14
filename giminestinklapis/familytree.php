<?php
session_start();

define('URL_PREFIX', '');

include('familytree_class.php');
include('usermanagement_class.php');
include_once('site.php');

class FamilyTreePage {

	var $database;
	var $form;
	var $familytree;
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
    
    function FamilyTreePage($database, $form, $familytree, $usermanagement, $site) {
	
		$this->database = $database;
		$this->formError = $form;
		$this->familytree = $familytree;
		$this->usermanagement = $usermanagement;
		$this->site = $site;
		$this->time = time();
		$this->setSessionVariables();
		
		$this->template = array(
            'sitename'      => 'Karta',
            'pagetitle'     => 'Medis ir profiliai',
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
		$this->relatives = array(
			'father', 
			'mother', 
			'spouse', 
			'brother', 
			'sister', 
			'son', 
			'daughter'
		);
		$this->familyMembers = $this->familytree->getCurrentUserFamily($this->username);
			
		if (isset($_GET['tree'])) {
            $this->currentTreeUserId = $_GET['tree'];
        }
        else {
            $this->currentTreeUserId = $this->familytree->getCurrentUserID($this->username);
        }
		if (isset($_GET['leaf'])) {
            $this->leafId = $_GET['leaf'];
        }
		else if (isset($_GET['tree'])) {
            $this->leafId = $_GET['tree'];
        }
        else {
            $this->leafId = $this->currentTreeUserId;
        }
		if (isset($_GET['profile'])) {
			if ($_GET['profile'] == 0) {
				  $this->currentProfileId = $this->familytree->getCurrentUserID($this->username);
			}
			else {
				$this->currentProfileId = $_GET['profile'];
			}
        }
		if ((!empty($this->currentTreeUserId) && !in_array($this->currentTreeUserId, $this->familyMembers)) ||
			(!empty($this->leafId) && !in_array($this->leafId, $this->familyMembers))) {
			header("Location: familytree.php");
			return;
		}
		if (!empty($this->currentProfileId) && !in_array($this->currentProfileId, $this->familyMembers)) {
			header("Location: familytree.php?profile=0");
			return;
		}
		if (isset($_POST['add-individual'])) {
			$this->addNewIndividual();
		}
		if (isset($_POST['edit-individual'])) {
			$this->editIndividual();
		}
		if (isset($_POST['edit-relationship'])) {
			$this->editRelationship();
		}
		if (isset($_POST['confirm-avatar-delete'])) {
			$this->deleteAvatarSubmit();
		}
		if (isset($_POST['confirm-delete'])) {
			$this->deleteIndividualSubmit();
		}
		if (isset($_GET['option'])) {
			$this->option = $_GET['option'];
			
			if ($this->option == 'delete-individual' && !isset($_POST['confirm-delete'])) {
				$this->displayConfirmDelete();
			}
			else if ($this->option == 'delete-avatar' && !isset($_POST['confirm-avatar-delete'])) {
				$this->displayConfirmDelete();
			}
			if (in_array($this->option, $this->relatives)) {
				$this->displayAddIndividualForm();
			}
			if ($this->option == 'edit') {
				$this->displayEditIndividualForm();
			}
        }
		else if (isset($_GET['edit-rel'])) {
				$this->displayEditRelationshipForm();
		}
		else if (isset($_GET['profile'])) {
			$this->displayIndividualProfile();
		}
		else {
			$this->displayFamilyTree();
		}
		
    }
	/**
     * setSessionVariables - Determines if the the user has logged in already,
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
     * displayAddIndividualForm 
     */
    function displayAddIndividualForm() {
        
		$type = $this->option;
        $leafid   = $this->leafId;
		$individualid   = $this->currentTreeUserId;
		$this->displayHeader();
		$this->familytree->displayCreateIndividualForm($type, $individualid, $leafid);
		$this->displayFooter();
	}
	 /**
     * displayEditIndividualForm 
     */
    function displayEditIndividualForm() {
        
        $leafid   = $this->leafId;
		$this->displayHeader();
		$this->familytree->displayEditIndividualForm($leafid);
		$this->displayFooter();
	}
	/**
     * displayEditRelationshipForm 
     */
    function displayEditRelationshipForm() {
        
        $leafid   = $this->leafId;
		$relationshipid = $_GET['edit-rel'];
		$this->displayHeader();
		$this->familytree->displayEditRelationshipForm($leafid, $relationshipid);
		$this->displayFooter();
	}
	/**
     * displayIndividualProfile
     */
    function displayIndividualProfile() {
        
		$username   = $this->username;
        $individualid   = $this->currentProfileId;
		$this->displayHeader();
		$this->familytree->displayIndividualProfile($username, $individualid);
		$this->displayFooter();
	}
	 /**
     * addNewIndividual
     */
    function addNewIndividual() {
        
		$type = $_POST['type'];
        $leafid   = $_POST['leafid'];
		$individualid   = $this->currentTreeUserId;
		$fname  =  $_POST['fname'];
        $lname  =  $_POST['lname'];
		$mname = isset($_POST['mname']) ? $_POST['mname'] : '';
		$bdate = $_POST['bdate'];
		$bplace = $_POST['bplace'];
		$ddate = $_POST['ddate'];
        $gender = $_POST['gender'];
        $bio = $_POST['bio'];
		$family   = $_POST['family'];
		$username = $this->username;
		$timestamp = $this->time;
		$path = "familytree.php?tree=$leafid";

		/* Error checking */
        $field = "fname"; 
        if (!$fname || strlen($fname = trim($fname)) == 0) {
            $this->formError->setError($field, "* Vardas neįvestas");
        } 
		else {
            if (strlen($fname) < 2) {
                $this->formError->setError($field, "* Vardas per trumpas");
            } else if (strlen($fname) > 30) {
                $this->formError->setError($field, "* Vardas per ilgas");
            }
            else if (preg_match("/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $fname) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis varde");
			}
        }
        $field = "lname";  
        if (!$lname || strlen($lname = trim($lname)) == 0) {
            $this->formError->setError($field, "* Pavardė neįvesta");
        } 
		else {
            /* Check length */
            if (strlen($lname) < 2) {
                $this->formError->setError($field, "* Pavardė per trumpa");
            } else if (strlen($lname) > 30) {
                $this->formError->setError($field, "* Pavardė per ilga");
            }
            else if (preg_match("/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $lname) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis pavardėje");
			}
        }
		/* Maiden name error checking */
        $field = "mname";
		
		if(!empty($mname)) {
			if (strlen($mname) < 2) {
				$this->formError->setError($field, "* Pavardė per trumpa");
			} 
			else if (strlen($mname) > 30) {
				$this->formError->setError($field, "* Pavardė per ilga");
			}
			else if (preg_match("/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $mname) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis pavardėje");
			}
		}		
		/* Birth place error checking */
        $field = "bplace";
		
		if(!empty($bplace)) {
			if (strlen($bplace) > 50) {
				$this->formError->setError($field, "* Įvedėte per daug simbolių");
			}
			else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:'()]+$/", $bplace) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
		}	
		/* Check dates */
		$field = "bdate";
		
		if(!empty($bdate)) {
			if(preg_match("/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/", $bdate) == 0){
				$this->formError->setError($field, "* Datos formatas YYYY-MM-DD");
			}
		}
		$field = "ddate";
		if(!empty($ddate)) {
			if(preg_match("/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/", $ddate) == 0){
				$this->formError->setError($field, "* Datos formatas YYYY-MM-DD");
			}
		}
		/* Check biography */
		$field = "bio";
		
		if(!empty($bio)) {
			if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:'()]+$/", $bio) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
		}	
		
		if ($this->formError->num_errors > 0) {
            $_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: ".$this->referrer);
			return;
        }
		
		$fname  =  $this->site->cleanOutput($fname);
        $lname  =  $this->site->cleanOutput($lname);
		$mname = $this->site->cleanOutput($mname);
		$bdate = $this->site->cleanOutput($bdate);
		$bplace = $this->site->cleanOutput($bplace);
		$ddate = $this->site->cleanOutput($ddate);
        $gender = $this->site->cleanOutput($gender);
        $bio = $this->site->cleanOutput($bio);
		$avatar = ($gender == 'Male' ? 'male.jpg' : 'female.jpg'); 
		$family   = $this->site->cleanOutput($family);
		$username = $this->site->cleanOutput($username);
		
        // Insert new user
		$q = "INSERT INTO ".TBL_INDIVIDUALS." (
				fname, lname, mname, birth_date, birth_place, death_date, gender, biography, avatar, individual_family, added_username, timestamp
				) 
                VALUES 
                    ('$fname', '$lname', '$mname', '$bdate', '$bplace', '$ddate', '$gender', '$bio', '$avatar', '$family', '$username', '$timestamp')";
        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		else {
			$q = "SELECT individual_id 
					FROM ".TBL_INDIVIDUALS." 
					WHERE added_username = '$username'
					ORDER BY timestamp DESC
					LIMIT 1";
			$result = $this->database->query($q);
				
			if ($result == false) {
				$result .= die(mysql_error());
				return;
			}
			else {
				list($lastid) = mysql_fetch_array($result);
			}
		}

        // Add this new user as a relationship
        if ($type == 'spouse') {
            $this->familytree->addSpouse($lastid, $leafid);
        }
        if ($type == 'father' || $type == 'mother') {
            $this->familytree->addChild($leafid, $lastid);
        }
        if ($type == 'son' || $type == 'daughter') {
            $this->familytree->addChild($lastid, $leafid);
			if (isset($_POST['parent'])) {
				$parentid = $_POST['parent'];
				$this->familytree->addChild($lastid, $parentid);
			}
        }
		if ($type == 'brother' || $type == 'sister') {
			$parents = $this->familytree->getParents($leafid);
			foreach ($parents as $parent) {
				$parentid = $parent['individual_id'];
				$this->familytree->addChild($lastid, $parentid);
			}
        }
    
        header("Location: $path");
    }
	/**
     * editIndividual
     */
    function editIndividual() {
        
        $leafid   = $_POST['leafid'];
		$fname  =  $_POST['fname'];
        $lname  =  $_POST['lname'];
		$mname = isset($_POST['mname']) ? $_POST['mname'] : '';
		$bdate = $_POST['bdate'];
		$bplace = $_POST['bplace'];
		$ddate = $_POST['ddate'];
        $bio = $_POST['bio'];
		$timestamp = $this->time;
        
		/* Error checking */
        $field = "fname"; 
        if (!$fname || strlen($fname = trim($fname)) == 0) {
            $this->formError->setError($field, "* Vardas neįvestas");
        } 
		else {
            if (strlen($fname) < 2) {
                $this->formError->setError($field, "* Vardas per trumpas");
            } else if (strlen($fname) > 30) {
                $this->formError->setError($field, "* Vardas per ilgas");
            }
            else if (preg_match("/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $fname) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis varde");
			}
        }
        $field = "lname";  
        if (!$lname || strlen($lname = trim($lname)) == 0) {
            $this->formError->setError($field, "* Pavardė neįvesta");
        } 
		else {
            /* Check length */
            if (strlen($lname) < 2) {
                $this->formError->setError($field, "* Pavardė per trumpa");
            } else if (strlen($lname) > 30) {
                $this->formError->setError($field, "* Pavardė per ilga");
            }
            else if (preg_match("/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $lname) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis pavardėje");
			}
        }
		/* Maiden name error checking */
        $field = "mname";
		
		if(!empty($mname)) {
			if (strlen($mname) < 2) {
				$this->formError->setError($field, "* Pavardė per trumpa");
			} 
			else if (strlen($mname) > 30) {
				$this->formError->setError($field, "* Pavardė per ilga");
			}
			else if (preg_match("/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $mname) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis pavardėje");
			}
		}		
		/* Birth place error checking */
        $field = "bplace";
		
		if(!empty($bplace)) {
			if (strlen($bplace) > 50) {
				$this->formError->setError($field, "* Įvedėte per daug simbolių");
			}
			else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:'()]+$/", $bplace) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
		}	
		/* Check dates */
		$field = "bdate";
		
		if(!empty($bdate)) {
			if(preg_match("/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/", $bdate) == 0){
				$this->formError->setError($field, "* Datos formatas YYYY-MM-DD");
			}
		}
		$field = "ddate";
		if(!empty($ddate)) {
			if(preg_match("/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/", $ddate) == 0){
				$this->formError->setError($field, "* Datos formatas YYYY-MM-DD");
			}
		}
		/* Check biography */
		$field = "bio";
		
		if(!empty($bio)) {
			if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:'()]+$/", $bio) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
		}	
		
		if ($this->formError->num_errors > 0) {
            $_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: ".$this->referrer);
			return;
        }

		$leafid   = $this->site->cleanOutput($_POST['leafid']);
        $fname  =  $this->site->cleanOutput($fname);
        $lname  =  $this->site->cleanOutput($lname);
		$mname = $this->site->cleanOutput($mname);
		$bdate = $this->site->cleanOutput($bdate);
		$bplace = $this->site->cleanOutput($bplace);
		$ddate = $this->site->cleanOutput($ddate);
        $bio = $this->site->cleanOutput($bio);
		$path = "familytree.php?tree=$leafid";

        $q = "UPDATE ".TBL_INDIVIDUALS." 
				SET fname = '$fname', lname = '$lname', mname = '$mname', birth_date = '$bdate', 
				birth_place = '$bplace', death_date = '$ddate', biography = '$bio'
				WHERE individual_id = '$leafid'";

        $result = $this->database->query($q);
				
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
        header("Location: $path");
    }
	/**
     * editRelationship
     */
    function editRelationship() {
        
		$leafid = $_POST['leafid'];
		$relationshipid = $_POST['relationshipid'];
		$sdate  =  $_POST['sdate'];
        $edate  =  $_POST['edate'];
		$ended = $_POST['married_divorced_options'];
		$path = "familytree.php?tree=$relationshipid&leaf=$leafid";
        
		/* Check dates */
		$field = "sdate";
		
		if(!empty($sdate)) {
			if(preg_match("/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/", $sdate) == 0){
				$this->formError->setError($field, "* Datos formatas YYYY-MM-DD");
			}
		}
		$field = "edate";
		if(!empty($edate)) {
			if(preg_match("/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/", $edate) == 0){
				$this->formError->setError($field, "* Datos formatas YYYY-MM-DD");
			}
		}
		
		if ($this->formError->num_errors > 0) {
            $_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: ".$this->referrer);
			return;
        }

        $this->familytree->editRelationship($leafid, $relationshipid, $sdate, $edate, $ended);
		$this->familytree->editRelationship($relationshipid, $leafid, $sdate, $edate, $ended);
	

        header("Location: $path");
    }
	 /**
     * displayConfirmDelete 
     */
    function displayConfirmDelete() {
        
		?>
		<div id="delete-family-tree" style="display:none">
		<?php
		if ($this->option == "delete-individual") {
			$treeid = $this->currentTreeUserId;
			$leafid = $this->leafId;
			$path = $this->url;
			
			if (strpos($path,'?option') == true) {
				$path = substr($path, 0, strpos($path, '?option'));
			}
			else if (strpos($path,'&option') == true){
				$path = substr($path, 0, strpos($path, '&option'));
			}
			
			$confirmMessage = "Ar tikrai norite ištrinti šį asmenį?";
			?>
			<form action="familytree.php" method="post">
				<div>
					<input type="hidden" name="delete-tree" value="<?php echo $treeid; ?>"/>
					<input type="hidden" name="delete-leaf" value="<?php echo $leafid; ?>"/>
					<input type="hidden" id="confirm-delete" name="confirm-delete" value="confirm-delete"/>
				</div>
			</form>
		<?php
		}
		if ($this->option == "delete-avatar") {
			$treeid = $this->currentTreeUserId;
			$leafid = $this->leafId;
			$path = $this->url;
			
			if (strpos($path,'?option') == true) {
				$path = substr($path, 0, strpos($path, '?option'));
			}
			else if (strpos($path,'&option') == true){
				$path = substr($path, 0, strpos($path, '&option'));
			}
			$confirmMessage = "Ar tikrai norite ištrinti profilio nuotrauką?";
			
			?>
			<form action="familytree.php" method="post">
				<div>
					<input type="hidden" name="delete-avatar" value="<?php echo $leafid; ?>"/>
					<input type="hidden" id="confirm-avatar-delete" name="confirm-avatar-delete"/>
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
     * deleteIndividualSubmit 
     */
    function deleteIndividualSubmit() {
        
		$leafid = $this->site->cleanOutput($_POST['delete-leaf']);
		$treeid = $_POST['delete-tree'];
		$path = "familytree.php?tree=$treeid";
		
        $q = "DELETE FROM ".TBL_INDIVIDUALS." WHERE individual_id = '$leafid'";
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		$q = "DELETE FROM ".TBL_RELATIONSHIPS." 
				WHERE individual = '$leafid'
				OR relationship_individual = '$leafid'";
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
        header("Location: $path");
    }
	/**
     * deleteAvatarSubmit 
     */
    function deleteAvatarSubmit() {
        
		$treeid = $this->currentTreeUserId;
		$leafid = $this->site->cleanOutput($_POST['delete-avatar']);
		$path = "familytree.php?tree=$treeid&leaf=$leafid";
		
		$q = "SELECT gender
				FROM ".TBL_INDIVIDUALS." 
				WHERE individual_id = '$leafid'";

        $result = $this->database->query($q);
				
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		list($gender) = mysql_fetch_array($result);
		
		$avatar = ($gender == 'Male' ? 'male.jpg' : 'female.jpg');
		
		$q = "UPDATE ".TBL_INDIVIDUALS." 
				SET avatar = '$avatar'
				WHERE individual_id = '$leafid'";

        $result = $this->database->query($q);
				
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
        header("Location: $path");
    }
	/**
     * displayFamilyTree 
     */
    function displayFamilyTree () {
		
		$username = $this->username;
        $leafid   = $this->leafId;
		$individualid   = $this->currentTreeUserId;

        $this->displayHeader();

        $this->familytree->displayFamilyTree($username, $individualid, $leafid);
		
        $this->displayFooter();
    }
};

$familyTreePage = new FamilyTreePage($database, $form, $familytree, $usermanagement, $site); 
?>
