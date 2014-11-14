<?php
include_once('include/form.php');
include_once('site.php');

class userManagement {

	var $database;
    var $form; 	
	var $site;

    /* Class constructor */
    function userManagement($database, $form, $site) {
	
		$this->database = $database;
		$this->formError = $form;
		$this->site = $site;
    }
	/**
	* confirmUserPass - Checks whether or not the given
	* username is in the database, if so it checks if the
	* given password is the same password in the database
	* for that user. If the user doesn't exist or if the
	* passwords don't match up, it returns an error code
	* (1 or 2). On success it returns 0.
	*/
	function confirmUserPass($username, $password){
		
		$username = $this->site->cleanOutput($username);

		/* Verify that user is in database */
		$q = "SELECT password 
				FROM ".TBL_USERS." 
				WHERE username = '$username'";
		$result = $this->database->query($q);
		
		if ($result == false) {
				$result .= die(mysql_error());
				return 1;
			}
			
		$num_rows = mysql_num_rows($result);
		$db_password = '';
		
		if ($num_rows <= 0) {
			return 1;
		}
		else {
			while ($row = mysql_fetch_assoc($result)) {
				$db_password = $row['password'];
			}
		}	

		/* Validate that userid is correct */
		if($password == $db_password){
			return 0; //Success
		}
		else{
			return 2; //Indicates userid invalid
		}
	}
	/**
	* confirmUserID - Checks whether or not the given
	* username is in the database, if so it checks if the
	* given userid is the same userid in the database
	* for that user. If the user doesn't exist or if the
	* userids don't match up, it returns an error code
	* (1 or 2). On success it returns 0.
	*/
	function confirmUserID($username, $userid){
		
		$username = $this->site->cleanOutput($username);

		/* Verify that user is in database */
		$q = "SELECT userid 
				FROM ".TBL_USERS." 
				WHERE username = '$username'";
		
		$result = $this->database->query($q);
		
		if ($result == false) {
				$result .= die(mysql_error());
				return 1;
			}
			
		$num_rows = mysql_num_rows($result);
		$db_id = '';
		
		if ($num_rows <= 0) {
			return 1;
		}
		else {
			while ($row = mysql_fetch_assoc($result)) {
				$db_id = $row['userid'];
			}
		}	

		/* Validate that userid is correct */
		if($userid == $db_id){
			return 0; //Success
		}
		else{
			return 2; //Indicates userid invalid
		}
	}
	/**
	* confirmInvitationInfo - Checks whether or not the given
	* invitation code is in the database, if so checks if the
	* given email is the same email as the one in the database.
	*/
	function confirmInvitationInfo($invitationCode){
	 
		$invitationCode = $this->site->cleanOutput($invitationCode);

		$q = "SELECT email 
				FROM ".TBL_INVITATIONS." 
				WHERE invitation_code = '$invitationCode'";
				
		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);

		return ($num_rows > 0);
	}
	/**
	* usernameTaken - Returns true if the username has
	* been taken by another user, false otherwise.
	*/
	function usernameTaken($username){

		$username = $this->site->cleanOutput($username);

		$q = "SELECT username 
				FROM ".TBL_USERS." 
				WHERE username = '$username'";

		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);

		return ($num_rows > 0);
	}
	/**
	* emailTaken - Returns true if the email has
	* been taken by another user, false otherwise.
	*/
	function emailTaken($username, $email) {
		
		$username = $this->site->cleanOutput($username);
		$email = $this->site->cleanOutput($email);

		$q = "SELECT email 
			FROM ".TBL_USERS." 
			WHERE email = '$email'
			AND username != '$username'";
		
		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);

		return ($num_rows > 0);
	}
	/**
	* usernameBanned - Returns true if the username has
	* been banned by the administrator.
	*/
	function usernameBanned($username) {
	  
		$username = $this->site->cleanOutput($username);

		$q = "SELECT username 
				FROM ".TBL_BANNED_USERS." 
				WHERE username = '$username'";

		$result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		
		return ($num_rows > 0);
	}
	/**
	* addNewUser - Inserts the given (username, password, email)
	* info into the database. Appropriate user level is set.
	* Returns true on success, false otherwise.
	*/
	function addNewUser($username, $password, $email){
		
		$username = $this->site->cleanOutput($username);
		$password  =  $this->site->cleanOutput($password);
		$email  =  $this->site->cleanOutput($email);
		$timestamp = time();
		/* If admin sign up, give admin user level */
		if (strcasecmp($username, ADMIN_NAME) == 0) {
			$ulevel = ADMIN_LEVEL;
		}
		else {
			$ulevel = USER_LEVEL;
		}
		$q = "INSERT INTO ".TBL_USERS." VALUES (
				'$username', '$password', '0', $ulevel, '$email', '$timestamp'
				)";
		
		return $this->database->query($q);
	}
	/**
	* addFamily
	* Inserts the given ($username, $fname, $lname) info into the database. 
	*/
	function addFamily($username, $fname, $lname){
	
		$username = $this->site->cleanOutput($username);
		$fname  =  $this->site->cleanOutput($fname);
		$lname  =  $this->site->cleanOutput($lname);
		$timestamp = time();
		$title =  $fname. ' ' .$lname;
		$q = "INSERT INTO ".TBL_FAMILY." (
				family_created, family_name, timestamp
				) 
				VALUES 
					('$username', '$title', '$timestamp')";
		
		return $this->database->query($q);
	}
	/**
	* addManager
	* Inserts the given (username, family) info into the database. 
	*/
	  function addNewManager($username, $invitationUser) {
		
		$username = $this->site->cleanOutput($username);
		$invitationUser = $this->site->cleanOutput($invitationUser);
		$timestamp = time();

		$q = "SELECT family_id 
				FROM ".TBL_FAMILY." 
				WHERE family_created = '$username'
				OR family_created = '$invitationUser'";
				
		$result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return false;
		}
		else {	
			list($family) = mysql_fetch_array($result);
			
			$q = "INSERT INTO ".TBL_MANAGERS." (
					manager_username, manager_family, timestamp
					) 
					VALUES 
						('$username', '$family', '$timestamp')";
			
			return $this->database->query($q);
		}
	}
	/**
	* addNewIndividual
	* Inserts the given ($username, $gender, $fname, $lname, $bdate) info into the database.
	*/
	function addNewIndividual($username, $gender, $fname, $lname, $bdate){
	
		$username = $this->site->cleanOutput($username);
		$gender = $this->site->cleanOutput($gender);
		$fname  =  $this->site->cleanOutput($fname);
        $lname  =  $this->site->cleanOutput($lname);
		$bdate = $this->site->cleanOutput($bdate);
		$avatar = ($gender == 'Male' ? 'male.jpg' : 'female.jpg'); 
		$timestamp = time();
		
		$q = "SELECT manager_family 
				FROM ".TBL_MANAGERS." 
				WHERE manager_username = '$username'";
		
		$result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return false;
		}
		else {	
			list($family) = mysql_fetch_array($result);
			// Insert new user
			$q = "INSERT INTO ".TBL_INDIVIDUALS." (
					fname, lname, birth_date, gender, avatar, individual_family, added_username,  individual_username, timestamp
					) 
					VALUES 
						('$fname', '$lname', '$bdate', '$gender', '$avatar','$family', '$username', '$username', '$timestamp')";
				
			return $this->database->query($q);
		}
	}
	/**
	* updateUserField - Updates a field, specified by the field
	* parameter, in the user's row of the database.
	*/
	function updateUserField($username, $field, $value){
		
		$username = $this->site->cleanOutput($username);
		$value = $this->site->cleanOutput($value);
		
		$q = "UPDATE ".TBL_USERS." SET ".$field." = '$value' WHERE username = '$username'";
		return $this->database->query($q) or die(mysql_error());
	}
	/**
	* getUserInfo - Returns the result array from a mysql
	* query asking for all information stored regarding
	* the given username. 
	*/
	function getUserInfo($username) {
	
		$username = $this->site->cleanOutput($username);
		
		$q = "SELECT * 
				FROM ".TBL_USERS." 
				WHERE username = '$username'";
				
		$result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		$userInfo = '';
		
		if ($num_rows > 0) {
			$userInfo = mysql_fetch_array($result);
			return $userInfo;
		}
	}
	/**
	* updateIndividualField - Updates a field, specified by the field
	* parameter, in the individual's row of the database.
	*/
	function updateIndividualField($individualid, $field, $value){
		
		$individualid = $this->site->cleanOutput($individualid);
		$value = $this->site->cleanOutput($value);
		
		$q = "UPDATE ".TBL_INDIVIDUALS." SET ".$field." = '$value' WHERE individual_id = '$individualid'";
		return $this->database->query($q);
	}
	/**
	* displayRegisterForm
	*/
	function displayRegisterForm() {
	
		$invitationUser = '';
		$invitationCode = '';
		$individualid = '';
		$fname = '';
		$lname = '';
		$bdate = '';
		$email = '';
		$male = 'checked="checked"';
		$female = '';
			
		if (isset($_GET['code'])) {
		
			$invitationCode = $this->site->cleanOutput($_GET['code']);
			
			$q = "SELECT individual_id, fname, lname, mname, birth_date, gender, email, invitation_username
					FROM ".TBL_INDIVIDUALS.",".TBL_INVITATIONS."
					WHERE invitation_code = '$invitationCode'
					AND invitation_individual = individual_id";
			
			$result = $this->database->query($q);
					
			if ($result == false) {
				$result .= die(mysql_error());
				return;
			}
			
			$num_rows = mysql_num_rows($result);
			$individualInfo = '';
			
			if ($num_rows > 0) {
				$individualInfo = mysql_fetch_array($result);
				$invitationUser = $individualInfo['invitation_username'];
				$individualid = $individualInfo['individual_id'];
				$fname = $individualInfo['fname'];
				$lname = $individualInfo['lname'];
				$mname = $individualInfo['mname'];
				$bdate = $individualInfo['birth_date'];
				$email = $individualInfo['email'];
				$gender = $individualInfo['gender'];
				if ($gender == 'Male') {
					$male = 'checked="checked"';
					$female = '';
				}
				else {
					$male = '';
					$female = 'checked="checked"';
				}
			}
		}
		?> 
		<div class="access_container">
			<div id="reg_container" class="reg_container"  style="display:block">
				<div class="register">
					<h1>Kurti mano šeimos medį</h1>
					<?php
					if (isset($_SESSION['regsuccess']) && $_SESSION['regsuccess'] == false) {
					?>
						<div class="error">
							<p>Įvyko klaida. Bandykite dar kartą!</p>
						</div>
					<?php
					}
					?>
					<form method="post" action="usermanagement.php">
						<div class="reg_section personal_info">
							<h3>Jūsų asmeninė informacija</h3>
							<p class="gender">
								<label>
									<input id="genderm" type="radio" name="gender" value="Male" <?php echo $male; ?>/>
									Vyras
								</label>
								<label>
									<input id="genderf" type="radio" name="gender" value="Female" <?php echo $female; ?>/>
									Moteris
								</label>
							</p>
							<input id="firstname" type="text" name="firstname" value="<?php echo $fname; echo $this->formError->value("firstname"); ?>" placeholder="Vardas"/>
							<?php echo $this->formError->error("firstname"); ?> 
							<input id="lastname" type="text" name="lastname" value="<?php echo $lname; echo $this->formError->value("lastname"); ?>" placeholder="Pavardė"/>
							<?php echo $this->formError->error("lastname"); ?>
							<input id="birthdate" type="text" name="birthdate" value= "<?php echo $bdate; echo $this->formError->value("birthdate"); ?>" placeholder="Gimimo data"/>
							<?php echo $this->formError->error("birthdate"); ?>
						</div>
						<div class="reg_section password">
							<h3>Jūsų prisijungimo informacija</h3>
							<input id="user" type="text" name="user" value="<?php echo $this->formError->value("user"); ?>" placeholder="Vartotojo vardas"/>
							<?php echo $this->formError->error("user"); ?>
							<input id="email" type="text" name="email" value="<?php echo $email; echo $this->formError->value("email"); ?>" placeholder="El. paštas"/>
							<?php echo $this->formError->error("email"); ?> 
							<input id="pass" type="password" name="pass" value="<?php echo $this->formError->value("pass"); ?>" placeholder="Slaptažodis"/>
							<?php echo $this->formError->error("pass"); ?>				
						</div>
						<p class="hidden">
							<input type="hidden" name="id" value="<?php echo $individualid; ?>"/>
							<input type="hidden" name="code" value="<?php echo $invitationCode; ?>"/>
							<input type="hidden" name="inv-user" value="<?php echo $invitationUser; ?>"/>
							<input type="hidden" name="subjoin" value="1"/>
						</p>
						<p class="submit">
							<input type="submit" name="register" value="Registruotis"/>
						</p>
					</form>
				</div>
				<div class="form-link">
					<p>Esate prisiregistravęs? <a id="login-link" href="usermanagement.php?login">Prisijungti</a></p>
				</div>
			</div>
		</div>
		<script type="text/javascript">
		//<![CDATA[
			$(function(e) {
				$( "#birthdate" ).datepicker({
					monthNamesShort: [ "Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis", 
								"Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis" ],
					dayNamesMin: [ "S", "Pr", "A", "T", "K", "Pn", "Š" ],
					firstDay: 1,
					dateFormat: "yy-mm-dd",
					showAnim: "slideDown",
					changeMonth: true,
					changeYear: true
				});
			});
		//]]>
		</script> 		
		<?php
	}
	/**
	* displayLoginForm
	*/
	function displayLoginForm() {
	
		?>
		<div class="access_container">
			<div id="log_container" class="log_container">
				<div class="login">
					<h1>Prisijungti</h1>
					<?php
					if (isset($_SESSION['regsuccess']) && $_SESSION['regsuccess'] == true) {
					?>
						<div class="success">
							<p>Registracija sėkmingai baigta! Galite prisijungti.</p>
						</div>
					<?php
					}
					?>
					<form method="post" action="usermanagement.php">
						<div class="log_section user_info">
							<input id="user" type="text" name="user" value="<?php echo $this->formError->value("user"); ?>" placeholder="Vartotojo vardas"/>
							<?php echo $this->formError->error("user"); ?>
							<input name="pass" type="password" value="<?php echo $this->formError->value("pass"); ?>" placeholder="Slaptažodis"/>
							<?php echo $this->formError->error("pass"); ?>
						</div>
						<p class="remember">
							<label>
							  <input type="checkbox" name="remember" id="remember" value=""/>
							   Prisiminti mane
							</label>
						</p>		
						<p class="hidden">
							<input type="hidden" name="sublogin" value="1"/>
						</p>
						<p class="submit">
							<input type="submit" value="Prisijungti"/>
						</p>
					</form>				
				</div>
				<div class="form-link">
					<p>Negalite prisijungti? <a id="forgot-link" href="usermanagement.php?forgot">Pamiršote slaptažodį</a></p>
					<p>Nesate prisiregistravęs? <a id="register-link" href="usermanagement.php?register">Registruotis</a></p>
				</div>
			</div>
		</div>
		<?php
	}
	/**
	* displayForgotPassForm
	*/
	function displayForgotPassForm() {
	
		?>
		<div class="access_container">
			<div id="forgot_container" class="forgot_container">
				<div class="forgot">
					<h1>Pamiršote slaptažodį</h1>
					<?php
					if (isset($_SESSION['forgotpass'])) {
						 if ($_SESSION['forgotpass'] == false) {
						?>
							<div class="error">
								<p class="text">Įvyko klaida. Bandykite dar kartą!</p>
							</div>
						<?php
						}
						else {
						?>
							<div class="success">
								<p>Naujas slaptažodis buvo išsiųstas! Pasitikrinkite el. paštą.</p>
							</div>
						<?php
						}
					}
					?>
					<form action="usermanagement.php" method="post">
						<p class="text">Naujas slaptažodis bus išsiųstas Jums el. paštu. 
							Įveskite savo vartotojo vardą apačioje.</p>
						<div class="forgot_section username">
							<input type="text" name="user" value="<?php echo $this->formError->value("user"); ?>" placeholder="Vartotojo vardas">
							<?php echo $this->formError->error("user");?>
						</div>
						<p class="hidden">
							<input type="hidden" name="subforgot" value="1">					
						</p>
						<p class="submit">
							<input type="submit" value="Pateikti">
						</p>
					</form>
				</div>
				<div class="form-link">
					<p>Prisimenate slaptažodį? <a id="back-login-link" href="usermanagement.php?login">Pakartoti prisijungimą</a></p>
				</div>
			</div> 
		</div>
		<?php
	}
	/**
	* displayEditUserForm
	*/
	function displayEditUserForm($email) {
	
		?>
		<div class="form_container_2">
			<div class="form">
				<h1>Redaguoti paskyros informaciją</h1>
				<form method="post" action="usermanagement.php">
					<div class="form_section password">
						<h3>Slaptažodis</h3>
						<input type="text" id="curpass" name="curpass" value="<?php echo $this->formError->value("curpass"); ?>" placeholder="Rašykite dabartinį slaptažodį čia">
						<?php echo $this->formError->error("curpass"); ?>
						<input type="text" id="newpass" name="newpass" value="<?php echo $this->formError->value("newpass"); ?>" placeholder="Rašykite naują slaptažodį čia">
						<?php echo $this->formError->error("newpass"); ?>
					</div>
					<div class="form_section email">
						<h3>El. paštas</h3>
						<input type="text" id="email" name="email" value="<?php echo $email; ?>" placeholder="Rašykite el. paštą čia">
						<?php echo $this->formError->error("email"); ?>
					</div>
					<p class="hidden">
						<input type="hidden" name="subedit" value="1">
					</p>
					<p class="submit">
						<input class="first-btn" type="submit" value="Atnaujinti" />&nbsp;
						<label>arba</label>&nbsp;
						<a href="familytree.php?profile=0#menu">Atšaukti</a>
					</p>
				</form> 	
			</div>
		</div>
		<?php
	}
	/**
	* addActiveUser - Updates username's last active timestamp
	* in the database, and also adds user to the table of
	* active users, or updates timestamp if already there.
	*/
	function addActiveUser($username, $time) {
	
		$username = $this->site->cleanOutput($username);
		
		$q = "UPDATE ".TBL_USERS." SET timestamp = '$time' WHERE username = '$username'";
		$this->database->query($q);

		if(!TRACK_VISITORS) return;
		$q = "REPLACE INTO ".TBL_ACTIVE_USERS." VALUES ('$username', '$time')";
		$this->database->query($q);
	}
	/* addActiveGuest
	* Adds guest to active guests table 
	*/
	function addActiveGuest($ip, $time) {
		if(!TRACK_VISITORS) return;
		$q = "REPLACE INTO ".TBL_ACTIVE_GUESTS." VALUES ('$ip', '$time')";
		$this->database->query($q);
	}
	/* 
	** removeActiveUser 
	*/
	function removeActiveUser($username) {
	
		$username = $this->site->cleanOutput($username);
		
		if(!TRACK_VISITORS) return;
		$q = "DELETE FROM ".TBL_ACTIVE_USERS." WHERE username = '$username'";
		$this->database->query($q);
	}
	/* 
	** removeActiveGuest 
	*/
	function removeActiveGuest($ip) {
		if(!TRACK_VISITORS) return;
		$q = "DELETE FROM ".TBL_ACTIVE_GUESTS." WHERE ip = '$ip'";
		$this->database->query($q);
	}
	/* 
	** removeInactiveUsers 
	*/
	function removeInactiveUsers() {
		if(!TRACK_VISITORS) return;
		$timeout = time()-USER_TIMEOUT*60;
		$q = "DELETE FROM ".TBL_ACTIVE_USERS." WHERE timestamp < $timeout";
		$this->database->query($q);
	}
	/* 
	** removeInactiveGuests 
	*/
	function removeInactiveGuests() {
		if(!TRACK_VISITORS) return;
		$timeout = time()-GUEST_TIMEOUT*60;
		$q = "DELETE FROM ".TBL_ACTIVE_GUESTS." WHERE timestamp < $timeout";
		$this->database->query($q);
	}
	/**
	 * getRandID - Generates a string made up of randomized
	 * letters (lower and upper case) and digits and returns
	 * the md5 hash of it to be used as a userid.
	 */
	function getRandID() {
		return md5($this->getRandString(16));
	}
	/**
	 * getRandString - Generates a string made up of randomized
	 * letters (lower and upper case) and digits, the length
	 * is a specified parameter.
	 */
	function getRandString($length) {
		$randString = '';
		for ($i = 0; $i < $length; $i++) {
			$randnum = mt_rand(0, 61);
			if ($randnum < 10) {
				$randString .= chr($randnum + 48);
			} 
			else if ($randnum < 36) {
				$randString .= chr($randnum + 55);
			} 
			else {
				$randString .= chr($randnum + 61);
			}
		}
		return $randString;
	}
};
$usermanagement = new userManagement($database, $form, $site);
?>