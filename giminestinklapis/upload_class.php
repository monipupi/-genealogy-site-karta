<?php
include_once('include/form.php');
include_once('site.php');

class Upload {

	var $database;
	var $form;
	var $site;
    
    function Upload($database, $form, $site) {
	
		$this->database = $database;
		$this->formError = $form; 
		$this->site = $site;
    }
		/**
     * getFamilyCategories
     * 
     * Used to get ids array of all the categories of user's family. 
     */
	function getFamilyCategories($username) {
		 
		 $username = $this->site->cleanOutput($username);
		 
		$q = "SELECT c.category_id
				FROM ".TBL_GALLERY_CATEGORY." AS c 
				INNER JOIN ".TBL_MANAGERS." AS m 
				ON m.manager_family = (
					SELECT individual_family 
					FROM ".TBL_INDIVIDUALS." 
					WHERE individual_username = '$username'
				) 
				AND c.category_user = m.manager_username";
		
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		$familyCategories = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$familyCategories[] = $row['category_id'];
			}
		}
		return $familyCategories;
	}
	/**
     * getCurrentUserFamily 
     * 
     * Used to get ids array of all the family members of current user. 
     */
	function getCurrentUserFamily($username) {
		 
		 $username = $this->site->cleanOutput($username);
		 
		$q = "SELECT `individual_id` 
			FROM ".TBL_INDIVIDUALS." 
			WHERE `individual_family` = (
				SELECT `individual_family`
				FROM ".TBL_INDIVIDUALS."
				WHERE `individual_username` = '$username'
			)";
		
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		$familyMembers = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$familyMembers[] = $row['individual_id'];
			}
		}
		return $familyMembers;
	}
	/**
     * uploadPhoto 
     * 
     * Uploads photo to the given directory and saves the information to the database table
     * 
     */
	 function uploadPhoto($username, $cid, $photo, $tmp_photo, $caption) {
		
		if ($photo) {	
			$this->filename = $photo;
			$this->extension = $this->getExtension($this->filename);
			$this->extension = strtolower($this->extension);
			$valid_extensions = array('jpg', 'jpeg', 'png', 'bmp');
			
			if (!in_array($this->extension, $valid_extensions)) {
				$field = "fileName";
				$this->formError->setError($field, "* Neleistino formato failas");
			}
			else {
				//Gets the size of the image in bytes
				$size = filesize($tmp_photo);

				if ($size > MAX_SIZE*1024) {
					$field = "fileName";
					$this->formError->setError($field, "* Per didelis failas");
				}
				else {
					$field = "caption";
					if(!$caption || strlen($caption = trim($caption)) == 0){
						$this->formError->setError($field, "* Pavadinimas neįvestas");
					}
					else if (preg_match("/^[0-9a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-,.;:']+$/", $caption) == 0) {
						$this->formError->setError($field, "* Netinkamas simbolis");
					}
					else {
						$username = $this->site->cleanOutput($username);
						$caption = $this->site->cleanOutput($caption);
						$cid = $this->site->cleanOutput($cid);
						$timestamp = time();
				
						$q = "INSERT INTO ".TBL_GALLERY_PHOTOS." (
							`photo_extension`, `photo_title`, `photo_category`, `photo_user`, `timestamp`
							) 
							VALUES 
								('$this->extension', '$caption', '$cid', '$username', '$timestamp')"; 

						$result = $this->database->query($q);
			
						if ($result == false) {
							$result .= die(mysql_error());
							return;
						}
						
						$new_id = mysql_insert_id();

						$photo_name = $new_id.'.'.$this->extension;
						$new_src = "uploads/photos/full-size/".$photo_name;

						$copied = copy($tmp_photo, $new_src);
						
						if (!$copied) {
							$field = "fileName";
							$this->formError->setError($field, "* Nepavyko sėkmingai perkelti");
						}
						else {
							$photo_src = "uploads/photos/".$photo_name;
							$this->resizeImage($new_src, $photo_src, 560, 560);
							
							$thumb_src = "uploads/photos/thumbs/thumb_".$photo_name;
							$this->cropResizeImage($new_src, $thumb_src, 100);
						}
					}
				}
			}	
		} 
		else {
			$field = "fileName";
			$this->formError->setError($field, "* Pasirinkite nuotrauką");
		}
	 }
	 /**
     * uploadAvatar 
     * 
     * Uploads avatar to the given directory and saves the information to the database table
     * 
     */
	 function uploadAvatar($individualid, $avatar, $tmp_avatar) {
		
		if ($avatar) {
			$this->filename = $avatar;
			$this->extension = $this->getExtension($this->filename);
			$this->extension = strtolower($this->extension);
			$valid_extensions = array('jpg', 'jpeg', 'png', 'bmp');
			
			if (!in_array($this->extension, $valid_extensions)) {
				$field = "fileName";
				$this->formError->setError($field, "* Neleistino formato failas");
			}
			else {
				//Gets the size of the image in bytes
				$size = filesize($tmp_avatar);

				$individualid = $this->site->cleanOutput($individualid);
				$avatar_name = $individualid.'.'.$this->extension;

				if ($size > MAX_SIZE*1024) {
					$field = "fileName";
					$this->formError->setError($field, "* Per didelis failas");
				}
				else {
					$q = "UPDATE ".TBL_INDIVIDUALS." SET avatar = '$avatar_name' WHERE individual_id = '$individualid'"; 

					$result = $this->database->query($q);
		
					if ($result == false) {
						$result .= die(mysql_error());
						return;
					}

					$small_src = "uploads/avatars/small/".$avatar_name;
					$large_src = "uploads/avatars/large/".$avatar_name;

					$small_copied = copy($tmp_avatar, $small_src);
					$large_copied = copy($tmp_avatar, $large_src);
					
					if (!$small_copied || !$large_copied) {
						$field = "fileName";
						$this->formError->setError($field, "* Nepavyko sėkmingai perkelti");
					}
					else {
						$this->cropResizeImage($small_src, $small_src, 60);
						$this->cropResizeImage($large_src, $large_src, 100);
					}
				}
			}	
		} 
		else {
			$field = "fileName";
			$this->formError->setError($field, "* Pasirinkite nuotrauką");
		}
	 }
	/**
     * getCategories 
     * 
     * Gets the information of all the categories that belong to the current user's family
     * 
     */
	 function getCategories($username) {
		 
		$username = $this->site->cleanOutput($username);
			
		$q = "SELECT `category_id`, `category_name` 
				FROM ".TBL_GALLERY_CATEGORY.",".TBL_MANAGERS." 
				WHERE `manager_family` = (
					SELECT `individual_family`
					FROM ".TBL_INDIVIDUALS."
					WHERE `individual_username` = '$username'
				) 
				AND category_user = manager_username";
				  
		$result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		$categories = array();
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$categories[] = $row;
			}
			
			return $categories;
		}
	 }
	 /**
     * getcurrentAvatar
     * 
     * Gets the info of the avatar that given individual is currently using
     */
	function getcurrentAvatar($individualid) {
        
		$individualid = $this->site->cleanOutput($individualid);
		
		$q = "SELECT avatar
				FROM ".TBL_INDIVIDUALS." 
				WHERE individual_id = '$individualid'";
        
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		list($avatar) = mysql_fetch_array($result);

		return $avatar;
	}
	/**
     * getExtension 
     * 
     * Gets the extension of the file
     * 
     */
	 function getExtension($string) {
		 
		$i = strrpos($string,".");

		if (!$i) { 
			return ""; 
		}

		$length = strlen($string) - $i;
		$extension = substr($string, $i+1, $length);
		
		return $extension;
	 }
	/**
	* resizeImage
	* 
	* Resizes the image for the gallery view
	* 
	*/
	function resizeImage($img_name, $filename, $new_w, $new_h) {

		$this->extension = $this->getExtension($img_name);
		if(!strcmp("jpg", $this->extension) || !strcmp("jpeg",$this->extension)) {
			$src_img = imagecreatefromjpeg($img_name);
		}		
		if(!strcmp("png",$this->extension)) {
			$src_img = imagecreatefrompng($img_name);
		}
		if(!strcmp("bmp", $this->extension)) {
			$src_img = imagecreatefromwbmp($img_name);
		}

		$old_x = imageSX($src_img);
		$old_y = imageSY($src_img); 

		$ratio1 = $old_x/$new_w;
		$ratio2 = $old_y/$new_h; 

		if ($ratio1 > $ratio2) {
			$thumb_w = $new_w;
			$thumb_h = $old_y / $ratio1;
		}
		else {
			$thumb_h = $new_h;
			$thumb_w = $old_x / $ratio2;
		}

		// Creates a new image with the new dimmensions
		$dst_img=ImageCreateTrueColor($thumb_w,$thumb_h);

		// Resizes the big image to the new created one
		imagecopyresampled($dst_img, $src_img, 0, 0, 0, 0, $thumb_w, $thumb_h, $old_x, $old_y); 

		// Outputs the created image to the file. 
		if (!strcmp("jpg", $this->extension) || !strcmp("jpeg", $this->extension)) {
			imagejpeg($dst_img, $filename); 
		}		
		else if (!strcmp("png", $this->extension)) {
			imagepng($dst_img, $filename); 
		} 
		else {
			imagewbmp($dst_img, $filename); 
		}
		
		imagedestroy($dst_img); 
		imagedestroy($src_img);
	}
	/**
	* cropResizeImage
	* 
	* Creates the thumbnail image from the uploaded image
	* 
	*/
	function cropResizeImage($img_name, $filename, $thumbSize) {

		$this->extension = $this->getExtension($img_name);
		if(!strcmp("jpg", $this->extension) || !strcmp("jpeg",$this->extension)) {
			$src_img = imagecreatefromjpeg($img_name);
		}		
		if(!strcmp("png",$this->extension)) {
			$src_img = imagecreatefrompng($img_name);
		}
		if(!strcmp("bmp", $this->extension)) {
			$src_img = imagecreatefromwbmp($img_name);
		}
		
		$width = imageSX($src_img);
		$height = imageSY($src_img); 	
		
		// calculating the part of the image to use for thumbnail
		if ($width > $height) {
			$y = 0;
			$x = ($width - $height) / 2;
			$smallestSide = $height;
		} 
		else {
			$x = 0;
			$y = ($height - $width) / 2;
			$smallestSide = $width;
		}

		// Creates a new image with the new dimmensions
		$dst_img = ImageCreateTrueColor($thumbSize, $thumbSize);

		// Resizes the big image to the new created one
		imagecopyresampled($dst_img, $src_img, 0, 0, $x, $y, $thumbSize, $thumbSize, $smallestSide, $smallestSide); 

		// Outputs the created image to the file. 
		if (!strcmp("jpg", $this->extension) || !strcmp("jpeg", $this->extension)) {
			imagejpeg($dst_img, $filename); 
		}		
		else if (!strcmp("png", $this->extension)) {
			imagepng($dst_img, $filename); 
		} 
		else {
			imagewbmp($dst_img, $filename); 
		}
		
		imagedestroy($dst_img); 
		imagedestroy($src_img);
	}
	/**
     * displayUploadPhotoForm
     */
    function displayUploadPhotoForm($categoryid) {
	
		?>
		<div class="gallery-panel">
			<div class="form_container">
				<div class="form">
					<h1>Nauja nuotrauka</h1>
					<form method="post" enctype="multipart/form-data" action="upload.php">
						<div class="form_section upload_photo">
							<h3>Nuotrauka</h3>
							<input type="text" id="fileName" name="fileName" placeholder="Pasirinkite nuotrauką"/>
							<div class="fileUpload uploadBtn">
								<span>Įkelti</span>
								<input id="uploadBtn" name="photo" type="file" class="upload" />
							</div>
							<?php echo $this->formError->error("fileName"); ?>
						</div>
						<div class="form_section photo_title">
							<h3>Antraštė</h3>
							<input type="text" name="caption" value="<?php echo $this->formError->value("caption"); ?>" placeholder="Rašykite antraštę čia"/>
							<?php echo $this->formError->error("caption"); ?>
						</div>
						<p>
							<input type="hidden" name="category" value="<?php echo $categoryid; ?>"/>
						</p>
						<p class="submit">
							<input class="first-btn" type="submit" name="submit-photo" value="Patvirtinti"/>&nbsp;
							<label>arba</label>&nbsp;
							<a href="photogallery.php?cid=<?php echo $categoryid; ?>#menu">Atšaukti</a>
						</p>
					</form>
				</div>
			</div>
		</div>
		<script type="text/javascript">
		//<![CDATA[
			document.getElementById("uploadBtn").onchange = function () {
				document.getElementById("fileName").value = this.value;
			};
		//]]>
		</script>
		<?php
    }
	/**
     * displayEditAvatarForm 
     */
    function displayUploadAvatarForm($individualid) {
        	
        $avatar = $this->getcurrentAvatar($individualid);
		
		?>
		<div class="gallery-panel">
			<div class="form_container_2">
				<div class="form">
					<h1>Redaguoti profilio nuotrauką</h1>
					<form enctype="multipart/form-data" action="upload.php" method="post">
						<div class="form_section current_avatar">
							<h3>Jūsų profilio nuotrauka</h3>
							<div class="avatar">
								<img src="uploads/avatars/large/<?php echo $avatar; ?>" alt=""/>
							</div>
						</div>
						<div class="form_section upload_avatar">
							<h3>Nauja nuotrauka</h3>
							<input type="text" id="fileName" name="fileName" placeholder="Pasirinkite nuotrauką"/>
							<div class="fileUpload uploadBtn">
								<span>Įkelti</span>
								<input id="uploadBtn" name="avatar" type="file" class="upload" />
							</div>
							<?php echo $this->formError->error("fileName"); ?>
						</div>
						<p>
							<input type="hidden" name="individualid" value="<?php echo $individualid; ?>"/>
						</p>
						<p class="submit">
							<input class="first-btn" type="submit" name="submit-avatar" value="Patvirtinti"/>&nbsp;
							<label>arba</label>&nbsp;
							<a href="familytree.php?tree=<?php echo $individualid; ?>#menu">Atšaukti</a>
						</p>
					</form>
				</div>
			</div>
		</div>
		<script type="text/javascript">
		//<![CDATA[
			document.getElementById("uploadBtn").onchange = function () {
				document.getElementById("fileName").value = this.value;
			};
		//]]>
		</script>
		<?php
    }
};
$upload = new Upload($database, $form, $site);
?>