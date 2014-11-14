<?php 
session_start();

define('URL_PREFIX', '');

include('events_class.php');
include('usermanagement_class.php');
include_once('site.php');


class HomePage {

	var $database;
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
	
    function HomePage($database, $form, $events, $usermanagement, $site) {
	
		$this->database = $database;
		$this->events = $events;
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
		
		$this->displayHomePage();
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
     * displayHomePage
     */
    function displayHomePage() {
		 
		$username = $this->username;
		
		$this->displayHeader();
		
		echo '<div class="home_panel">';
		
		$this->displayHomeLeftPanel($username);
		$this->displayHomeCenterPanel($username);
		$this->displayHomeRightPanel($username);
		
		echo '</div>';

		$this->displayFooter();
    }
	/**
     * getCurrentUserFamily 
     * 
     * Used to get ids array of all the family members of current user. 
     */
	function getCurrentUserFamily($username) {
		 
		 $username = $this->site->cleanOutput($username);
		 
		$q = "SELECT `individual_username` 
			FROM ".TBL_INDIVIDUALS." 
			WHERE `individual_family` = (
				SELECT `individual_family`
				FROM ".TBL_INDIVIDUALS."
				WHERE `individual_username` = '$username'
			)
			AND `individual_username` IS NOT NULL";
		
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		$familyMembers = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$familyMembers[] = $row['individual_username'];
			}
		}
		
		return $familyMembers;
	}
	/**
     * displayHomeLeftPanel 
     */
    function displayHomeLeftPanel($username) {
		
		echo '<div class="home_left">
			<div class="home_side">
				<div class="home_menu">
					<h2>Pagrindinis šeimos svetainė</h2>
					<ul>
						<li>
							<p>
								<a class="home-invite-icon" href="invitation.php#menu">Kviesti prisijungti</a>
							</p>
						</li>
						<li>
							<p>
								<a class="home-tree-icon" href="familytree.php#menu">Peržiūrėti medį</a>
							</p>
						</li>
						<li>
							<p>
								<a class="home-gallery-icon" href="photogallery.php#menu">Pridėti nuotrauką</a>
							</p>
						</li>
						<li>
							<p>
								<a class="home-event-icon" href="events.php#menu">Pridėti įvykį</a>
							</p>
						</li>
					</ul>
				</div>
				<div class="home_events">
					<h2>Šiandienos įvykiai</h2>';
		$year  = date('Y');
        $month = date('m');
        $day   = date('d');
		
		$date = $this->events->formatDate(('F j, Y'), "$year-$month-$day");
		
		echo '		
					<h3 class="home-flag-icon">'.$date.'</h3>';
		
        $this->events->displayTodaysEvents ($username, $year, $month, $day);
				
		echo '		</div>
				</div>
			</div>';
    }
	/**
     * displayHomeCenterPanel
     */
    function displayHomeCenterPanel() {
		 
		$username = $this->username;
		
		echo '<div class="home_center">';
	
		echo '<div class="home_welcome">
				<h1>Sveiki</h1>
				<p>Sveiki, <a href="familytree.php?profile=0#menu">'.$username.'</a>!</p><p> Ši svetainė buvo sukurta, siekiant skatinti Jūsų giminės bendravimą internetinėje erdvėje.
					Tai yra puiki sistema leidžianti bet kam, kurti privačią savo šeimos svetainę  ir šeimos medį bei dalintis šeimos nuotraukomis 
					ar svarbiausiais įvykiais. Linkime naujų bei įdomių adtradimų ir malonaus bendravimo!
				</p>
			</div>';
			
		$this->displayNews($username); 
		
		echo '</div>';
    }
	/**
     * displayHomeRightPanel 
     */
    function displayHomeRightPanel($username) {
        
		$familyMembers = $this->getCurrentUserFamily($username);
		
		echo '<div class="home_right">
				<div class="home_side">
					<div class="home_online">
						<h2>Dabar prisijungę</h2>';
				
        $this->displayActiveFamilyMembers($familyMembers);
		
		echo '		</div>
				</div>
			</div>';
    }
	/**
     * displayNews 
	 * Displays all the news from all categories
     */
    function displayNews($username) { 
		
		$familyMembers = $this->getCurrentUserFamily($username);
		$individualsNews = $this->getFamilyIndividualsNews($familyMembers);
		$managersNews = $this->getFamilyManagersNews($familyMembers);
		$photosNews = $this->getPhotosNews($familyMembers);
		$commentsNews = $this->getCommentsNews($familyMembers);
		$eventsNews = $this->getEventsNews($familyMembers);
		$news = array_merge($individualsNews, $managersNews, 
							$photosNews, $commentsNews, $eventsNews);
		usort($news, array($this, 'sortArrayByDate'));
		$numNews = 0;
		
		?>
		<div class="news_feed">
			<h1>Naujienos</h1>
			<div class="news">
				<ul>
				<?php
				foreach ($news as $new) {	
					$numNews++;
					?>	
						<li>
							<img class="news avatar" src="uploads/avatars/small/<?php echo $new['avatar']; ?>" alt=""/>
							<p class="title">
								<?php echo $new['title']; ?>
							</p>
							<p class="date"><?php echo $new['date']; ?></p>
							<p class="description"><?php echo $new['description']; ?></p>
						</li>
						<?php
							if ($numNews > 4) {
								break;
							}
						}
						?>
				</ul>
			</div>
		</div>
		<?php
    }
	/**
    * displayActiveFamilyMembers - Finds out how many active family members
    * are viewing site and displays their usernames in a list.
    */
   function displayActiveFamilyMembers($familyMembers){
      
	  $familyMembers = $this->site->cleanOutput($familyMembers);
	  $familyMembersString = '"' .implode('","', array_values($familyMembers)). '"';
	  
      $q = "SELECT u.`username`, i.`avatar` 
			FROM ".TBL_ACTIVE_USERS." AS u,".TBL_INDIVIDUALS." AS i
			WHERE u.`username` IN ($familyMembersString)
			AND u.`username` = i.`individual_username`
			ORDER BY u.`timestamp`";
      $result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		$activeMembers = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$activeMembers[] = $row;
			}
			
			echo '<ul>';
			
			foreach ($activeMembers as $activeMember) {		
				echo '<li>
						<img class="home_online avatar" src="'.'uploads/avatars/small/'.$activeMember['avatar'].'" alt=""/>
							<p>
								<a href="privatemsg.php?compose#menu">'.$activeMember['username'].'</a>
							</p>
					</li>';
			}
			echo '</ul>';
		}
   }
	/**
     * getFamilyIndividualsNews 
	 * Gets the news of new individuals when they are added to the family tree
     */
	function getFamilyIndividualsNews($familyMembers) { 
	
		$familyMembers = $this->site->cleanOutput($familyMembers);
		$familyMembersString = '"' .implode('","', array_values($familyMembers)). '"';
		
		$q = "SELECT i1.`individual_id`, i1.`fname`, i1.`lname`, i1.`mname`, i1.`added_username`, i1.`timestamp`, (
					SELECT i2.`avatar`
					FROM ".TBL_INDIVIDUALS." AS i2
					WHERE i2.`individual_username` = i1.`added_username`
				) AS avatar, (
				SELECT i3.`individual_id`
					FROM ".TBL_INDIVIDUALS." AS i3
					WHERE i3.`individual_username` = i1.`added_username`
				) AS added_id
				FROM ".TBL_INDIVIDUALS." AS i1
				WHERE i1.`added_username` IN ($familyMembersString)
				ORDER BY i1.`timestamp` DESC";
        
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		$individuals = array();
		$individualsNews = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$individuals[] = $row;
			}
			foreach ($individuals as $individual) {		
				
				if (!empty($individual['mname'])) {
					$name = $individual['fname'].' '.$individual['lname'].' ('.$individual['mname'].')';
				}
				else {
					$name = $individual['fname'].' '.$individual['lname'];
				}
				
				$user = $individual['added_username'];
				$avatar = $individual['avatar'];
				$title = '<a href="familytree.php?profile='.$individual['added_id'].'#menu">'.$individual['added_username'].'</a> pridėjo 
							<a href="familytree.php?profile='.$individual['individual_id'].'#menu">'.$name.'</a> prie Jūsų 
							<a href="familytree.php?tree='.$individual['individual_id'].'#menu">šeimos medžio</a>';
				$description = '';
				$date = date('Y-m-d H:i', $individual['timestamp']);
				
				$individualsNews[] = array("avatar"=>$avatar, "title"=>$title, "description"=>$description, "date"=>$date);	
			}
		}
		return $individualsNews;
    }
	/**
     * getFamilyManagersNews 
	 * Gets the news of new managers when they register and join the relatives page
     */
	function getFamilyManagersNews($familyMembers) {
	
		$familyMembers = $this->site->cleanOutput($familyMembers);
		$familyMembersString = '"' .implode('","', array_values($familyMembers)). '"';
		
		$q = "SELECT m.`manager_id`, m.`manager_username`, m.`timestamp`, 
				i.`individual_id`, i.`avatar`, f.`family_name`
				FROM ".TBL_MANAGERS." AS m,".TBL_INDIVIDUALS." AS i,".TBL_FAMILY." AS f
				WHERE m.`manager_username` IN ($familyMembersString)
				AND m.`manager_username` = i.`individual_username`
				AND i.`individual_family` = f.`family_id`
				ORDER BY m.`timestamp` ASC";
        
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		$managers = array();
		$managersNews = array();
		
		if ($num_rows > 0) {
			$individualsNews = array(); 
			while ($row = mysql_fetch_assoc($result)) {
				$managers[] = $row;
			}
	
			$counter = 0;
	
			foreach ($managers as $manager) {
				
				$counter++;
				
				$user = $manager['manager_username'];
				$avatar = $manager['avatar'];
				$date = date('Y-m-d H:i', $manager['timestamp']);
				
				if ($counter == 1) {
					$title = '<a href="familytree.php?profile='.$manager['individual_id'].'#menu">'.$manager['manager_username'].'</a> sukūrė 
								<a href="familytree.php?tree='.$manager['individual_id'].'#menu">'.$manager['family_name'].'</a> šeimos svetainę ir medį';
					$description = '';
				}
				else {
					$title = '<a href="familytree.php?profile='.$manager['individual_id'].'#menu">'.$manager['manager_username'].'</a> prisijungė prie 
								<a href="familytree.php?tree='.$manager['individual_id'].'#menu">'.$manager['family_name'].'</a> šeimos svetainės';
					$description = '';
				}
				
				$managersNews[] = array("avatar"=>$avatar, "title"=>$title, "description"=>$description, "date"=>$date);
			}
		}
		return $managersNews;
    }
	/**
     * getPhotosNews 
	 * Gets the news when new photos are added to the albums of current family
     */
	function getPhotosNews($familyMembers) {
		
		$familyMembers = $this->site->cleanOutput($familyMembers);
		$familyMembersString = '"' .implode('","', array_values($familyMembers)). '"';
		
		$q = "SELECT p.`photo_id`, p.`photo_extension`, p.`photo_title`, p.`photo_category`, 
				p.`photo_user`, p.`timestamp`, c.`category_name`, i.`individual_id`, i.`avatar`
				FROM ".TBL_GALLERY_PHOTOS." AS p,".TBL_GALLERY_CATEGORY." AS c,".TBL_INDIVIDUALS." AS i
				WHERE p.`photo_user` IN ($familyMembersString)
				AND p.`photo_category` = c.`category_id`
				AND p.`photo_user` = i.`individual_username`
				ORDER BY p.`timestamp` DESC";
        
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		$photos = array();
		$photosNews = array(); 
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$photos[] = $row;
			}

			foreach ($photos as $photo) {
				$avatar = $photo['avatar'];
				$title = '<a href="familytree.php?profile='.$photo['individual_id'].'#menu">'.$photo['photo_user'].'</a> įkėlė į albumą 
							<a href="photogallery.php?cid='.$photo['photo_category'].'#menu">'.$photo['category_name'].'</a> nuotrauką 
							<a href="photogallery.php?cid='.$photo['photo_category'].'&amp;pid='.$photo['photo_id'].'#menu">'.$photo['photo_title'].'</a>';
				$description = '<a href="photogallery.php?cid='.$photo['photo_category'].'&amp;pid='.$photo['photo_id'].'#menu">
									<img src="'.'uploads/photos/thumbs/thumb_'.$photo['photo_id'].'.'.$photo['photo_extension'].'" alt="'.$photo['photo_title'].'"/>
								</a>';
				$date = date('Y-m-d H:i', $photo['timestamp']);
				
				$photosNews[] = array("avatar"=>$avatar, "title"=>$title, "description"=>$description, "date"=>$date);
			}
		}
		return $photosNews;
    }
	/**
     * getCommentsNews 
	 * Gets the news when new comments are posted in the albums of current family
     */
	function getCommentsNews($familyMembers) {
		
		$familyMembers = $this->site->cleanOutput($familyMembers);
		$familyMembersString = '"' .implode('","', array_values($familyMembers)). '"';
		
		$q = "SELECT c.`comment_id`, c.`comment_category`, c.`comment_photo`, c.`comment_user`, c.`comment_text`, 
				c.`timestamp`, p.`photo_extension`, p.`photo_title`, ca.`category_name`, i.`individual_id`, i.`avatar`
				FROM ".TBL_GALLERY_COMMENTS." AS c, ".TBL_GALLERY_PHOTOS." AS p, 
						".TBL_GALLERY_CATEGORY." AS ca,".TBL_INDIVIDUALS." AS i
				WHERE c.`comment_user` IN ($familyMembersString)
				AND c.`comment_photo` = p.`photo_id`
				AND c.`comment_category` = ca.`category_id`
				AND c.`comment_user` = i.`individual_username`
				ORDER BY c.`timestamp` DESC";
        
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		$comments = array();
		$commentsNews = array(); 
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$comments[] = $row;
			}
			
			foreach ($comments as $comment) {
				$avatar = $comment['avatar'];
				$title = '<a href="familytree.php?profile='.$comment['individual_id'].'#menu">'.$comment['comment_user'].'</a> pakomentavo nuotrauką 
							<a href="photogallery.php?cid='.$comment['comment_category'].'&amp;pid='.$comment['comment_photo'].'#menu">'.$comment['photo_title'].'</a>';
				$description = '<a href="photogallery.php?cid='.$comment['comment_category'].'&amp;pid='.$comment['comment_photo'].'#menu">
									<img src="'.'uploads/photos/thumbs/thumb_'.$comment['comment_photo'].'.'.$comment['photo_extension'].'" alt="'.$comment['photo_title'].'"/>
								</a>
								„<i>'.$comment['comment_text'].'</i>“';
				$date = date('Y-m-d H:i', $comment['timestamp']);
				
				$commentsNews[] = array("avatar"=>$avatar, "title"=>$title, "description"=>$description, "date"=>$date);
			}
		}
		return $commentsNews;
    }
	/**
     * getEventsNews
	 * Gets the news when new events are added to the family calendar
     */
	function getEventsNews($familyMembers) {
	
		$familyMembers = $this->site->cleanOutput($familyMembers);
		$familyMembersString = '"' .implode('","', array_values($familyMembers)). '"';
		
		$q = "SELECT e.`event_id`, e.`title`, e.`description`, e.`event_date`, e.`event_user`, 
				e.`repeat`, e.`timestamp`, c.`category_name`, i.`individual_id`, i.`avatar`
				FROM ".TBL_EVENTS." AS e,".TBL_EVENTS_CATEGORY." AS c, ".TBL_INDIVIDUALS." AS i
				WHERE e.`event_user` IN ($familyMembersString)
				AND e.`event_category` = c.`category_id`
				AND e.`event_user` = i.`individual_username`
				ORDER BY e.`timestamp` DESC";
        
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		$events = array();
		$eventsNews = array();
		
		if ($num_rows > 0) {
			 
			while ($row = mysql_fetch_assoc($result)) {
				$events[] = $row;
			}
		
			foreach ($events as $event) {
				if ($event['repeat'] == '1') {
					list($year, $month, $day) = explode('-', $event['event_date']);
					$event_date = "$month-$day";
				}
				else {
					$event_date = $event['event_date'];
				}
				$avatar = $event['avatar'];
				$title = '<a href="familytree.php?profile='.$event['individual_id'].'#menu">'.$event['event_user'].'</a> sukūrė naują įvykį 
							<a href="events.php?event='.$event['event_id'].'#menu">'.$event['title'].'</a>, kuris vyks '.$event_date.'';
				$description = (!empty($event['description']) ? '„<i>'.$event['description'].'</i>“' : '');
				$date = date('Y-m-d H:i', $event['timestamp']);
				
				$eventsNews[] = array("avatar"=>$avatar, "title"=>$title, "description"=>$description, "date"=>$date);		
			}
		}
		return $eventsNews;
    }
	/**
     * sortArrayByDate
	 * Sorts array by date in descending order
     */
	function sortArrayByDate($a, $b) {
		
		$d1 = strtotime($a['date']);
		$d2 = strtotime($b['date']);
		
		return $d2 - $d1;
	}
};
$homePage = new HomePage($database, $form, $events, $usermanagement, $site); 
?>