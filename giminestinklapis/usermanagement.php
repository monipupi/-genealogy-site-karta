<?php
session_start();

define('URL_PREFIX', '');

include('usermanagement_class.php');
include_once('include/mailer.php');
include_once('site.php');

class Process {

	var $database;
	var $usermanagement;
	var $site;
    var $form;
	var $mailer;
	var $username;     				
    var $userid;       				
    var $userlevel;
	var $email;
    var $time;         				
    var $logged_in;    				
    var $userinfo = array();
	var $num_new_msg;
	var $url; 
	var $referrer;    	
	
	/* Class constructor */
	function Process($database, $usermanagement, $site, $form, $mailer) {

		$this->database = $database;
		$this->usermanagement = $usermanagement;
		$this->site = $site;
		$this->formError = $form;
		$this->mailer = $mailer;
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
	
		/* Set referrer page */
        if (isset($_SESSION['url'])) {
            $this->referrer = $_SESSION['url'];
        } 
		else {
            $this->referrer = "index.php";
        }
        /* Set current url */
        $this->url = $_SESSION['url'] = $_SERVER['REQUEST_URI'];
		
		if (!$this->logged_in && isset($_GET['register'])) {
			$this->displayRegisterForm();
		}
		else if (!$this->logged_in && isset($_GET['login'])) {
			$this->displayLoginForm();
		}
		else if (!$this->logged_in && isset($_GET['forgot'])) {
			$this->displayforgotPassForm();
		}
		/**
		 * The only other reason user should be directed here
		 * is if he wants to logout, which means user is
		 * logged in currently.
		 */ 
		 else if ($this->logged_in && isset($_GET['logout'])) {
			$this->logout();
		}
		else if (isset($_GET['edit'])) {
			$this->displayEditUserForm();
		}
		/* User submitted login form */
		else if (isset($_POST['sublogin'])) {
			$this->login();
		}
		/* User submitted registration form */ 
		else if (isset($_POST['subjoin'])) {
			$this->register();
		}
		/* User submitted forgot password form */
		else if(isset($_POST['subforgot'])){
			$this->forgotPass();
		}
		/* User submitted edit account form */ 
		else if (isset($_POST['subedit'])) {
			$this->editAccount();
		}
		/**
		 * Should not get here, which means user is viewing this page
		 * by mistake and therefore is redirected.
		 */ 
		 else {
			header("Location: index.php");
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
			$this->email = $this->userinfo['email'];
			
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
	* displayRegisterForm
	*/
	function displayRegisterForm() {
			
		$this->displayHeader();
		$this->usermanagement->displayRegisterForm();
		$this->displayFooter();
	}
	/**
	* displayLoginForm
	*/
	function displayLoginForm() {
		
		$this->displayHeader();
		$this->usermanagement->displayLoginForm();
		$this->displayFooter();
	}
	/**
	* displayForgotPassForm
	*/
	function displayForgotPassForm() {
			
		$this->displayHeader();
		$this->usermanagement->displayForgotPassForm();
		$this->displayFooter();
	}
	/**
	* displayEditUserForm
	*/
	function displayEditUserForm() {
			
		$email = $this->email; 	
		
		$this->displayHeader();
		$this->usermanagement->displayEditUserForm($email);
		$this->displayFooter();
	}
    /**
     * login - The user has submitted his username and password
     * through the login form, this function checks the authenticity
     * of that information in the database and creates the session.
     * Effectively logging in the user if all goes well.
     */
    function login() {

		$username = $_POST['user']; 
		$password = $_POST['pass']; 
		$remember = isset($_POST['remember']);
		
        /* Username error checking */
        $field = "user";  //Use field name for username
		if (!$username || strlen($username = trim($username)) == 0) {
            $this->formError->setError($field, "* Vartotojo vardas neįvestas");
        } 
		else {
            /* Spruce up username, check length */
            if (strlen($username) < 5) {
                $this->formError->setError($field, "* Vartotojo vardas per trumpas");
            } 
			else if (strlen($username) > 30) {
                $this->formError->setError($field, "* Vartotojo vardas per ilgas");
            }
            /* Check if username is not  */ 
			else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $username) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
        }
        /* Password error checking */
        $field = "pass";  //Use field name for password
        if (!$password) {
            $this->formError->setError($field, "* Slaptažodis neįvestas");
        }
        /* Return if form errors exist */
        if ($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: usermanagement.php?login");
			return false;
        }
        /* Checks that username is in database and password is correct */
        $result = $this->usermanagement->confirmUserPass($username, md5($password));

        /* Check error codes */
        if ($result == 1) {
            $field = "user";
            $this->formError->setError($field, "* Tokio vartotojo vardo nėra");
        } 
		else if ($result == 2) {
            $field = "pass";
            $this->formError->setError($field, "* Neteisingas slaptažodis");
        }

        /* Return if form errors exist */
        if ($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: usermanagement.php?login");
			return false;
        }

        /* Username and password correct, register session variables */
        $this->userinfo = $this->usermanagement->getUserInfo($username);
        $this->username = $_SESSION['username'] = $this->userinfo['username'];
        $this->userid = $_SESSION['userid'] = $this->usermanagement->getRandID();
        $this->userlevel = $this->userinfo['userlevel'];

        /* Insert userid into database and update active users table */
        $this->usermanagement->updateUserField($this->username, "userid", $this->userid);
        $this->usermanagement->addActiveUser($this->username, $this->time);
        $this->usermanagement->removeActiveGuest($_SERVER['REMOTE_ADDR']);

        /**
         * The user has requested that we remember that he's logged in, 
		 * so we set two cookies. One to hold his username, and one to 
		 * hold his random value userid. It expires by the time specified 
		 * in constants.php. Now, next time he comes to our site, we will
         * log him in automatically, if he didn't log out before he left.
         */
        if ($remember) {
            setcookie("cookname", $this->username, time() + COOKIE_EXPIRE, COOKIE_PATH);
            setcookie("cookid", $this->userid, time() + COOKIE_EXPIRE, COOKIE_PATH);
        }
        /* Login completed successfully */
		header("Location: ".$this->referrer);
        return true;
    }

    /**
     * logout - Gets called when the user wants to be logged out of the
     * website. It deletes any cookies that were stored on the users
     * computer as a result of him wanting to be remembered, and also
     * unsets session variables and demotes his user level to guest.
     */
    function logout() {
         /* Delete cookies */
        if (isset($_COOKIE['cookname']) && isset($_COOKIE['cookid'])) {
            setcookie("cookname", "", time() - COOKIE_EXPIRE, COOKIE_PATH);
            setcookie("cookid", "", time() - COOKIE_EXPIRE, COOKIE_PATH);
        }
        /* Unset PHP session variables */
        unset($_SESSION['username']);
        unset($_SESSION['userid']);

        /* Reflect fact that user has logged out */
        $this->logged_in = false;

        /**
         * Remove from active users table and add to
         * active guests tables.
         */
        $this->usermanagement->removeActiveUser($this->username);
        $this->usermanagement->addActiveGuest($_SERVER['REMOTE_ADDR'], $this->time);

        /* Set user level to guest */
        $this->username = GUEST_NAME;
        $this->userlevel = GUEST_LEVEL;
		header("Location: ".$this->referrer);
    }
	/**
     * register - Gets called when the user has just submitted the
     * registration form. Determines if there were any errors with
     * the entry fields, if so, it records the errors and returns
     * 1. If no errors were found, it registers the new user and
     * returns 0. Returns 2 if registration failed.
     */
    function register() {
		
		$gender = $_POST['gender']; 
		$username = ucfirst($_POST['user']); 
		$fname = $_POST['firstname']; 
		$lname = $_POST['lastname']; 
		$email = $_POST['email']; 
		$password = $_POST['pass']; 
		$birthdate = $_POST['birthdate']; 
		$individualid = $_POST['id'];
		$invitationCode = $_POST['code'];
		$invitationUser = $_POST['inv-user'];
		$template = $this->template;
		$sitename = $template['sitename'];
		$url = $this->site->getDomainAndDir();
		
        /* Gender error checking */
        $field = "gender";  //Use field name for gender
        if (!$gender) {
            $this->formError->setError($field, "* Neįvesta lytis");
        }
		
		/* Username error checking */
        $field = "user";  //Use field name for username
        if (!$username || strlen($username = trim($username)) == 0) {
            $this->formError->setError($field, "* Vartotojo vardas neįvestas");
        } 
		else {
            /* Spruce up username, check length */
            if (strlen($username) < 5) {
                $this->formError->setError($field, "* Vartotojo vardas per trumpas");
            } 
			else if (strlen($username) > 30) {
                $this->formError->setError($field, "* Vartotojo vardas per ilgas");
            }
            /* Check if username is not  */ 
			else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $username) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
            /* Check if username is reserved */ 
			else if (strcasecmp($username, GUEST_NAME) == 0) {
                $this->formError->setError($field, "* Vartotojo vardas rezervuotas");
            }
            /* Check if username is already in use */ 
			else if ($this->usermanagement->usernameTaken($username)) {
                $this->formError->setError($field, "* Vartotojo vardas užimtas");
            }
            /* Check if username is banned */ 
			else if ($this->usermanagement->usernameBanned($username)) {
                $this->formError->setError($field, "* Vartotojas užblokuotas");
            }
        }
		
		/* First name error checking */
        $field = "firstname";  //Use field name for first name
        if (!$fname || strlen($fname = trim($fname)) == 0) {
            $this->formError->setError($field, "* Vardas neįvestas");
        } else {
            /* Spruce up first name, check length */
            if (strlen($fname) < 2) {
                $this->formError->setError($field, "* Vardas per trumpas");
            } else if (strlen($fname) > 30) {
                $this->formError->setError($field, "* Vardas per ilgas");
            }
            /* Check if first name is not alphanumeric */ 
			else if (preg_match("/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $fname) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
        }
		/* Last name error checking */
        $field = "lastname";  //Use field name for last name
        if (!$lname || strlen($lname = trim($lname)) == 0) {
            $this->formError->setError($field, "* Pavardė neįvesta");
        } 
		else {
            /* Spruce up last name, check length */
            if (strlen($lname) < 2) {
                $this->formError->setError($field, "* Pavardė per trumpa");
            } else if (strlen($lname) > 30) {
                $this->formError->setError($field, "* Pavardė per ilga");
            }
            /* Check if username is not alphanumeric */ 
			else if (preg_match("/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $lname) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
        }
		/* Email error checking */
        $field = "email";  //Use field name for email
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
                $this->formError->setError($field, "* Toks el. pašto adresas jau yra");
            }
			else if (!empty($invitationCode) && !$this->usermanagement->confirmInvitationInfo($invitationCode)) {
				$this->formError->setError($field, "* Klaidinga kvietimo informacija");
			}			
        }
		
        /* Password error checking */
        $field = "pass";  //Use field name for password
        if (!$password) {
            $this->formError->setError($field, "* Neįvestas slaptažodis");
        } else {
            /* Spruce up password and check length */
            if (strlen($password) < 9) {
                $this->formError->setError($field, "* Slaptažodis per trumpas");
            }
            /* Check if password is not alphanumeric */ 
			else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $password) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
        }
		/* Birthday error checking */
        $field = "birthday";  //Use field name for birthday
		if (!$birthdate || strlen($birthdate = trim($birthdate)) == 0) {
            $this->formError->setError($field, "* Data neįvesta");
        } 
		else if(preg_match("/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/", $birthdate) == 0){
			$this->formError->setError($field, "* Datos formatas YYYY-MM-DD");
		}
        /* Errors exist, have user correct them */
        if ($this->formError->num_errors > 0) {
            $_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: usermanagement.php?register");
			return false;
        }
        /* No errors, add the new account to the */ 
		else {
			if (!empty($invitationCode)) {
				$newUser = $this->usermanagement->addNewUser($username, md5($password), $email);
				$newManager = $this->usermanagement->addNewManager($username, $invitationUser);
				$updateFName = $this->usermanagement->updateIndividualField($individualid, 'fname', $fname);
				$updateLName = $this->usermanagement->updateIndividualField($individualid, 'lname', $lname);
				$updateDate = $this->usermanagement->updateIndividualField($individualid, 'birth_date', $bdate);
				$updateUsername = $this->usermanagement->updateIndividualField($individualid, 'individual_username', $username);
				
				if ($newUser && $newManager && $updateFName && $updateLName 
							&& $updateDate && $updateUsername) {
					$this->mailer->sendWelcome($username, $email, $password, $sitename, $url);	
					$_SESSION['reguname'] = $_POST['user'];
					$_SESSION['regsuccess'] = true;
					header("Location: usermanagement.php?login");
				}
				else {
					$_SESSION['reguname'] = $_POST['user'];
					$_SESSION['regsuccess'] = false;
					header("Location: usermanagement.php?register");
				}	
			}
			else {
				$newUser = $this->usermanagement->addNewUser($username, md5($password), $email);
				$newFamily = $this->usermanagement->addFamily($username, $fname, $lname);
				$newManager = $this->usermanagement->addNewManager($username, null);
				$newIndividual = $this->usermanagement->addNewIndividual($username, $gender, $fname, $lname, $bdate);
				
				if ($newUser && $newFamily && 
					$newManager && $newIndividual) {
					$this->mailer->sendWelcome($username, $email, $password, $sitename, $url);	
					$_SESSION['reguname'] = $_POST['user'];
					$_SESSION['regsuccess'] = true;
					header("Location: usermanagement.php?login");
				}
				else {
					$_SESSION['reguname'] = $_POST['user'];
					$_SESSION['regsuccess'] = false;
					header("Location: usermanagement.php?register");				
				}
			}
        }
    }
    /**
     * editAccount - Attempts to edit the user's account information
     * including the password, which it first makes sure is correct
     * if entered, if so and the new password is in the right
     * format, the change is made. All other fields are changed
     * automatically.
     */
    function editAccount() {
	
		$username = $this->username;
		$currentPassword = $_POST['curpass'];
		$newPassword = $_POST['newpass'];
		$email = $_POST['email'];
		
        /* New password entered */
        if ($newPassword) {
            /* Current Password error checking */
            $field = "curpass";  //Use field name for current password
            if (!$currentPassword) {
                $this->formError->setError($field, "* Neįvestas slaptažodis");
            } 
			else {
                /* Check if password too short or is not alphanumeric */
                if (strlen($currentPassword) < 9) {
                    $this->formError->setError($field, "* Slaptažodis per trumpas");
                }
				/* Check if password is not alphanumeric */ 
				else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $currentPassword) == 0) {
					$this->formError->setError($field, "* Netinkamas simbolis");
				}
                /* Password entered is incorrect */
                else if ($this->usermanagement->confirmUserPass($this->username, md5($currentPassword)) != 0) {
                    $this->formError->setError($field, "* Neteisingas slaptažodis");
                }
            }
            /* New Password error checking */
            $field = "newpass";  //Use field name for new password
            /* Spruce up password and check length */
            if (strlen($newPassword) < 9) {
                $this->formError->setError($field, "* Slaptažodis per trumpas");
            }
            /* Check if password is not alphanumeric */ 
			else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $newPassword) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
        }
        /* Change password attempted */ 
		else if ($currentPassword) {
            /* New Password error reporting */
            $field = "newpass";  //Use field name for new password
            $this->formError->setError($field, "* Neįvestas naujas slaptažodis");
        }
        /* Email error checking */
        $field = "email";  //Use field name for email
		if (!$email || strlen($email = trim($email)) == 0 ) {
			$this->formError->setError($field, "* Neįvestas el. pašto adresas");
		} 
		else {
			/* Check if valid email address */
			if(preg_match("/^[a-zA-Z]\w+(\.\w+)*@\w+(\.[0-9a-zA-Z]+)*\.[a-zA-Z]{2,4}$/", $email) == 0) {
				$this->formError->setError($field, "* Klaidingas el. pašto adresas");
			}
			/* Check if email is already in use */ 
			else if ($this->usermanagement->emailTaken($username, $email)) {
				$this->formError->setError($field, "* Toks el. pašto adresas jau yra");
			}
		}
        /* Errors exist, have user correct them */
        if ($this->formError->num_errors > 0) {
            $_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: usermanagement.php?edit=0");
			return false;
        }

        /* Update password since there were no errors */
        if ($currentPassword && $newPassword) {
            $this->usermanagement->updateUserField($this->username, "password", md5($newPassword));
        }

        /* Change Email */
        if ($email) {
            $this->usermanagement->updateUserField($this->username, "email", $email);
        }
        /* Success! */
		header("Location: familytree.php?profile=0");
    }
	/**
     * forgotPass - Gets called when the user submits the
     * forgotten password form. Determines if there were any errors with
     * the entry fields, if so, it records the errors. 
	 * If no errors were found, a new password is generated and
	 * emailed to the address the user gave.
     */
    function forgotPass() {
		
		$username = $_POST['user'];
		$template = $this->template;
		$sitename = $template['sitename'];
		$url = $this->site->getDomainAndDir();
		
		/* Username error checking */
		$field = "user";  //Use field name for username
		if(!$username || strlen($username = trim($username)) == 0){
			$this->formError->setError($field, "* Vartotojo vardas neįvestas");
		}
		else {
			/* Spruce up username, check length */
            if (strlen($username) < 5) {
                $this->formError->setError($field, "* Vartotojo vardas per trumpas");
            } 
			else if (strlen($username) > 30) {
                $this->formError->setError($field, "* Vartotojo vardas per ilgas");
            }
            /* Check if username is not  */ 
			else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s']+$/", $username) == 0) {
				$this->formError->setError($field, "* Netinkamas simbolis");
			}
            /* Check if username is already in use */ 
			else if (!$this->usermanagement->usernameTaken($username)) {
                $this->formError->setError($field, "* Tokio vartotojo vardo nėra");
            }
            /* Check if username is banned */ 
			else if ($this->usermanagement->usernameBanned($username)) {
                $this->formError->setError($field, "* Vartotojas užblokuotas");
            }
		}
        /* Errors exist, have user correct them */
        if ($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: usermanagement.php?forgot");
			return false;
        }
        /* No errors */ 
		else {
			/* Generate new password */
			$newPassword = $this->usermanagement->getRandString(9);
			/* Get email of user */
			$usrinf = $this->usermanagement->getUserInfo($username);
			$email  = $usrinf['email'];

			/* Attempt to send the email with new password */
			if($this->mailer->sendNewPass($username, $email, $newPassword, $sitename, $url)){
				/* Email sent, update database */
				$this->usermanagement->updateUserField($username, "password", md5($newPassword));
				$_SESSION['forgotpass'] = true;	
				header("Location: usermanagement.php?forgot");
			}
			/* Email failure, do not change password */
			else{
				$_SESSION['forgotpass'] = false;	
				header("Location: usermanagement.php?forgot");
			}
        }
    }
};
$process = new Process($database, $usermanagement, $site, $form, $mailer);
?>