<?php 
session_start();

define('URL_PREFIX', '../');

include('../usermanagement_class.php');
include_once('../include/form.php');
include_once('../site.php');
    
class Gallery {

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
	
    function Gallery($database, $form, $usermanagement, $site) {
	
		$this->database = $database;
		$this->formError = $form;
		$this->usermanagement = $usermanagement;
		$this->site = $site;
		$this->time = time();
		$this->setSessionVariables();
		
		$this->template = array(
            'sitename'      => 'Karta',
            'pagetitle'     => 'Tvarkyti galerijas',
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
		
		if (isset($_GET['cid'])) {
            $this->cid = $_GET['cid'];
        }
        else {
            $this->cid = 0;
        }
        if (isset($_GET['pid'])) {
            $this->pid = $_GET['pid'];
        }
		else {
            $this->pid = 0;
        }
		if (isset($_GET['page'])) {
			$this->page = $_GET['page'];
		}
		else {
			$this->page = 1;
		}
		if (isset($_POST['submit-vote'])) {
			$this->clickVoteSubmit();
		} 
		else if (isset($_POST['add-comment'])) {
			$this->addCommentSubmit();
		}
		else if (isset($_POST['add-category'])) {
			$this->addNewCategorySubmit();
		}
		else if (isset($_POST['edit-category'])) {
			$this->editCategorySubmit();
		}
		else if (isset($_GET['del-photo']) && !isset($_POST['confirm-del-photo'])) {
			$this->displayConfirmDelete();
		}
		else if (isset($_POST['confirm-del-photo'])) {
			$this->deletePhotoSubmit();
		}
		else if (isset($_GET['del-category']) && !isset($_POST['confirm-del-category'])) {
			$this->displayConfirmDelete();
		}
		else if (isset($_POST['confirm-del-category'])) {
			 $this->deleteCategorySubmit();
		}
		else if (isset($_GET['del-comment']) && !isset($_POST['confirm-del-comment'])) {
			$this->displayConfirmDelete();
		}
		else if (isset($_POST['confirm-del-comment'])) {
			$this->deleteCommentSubmit();
		}
		else if (isset($_GET['add-category'])){
		 $this->displayAddCategoryForm();
		}
		else if (isset($_GET['edit-category'])){
		 $this->displayEditCategoryForm();
		}
		else if (isset($_GET['search'])) {
			$this->displaySearchResults();
		}
		else {
			$this->displayGallery();
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
     * displayGallery 
     */
	function displayGallery() {
		
		$username = $this->site->cleanOutput($this->username);
		$cid = $this->site->cleanOutput($this->cid);
		$pid = $this->site->cleanOutput($this->pid);
		$page = $this->site->cleanOutput($this->page); 
  
		$this->displayHeader();
		$this->initializeDisplayGalleryScript();
		echo "<div id='gallery-panel' class='gallery-panel'>"; 
		
		// Category Listing 
		if (empty($cid) && empty($pid)) { 
			$this->displayCategories($username, $cid, $page);
		} 
		// Thumbnail Listing for Category 
		else if ($cid && empty($pid)) {
			$this->displayThumbnails($cid, $page);
		}
		// The Full-Size Photo
		// Previous, next photo 
		 else if($pid) {  
			$this->displayPhoto($cid, $pid);
			$this->displayAddVoteForm();
			$this->displayComments($cid, $pid, $page);
		}
		
		echo "</div>";	
		$this->displayFooter();
	}
	/**
     * displayCategories 
     */
	function displayCategories($username, $cid, $page) {

		$result_array = array(); 
		$counter = 0;
		$catrow = 4; 
		$phorow = 5;
		$max_results = 25;
		// Result limit per page  
		$from = (($page * $max_results) - $max_results);

		$result_final = "<div class='gallery-menu'>";
		$this->displaySearchForm();
		$result_final .= "
						</div>
						<table class='gallery'>";
						
		$q = "SELECT c.category_id, c.category_name, c.category_user, 
				p.photo_id, p.photo_extension
				FROM ".TBL_GALLERY_CATEGORY." AS c 
				LEFT JOIN ".TBL_GALLERY_PHOTOS." AS p 
				ON p.photo_category = c.category_id 
				GROUP BY c.category_id
				LIMIT $from, $max_results";
		 
		$result = $this->database->query($q); 
		
		$num_rows = mysql_num_rows($result);
		
		if (empty($num_rows)) {
			$result_final .= "<div class='notice'><p>Galerija tuščia. Sukurkite naują <a href='".$this->url."?add-category=0#menu'>albumą</a>!</p></div>";
		}
		else {
			while ($row = mysql_fetch_array($result)) { 
				$category_thumb = '';
				
				if (empty($row['photo_id'])) {
					$category_thumb = '../ui/css/images/gallery_icon.png';
				}
				else {
					$category_thumb = '../uploads/photos/thumbs/thumb_'.$row['photo_id'].'.'.$row['photo_extension'];
				}
				$result_array[] = "<div class='thumbs'>
										<a href='photogallery.php?cid=".$row['category_id']."&amp;pid=".$row['photo_id']."#menu' title='".$row['category_name']."'>
											<img src='".$category_thumb."' alt='".$row['category_name']."'/>
										</a>
										<a href='photogallery.php?cid=".$row['category_id']."#menu'>".$row['category_name']."</a>
										<p><b>Sukūrė:</b> ".$row['category_user']."</p>
									</div>";					   
			}   
			mysql_free_result($result); 
			$result_final .= "<tr>\n"; 
	  
			foreach ($result_array as $category_link) { 
				if($counter == $catrow) {  
					$counter = 0;
					$result_final .= "\t<td>".$category_link."</td>\n"; 
					$result_final .= "</tr>\n<tr>\n"; 
				} 
				else {
					$counter++; 
					$result_final .= "\t<td>".$category_link."</td>\n"; 
				}
			} 
			if($counter) { 
				if($phorow-$counter) {
					$result_final .= "\t<td colspan='".($phorow-$counter)."'>&nbsp;</td>\n"; 
					$result_final .= "	</tr>\n";
				}
			}
			else {
				$result_final .= "	</tr>\n"; 
			}
					
			// Results count
			$q =  "SELECT COUNT(*) AS num 
					FROM ".TBL_GALLERY_CATEGORY."";
			
			$result = $this->database->query($q);
			
			$total_results = mysql_result($result,0);  
			$total_pages = ceil($total_results / $max_results);  
			
			if ($total_pages > 1) {
				$result_final .=  "<p>
										<tr><td colspan='".$phorow."' class='pagination'>";  
				// Previous page
				if($page > 1) {  
					$prev = ($page - 1);  
					$result_final .=  "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?page=$prev#menu\" title='Ankstenis'>&laquo</a>";  
				}  
				for($i = 1; $i <= $total_pages; $i++) {  
					if(($page) == $i) {  
						$result_final .= "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?page=$i#menu\" title='".$i." puslapis' class='selected'>$i</a>";  
					} 
					else  {  
						$result_final .=  "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?page=$i#menu\" title='".$i." puslapis'>$i</a>";  
					}  
				}  
				// Next page 
				if($page < $total_pages) {  
					$next = ($page + 1);  
					$result_final .=  "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?page=$next#menu\" title='Sekantis'>&raquo</a>";  
				}  
				$result_final .=  "\n</td></tr></p>";  
			} 
			else { 
				$result_final .=  "\n"; 
			}       
		}
		$result_final .=  "</table>"; 
		echo $result_final;
	}
	/**
     * displayThumbnails 
     */
	function displayThumbnails($cid, $page) {
									
		$result_array = array(); 
		$counter = 0;
		$thumbsrow = 4;   
		$phorow = 5;
		$max_results = 25;
		// Result limit per page  
		$from = (($page * $max_results) - $max_results); 
		
		$result_final = "<div class='gallery-menu'>";
		$this->displaySearchForm();
		$result_final .= "	<a class='edit-icon' href='".$this->url."&edit-category=".$cid."#menu'>Redaguoti albumą</a>
							<a class='del-icon' href='".$this->url."&del-category=".$cid."'>Trinti albumą</a>
						</div>
						<table class='gallery'>";
		
		$q = "SELECT photo_id, photo_extension, photo_title, photo_category 
				FROM ".TBL_GALLERY_PHOTOS." 
				WHERE photo_category = '$cid'
				LIMIT $from, $max_results";
		$result = $this->database->query($q);
						
		$num_rows = mysql_num_rows($result);
		
		if (empty($num_rows)) {
			$result_final .= "<div class='notice'><p>Albume nėra nuotraukų.</p></div>";
		}
		else {
			while($row = mysql_fetch_array($result)) {
				$result_array[]= "
								<div class='thumbs'>
									<a href='photogallery.php?cid=$cid&amp;pid=".$row['photo_id']."#menu' title='".$row['photo_title']."'>
										<img src='"."../uploads/photos/thumbs/"."thumb_".$row['photo_id'].".".$row['photo_extension']."' alt='".$row['photo_title']."'/>
									</a>
								</div>";
			}
			mysql_free_result($result); 
		   
			$q = "SELECT photo_category 
					FROM ".TBL_GALLERY_PHOTOS." 
					WHERE photo_category='".$cid."'";
			$result = $this->database->query($q);
			
			$row = mysql_fetch_assoc($result);
			$result_final .= "<tr>\n";
		   
			foreach($result_array as $thumbnail_link) { 
				if($counter == $thumbsrow) {  
					$counter = 0;
					$result_final .= "\t<td>".$thumbnail_link."</td>\n"; 
					$result_final .= "</tr>\n<tr>\n"; 
				} 
				else {
					$counter++; 
					$result_final .= "\t<td>".$thumbnail_link."</td>\n"; 
				}
			} 
			if($counter) { 
				if($phorow-$counter) {
					$result_final .= "\t<td colspan='".($phorow-$counter)."'>&nbsp;</td>\n"; 
					$result_final .= "	</tr>\n";
				}
			}
			else {
				$result_final .= "	</tr>\n"; 
			}

			// Results count
			$q =  "SELECT COUNT(*) AS num 
					FROM ".TBL_GALLERY_PHOTOS." 
					WHERE photo_category=".$cid."";
			
			$result = $this->database->query($q);
			
			$total_results = mysql_result($result,0);  
			$total_pages = ceil($total_results / $max_results);  
			
			if ($total_pages >1) { 
				$result_final .=  "<p>
										<tr><td colspan='".$phorow."' class='pagination'>";  
				// Previous page
				if($page > 1) {  
					$prev = ($page - 1);  
					$result_final .=  "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?cid=$cid&page=$prev#menu\" title='Ankstenis'>&laquo</a>";  
				}  
				for($i = 1; $i <= $total_pages; $i++) {  
					if(($page) == $i) {  
						$result_final .= "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?cid=$cid&page=$i#menu\" title='".$i." puslapis' class='selected'>$i</a>";  
					} 
					else  {  
						$result_final .=  "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?cid=$cid&page=$i#menu\" title='".$i." puslapis'>$i</a>";  
					}  
				}  
				// Next page 
				if($page < $total_pages) {  
					$next = ($page + 1);  
					$result_final .=  "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?cid=$cid&page=$next#menu\" title='Sekantis'>&raquo</a>";  
				}  
				$result_final .=  "\n</td></tr></p>";  
			} 
			else { 
				$result_final .=  "\n"; 
			}              
		}
		$result_final .=  "</table>"; 
		echo $result_final;
	}
	/**
     * displayPhoto 
     */
	function displayPhoto($cid, $pid) {

		$q = "SELECT photo_id, photo_extension, photo_title, photo_user, timestamp 
				FROM ".TBL_GALLERY_PHOTOS." 
				WHERE photo_id = '$pid'";
			
		$result = $this->database->query($q);		
		
		list($photo_id, $photo_extension, $photo_title, $photo_user, $timestamp) = mysql_fetch_array($result);  
		
		$num_rows = mysql_num_rows($result);  
		
		mysql_free_result($result);      

		//Order photos  
		$q = "SELECT photo_id 
				FROM ".TBL_GALLERY_PHOTOS." 
				WHERE photo_category = '$cid' 
				ORDER BY photo_id DESC";  
				
		$result = $this->database->query($q);

		$ct = mysql_num_rows($result);      
		
		while ($row = mysql_fetch_array($result)) {  
			$pid_array[] = $row[0];  
		}  
		
		mysql_free_result($result);  

		if (empty($num_rows)) {  
			$result_final = "<div class='notice'><p>Nerasta nuotrauka.</p></div>";  
		}  
		else  {  
			$q = "SELECT category_name 
					FROM ".TBL_GALLERY_CATEGORY." 
					WHERE category_id = '$cid'"; 
			
			$result = $this->database->query($q);			
				
			list($category_name) = mysql_fetch_array($result);  
			mysql_free_result($result);      

			$result_final = "<table class='gallery'>
								<tr class='controls'>
									<td class='nav-categories'>  
										<a href=photogallery.php>Albumai</a> &raquo  
										<a href=photogallery.php?cid=$cid#menu>$category_name</a><br><br>
									</td>";  
				  
			if ($ct > 1) {  
				$key = array_search($pid, $pid_array);  
				$prev = $key - 1;  
				if ($prev < 0) 
					$prev = $ct - 1;  
					$next = $key + 1;  
					if ($next == $ct)
						$next = 0;  
						$result_final .= "<td class='nav-controls'>";  
						$result_final .= "<a class='prev' href=photogallery.php?cid=$cid&amp;pid=".$pid_array[$prev]."#menu title='Ankstesnė'>Ankstenė &laquo</a>";  
						$result_final .= "<a class='photo-counter' href=#>".($key+1)."/".$ct."</a>";  
						$result_final .= "<a class='next' href=photogallery.php?cid=$cid&amp;pid=".$pid_array[$next]."#menu title='Sekanti'>Sekanti &raquo</a>";  
						$result_final .= "</td>
										</tr>";  
			} 
			
			$result_final .= "
							<tr>\n\t
								<td>  
									<div class='image'>
										<a href=photogallery.php?cid=$cid&amp;pid=".$pid."#menu>
											<img src='"."../uploads/photos/".$photo_id.".".$photo_extension."' alt='".$photo_title."'/>
										</a>
										<div class='caption'>
											<div class='photo-controls'>
												<div class='download'>
													<a href='".$this->site->getDomainAndDir()."../uploads/photos/full-size/".$photo_id.".".$photo_extension."'>Žiūrėti originalą</a>
												</div></br>
												<div class='delete'>
													<a href='".$this->url."&del-photo=".$photo_id."'>Trinti</a>
												</div>
											</div>
											<div class='image-title'>".$photo_title."</div>
											<div class='image-desc'>
												<b>Įkėlė:</b> ".$photo_user."</br>
												<b>Data:</b> ".date('Y-m-d', $timestamp)."
											</div>
										</div>
									</div>
								</td>
						  </tr>";
			
			$result_final .= "<tr>
								<td>
									<div class='votes'>
										<a id='votes' href='javascript: void(0)' title='Patinka'>
											<p>".$this->getVotes($cid, $pid)."</p>
										</a>
									</div>
									<div id='captionToggle'>
										<a href='#toggleCaption' class='off' title='Rodyti antraštę'>Rodyti antraštę</a>
									</div>
								</td>
							</tr>";

			$result_final .= "</table>";
		}   
		echo $result_final;
	}
	/**
	 * displayComments 
	 * Displays the comments of the photos
	 */
	function displayComments($cid, $pid, $page) {
	   
		$result_array = array();
		$counter = 0;
		$max_results = 25;
		$from = (($page * $max_results) - $max_results);
		
		$results_final = "<div class='comments'>";
		
	   if ((!empty($cid)) && (!empty($pid))) {
			$q = "SELECT c.comment_id, c.comment_category, c.comment_photo, c.comment_user, 
					c.comment_text, c.timestamp, i.individual_id, i.avatar
					FROM ".TBL_GALLERY_COMMENTS." AS c,".TBL_INDIVIDUALS." AS i
					WHERE c.comment_category = '$cid' 
					AND c.comment_photo = '$pid'
					AND c.comment_user = i.individual_username
					ORDER BY timestamp DESC
					LIMIT $from, $max_results";

		   $result = $this->database->query($q);
		   
		   $num_rows = mysql_numrows($result);
		   
			if ($result == false || ($num_rows < 0)) {
				$result .= die(mysql_error());
				return;
			}
			if ($num_rows == 0){ 
				$results_final .= "<div class='notice'><p>Komentarų nėra. Pasidalinkite savo mintimis apie šią nuotrauką!</p></div>";
			}
			else{     	 
				while($rows = mysql_fetch_assoc($result)) {
					
					$result_array[] = "
									<img src='"."../uploads/avatars/small/".$rows['avatar']."'>
									<a class='delete' href='".$this->url."&del-comment=".$rows['comment_id']."'>Trinti komentarą</a>
									<a href='familytree.php?profile=".$rows['individual_id']."'>".$rows['comment_user']."</a>
									<p class='date'>". date('Y-m-d H:i', $rows['timestamp']) ."</p>
									<p class='text'>". wordwrap($rows['comment_text'], 30, "<br/>\n", true) ."</p>";
				}
				mysql_free_result($result); 
				$results_final .= "<ul>";
				
				foreach ($result_array as $comment) { 
					$counter++;
					if ($counter <= $max_results) {
						$results_final .= "<li>".$comment."</li>"; 
					}
				}
				if($counter) {
					
					// Results count
					$q =  "SELECT COUNT(*) AS num 
							FROM ".TBL_GALLERY_COMMENTS."
							WHERE comment_category = '$cid' 
							AND comment_photo = '$pid'";
					
					$result = $this->database->query($q);
					
					$total_results = mysql_result($result,0);  
					$total_pages = ceil($total_results / $max_results);  
					
					if ($total_pages > 1) {  
						$results_final .=  "</ul>
											<div class='pagination'>";  
						// Previous page
						if($page > 1) {  
							$prev = ($page - 1);  
							$results_final .=  "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?cid=$cid&amp;pid=$pid&page=$prev#menu\" title='Ankstenis'>&laquo</a>";  
						}  
						for($i = 1; $i <= $total_pages; $i++) {  
							if(($page) == $i) {  
								$results_final .= "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?cid=$cid&amp;pid=$pid&page=$i#menu\" title='".$i." puslapis' class='selected'>$i</a>";  
							} 
							else  {  
								$results_final .=  "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?cid=$cid&amp;pid=$pid&page=$i#menu\" title='".$i." puslapis'>$i</a>";  
							}  
						}  
						// Next page 
						if($page < $total_pages) {  
							$next = ($page + 1);  
							$results_final .=  "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?cid=$cid&amp;pid=$pid&page=$next#menu\" title='Sekantis'>&raquo</a>";  
						}  
						$results_final .=  "</div>";  
					} 
					else { 
						$results_final .=  "\n"; 
					}
				}
			}
									
			$results_final .= "</div>";                
			echo $results_final;
		}
	}
	/**
	*  displaySearchResults 
	*/
	function displaySearchResults() {
		
		$username = $this->username;
		$search = $_GET['search'];
		$page = $this->page;
		$result_array = array(); 
		$counter = 0;
		$thumbsrow = 4;   
		$phorow = 5;
		$max_results = 25;
		// Result limit per page  
		$from = (($page * $max_results) - $max_results);
		$path = $this->url;
			
		if (strpos($path,'?search') == true) {
			$path = substr($path, 0, strpos($path, '?search'));
		}
		
		// Error checking
		$field = "search";
		if(!$search || strlen($search = trim($search)) == 0){
			$this->formError->setError($field, "* Įveskite tekstą");
		}
		else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:']+$/", $search) == 0) {
			$this->formError->setError($field, "* Netinkamas simbolis");
		}
		
		/* Errors exist, have user correct them */
		if($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: $path");
			
			return;
		}
		
		$username = $this->site->cleanOutput($username);
		$search = $this->site->cleanOutput($search);
		$page = $this->site->cleanOutput($page);
		
		$this->displayHeader();
		$this->initializeDisplayGalleryScript();
		
		$results_final = "<div class='gallery-panel'>";
		$results_final .= "<table class='gallery'>";
		
		$q = "SELECT photo_id, photo_extension, photo_title, photo_category, photo_user 
				FROM ".TBL_GALLERY_PHOTOS.",".TBL_GALLERY_CATEGORY."
				WHERE photo_category = category_id 
				AND photo_title LIKE '%$search%'
				LIMIT $from, $max_results";
				
		$result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		
		if(empty($num_rows)) {
			$results_final .= "<div class='notice'><p>Atsiprašome, rezultatų užklausai „<i>$search</i>“ nerasta.</p></div>";
		}
		else {
			$results_final .= "<p>Užklausa „<i>$search</i>“ grąžino $num_rows rezultatus(ų).</p>";       

			while($row = mysql_fetch_assoc($result)) {
				$result_array[] = "<div class='thumbs'>
										<a href='photogallery.php?cid=".$row['photo_category']."&amp;pid=".$row['photo_id']."#menu' title='".$row['photo_title']."'>
											<img src='"."../uploads/photos/thumbs/thumb_".$row['photo_id'].".".$row['photo_extension']."' alt='".$row['photo_title']."'/>
										</a>
										<p>".$row['photo_title']."</p>
									</div>";					   
			}   
			mysql_free_result($result); 
			$results_final .= "<tr>\n";

			foreach ($result_array as $thumbnail_link) {
				if($counter == $thumbsrow) {  
					$counter = 0;
					$results_final .= "\t<td>".$thumbnail_link."</td>\n"; 
					$results_final .= "</tr>\n<tr>\n"; 
				} 
				else {
					$counter++; 
					$results_final .= "\t<td>".$thumbnail_link."</td>\n"; 
				}
			} 
			if($counter) { 
				if($phorow-$counter) {
					$results_final .= "\t<td colspan='".($phorow-$counter)."'>&nbsp;</td>\n"; 
					$results_final .= "	</tr>\n";
				}
			}
			else {
				$results_final .= "	</tr>\n"; 
			}
					
			// Results count
			$q =  "SELECT COUNT(*) AS num 
					FROM ".TBL_GALLERY_PHOTOS."
					WHERE photo_title LIKE '%$search%'";
			
			$result = $this->database->query($q);
			
			$total_results = mysql_result($result,0);  
			$total_pages = ceil($total_results / $max_results);  
			
			if ($total_pages > 1) {  
				$results_final .=  "<p>
										<tr><td colspan='".$phorow."' class='pagination'>";  
				// Previous page
				if($page > 1) {  
					$prev = ($page - 1);  
					$results_final .=  "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?search=$search&page=$prev#menu\" title='Ankstenis'>&laquo</a>";  
				}  
				for($i = 1; $i <= $total_pages; $i++) {  
					if(($page) == $i) {  
						$results_final .= "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?search=$search&page=$i#menu\" title='".$i." puslapis' class='selected'>$i</a>";  
					} 
					else  {  
						$results_final .=  "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?search=$search&page=$i#menu\" title='".$i." puslapis'>$i</a>";  
					}  
				}  
				// Next page 
				if($page < $total_pages) {  
					$next = ($page + 1);  
					$results_final .=  "\n<a href=\"".$this->site->getDomainAndDir()."photogallery.php?search=$search&page=$next#menu\" title='Sekantis'>&raquo</a>";  
				}  
				$results_final .=  "\n</td></tr></p>";  
			} 
			else { 
				$results_final .=  "\n"; 
			}       
		} 
		$results_final .=  "
							</table>
						</div>";
						
		echo $results_final;
		
		$this->displayFooter();
	}
	/**
	 * getVotes 
	 * Gets the count of votes for the given photo
	 */
	function getVotes($cid, $pid){
		
		if ((!empty($cid)) && (!empty($pid))) {
			$votes = 0;
			$q = "SELECT vote_id
					FROM ".TBL_GALLERY_VOTES."
					WHERE vote_category = '$cid' 
					AND vote_photo = '$pid'";

			$result = $this->database->query($q);

			$num_rows = mysql_numrows($result);
			if ($result == false || ($num_rows < 0)) {
				$result .= die(mysql_error());
				return; 
			}
			if ($num_rows != 0){   
				while($rows = mysql_fetch_assoc($result)) {
					$votes++;	
				}
			}
			return $votes;
		}
	}
	/**
	 * addComment
	 * Adds new comment to the database
	 */
	function addCommentSubmit() {
		
		$username = $this->site->cleanOutput($this->username);
		$cid = $this->site->cleanOutput($this->cid);
		$pid = $this->site->cleanOutput($this->pid);
		$comment = $this->site->cleanOutput($_POST['comment']);
		$path = "photogallery.php?cid=$cid&pid=$pid";
		$field = "comment";
		
		if(!$comment || strlen($comment = trim($comment)) == 0){
			$this->formError->setError($field, "* Įveskite komentarą");
		}
		else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:()']+$/", $comment) == 0) {
			$this->formError->setError($field, "* Netinkamas simbolis");
		}
		
	   /* Errors exist, have user correct them */
		if($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: $this->url");
		}
	   else {
			$q = "INSERT INTO ".TBL_GALLERY_COMMENTS."(
					comment_user, comment_category, comment_photo, comment_text, timestamp
					)
					VALUES 
						('$username', '$cid', '$pid', '$comment', '$this->time')"; 
			
			$result = $this->database->query($q);
			
			if ($result == false) {
				$this->formError->setError($field, "* Komentaras nenusiųstas. Bandykite dar kartą!");
			}
			else {
				header("Location: $path");
			} 
		}
	}
	/**
	 * addVoteSubmit
	 * Adds new vote to the database
	 */
	function clickVoteSubmit(){
	
		$username = $this->site->cleanOutput($this->username);
		$cid = $this->site->cleanOutput($_POST['cid']);
		$pid = $this->site->cleanOutput($_POST['pid']);
	
		$q = "SELECT vote_id 
				FROM ".TBL_GALLERY_VOTES." 
				WHERE vote_user = '$username'
				AND vote_category = '$cid'
				AND vote_photo = '$pid'";
				
		$result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		if ($num_rows > 0) {
			$q = "DELETE FROM ".TBL_GALLERY_VOTES." 
					WHERE vote_user = '$username'
					AND vote_category = '$cid'
					AND vote_photo = '$pid'";
					
			$result = $this->database->query($q);
			 
			if ($result == false) {
				$result .= die(mysql_error());
				return;
			}
			else {
				header("Location: $this->url");
			} 	
		}
		else {
			$q = "INSERT INTO ".TBL_GALLERY_VOTES."(
					vote_category, vote_photo, vote_user
					) 
					VALUES 
						('$cid', '$pid', '$username')"; 
			
			$result = $this->database->query($q);
			
			if ($result == false) {
				$result .= die(mysql_error());
	
			}
			else {
				header("Location: $this->url");
			} 	
		}
	}
	/**
    * checkCategoryName - makes sure the submitted category name is valid, if not,
    * it adds the appropritate error to the form.
    */
	function checkCategoryName($name){
      
		$field = "category-name";  //Use field name for category name

		// Category name error checking
		if(!$name || strlen($name = trim($name)) == 0){
			$this->formError->setError($field, "* Pavadinimas neįvestas");
		}
		else if (strlen($name) < 2) {
			$this->formError->setError($field, "* Pavadinimas per trumpas");
		}
		else if (strlen($name) > 30) {
			$this->formError->setError($field, "* Pavadinimas per ilgas");
		}
		else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:']+$/", $name) == 0) {
			$this->formError->setError($field, "* Netinkamas simbolis pavadinime");
		}
		else {
			$username = $this->site->cleanOutput($this->username);
			$name = $this->site->cleanOutput($name);
		
			$q = "SELECT category_id 
			FROM ".TBL_GALLERY_CATEGORY." 
			WHERE category_user IN (
				SELECT manager_username 
				FROM ".TBL_MANAGERS." 
				WHERE manager_family = (
					SELECT individual_family 
					FROM ".TBL_INDIVIDUALS." 
					WHERE individual_username = category_user
				)
			)
			AND category_name = '$name'";

			$result = $this->database->query($q);

			if ($result == false) {
				$result .= die(mysql_error());
				return;
			}
			$num_rows = mysql_num_rows($result);

			if ($num_rows > 0) {
				$this->formError->setError($field, "* Pavadinimas užimtas");
			}
			else {
				return $name;
			}
		}
	} 
   /**
    * deletePhotoSubmit - deletes photo from the database.
    */
    function deletePhotoSubmit() {
      
		$username = $this->site->cleanOutput($this->username);
		$cid = $this->site->cleanOutput($_POST['confirm-category']);
		$pid = $this->site->cleanOutput($_POST['confirm-photo']);
		$path = "photogallery.php?cid=$cid";
		
		$q = "SELECT photo_extension FROM ".TBL_GALLERY_PHOTOS." 
				WHERE photo_category = '$cid'
				AND photo_id = '$pid'";
		 $result = $this->database->query($q);
		 
		 list($extension) = mysql_fetch_array($result);
		 
		// Delete photo from database
	     unlink('../uploads/photos/'.$pid.'.'.$extension); 
		 unlink('../uploads/photos/thumbs/'.'thumb_'.$pid.'.'.$extension);
		 unlink('../uploads/photos/full-size/'.$pid.'.'.$extension);
		 
         $q = "DELETE FROM ".TBL_GALLERY_PHOTOS." 
				WHERE photo_category = '$cid'
				AND photo_id = '$pid'";
         $result = $this->database->query($q);
		 
		 if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		 $q = "DELETE FROM ".TBL_GALLERY_COMMENTS." 
				WHERE comment_category = '$cid'
				AND comment_photo = '$pid'";
		 $result = $this->database->query($q);
		 
		 if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		 $q = "DELETE FROM ".TBL_GALLERY_VOTES." 
				WHERE vote_category = '$cid'
				AND vote_photo = '$pid'";
		 $result = $this->database->query($q);
		 
		 if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		 header("Location: $path");
   }
   /**
    * deleteCategorySubmit - deletes category from the database.
    */
   function deleteCategorySubmit(){
      
		$username = $this->site->cleanOutput($this->username);
		$cid = $this->site->cleanOutput($_POST['confirm-category']);		 
		$path = "photogallery.php";

		 $q = "SELECT photo_id, photo_extension 
				FROM ".TBL_GALLERY_PHOTOS." 
				WHERE photo_category = '$cid'"; 
		 $result = $this->database->query($q);

		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				unlink("../uploads/photos/".$row['photo_id'].".".$row['photo_extension']);
				unlink("../uploads/photos/thumbs/"."thumb_".$row['photo_id'].".".$row['photo_extension']);
				unlink("../uploads/photos/full-size/".$row['photo_id'].".".$row['photo_extension']);
			}
		}
		
		$q = "DELETE FROM ".TBL_GALLERY_PHOTOS." 
				WHERE photo_category = '$cid'"; 
		$result = $this->database->query($q);
		 
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		  
		$q = "DELETE FROM ".TBL_GALLERY_CATEGORY." 
				WHERE category_id = '$cid'";
		$result = $this->database->query($q);
		 
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$q = "DELETE FROM ".TBL_GALLERY_COMMENTS." 
				WHERE comment_category = '$cid'";
		$result = $this->database->query($q);
		 
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$q = "DELETE FROM ".TBL_GALLERY_VOTES." 
				WHERE vote_category = '$cid'";
		$result = $this->database->query($q);
		 
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		header("Location: $path");
	}
	/**
    * deleteCommentSubmit - deletes the comment from the database.
    */
	function deleteCommentSubmit(){
      
		$username = $this->site->cleanOutput($username);
		$cid = $this->site->cleanOutput($_POST['confirm-category']);	
		$pid = $this->site->cleanOutput($_POST['confirm-photo']);	
		$commentid = $this->site->cleanOutput($_POST['confirm-comment']);
		$path = "photogallery.php?cid=$cid&pid=$pid";
		
         $q = "DELETE FROM ".TBL_GALLERY_COMMENTS." 
				WHERE comment_category = '$cid'
				AND comment_photo = '$pid'
				AND comment_id = '$commentid'";
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
		<div id="delete-gallery" style="display:none">
		<?php
		if (isset($_GET['del-photo'])) {
			$pid = $_GET['del-photo'];
			$confirmMessage = "Ar tikrai norite ištrinti šią nuotrauką?";
			$path = "photogallery.php?cid=$this->cid&pid=$this->pid#menu";
			?>
			<form action="" method="post">
				<div>
					<input type="hidden" id="confirm-category" name="confirm-category" value="<?php echo $this->cid; ?>"/>
					<input type="hidden" id="confirm-photo" name="confirm-photo" value="<?php echo $pid; ?>"/>
					<input type="hidden" id="confirm-del-photo" name="confirm-del-photo"/>
				</div>
			</form>
		<?php
		}
		if (isset($_GET['del-comment'])) {
			$commentid = $_GET['del-comment'];
			$confirmMessage = "Ar tikrai norite ištrinti šį komentarą?";
			$path = "photogallery.php?cid=$this->cid&pid=$this->pid#menu";
			?>
			<form action="" method="post">
				<div>
					<input type="hidden" id="confirm-category" name="confirm-category" value="<?php echo $this->cid; ?>"/>
					<input type="hidden" id="confirm-photo" name="confirm-photo" value="<?php echo $this->pid; ?>"/>
					<input type="hidden" name="confirm-comment" value="<?php echo $commentid; ?>"/>
					<input type="hidden" id="confirm-del-comment" name="confirm-del-comment"/>
				</div>
			</form>
		<?php
		}
		if (isset($_GET['del-category'])) {
			$cid = $_GET['del-category'];
			$confirmMessage = "Ar tikrai norite ištrinti šį albumą?";
			$path = "photogallery.php?cid=$this->cid#menu";
			?>
			<form action="" method="post">
				<div>
					<input type="hidden" name="confirm-category" value="<?php echo $cid; ?>"/>
					<input type="hidden" id="confirm-del-category" name="confirm-del-category"/>
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
    * addNewCategorySubmit - If the submitted name is correct and unused,
    * the category is added to the database.
    */
	function addNewCategorySubmit(){
		
		$username = $this->site->cleanOutput($this->username); 
		$name = $_POST['category-name'];
		$path = "photogallery.php";

		// Category name error checking
		$checkedName = $this->checkCategoryName($name);

		/* Errors exist, have user correct them */
		if($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: $this->url");
		}
		/* Add new category */
		else{
			$q = "INSERT INTO ".TBL_GALLERY_CATEGORY."(category_name, category_user) VALUES ('$checkedName', '$username')";
			$result = $this->database->query($q);

			if ($result == false) {
				$result .= die(mysql_error());
				return;
			}
			header("Location: $path");
		}
   }
	/**
	* editCategorySubmit - if the submitted name is correct and unused the category is updated.
	*/
	function editCategorySubmit() {

		$username = $this->site->cleanOutput($this->username);
		$cid = $this->site->cleanOutput($_POST['category-id']);
		$name = $_POST['category-name'];
		$path = "photogallery.php?cid=$cid";

		// Category name error checking
		$checkedName = $this->checkCategoryName($name);

		/* Errors exist, have user correct them */
		if($this->formError->num_errors > 0) {
			$_SESSION['value_array'] = $_POST;
			$_SESSION['error_array'] = $this->formError->getErrorArray();
			header("Location: $this->url");
		}
		/* Update category */
		else {
			$q = "UPDATE ".TBL_GALLERY_CATEGORY." SET category_name = '$checkedName' WHERE category_id = '$cid'";
			$result = $this->database->query($q);

			if ($result == false) {
				$result .= die(mysql_error());
				return;
			}
			header("Location: $path");
		}
	}
	/**
     * displayAddCategoryForm 
     */
    function displayAddCategoryForm() {
		
		$this->displayHeader();
		?>
		<div class="gallery-panel">
			<div class="form_container">
				<div class="form">
					<h1>Naujas albumas</h1>
					<form method="post" action="">
						<div class="form_section category_name">
							<h3>Pavadinimas</h3>
							<input type="text" id="category-name" name="category-name" value="<?php echo $this->formError->value("category-name"); ?>" placeholder="Rašykite pavadinimą čia">
							<?php echo $this->formError->error("category-name"); ?>
						</div>
						<p class="submit">
							<input class="first-btn" type="submit" name="add-category" value="Patvirtinti">&nbsp;
							<label>arba</label>&nbsp;
							<a href="photogallery.php#menu">Atšaukti</a>
						</p>
					</form>
				</div>
			</div>
		</div>
		<?php
		$this->displayFooter();
    }
	/**
     * displayEditCategoryForm 
     */
    function displayEditCategoryForm() {
        
		$this->displayHeader();
		
		$cid = $this->site->cleanOutput($_GET['edit-category']);

		$q = "SELECT category_name
				FROM ".TBL_GALLERY_CATEGORY." 
				WHERE category_id = '$cid'";

		$result = $this->database->query($q);
				
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}	
		list($category_name) = mysql_fetch_array($result); 

		?>
		<div class="gallery-panel">
			<div class="form_container">
				<div class="form">
					<h1>Redaguoti albumą</h1>
					<form method="post" action="">
						<div class="form_section category_name">
							<h3>Pavadinimas</h3>
							<input type="text" id="category-name" name="category-name" value="<?php echo $category_name; ?>"  placeholder="Rašykite naują pavadinimą čia">
							<?php echo $this->formError->error("category-name"); ?>
						</div>
						<p>
							<input type="hidden" name="category-id" value="<?php echo $cid; ?>"/>
						<p>
						<p class="submit">
							<input class="first-btn" type="submit" name="edit-category" value="Patvirtinti">&nbsp;
							<label>arba</label>&nbsp;
							<a href="photogallery.php?cid=<?php echo $cid; ?>#menu">Atšaukti</a>
						</p>
					</form>
				</div>
			</div>
		</div>
		<?php
		$this->displayFooter();
    }
	/**
	 * displayAddVoteForm
	 */
	function displayAddVoteForm() {
		?>
		<div class="form_container" style="display:none">
			<div class="form">
				<form id="submit-vote" method="POST" action="">
					<input type="hidden" name="cid" value="<?php echo $this->cid; ?>"/>
					<input type="hidden" name="pid" value="<?php echo $this->pid; ?>"/>
					<input type="hidden" id="submit-vote" name="submit-vote" value="submit-vote"/>
				</form>
			</div>
		</div>
		<?php
	}
	/**
	 * displaySearchForm
	 */
	function displaySearchForm() {
		?>
		<div class="search">
			<form id="search" method="get" action="">
				<div id="search-input">
					<input type="text" name="search" id="search-text" value="<?php echo $this->formError->value("search"); ?>"/>
					<?php echo $this->formError->error("search"); ?>
				</div>
			</form>
		</div>
		<?php
	}
	/**
     * initializeDisplayGalleryScript
     */
    function initializeDisplayGalleryScript() {
		
		?>
		<script type="text/javascript">
		//<![CDATA[
			jQuery(document).ready(function($) {
				// Initially set opacity on thumbs and add
				// additional styling for hover effect on thumbs
				var onMouseOutOpacity = 0.67;
				$('.thumbs').opacityrollover({
					mouseOutOpacity:   onMouseOutOpacity,
					mouseOverOpacity:  1.0,
					fadeSpeed:         'fast'
				});

				// Enable toggling of the caption
				var captionOpacity = 0.0;
				$('#captionToggle a').click(function(e) {
					var link = $(this);
					
					var isOff = link.hasClass('off');
					var removeClass = isOff ? 'off' : 'on';
					var addClass = isOff ? 'on' : 'off';
					var linkText = isOff ? 'Slėpti antraštę' : 'Rodyti antraštę';
					captionOpacity = isOff ? 0.7 : 0.0;

					link.removeClass(removeClass).addClass(addClass).text(linkText).attr('title', linkText);
					$('.caption').fadeTo(1000, captionOpacity);
					
					e.preventDefault();
				});
				
				 $('.votes').click(function(e) {
					$('#submit-vote').submit();
					
					e.preventDefault();
				});
			});
		
		//]]>
		</script>
		<?php
	}
};
$gallery = new Gallery($database, $form, $usermanagement, $site);
 ?>