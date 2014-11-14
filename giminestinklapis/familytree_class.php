<?php 
include_once('include/form.php');
include_once('site.php');

class FamilyTree {

	var $database;
	var $form;
	var $site;
    
    function FamilyTree($database, $form, $site) {
	
		$this->database = $database;
		$this->formError = $form;  
		$this->site = $site;
    }
	/**
	* getCurrentUserID
	* 
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
     * displayFamilyTree 
     * 
     * Displays the family tree for the given user.
     * 
     */
	 
    function displayFamilyTree($username, $individualid, $leafid)	{
		
		$topOrientation = 'checked="checked"';
		$rightOrientation = '';
		$fatherLine   = 'checked="checked"';
        $motherLine = '';

        if (isset($_POST['tree-orientation'])) {
			if ($_POST['tree-orientation'] == 'top') {
				$topOrientation = 'checked="checked"';
				$rightOrientation = '';
			}
            else {
				$topOrientation = '';
				$rightOrientation = 'checked="checked"';
			}
        }
		 if (isset($_POST['inheritance-line'])) {
			if ($_POST['inheritance-line'] == 'father') {
				$fatherLine   = 'checked="checked"';
				$motherLine = '';
			}
            else {
				$fatherLine   = '';
				$motherLine = 'checked="checked"';
			}
        }
		
		?>
		<div class="tree_panel">
			<div class="tree_left">
				<div class="tree_menu">
					<h2>Pasirinktys</h2>
					<form id="treeOptions" action= "" method= "post">
						<h3>Kryptis</h3>
						<p>
							<input id="tree-orientation-vertical" type="radio" name="tree-orientation" value="top" onclick="javascript: submit()" <?php echo $topOrientation; ?>></input>
							<label>Vertikalus</label><br/>
							<input id="tree-orientation-horizontal" type="radio" name="tree-orientation" value="right" onclick="javascript: submit()" <?php echo $rightOrientation; ?>></input>
							<label>Horizontalus</label><br/>
						</p>
						<h3>Giminystės linija</h3>
						<p>
							<input id="inheritance-line-father" type="radio" name="inheritance-line" value="father" onclick="javascript: submit()" <?php echo $fatherLine; ?>></input>
							<label>Tėvas</label><br/>
							<input id="inheritance-line-mother" type="radio" name="inheritance-line" value="mother" onclick="javascript: submit()" <?php echo $motherLine; ?>></input>
							<label>Motina</label><br/>
						</p>
					</form>
				</div>
			</div>
		<div class="tree_right">
			<div id="tree" class="tree"></div>
		</div>		
				<?php
				$this->displayAddLeafForm ($username, $individualid, $leafid);
				$this->displayLeafEditForm ($username, $individualid, $leafid);
				$this->initializeDisplayTreeScript();
				$this->displayParents($this->getParents($individualid));
				$this->displayParents($this->getParents($this->getParents($individualid)));
				$this->displayCurrentIndividual($this->getCurrentIndividualInfo($individualid));
				$this->displaySpouses($this->getSpouses($individualid));
				$this->displayChildren($this->getChildren($individualid));
				$this->displayChildren($this->getChildren($this->getParents($individualid)));
				$this->displaySpouses($this->getSpouses($this->getChildren($individualid)));
				$this->displayChildren($this->getChildren($this->getChildren($individualid)));
				$this->finalizeDisplayTreeScript($individualid, $leafid);
		?>
		</div>
		<?php
    }
	/**
     * getCurrentIndividualInfo
     * 
     * Used by displayCurrentIndividual, gets the information of the currently active individual
     */
	function getCurrentIndividualInfo($individualid) {
        
		$individualid = $this->site->cleanOutput($individualid);
		
		$q = "SELECT individual_id, fname, lname, mname, birth_date, birth_place, death_date, 
				gender, biography, avatar, individual_family, individual_username
				FROM ".TBL_INDIVIDUALS." 
				WHERE individual_id = '$individualid'";
        
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		
        if ($num_rows <= 0) {
            echo "<div class='notice'><p>Nepavyko rasti tokio vartotojo</p></div>";
            return;
        }
		else {
			$currentIndividualInfo = mysql_fetch_array($result);
			return $currentIndividualInfo;
		}  
	}
	/**
     * getSpouses
     * 
     * Used by displayFamilyTree, gets the information of the spouse of the given individual
     */
	function getSpouses($individualInfo) {
		
		if (!empty($individualInfo)) {
			if (is_string($individualInfo)) { 
				$individualInfo = array('individual_id' => $individualInfo); 
			}
			
			if (isset($individualInfo['individual_id'])) { 
				$individualInfo = array($individualInfo); 
			}

			$individualids = array();
			
			foreach ($individualInfo as $individualid) {
				if (!empty($individualid['individual_id']) && is_string($individualid['individual_id'])) {
					$individualid['individual_id'] = $this->site->cleanOutput($individualid['individual_id']);
					$individualids[$individualid['individual_id']] = true; 
				}
			}

			$individualidsString = implode(',', array_keys($individualids));
			
			$q = "SELECT individual_id, fname, lname, mname, birth_date, birth_place, death_date, gender, 
					biography, avatar, individual_username, individual, start_date, end_date, ended
					FROM ".TBL_RELATIONSHIPS.",".TBL_INDIVIDUALS."
					WHERE individual IN ($individualidsString) 
					AND relationship_individual = individual_id
					AND role = '1'
					ORDER BY timestamp ASC";

			$result = $this->database->query($q);
			
			if ($result == false) {
				$result .= die(mysql_error());
				return;
			}
			
			$num_rows = mysql_num_rows($result);
			$spouses = array();
			
			if ($num_rows > 0) {
				while ($row = mysql_fetch_assoc($result)) {
					$spouses[] = $row;
				}
				return $spouses;
			}
		}
	}
	/**
     * getChildren
     * 
     * Used by displayChildren, gets the information of the children of the given individual
     */
	function getChildren($individualInfo) {
		
		if (!empty($individualInfo)) {
		
			if (is_string($individualInfo)) { 
				$individualInfo = array('individual_id' => $individualInfo); 
			}
			
			if (isset($individualInfo['individual_id'])) { 
				$individualInfo = array($individualInfo); 
			}

			$individualids = array();
			
			foreach ($individualInfo as $individualid) {
				if (!empty($individualid['individual_id']) && is_string($individualid['individual_id'])) {
					$individualid['individual_id'] = $this->site->cleanOutput($individualid['individual_id']);
					$individualids[$individualid['individual_id']] = true; 
				}
			}

			$individualidsString = implode(',', array_keys($individualids));
			
			$q = "SELECT i.individual_id, i.fname, i.lname, i.mname, i.birth_date, i.birth_place, i.death_date, 
						i.gender, i.biography, i.avatar, i.individual_username, r1.individual, ( 
						SELECT r2.individual 
						FROM  ".TBL_RELATIONSHIPS." AS r2
						WHERE r2.individual != r1.individual
						AND r2.relationship_individual = i.individual_id
						AND r2.role = '2'
					) AS parent
					FROM ".TBL_RELATIONSHIPS." AS r1,".TBL_INDIVIDUALS." AS i
					WHERE r1.individual IN ($individualidsString) 
					AND r1.relationship_individual = i.individual_id
					AND r1.role = '2'";

			$result = $this->database->query($q);
			
			if ($result == false) {
				$result .= die(mysql_error());
				return;
			}

			$num_rows = mysql_num_rows($result);
			$children   = array();
			$firstChild = ''; 
			
			if ($num_rows > 0) {
				while ($row = mysql_fetch_assoc($result)) {
					$children[] = $row;
				}
				return $children;
			}
		}
	}
	/**
     * getParents
     * 
     * Used by displayParents, gets the information of the parents of the given individual
     */
	function getParents($individualInfo) {
		
		if (!empty($individualInfo)) {
			if (is_string($individualInfo)) { 
				$individualInfo = array('individual_id' => $individualInfo); 
			}
			
			if (isset($individualInfo['individual_id'])) { 
				$individualInfo = array($individualInfo); 
			}

			$individualids = array();
			
			foreach ($individualInfo as $individualid) {
				if (!empty($individualid['individual_id']) && is_string($individualid['individual_id'])) {
					$individualid['individual_id'] = $this->site->cleanOutput($individualid['individual_id']);
					$individualids[$individualid['individual_id']] = true; 
				}
			}

			$individualidsString = implode(',', array_keys($individualids));
			$maxParents = 2*count($individualids);

			$q = "SELECT individual_id, fname, lname, mname, birth_date, birth_place, death_date, gender, 
					biography, avatar, individual_username, relationship_individual
					FROM ".TBL_RELATIONSHIPS.",".TBL_INDIVIDUALS."
					WHERE relationship_individual IN ($individualidsString)
					AND individual = individual_id
					AND (role = '2')
					ORDER BY gender DESC
					LIMIT $maxParents";

			$result = $this->database->query($q);
				
			if ($result === false) {
				$result .= die(mysql_error());
				return;
			}
				
			$num_rows = mysql_num_rows($result);
			$parents = array();
				
			if ($num_rows > 0) {
				while ($row = mysql_fetch_assoc($result)) {
					$parents[] = $row;
				}	
				return $parents;
			}
		}
	}
	/**
     * displayCurrentIndividual
     * 
     * Used by displayFamilyTree, displays the information of the currently active individual
     */
	function displayCurrentIndividual($currentIndividualInfo) {
		
		if (!empty($currentIndividualInfo)) {
			if (!empty($currentIndividualInfo['mname'])) {
				$name = $currentIndividualInfo['fname'].' '.$currentIndividualInfo['lname'].' ('.$currentIndividualInfo['mname'].')';
			}
			else {
				$name = $currentIndividualInfo['fname'].' '.$currentIndividualInfo['lname'];
			}
			$type = 'currentIndividual';
            $individualid = $currentIndividualInfo['individual_id'];
			if ($currentIndividualInfo['death_date'] != "0000-00-00") {
				$dates = $currentIndividualInfo['birth_date'].'—'.$currentIndividualInfo['death_date'];
			}
			else if ($currentIndividualInfo['birth_date'] != "0000-00-00"){
				$dates = $currentIndividualInfo['birth_date'];
			}
			else {
				$dates = '';
			}
			$gender = $currentIndividualInfo['gender'];
			$avatar = 'uploads/avatars/small/'.$currentIndividualInfo['avatar'];
			$this->displayLeaf($type, $individualid, $name, $dates, $gender, $avatar, NULL, NULL);
        }
	}
	/**
     * displaySpouses
     * 
     * Used by displayFamilyTree, displays the spouses of the given individual
     */
    function displaySpouses($spouses) {
		
		if (!empty($spouses)) {
			foreach ($spouses as $spouse) {
				if (!empty($spouse['mname'])) {
					$name = $spouse['fname'].' '.$spouse['lname'].' ('.$spouse['mname'].')';
				}
				else {
					$name = $spouse['fname'].' '.$spouse['lname'];
				}
				$type = 'spouse';
				$individualid = $spouse['individual_id'];
				if ($spouse['death_date'] != "0000-00-00") {
					$dates = $spouse['birth_date'].'—'.$spouse['death_date'];
				}
				else if ($spouse['birth_date'] != "0000-00-00"){
					$dates = $spouse['birth_date'];
				}
				else {
					$dates = '';
				}
				$gender = $spouse['gender'];
				$avatar = 'uploads/avatars/small/'.$spouse['avatar'];
				$relationships = $spouse['individual'];
				$ended = $spouse['ended'];
				$_type = 'spouseAggregator';
				$_individualid = $relationships.' aggregator '.$individualid;
				$_relationships = $relationships.' '.$individualid;
				$this->displayLeaf($_type, $_individualid, NULL, NULL, $gender, NULL, $_relationships, NULL);
				$this->displayLeaf($type, $individualid, $name, $dates, $gender, $avatar, $relationships, $ended);
			}
		}
    }
	/**
     * displayChildren
     * 
     * Used by displayFamilyTree, displays the children of the given individual
     */
	function displayChildren($children) {		
		
		if (!empty($children)) {
			foreach ($children as $child) {
				if (!empty($child['mname'])) {
					$name = $child['fname'].' '.$child['lname'].' ('.$child['mname'].')';
				}
				else {
					$name = $child['fname'].' '.$child['lname'];
				}
				$type = 'child';
				$individualid = $child['individual_id'];
				if ($child['death_date'] != "0000-00-00") {
					$dates = $child['birth_date'].'—'.$child['death_date'];
				}
				else if ($child['birth_date'] != "0000-00-00"){
					$dates = $child['birth_date'];
				}
				else {
					$dates = '';
				}
				$gender = $child['gender'];
				$avatar = 'uploads/avatars/small/'.$child['avatar'];
				$relationships = $child['individual'].' '.$child['parent'];
				$this->displayLeaf($type, $individualid, $name, $dates, $gender, $avatar, $relationships, NULL);
					
			}
		}	
	}
    /**
     * displayParents
     * 
     * Used by displayFamilyTree, displays the parents of the given individual
     */
    function displayParents($parents) {
		
		if (!empty($parents)) {
			foreach ($parents as $parent) {
				if (!empty($parent['mname'])) {
					$name = $parent['fname'].' '.$parent['lname'].' ('.$parent['mname'].')';
				}
				else {
					$name = $parent['fname'].' '.$parent['lname'];
				}
				$type = 'parent';
				$individualid = $parent['individual_id'];
				if ($parent['death_date'] != "0000-00-00") {
					$dates = $parent['birth_date'].'—'.$parent['death_date'];
				}
				else if ($parent['birth_date'] != "0000-00-00"){
					$dates = $parent['birth_date'];
				}
				else {
					$dates = '';
				}
				$gender = $parent['gender'];
				$avatar = 'uploads/avatars/small/'.$parent['avatar'];
				$relationships = $parent['relationship_individual'];
				$this->displayLeaf($type, $individualid, $name, $dates, $gender, $avatar, $relationships, NULL);
			}
		}
    }
	/**
     * initializeDisplayTreeScript
     */
	 
    function initializeDisplayTreeScript() {
		
		?>
		<script type="text/javascript">
		//<![CDATA[
		
			$(window).load(function(){
				var options = new primitives.orgdiagram.Config();
				var items = [];
				var annotations = [];
				var buttons = [];
					buttons.push(new primitives.orgdiagram.ButtonConfig("tree", "ui-icon-tree", "Medis"));
					buttons.push(new primitives.orgdiagram.ButtonConfig("add", "ui-icon-plus", "Pridėti"));	
					buttons.push(new primitives.orgdiagram.ButtonConfig("edit", "ui-icon-gear-2", "Redaguoti"));
				var templates = [];
					templates.push(getFemaleTemplate());
					templates.push(getMaleTemplate());
				var treeOrientation = jQuery("input:radio[name=tree-orientation]:checked").val();
				var inheritanceLine = jQuery("input:radio[name=inheritance-line]:checked").val();
		<?php
	}
	/**
     * displayLeaf 
     * Displays the leaves of the family tree for current individual and all the relatives
     */
	 
    function displayLeaf($type, $individualid, $name, $dates, $gender, $avatar, $relationships, $ended) {
		
		?>
		var type = <?php echo json_encode($type); ?>,
			individualid = <?php echo json_encode($individualid); ?>,
			name = <?php echo json_encode($name); ?>,
			dates = <?php echo json_encode($dates); ?>,
			gender = <?php echo json_encode($gender); ?>,
			avatar = <?php echo json_encode($avatar); ?>,
			relationships = <?php echo json_encode($relationships); ?>,
			ended = <?php echo json_encode($ended); ?>,
			parentid = null,
			itemType = primitives.orgdiagram.ItemType.Regular,
			placementType = primitives.common.AdviserPlacementType.Auto,
			itemTitleColor = (gender == "Male") ? primitives.common.Colors.CadetBlue : primitives.common.Colors.PaleVioletRed,
			href = "familytree.php?profile=" + individualid + "#menu",
			isVisible = true;
		
		if (type.length != 0) {
			for (var i = 0; i < items.length; i++) { 
				if (items[i].id == individualid) {
					parentid = -1;
				}	
				if (type == "parent") {
					if (inheritanceLine == "father") {
						if (gender == "Male") {
							if (items[i].relationship == relationships) {
								parentid = items[i].parent;
								items[i].parent = individualid;
								items[i].itemType = primitives.orgdiagram.ItemType.LimitedPartner;
							}
							if (items[i].itemType == primitives.orgdiagram.ItemType.Regular && 
								items[i].id == relationships) {
								parentid = items[i].parent;	
								items[i].parent = individualid;
							}
							if (items[i].itemType == primitives.orgdiagram.ItemType.LimitedPartner && 
								items[i].id == relationships) {
								parentid = -1;
							}
						}
						else {
							if (items[i].relationship == relationships) {
								parentid = items[i].id;
								itemType = primitives.orgdiagram.ItemType.LimitedPartner;
							}
							else if (items[i].itemType == primitives.orgdiagram.ItemType.Regular && 
								items[i].id == relationships) {
								parentid = items[i].id;
								itemType = primitives.orgdiagram.ItemType.LimitedPartner;
							}
							else {
								parentid = -1;
							}
						}
					}
					if (inheritanceLine == "mother") {
						if (gender == "Female") {
							if (items[i].relationship == relationships) {
								parentid = items[i].parent;
								items[i].parent = individualid;
								items[i].itemType = primitives.orgdiagram.ItemType.LimitedPartner;
							}
							if (items[i].itemType == primitives.orgdiagram.ItemType.Regular && 
								items[i].id == relationships) {
								parentid = items[i].parent;	
								items[i].parent = individualid;
							}
							if (items[i].itemType == primitives.orgdiagram.ItemType.LimitedPartner && 
								items[i].id == relationships) {
								parentid = -1;
							}
						}
						else {
							if (items[i].relationship == relationships) {
								parentid = items[i].id;
								itemType = primitives.orgdiagram.ItemType.LimitedPartner;
							}	
							else if (items[i].itemType == primitives.orgdiagram.ItemType.Regular && 
								items[i].id == relationships) {
								parentid = items[i].parent;	
								items[i].parent = individualid;
							}
							else {
								parentid = -1;
							}
						}
					}
				}
				if (type == "currentIndividual") {
					if (items[i].itemType == primitives.orgdiagram.ItemType.Regular && 
						items[i].relationship == individualid) {
						parentid = items[i].id;								
					}
				}
				if (type == "spouseAggregator") {
					if (individualid.indexOf(items[i].id) != -1) {
						parentid = items[i].id;	
						itemType = primitives.orgdiagram.ItemType.Adviser;
					}
					isVisible = false;
				}
				if (type == "spouse") {
					if (items[i].id.indexOf(individualid) != -1) {
						parentid = items[i].id;
						itemType = primitives.orgdiagram.ItemType.Adviser;
					}
				}
				if (type == "child") {
					if (items[i].relationship == relationships && items[i].isVisible == false) {
						parentid = items[i].id;	
					}
					if (items[i].itemType == primitives.orgdiagram.ItemType.Regular &&
						relationships.indexOf(items[i].id) != -1) {
						parentid = items[i].id;		
					}
				}
			}
			if (parentid != -1) {	
				items.push(new primitives.orgdiagram.ItemConfig({
							id: individualid,
							relationship: relationships, 
							parent: parentid,
							title: name,
							description: dates,
							itemType: itemType,
							adviserPlacementType: placementType,
							templateName: gender,
							itemTitleColor: itemTitleColor,
							image: avatar,
							href: href,
							isVisible: isVisible
						}));
			}
			if (ended == 1) {
				annotations.push(new primitives.orgdiagram.HighlightPathAnnotationConfig({
					items: [individualid, relationships]
				}));
			}
		}
		<?php
	}
	/**
     * finalizeDisplayTreeScript
     */
	 
    function finalizeDisplayTreeScript($individualid, $leafid) {
		
		?>			
		options.items = items;
		options.annotations = annotations;
		options.cursorItem = <?php echo json_encode($leafid); ?>;
		options.buttons = buttons;
		options.hasButtons = primitives.common.Enabled.false;
		options.templates = templates;
		options.onItemRender = onTemplateRender;
		options.orientationType = (treeOrientation == "top" ? primitives.common.OrientationType.Top : primitives.common.OrientationType.Right);
		options.linesColor = primitives.common.Colors.Black;
		options.highlightLinesColor = primitives.common.Colors.Silver;
        options.highlightLinesWidth = 1;
        options.highlightLinesType = primitives.common.LineType.Solid;
		options.pageFitMode = primitives.common.PageFitMode.FitToPage;
		options.hasSelectorCheckbox = primitives.common.Enabled.False;
		options.onButtonClick = onButtonClick; 
		options.onCursorChanged = onCursorChanged; 

		jQuery("#tree").orgDiagram(options);
							
		function onCursorChanged(e, data) {
			if (window.location.href.indexOf("?tree=") != -1) {
				window.location.href = "?tree=" + <?php echo json_encode($individualid); ?> + "&leaf=" + data.context.id + "#menu";
			}
			else {
				window.location.href = "?leaf=" + data.context.id + "#menu";
			}
		}
		function onButtonClick(e, data) {
			switch (data.name) {
				case "tree":
					window.location.href = "?tree=" + data.context.id + "#menu";
					break;
								
				case "add":
					if (document.readyState == "complete") { 
						jQuery(".add-leaf").dialog({
							autoOpen: true,
							modal: true,
							closeOnEscape: true,
							draggable: false,
							resizable: false,
							width: 200,
							height: "auto",
							dialogClass: "dlg-add",
							position: [e.clientX, e.clientY]
						});
					}
					break;	
		
				case "edit":
					if (document.readyState == "complete") { 
						jQuery(".edit-leaf").dialog({
							autoOpen: true,
							modal: true,
							closeOnEscape: true,
							draggable: false,
							resizable: false,
							width: 200,
							height: "auto",
							dialogClass: "dlg-edit",
							position: [e.clientX, e.clientY]
						});
					}
					break;								
				}
			}
							
			function onTemplateRender(event, data) {
				var hrefElement = data.element.find("[name=readmore]");
				switch (data.renderingMode) {
					case primitives.common.RenderingMode.Create:
						/* Initialize widgets here */
						hrefElement.click(function (e) {
							/* Block mouse click propogation in order to avoid layout updates before server postback*/
							primitives.common.stopPropagation(e);
						});
						break;
					case primitives.common.RenderingMode.Update:
						/* Update widgets here */
						break;
				}


				var itemConfig = data.context;

				if (data.templateName == "Female" || data.templateName == "Male") {
				   data.element.find("[name=photo]").attr({ "src": itemConfig.image, "alt": itemConfig.title});
				   data.element.find("[name=title]").text(itemConfig.title);
				   data.element.find("[name=description]").text(itemConfig.description);
				   data.element.find("[name=titleBackground]").css({ "background": itemConfig.itemTitleColor });
				   hrefElement.attr({ "href": itemConfig.href });
				} 
			}

			function getFemaleTemplate() {
				var result = new primitives.orgdiagram.TemplateConfig();
				result.name = "Female";

				result.itemSize = new primitives.common.Size(240, 80);
				result.minimizedItemSize = new primitives.common.Size(3, 3);
				result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);


				var itemTemplate = jQuery("<div></div>")
				.css({
					"width": result.itemSize.width + "px",
					"height": result.itemSize.height + "px",
					"border": "1px solid #dddddd",
					"background": "#ffffff url(ui/css/images/pink-bg.png) left top",
					"color": "#333333",
				}).addClass("bp-item bp-corner-all bt-item-frame");

				var title = jQuery("<div name=\"title\"></div>")
					.css({
						"top":  "8px",
						"left": "81px",
						"width": "159px",
						"height": "60px",
						"text-overflow": "ellipsis",
						"-o-text-overflow": "ellipsis",
						"white-space": "normal",
						"font-size": "12px",
						"font-weight": "bold",
						"font-family": "Arial",
						"color": "#333333",
						"text-shadow": "0 1px white",
						"padding": "0"
					}).addClass("bp-item");

				itemTemplate.append(title);

				var photoborder = jQuery("<div></div>")
					.css({
						"top": "5.5px",
						"left": "5.5px",
						"width": "60px",
						"height": "60px"
					}).addClass("bp-item bp-photo-frame");

				itemTemplate.append(photoborder);
				
				var itemdescription = jQuery("<div name=\"description\"></div>")
					.css({
						"top": "40px",
						"left": "81px",
						"font-size": "10px",
						"line-height": "12px",
						"font-family": "Arial",
						"color": "#333333",
						"text-shadow": "0 1px white"
					}).addClass("bp-item");

				itemTemplate.append(itemdescription);
				
				var href = jQuery("<a name=\"readmore\">Daugiau...</a>")
					.css({
						"top":  "60px",
						"left": "180px",
						"width": "212px",
						"height": "12px",
						"text-decoration": "none",
						"white-space": "normal",
						"font-size": "10px",
						"font-weight": "bold",
						"font-family": "Arial",
						"color": "#eb8f00",
						"text-shadow": "0 1px white",
						"opacity": "0.8",
						"padding": "0"
					}).addClass("bp-item");

				itemTemplate.append(href);

				var photo = jQuery("<img name=\"photo\"></img>")
					.css({
						"width": "60px",
						"height": "60px"
					});
				photoborder.append(photo);

				result.itemTemplate = itemTemplate.wrap('<div>').parent().html();

				return result;
							}
			
			function getMaleTemplate() {
				var result = new primitives.orgdiagram.TemplateConfig();
				result.name = "Male";

				result.itemSize = new primitives.common.Size(240, 80);
				result.minimizedItemSize = new primitives.common.Size(3, 3);
				result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);


				var itemTemplate = jQuery("<div></div>")
				.css({
					width: result.itemSize.width + "px",
					height: result.itemSize.height + "px",
					border: "1px solid #dddddd",
					"background": "#ffffff url(ui/css/images/blue-bg.png) left top",
					"color": "#333333",
				}).addClass("bp-item bp-corner-all bt-item-frame");

				var title = jQuery("<div name=\"title\"></div>")
					.css({
						"top":  "8px",
						"left": "81px",
						"width": "159px",
						"height": "60px",
						"text-overflow": "ellipsis",
						"-o-text-overflow": "ellipsis",
						"white-space": "normal",
						"font-size": "12px",
						"font-weight": "bold",
						"font-family": "Arial",
						"color": "#333333",
						"text-shadow": "0 1px white",
						"padding": "0"
					}).addClass("bp-item");

				itemTemplate.append(title);

				var photoborder = jQuery("<div></div>")
					.css({
						top: "5.5px",
						left: "5.5px",
						width: "60px",
						height: "60px",
					}).addClass("bp-item bp-photo-frame");

				itemTemplate.append(photoborder);
				
				var itemdescription = jQuery("<div name=\"description\"></div>")
					.css({
						"top": "40px",
						"left": "81px",
						"font-size": "10px",
						"line-height": "12px",
						"font-family": "Arial",
						"color": "#333333",
						"text-shadow": "0 1px white"
					}).addClass("bp-item");

				itemTemplate.append(itemdescription);
				
				var href = jQuery("<a name=\"readmore\">Daugiau...</a>")
					.css({
						"top":  "60px",
						"left": "180px",
						"width": "212px",
						"height": "12px",
						"text-decoration": "none",
						"white-space": "normal",
						"font-size": "10px",
						"font-weight": "bold",
						"font-family": "Arial",
						"color": "#eb8f00",
						"text-shadow": "0 1px white",
						"opacity": "0.8",
						"padding": "0"
					}).addClass("bp-item");

				itemTemplate.append(href);

				var photo = jQuery("<img name=\"photo\"></img>")
					.css({
						width: "60px",
						height: "60px"
					});
				photoborder.append(photo);

				result.itemTemplate = itemTemplate.wrap('<div>').parent().html();

				return result;
			}					
		});
		//]]>
		</script>
	<?php
	}
	/**
     * displayLeafEditForm 
     */
    function displayAddLeafForm ($username, $individualid, $leafid) {
	
			$grandParents = $this->getParents($this->getParents($individualid));
			$parents = $this->getParents($individualid);
			$spouses = $this->getSpouses($individualid);
			$children = $this->getChildren($individualid);
			$siblings = $this->getChildren($this->getParents($individualid));
			$grandChildren = $this->getChildren($this->getChildren($individualid)); 
			$childrenSpouses = $this->getSpouses($this->getChildren($individualid));
			$currentLeafInfo = $this->getcurrentIndividualInfo($leafid);
			$options = array();
			$currentClass = ($currentLeafInfo['gender'] == 'Male' ? 'male_btn' : 'female_btn');
			$spouseClass = ($currentLeafInfo['gender'] == 'Male' ? 'female_btn' : 'male_btn');
			
			$path = $_SERVER['REQUEST_URI'];
			
			if (strpos($path,'option') == false) {
				if (strpos($path,'leaf') == true) {
					$path = $path.'&option=';
				}
				else if (strpos($path,'?tree') == true) {
					$path = $path.'&option=';
				}
				else {
					$path = $path.'?option=';
				}
			}
			else {
				$path = substr($path, 0, strpos($path, 'option=')).'option=';
			}
			
			if ($individualid == $leafid) {
				
				$options[] = '<a class="'.$spouseClass.'" href="'.$path.'spouse#menu">Pridėti sutuoktinį (-ę)</a>';	
				// Parents
				if (count($parents) == 0) {
					$options[] = '<a class="male_btn" href="'.$path.'father#menu">Pridėti tėvą</a>';
					$options[] = '<a class="female_btn" href="'.$path.'mother#menu">Pridėti motiną</a>';
				}
				else if (count($parents) == 1) {
					if ($parents['gender'] != 'Male') {
						$options[] = '<a class="male_btn" href="'.$path.'father#menu">Pridėti tėvą</a>';
					}
					else {
						$options[] = '<a class="female_btn" href="'.$path.'mother#menu">Pridėti motiną</a>';
					}
					$options[] = '<a class="male_btn" href="'.$path.'brother#menu">Pridėti brolį</a>';
					$options[] = '<a class="female_btn" href="'.$path.'sister#menu">Pridėti seserį</a>';
				}
				else {
					$options[] = '<a class="male_btn" href="'.$path.'brother#menu">Pridėti brolį</a>';
					$options[] = '<a class="female_btn" href="'.$path.'sister#menu">Pridėti seserį</a>';
				}
				// Spouses
				if (count($spouses) > 0) {
					$options[] = '<a class="male_btn" href="'.$path.'son#menu">Pridėti sūnų</a>';
					$options[] = '<a class="female_btn" href="'.$path.'daughter#menu">Pridėti dukterį</a>';
				}
			}
			else {	
				// Grandparents
				if (count($grandParents) > 0) {
					foreach ($grandParents as $grandParent) {
						if ($grandParent['individual_id'] == $leafid) {
							if (count($grandParents) == 1) {
								if ($parents['gender'] != 'Male') {
									$options[] = '<a class="'.$spouseClass.'" href="'.$path.'father#menu">Pridėti sutuoktinį (-ę)</a>';
								}
							}
						}
					}
				}
				// Parents
				if (count($parents) > 0) {
					foreach ($parents as $parent) {
						if ($parent['individual_id'] == $leafid) {
							// Grandparents
							if (count($grandParents) == 0) {
								$options[] = '<a class="male_btn" href="'.$path.'father#menu">Pridėti tėvą</a>>';
								$options[] = '<a class="female_btn" href="'.$path.'mother#menu">Pridėti motiną</a>';
							}
							else if (count($grandParents) == 1) {
								if ($parents['gender'] != 'Male') {
									$options[] = '<a class="male_btn" href="'.$path.'father#menu">Pridėti tėvą</a>>';
								}
								else {
									$options[] = '<a class="female_btn" href="'.$path.'mother#menu">Pridėti motiną</a>';
								}
							}
							if (count($parents) == 1) {
								$options[] = '<a class="'.$spouseClass.'" href="'.$path.'spouse#menu">Pridėti sutuoktinį (-ę)</a>';
								$options[] = '<a class="male_btn" href="'.$path.'son#menu">Pridėti sūnų</a>';
								$options[] = '<a class="female_btn" href="'.$path.'daughter#menu">Pridėti dukterį</a>';
							}
							else {
								$options[] = '<a class="male_btn" href="'.$path.'son#menu">Pridėti sūnų</a>';
								$options[] = '<a class="female_btn" href="'.$path.'daughter#menu">Pridėti dukterį</a>';
							}
						}
					}
				}
				// Spouses
				if (count($spouses) > 0) {
					foreach ($spouses as $spouse) {
						if ($spouse['individual_id'] == $leafid) {
								$options[] = '<a class="male_btn" href="'.$path.'son#menu">Pridėti sūnų</a>';
								$options[] = '<a class="female_btn" href="'.$path.'daughter#menu">Pridėti dukterį</a>';
						}
					}
				}
				// Children
				if (count($children) > 0) {
					foreach ($children as $child) {
						if ($child['individual_id'] == $leafid) {
							$options[] = '<a class="'.$spouseClass.'" href="'.$path.'spouse#menu">Pridėti sutuoktinį (-ę)</a>';
							$options[] = '<a class="male_btn" href="'.$path.'brother#menu">Pridėti brolį</a>';
							$options[] = '<a class="female_btn" href="'.$path.'sister#menu">Pridėti seserį</a>';
							if (count($childrenSpouses) > 0) {
								foreach ($childrenSpouses as $childrenSpouse) {
									if ($childrenSpouse['individual'] == $leafid) {
										if (count($options) == 3) {
											$options[] = '<a class="male_btn" href="'.$path.'son#menu">Pridėti sūnų</a>';
											$options[] = '<a class="female_btn" href="'.$path.'daughter#menu">Pridėti dukterį</a>';
										}
									}
								}
							}
						}
					}
				}
				// Siblings
				if (count($siblings) > 0) {
					foreach ($siblings as $sibling) {
						if ($sibling['individual_id'] == $leafid) {
							if (count($options) == 0) {
								$options[] = '<a class="male_btn" href="'.$path.'brother#menu">Pridėti brolį</a>';
								$options[] = '<a class="female_btn" href="'.$path.'sister#menu">Pridėti seserį</a>';
							}
						}
					}
				}
				// Spouses of the children
				if (count($childrenSpouses) > 0) {
					foreach ($childrenSpouses as $childrenSpouse) {
						if ($childrenSpouse['individual_id'] == $leafid) {
							$options[] = '<a class="male_btn" href="'.$path.'son#menu">Pridėti sūnų</a>';
							$options[] = '<a class="female_btn" href="'.$path.'daughter#menu">Pridėti dukterį</a>';
						}
					}
				}
				// Grandchildren
				if (count($grandChildren) > 0) {
					foreach ($grandChildren as $grandChild) {
						if ($grandChild['individual_id'] == $leafid) {
							$options[] = '<a class="male_btn" href="'.$path.'brother#menu">Pridėti brolį</a>';
							$options[] = '<a class="female_btn" href="'.$path.'sister#menu">Pridėti seserį</a>';
							
						}
					}
				}
			}
			if (count($options) == 0) {
				$options[] = '<a class="'.$currentClass.'" href="familytree.php?tree='.$leafid.'#menu">Žiūrėti medį</a>';
			}
			echo '<div class="add-leaf" style="display:none">
					<ul>';
						
			foreach ($options as $option) {
				echo '<li>'.$option.'</li>';
			}

			echo '</ul>
					</div>';
	}
	/**
     * displayLeafEditForm 
     */
    function displayLeafEditForm ($username, $individualid, $leafid) {
	
		$grandParents = $this->getParents($this->getParents($individualid));
		$parents = $this->getParents($individualid);
		$spouses = $this->getSpouses($individualid);
		$children = $this->getChildren($individualid);
		$siblings = $this->getChildren($this->getParents($individualid));
		$grandChildren = $this->getChildren($this->getChildren($individualid)); 
		$childrenSpouses = $this->getSpouses($this->getChildren($individualid));
		$currentLeafInfo = $this->getcurrentIndividualInfo($leafid);
		$leafSpouses = $this->getSpouses($leafid);
		$options = array();
		
		$path = $this->site->cleanOutput($_SERVER['REQUEST_URI']);
		
		if (strpos($path,'option') == false) {
			if (strpos($path,'leaf') == true) {
				$path = $path.'&';
			}
			else if (strpos($path,'?tree') == true) {
				$path = $path.'&';
			}
			else {
				$path = $path.'?';
			}
		}
		else {
			$path = substr($path, 0, strpos($path, 'option=')).'option=';
		}
		
		if ($individualid == $leafid) {
			if (count($spouses) == 0 && $currentLeafInfo['individual_username'] == NULL) {
				$options[] = '<a class="edit_btn" href="'.$path.'option=delete-individual#menu">Trinti asmenį</a>';
			}
			else if (count($spouses) > 0) {
				$options[] = '<a id="edit-rel-link" class="edit_btn" href="javascript: void(0)">Redaguoti ryšius</a>';
			}
		}
		else {
			$leafParents = $this->getParents($leafid);
			$leafSpouses = $this->getSpouses($leafid);
			$leafChildren = $this->getChildren($leafid);
			
			// Grandparents
			if (count($grandParents) > 0) {
				foreach ($grandParents as $grandParent) {
					if ($grandParent['individual_id'] == $leafid) {
						if (count($grandParents) == 1) {
							if (count($leafParents) == 0 && count($leafChildren) == 1 
								&& $currentLeafInfo['individual_username'] == NULL) {
								$options[] = '<a class="edit_btn" href="'.$path.'option=delete-individual#menu">Trinti asmenį</a>';
							}
						}
						else {
							if (count($leafParents) == 0 && $currentLeafInfo['individual_username'] == NULL) {
								$options[] = '<a class="edit_btn" href="'.$path.'option=delete-individual#menu">Trinti asmenį</a>';
							}
							$options[] = '<a id="edit-rel-link" class="edit_btn" href="javascript: void(0)">Redaguoti ryšius</a>';
						}
					}
				}
			}
			// Parents
			if (count($parents) > 0) {
				foreach ($parents as $parent) {
					if ($parent['individual_id'] == $leafid) {
						if (count($parents) == 1) {
							if (count($leafParents) == 0 && count($leafChildren) == 1 
								&& $currentLeafInfo['individual_username'] == NULL) {
								$options[] = '<a class="edit_btn" href="'.$path.'option=delete-individual#menu">Trinti asmenį</a>';
							}
						}
						else {
							if (count($leafParents) == 0 && $currentLeafInfo['individual_username'] == NULL) {
								$options[] = '<a class="edit_btn" href="'.$path.'option=delete-individual#menu">Trinti asmenį</a>';
							}
							$options[] = '<a id="edit-rel-link" class="edit_btn" href="javascript: void(0)">Redaguoti ryšius</a>';
						}
					}
				}
			}
			// Spouses
			if (count($spouses) > 0) {
				foreach ($spouses as $spouse) {
					if ($spouse['individual_id'] == $leafid) {
						if (count($leafChildren) == 0 && count($leafSpouses) == 1 
							&& $currentLeafInfo['individual_username'] == NULL) {
							$options[] = '<a class="edit_btn" href="'.$path.'option=delete-individual#menu">Trinti asmenį</a>';
						}
						$options[] = '<a id="edit-rel-link" class="edit_btn" href="javascript: void(0)">Redaguoti ryšius</a>';
					}
				}
			}
			// Children
			if (count($children) > 0) {
				foreach ($children as $child) {
					if ($child['individual_id'] == $leafid) {
						if (count($leafSpouses) == 0 && $currentLeafInfo['individual_username'] == NULL) {
							$options[] = '<a class="edit_btn" href="'.$path.'option=delete-individual#menu">Trinti asmenį</a>';
						}
						if (count($leafSpouses) > 0) {
							$options[] = '<a id="edit-rel-link" class="edit_btn" href="javascript: void(0)">Redaguoti ryšius</a>';
						}
					}
				}	
			}
			// Siblings
			if (count($siblings) > 0) {
				foreach ($siblings as $sibling) {
					if ($sibling['individual_id'] == $leafid) {
						if (count($leafSpouses) == 0 && $currentLeafInfo['individual_username'] == NULL) {
							if (count($options) == 0) {
								$options[] = '<a class="edit_btn" href="'.$path.'option=delete-individual#menu">Trinti asmenį</a>';
							}
						}
					}
				}
			}
			// Spouses of the children
			if (count($childrenSpouses) > 0) {
				foreach ($childrenSpouses as $childrenSpouse) {
					if ($childrenSpouse['individual_id'] == $leafid) {
						if (count($leafChildren) == 0 && count($leafSpouses) == 1 
							&& $currentLeafInfo['individual_username'] == NULL) {
							$options[] = '<a class="edit_btn" href="'.$path.'option=delete-individual#menu">Trinti asmenį</a>';
						}
						$options[] = '<a id="edit-rel-link" class="edit_btn" href="javascript: void(0)">Redaguoti ryšius</a>';
					}
				}
			}
			// Grandchildren
			if (count($grandChildren) > 0) {
				foreach ($grandChildren as $grandChild) {
					if ($grandChild['individual_id'] == $leafid) {
						if (count($leafSpouses) == 0 && $currentLeafInfo['individual_username'] == NULL) {
							$options[] = '<a class="edit_btn" href="'.$path.'option=delete-individual#menu">Trinti asmenį</a>';
						}
					}
				}
			}
		}
		$options[] = '<a class="edit_btn" href="'.$path.'option=edit#menu">Redaguoti asmeninę informaciją</a>';
		$options[] = '<a class="edit_btn" href="upload.php?avatar='.$leafid.'#menu">Redaguoti profilio nuotrauką</a>';
		$options[] = '<a class="edit_btn" href="'.$path.'option=delete-avatar#menu">Trinti profilio nuotrauką</a>';
	
		echo '<div class="edit-leaf" style="display:none">
				<div id="edit-options" style="display:block">
					<ul>';
					
		foreach ($options as $option) {
			echo '<li>'.$option.'</li>';
		}

		echo '
					</ul>
				</div>
				<div id="edit-spouses" style="display:none">';
		if (count($leafSpouses) > 0) {
			
			echo '<ul>';
			
			foreach ($leafSpouses as $leafSpouse) {
				if (!empty($leafSpouse['mname'])) {
						$name = $leafSpouse['fname'].' '.$leafSpouse['lname'].' ('.$leafSpouse['mname'].')';
					}
					else {
						$name = $leafSpouse['fname'].' '.$leafSpouse['lname'];
					}
				echo '<li><a class="edit_btn" id="edit-spouse-link" href="'.$path.'edit-rel='.$leafSpouse['individual_id'].'#menu">'.$name.'</a></li>';
			}
			
			echo '</ul>';
		}			
		echo '
				</div>
			</div>
			<script type="text/javascript">
			//<![CDATA[
				$("#edit-rel-link").click(function(e){
					document.getElementById("edit-options").style.display = "none";
					document.getElementById("edit-spouses").style.display = "block";
				});
				 $(".edit-leaf").bind("dialogclose", function(e) {
					document.getElementById("edit-options").style.display = "block";
					document.getElementById("edit-spouses").style.display = "none";
				 });
			//]]>
			</script>';		
	}
	/**
     * displayCreateIndividualForm
     * 
     * Displays the form for creating a new individual to be added to the family tree
     */
    function displayCreateIndividualForm ($type, $individualid, $leafid) {
	
		$type = $this->site->cleanOutput($type);
		$leafid = $this->site->cleanOutput($leafid);
		$currentLeafInfo = $this->getcurrentIndividualInfo($leafid);
		$leafGender = $currentLeafInfo['gender'];
        $name = $currentLeafInfo['fname'].' '.$currentLeafInfo['lname'];
		$family = $currentLeafInfo['individual_family'];
		$parents = $this->getParents($individualid);
		$spouses = $this->getSpouses($individualid);
		$children = $this->getChildren($individualid);
		$childrenSpouses = $this->getSpouses($this->getChildren($individualid));
		$path = $this->site->cleanOutput($_SERVER['REQUEST_URI']);
		
		if (strpos($path,'?option') == true) {
			$path = substr($path, 0, strpos($path, '?option'));
		}
		else if (strpos($path,'&option') == true){
			$path = substr($path, 0, strpos($path, '&option'));
		}
		
        switch ($type) {
            case 'father':
                $gender    = 'Male';
                $title = 'Pridėti tėvą asmeniui vardu '.$name;
                break;

            case 'mother':
                $gender    = 'Female';
                $title = 'Pridėti mamą asmeniui vardu '.$name;
                break;

            case 'spouse':
                $gender = ($leafGender == 'Male' ? 'Female' : 'Male');
                $title = 'Pridėti sutuoktinį (-ę) asmeniui vardu '.$name;
                break;

            case 'son':
                $gender    = 'Male';
                $title = 'Pridėti sūnų asmeniui vardu '.$name;
                break;

            case 'daughter':
                $gender    = 'Female';
                $title = 'Pridėti dukterį asmeniui vardu '.$name;
                break;
			
			 case 'brother':
                $gender    = 'Male';
                $title = 'Pridėti brolį asmeniui vardu '.$name;
                break;

            case 'sister':
                $gender    = 'Female';
                $title = 'Pridėti seserį asmeniui vardu '.$name;
                break;
				
            default:
                echo 'Tokio giminaičio pridėti negalima';
                return;
        }
		?>
		<div class="form_container_2">
			<div class="form">
			<h1><?php echo $title; ?></h1>
			<form action="familytree.php" method="post">
				<div class="form_section name">
					<h3>Vardas, pavardė</h3>
					<input type="text" id="fname" name="fname" value="<?php echo $this->formError->value("fname"); ?>"  placeholder="Rašykite vardą čia">
					<?php echo $this->formError->error("fname"); ?>
					<input type="text" id="lname" name="lname" value="<?php echo $this->formError->value("lname"); ?>"  placeholder="Rašykite pavardę čia">
					<?php echo $this->formError->error("lname"); ?>
				</div>
				
			<?php
        // Show mname name option for women
        if ($gender == 'Female') {
			?>
			<div class="form_section maiden_name">
				<h3>Mergautinė pavardė</h3>
				<input type="text" id="mname" name="mname" value="<?php echo $this->formError->value("mname"); ?>"  placeholder="Rašykite mergautinę pavardę čia">
				<?php echo $this->formError->error("mname"); ?>
			</div>
			<?php
        }
		if ($type == 'son' || $type == 'daughter') {
			if ($individualid == $leafid) {
				if (count($spouses) == 1) {
					?>
					<p>
						<input type="hidden" id="parent" name="parent" value="<?php echo $spouses[0]['individual_id']; ?>"/>
					</p>
					<?php
				}
				if (count($spouses) > 1) {
					?>
					<div class="form_section parent">
						<h3>Kitas tėvas</h3>
						<select id="parent" name="parent">
					<?php
					foreach ($spouses as $spouse) {
						?>
							<option value="<?php echo $spouse['individual_id']; ?>"><?php echo $spouse['fname'].' '.$spouse['lname']; ?></option>
						<?php
					}
					?>
						</select>
					</div>
					<?php
				}	
			}
			if (count($parents) == 2) {
				foreach ($parents as $firstParent) {
					foreach ($parents as $secondParent) {
						if ($firstParent['individual_id'] != $secondParent['individual_id']
							&& $firstParent['individual_id'] == $leafid) {
							?>
							<p>
								<input type="hidden" id="parent" name="parent" value="<?php echo $secondParent['individual_id']; ?>"/>
							</p>
							<?php
						}
					}
				}
			}
			if (count($spouses) > 0) {
				foreach ($spouses as $spouse) {
					if ($spouse['individual_id'] == $leafid) {
						?>
						<p>
							<input type="hidden" id="parent" name="parent" value="<?php echo $spouse['individual']; ?>"/>
						</p>
						<?php
					}
				}	
			}
			if (count($children) > 0) {
				foreach ($children as $child) {
					if ($child['individual_id'] == $leafid) {
						if (count($childrenSpouses) == 1) {
							?>
							<p>
								<input type="hidden" id="parent" name="parent" value="<?php echo $childrenSpouses[0]['individual_id']; ?>"/>
							</p>
							<?php
						}
						if (count($childrenSpouses) > 1) {
							?>
							<div class="form_section parent">
								<h3>Kitas tėvas</h3>
								<select id="parent" name="parent">
							<?php
							foreach ($childrenSpouses as $childrenSpouse) {
								?>
									<option value="<?php echo $childrenSpouse['individual_id']; ?>"><?php echo $childrenSpouse['fname'].' '.$childrenSpouse['lname']; ?></option>
								<?php
							}
							?>
								</select>
							</div>
							<?php
						}	
					}
				}	
			}
			if (count($childrenSpouses) > 0) {
				foreach ($childrenSpouses as $childrenSpouse) {
					if ($childrenSpouse['individual_id'] == $leafid) {
						?>
						<p>
							<input type="hidden" id="parent" name="parent" value="<?php echo $childrenSpouse['individual']; ?>"/>
						</p>
						<?php
					}
				}	
			}
		}
		?>				<p>
							<input type="hidden" id="gender" name="gender" value="<?php echo $gender; ?>"/>
						</p>
						<div class="form_section birth_place">
							<h3>Gimimo vieta</h3>
							<input type="text" id="bplace" name="bplace" value="<?php echo $this->formError->value("bplace"); ?>"  placeholder="Rašykite gimimo vietą čia">
							<?php echo $this->formError->error("bplace"); ?>
						</div>
						<div class="form_section dates">
							<h3>Data</h3>
							<p>
								<input type="radio" id="living_option" name="living_deceased_options" checked="checked" value="1"/>
								<label for="bdate">Gyvas (-a)</label>&nbsp; &nbsp; &nbsp;	
								<input type="radio" id="deceased_option" name="living_deceased_options" value="1"/>
								<label for="ddate">Miręs (-usi)</label>	
							</p>
							<div class="half" style="display: inline">
								<input type="text" name="bdate" id="bdate" value="<?php echo $this->formError->value("bdate"); ?>" placeholder="Rašykite gimimo datą čia"/>
								<?php echo $this->formError->error("bdate"); ?>
							</div>
							<div id="deceased" class="half" style="display:none">
								<input type="text" name="ddate" id="ddate" value="<?php echo $this->formError->value("ddate"); ?>" placeholder="Rašykite mirties datą čia"/>
								<?php echo $this->formError->error("ddate"); ?>
							</div>
						</div>
						<div class="form_section bio">
							<h3>Biografija</h3>
							<textarea name="bio" id="bio" type="text"  placeholder="Rašykite biografiją čia"><?php echo $this->formError->value("bio"); ?></textarea>
							<?php echo $this->formError->error("bio"); ?>
						</div>
						<p>
							<input type="hidden" id="leafid" name="leafid" value="<?php echo $leafid; ?>"/>
							<input type="hidden" id="family" name="family" value="<?php echo $family; ?>"/>
							<input type="hidden" id="type" name="type" value="<?php echo $type; ?>"/>
						</p>
						<p class="submit">
							<input class="first-btn" type="submit" id="add-individual" name="add-individual" value="Pridėti"/> &nbsp;
							<label>arba</label>&nbsp;
							<a href="<?php echo $path; ?>#menu">Atšaukti</a>
						</p>
				</form>
			</div>
		</div>
		<script type="text/javascript">
		//<![CDATA[
			jQuery("[id*='date']").datepicker({
				monthNamesShort: [ "Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis", 
								"Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis" ],
				dayNamesMin: [ "Pr", "A", "T", "K", "Pn", "Š", "S" ],
				firstDay: 1,
				dateFormat: "yy-mm-dd",
				showOn: "button",
				showAnim: "slideDown",
				buttonImage: "ui/css/images/calendar.png",
				buttonImageOnly: true,
				changeMonth: true,
				changeYear: true
			});
			jQuery("#deceased_option").click(function() {
				document.getElementById("deceased").style.display = "inline-block";
			});
			jQuery("#living_option").click(function() {
				document.getElementById("deceased").style.display = "none";
			});
			//]]>
			</script>
		<?php	
    }
	/**
     * displayEditIndividualForm 
     */
    function displayEditIndividualForm($leafid) {  
		
		$leafid = $this->site->cleanOutput($leafid);	
        $currentLeafInfo = $this->getCurrentIndividualInfo($leafid);
		$spouses = $this->getSpouses($leafid);
		$path = $this->site->cleanOutput($_SERVER['REQUEST_URI']);
		
		if (strpos($path,'?option') == true) {
			$path = substr($path, 0, strpos($path, '?option'));
		}
		else if (strpos($path,'&option') == true){
			$path = substr($path, 0, strpos($path, '&option'));
		}

        // Living or deceased
        $living   = 'checked';
        $deceased = '';

        if ($currentLeafInfo['death_date'] != "0000-00-00") {
            $living   = '';
            $deceased = 'checked';
        }
		?>
		<div class="form_container_2">
			<div class="form">
			<h1>Redaguoti asmeninę informaciją</h1>
			<form action="familytree.php" method="post">
				<div class="form_section name">
					<h3>Vardas, pavardė</h3>
					<input type="text" id="fname" name="fname" value="<?php echo $currentLeafInfo['fname'];  ?>">
					<?php echo $this->formError->error("fname"); ?>
					<input type="text" id="lname" name="lname" value="<?php echo $currentLeafInfo['lname'];  ?>">
					<?php echo $this->formError->error("lname"); ?>
				</div>
					<?php
		if ($currentLeafInfo['gender'] == 'Female' && count($spouses) > 0) {
			?>
				<div class="form_section maiden_name">
					<h3>Mergautinė pavardė</h3>
					<input type="text" id="mname" name="mname" value="<?php echo $currentLeafInfo['mname']; ?>">
					<?php echo $this->formError->error("mname"); ?>
				</div>
			<?php
        }
		?>
					 <div class="form_section birth_place">
						<h3>Gimimo vieta</h3>
						<input type="text" id="bplace" name="bplace" value="<?php echo $currentLeafInfo['birth_place']; ?>" placeholder="Rašykite gimimo vietą čia">
						<?php echo $this->formError->error("bplace"); ?>
					</div>
					<div class="form_section dates">
						<h3>Data</h3>
						<p>
							<input type="radio" id="living_option" name="living_deceased_options" <?php echo $living; ?> value="1"/>
							<label for="bdate">Gyvas (-a)</label>&nbsp; &nbsp; &nbsp;	
							<input type="radio" id="deceased_option" name="living_deceased_options" <?php echo $deceased; ?> value="1"/>
							<label for="ddate">Miręs (-usi)</label>	
						</p>
						<div class="half" style="display: inline">
							<input type="text" name="bdate" id="bdate" value="<?php echo $currentLeafInfo['birth_date']; ?>" placeholder="Rašykite gimimo datą čia"/>
							<?php echo $this->formError->error("bdate"); ?>
						</div>
						<div id="deceased" class="half" style="display:none">
							<input type="text" name="ddate" id="ddate" value="<?php echo $currentLeafInfo['death_date']; ?>" placeholder="Rašykite mirties datą čia"/>
							<?php echo $this->formError->error("ddate"); ?>
						</div>
					</div>
					<div class="form_section bio">
						<h3>Biografija</h3>
						<textarea name="bio" id="bio" type="text" placeholder="Rašykite biografiją čia"><?php echo $currentLeafInfo['biography']; ?></textarea>
						<?php echo $this->formError->error("bio"); ?>
					</div>
					<p>
						<input type="hidden" id="leafid" name="leafid" value="<?php echo $leafid; ?>"/>
					</p>
					<p class="submit">
						<input class="first-btn" type="submit" id="edit-individual" name="edit-individual" value="Redaguoti"/>&nbsp;
						<label>arba</label>&nbsp;
						<a href="<?php echo $path; ?>#menu">Atšaukti</a>
					</p>
				</form>
			</div>
		</div>
		<script type="text/javascript">
		//<![CDATA[
			jQuery( "[id*='date']" ).datepicker({
				monthNamesShort: [ "Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis", 
								"Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis" ],
				dayNamesMin: [ "Pr", "A", "T", "K", "Pn", "Š", "S" ],
				firstDay: 1,
				dateFormat: "yy-mm-dd",
				showOn: "button",
				showAnim: "slideDown",
				buttonImage: "ui/css/images/calendar.png",
				buttonImageOnly: true,
				changeMonth: true,
				changeYear: true
			});
			jQuery("#deceased_option").click(function() {
				document.getElementById("deceased").style.display = "inline-block";
			});
			jQuery("#living_option").click(function() {
				document.getElementById("deceased").style.display = "none";
			});
			if (jQuery("#deceased_option").attr("checked")) {
				document.getElementById("deceased").style.display = "inline-block";
			}
			if (jQuery("#living_option").attr("checked")) {
				document.getElementById("deceased").style.display = "none";
			}
		//]]>	
		</script>
			<?php
    }
	/**
     * displayEditRelationshipForm 
     */
    function displayEditRelationshipForm ($leafid, $relationship) {  
		
		$leafid = $this->site->cleanOutput($leafid);
		$relationship = $this->site->cleanOutput($relationship);
		
		$q = "SELECT individual_id, fname, lname, mname, start_date, end_date, ended
				FROM ".TBL_INDIVIDUALS.",".TBL_RELATIONSHIPS."
				WHERE individual_id = individual
				AND individual = '$relationship'
				AND relationship_individual = '$leafid'
				AND role = '1'";
        
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		
        if ($num_rows <= 0) {
            echo "Could not find user";
            return;
        }
		else {
			$relationshipInfo = mysql_fetch_array($result);
		}
		
		if (!empty($relationshipInfo['mname'])) {
			$name = $relationshipInfo['fname'].' '.$relationshipInfo['lname'].' ('.$relationshipInfo['mname'].')';
		}
		else {
			$name = $relationshipInfo['fname'].' '.$relationshipInfo['lname'];
		}
		
		$start_date = $relationshipInfo['start_date'];
		$end_date = $relationshipInfo['end_date'];
		$married = 'checked';
		$divorced = '';
		
		if ($relationshipInfo['ended'] == '1') {
			$married = '';
			$divorced = 'checked';
		}

		$path = $this->site->cleanOutput($_SERVER['REQUEST_URI']);
		
		if (strpos($path,'&edit-rel') == true) {
			$path = substr($path, 0, strpos($path, '&edit-rel'));
		}
        
		?>
		<div class="form_container_2">
			<div class="form">
				<h1>Redaguoti ryšius</h1>
				<form action="familytree.php" method="post">
					<div class="form_section dates">
						<h3><?php echo $name; ?></h3>
						<p>
							<input type="radio" id="married_option" name="married_divorced_options" <?php echo $married; ?> value="0"/>
							<label for="edate">Susituokę</label>&nbsp; &nbsp; &nbsp;	
							<input type="radio" id="divorced_option" name="married_divorced_options" <?php echo $divorced; ?> value="1"/>
							<label for="sdate">Išsiskyrę</label>	
						</p>
						<div id="married" class="half" style="display: inline">
							<input type="text" name="sdate" id="sdate" value="<?php echo $start_date; ?>" placeholder="Rašykite sutuoktuvių datą čia"/>
							<?php echo $this->formError->error("sdate"); ?>
						</div>
						<div id="divorced" class="half" style="display:none">
							<input type="text" name="edate" id="edate" value="<?php echo $end_date; ?>" placeholder="Rašykite skyrybų datą čia"/>
							<?php echo $this->formError->error("edate"); ?>
						</div>
					</div>
					<p>
						<input type="hidden" id="relationshipid" name="relationshipid" value="<?php echo $relationship; ?>"/>
						<input type="hidden" id="leafid" name="leafid" value="<?php echo $leafid; ?>"/>
					</p>
					<p class="submit">
						<input class="first-btn" type="submit" id="edit-relationship" name="edit-relationship" value="Redaguoti"/>&nbsp;
						<label>arba</label>&nbsp;
						<a href="<?php echo $path; ?>#menu">Atšaukti</a>
					</p>
				</form>
			</div>
		</div>
		<script type="text/javascript">
		//<![CDATA[
			jQuery("[id*='date']").datepicker({
				monthNamesShort: [ "Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis", 
								"Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis" ],
				dayNamesMin: [ "Pr", "A", "T", "K", "Pn", "Š", "S" ],
				firstDay: 1,
				dateFormat: "yy-mm-dd",
				showOn: "button",
				showAnim: "slideDown",
				buttonImage: "ui/css/images/calendar.png",
				buttonImageOnly: true,
				changeMonth: true,
				changeYear: true
			});
			jQuery("#divorced_option").click(function(e) {
				document.getElementById("divorced").style.display = "inline-block";
			});
			jQuery("#married_option").click(function() {
				document.getElementById("divorced").style.display = "none";
			});
			if (jQuery("#divorced_option").attr("checked")) {
				document.getElementById("divorced").style.display = "inline-block";
			}
			if (jQuery("#married_option").attr("checked")) {
				document.getElementById("divorced").style.display = "none";
			}
		//]]>
		</script>
			<?php
    }
	/**
     * displayIndividualProfile
     */
    function displayIndividualProfile($username, $individualid) {  
		
		$currentUserId = $this->getCurrentUserID($username);
		$individualid = $this->site->cleanOutput($individualid);
		$parents = $this->getParents($individualid);
		$spouses = $this->getSpouses($individualid);
		$children = $this->getChildren($individualid);
		$siblings = $this->getChildren($parents);
		
		$q = "SELECT i.individual_id, i.fname, i.lname, i.mname, i.birth_date, i.birth_place, i.death_date, 
				i.gender, i.biography, i.avatar, i.individual_family, u.username, u.email, u.timestamp
				FROM ".TBL_INDIVIDUALS." AS i 
				LEFT JOIN ".TBL_USERS." AS u
				ON u.username = i.individual_username
				WHERE i.individual_id = '$individualid'";
        
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		
        if ($num_rows <= 0) {
            echo "<div class='notice'><p>Nepavyko rasti tokio vartotojo</p></div>";
            return;
        }
		else {
			$currentProfileInfo = mysql_fetch_array($result);
		}  
		
		if (!empty($currentProfileInfo['mname'])) {
			$name = $currentProfileInfo['fname'].' '.$currentProfileInfo['lname'].' ('.$currentProfileInfo['mname'].')';
		}
		else {
			$name = $currentProfileInfo['fname'].' '.$currentProfileInfo['lname'];
		}
		
		if (!empty($currentProfileInfo['timestamp'])) {
			$registered = date('Y-m-d', $currentProfileInfo['timestamp']);
		}
		else {
			$registered = 'neprisiregistravęs (-usi)';
		}
		
		?>
		<div class="profile_panel">
			<div class="profile_left">
				<div class="profile_side">
					<h4>Profilio nuotrauka</h4>
					<div class="profile_picture">
						<img src='uploads/avatars/large/<?php echo $currentProfileInfo['avatar']; ?>'>
					</div>
					<h4>Pasirinktys</h4>
					<div class="profile_menu">
						<ul>
							<li>
								<p>
									<a class="profile-edit-icon" href="familytree.php?tree=<?php echo $individualid; ?>&option=edit#menu">Redaguoti profilį</a>
								</p>
							</li>
							<li>
								<p>
									<a class="home-gallery-icon" href="upload.php?avatar=<?php echo $individualid; ?>#menu">Redaguoti nuotrauką</a>
								</p>
							</li>
							<li>
								<p>
									<a class="home-tree-icon" href="familytree.php?tree=<?php echo $individualid; ?>#menu">Žiūrėti medyje</a>
								</p>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="profile_center">
				<div class="profile_main_data">
					<h1><?php echo $name; ?></h1>
					<h2><b>Prisijungė:</b>&nbsp; &nbsp;<?php echo $registered; ?></h2>
				</div>
				<div class="profile_info">
					<div class="info">
						<h3>Kontaktinė informacija</h3>
						<ul>
							<li>
								<p class="description">
									El. pašto adresas:<a href="mailto:<?php echo $currentProfileInfo['email']; ?>"><?php echo $currentProfileInfo['email']; ?></a>
								</p>
							</li>			
						</ul>
						<h3>Svarbios datos</h3>
						<ul>
							<li>
							<?php
							if ($currentProfileInfo['birth_date'] != '0000-00-00') {
							?>
								<p class="description">Gimimo data:</p><p class="date"><?php echo $currentProfileInfo['birth_date']; ?></p>
							<?php
							}
							if ($currentProfileInfo['death_date'] != '0000-00-00') {
							?>
								<p class="description">Mirties data:</p><p class="date"><?php echo $currentProfileInfo['death_date']; ?></p>
							<?php
							}
							?>
							</li>
						</ul>
						<h3>Vieta</h3>
						<ul>
							<li>
								<p class="description">
									<?php echo $currentProfileInfo['birth_place']; ?>
								</p>
							</li>			
						</ul>
						<h3>Biografija</h3>
						<ul>
							<li>
								<p class="description">
									<?php echo $currentProfileInfo['biography']; ?>
								</p>
							</li>			
						</ul>
					</div>
				</div>
				<div class="profile_desc">
					<p>
					<b>Pastaba:</b></br> Jei norite redaguoti asmeninę informaciją, tai padaryti galite <a href="familytree.php?tree=<?php echo $individualid; ?>&option=edit#menu">čia</a>.
					</p>
					<?php
					if ($individualid == 0 || $individualid == $currentUserId) {
					?>
						<p>
						Jei norite redaguoti paskyros informaciją, spauskite <a href="usermanagement.php?edit=0#menu">čia</a>.
						</p>
					<?php
					}
					?>
				</div>
			</div>
			<div class="profile_right">
				<div class="profile_side">
					<div class="profile_family">
						<h4>Artimiausia šeima</h4>
						<ul>
						<?php
						if (!empty($parents)) {
							foreach ($parents as $parent) {
								if ($parent['gender'] == 'Male') {
								?>
									<li>
									<img class="profile_family avatar" src="uploads/avatars/small/<?php echo $parent['avatar']; ?>">
										<p>
											<a href="familytree.php?profile=<?php echo $parent['individual_id']; ?>#menu"><?php echo $parent['fname'].' '.$parent['lname']; ?></a>
										</p>
										<p>Tėvas</p>
									</li>
								<?php
								}
								else {
									?>
									<li>
									<img class="profile_family avatar" src="uploads/avatars/small/<?php echo $parent['avatar']; ?>">
										<p>
											<a href="familytree.php?profile=<?php echo $parent['individual_id']; ?>#menu"><?php echo $parent['fname'].' '.$parent['lname']; ?></a>
										</p>
										<p>Mama</p>
									</li>
									<?php
								}
							}
						}
						if (!empty($spouses)) {
							foreach ($spouses as $spouse) {
								if ($spouse['gender'] == 'Male') {
								?>
									<li>
									<img class="profile_family avatar" src="uploads/avatars/small/<?php echo $spouse['avatar']; ?>">
										<p>
											<a href="familytree.php?profile=<?php echo $spouse['individual_id']; ?>#menu"><?php echo $spouse['fname'].' '.$spouse['lname']; ?></a>
										</p>
										<p>Sutuoktinis</p>
									</li>
								<?php
								}
								else {
									?>
									<li>
									<img class="profile_family avatar" src="uploads/avatars/small/<?php echo $spouse['avatar']; ?>">
										<p>
											<a href="familytree.php?profile=<?php echo $spouse['individual_id']; ?>#menu"><?php echo $spouse['fname'].' '.$spouse['lname']; ?></a>
										</p>
										<p>Sutuoktinė</p>
									</li>
									<?php
								}
							}
						}
						if (!empty($children)) {
							foreach ($children as $child) {
								if ($child['gender'] == 'Male') {
								?>
									<li>
									<img class="profile_family avatar" src="uploads/avatars/small/<?php echo $child['avatar']; ?>">
										<p>
											<a href="familytree.php?profile=<?php echo $child['individual_id']; ?>#menu"><?php echo $child['fname'].' '.$child['lname']; ?></a>
										</p>
										<p>Sūnus</p>
									</li>
								<?php
								}
								else {
									?>
									<li>
									<img class="profile_family avatar" src="uploads/avatars/small/<?php echo $child['avatar']; ?>">
										<p>
											<a href="familytree.php?profile=<?php echo $child['individual_id']; ?>#menu"><?php echo $child['fname'].' '.$child['lname']; ?></a>
										</p>
										<p>Dukra</p>
									</li>
									<?php
								}
							}
						}
						if (!empty($siblings)) {
							
							$tmp_sibling = "";
							
							foreach ($siblings as $sibling) {
								if ($sibling['individual_id'] != $individualid && $sibling['individual_id'] != $tmp_sibling) {
									$tmp_sibling = $sibling['individual_id'];
									
									if ($sibling['gender'] == 'Male') {
									?>
										<li>
										<img class="profile_family avatar" src="uploads/avatars/small/<?php echo $sibling['avatar']; ?>">
											<p>
												<a href="familytree.php?profile=<?php echo $sibling['individual_id']; ?>#menu"><?php echo $sibling['fname'].' '.$sibling['lname']; ?></a>
											</p>
											<p>Brolis</p>
										</li>
									<?php
									}
									else {
										?>
										<li>
										<img class="profile_family avatar" src="uploads/avatars/small/<?php echo $sibling['avatar']; ?>">
											<p>
												<a href="familytree.php?profile=<?php echo $sibling['individual_id']; ?>#menu"><?php echo $sibling['fname'].' '.$sibling['lname']; ?></a>
											</p>
											<p>Sesuo</p>
										</li>
										<?php
									}
								}
							}
						}
						?>
					</ul>
					</div>
				</div>
			</div>
		</div>
		<?php
		
    }
    /**
     * addSpouse 
     */
    function addSpouse ($individual, $relationship) {
        
		$role = '1';
		$individual = $this->site->cleanOutput($individual);	
		$relationship = $this->site->cleanOutput($relationship);
		$spouses = $this->getSpouses($relationship);
		$children = $this->getChildren($relationship);

        // Insert relationships for both individuals
        $q = "INSERT INTO ".TBL_RELATIONSHIPS." (
				individual, role, relationship_individual
				) 
                VALUES 
                    ('$individual', '$role', '$relationship'),
                    ('$relationship', '$role', '$individual')";

        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		if (count($spouses) == 0 && count($children) > 0) {
			foreach ($children as $child) {
				$childid = $child['individual_id'];
				$this->addChild ($child[''], $individual);
			}
		}
			
    }

    /**
     * addChild
     * Adds a child relationship for the given user.
     */
    function addChild ($individual, $relationship) {
		
        $role = '2';
		$individual = $this->site->cleanOutput($individual);	
		$relationship = $this->site->cleanOutput($relationship);
		
		$q = "INSERT INTO ".TBL_RELATIONSHIPS." (
				individual, role, relationship_individual
				)
				VALUES
					('$relationship', '$role', '$individual')";
				
		$result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
    }
	/**
     * editRelationship
     * Edits the relationship of the given user and the spouse.
     */
    function editRelationship ($individual, $relationship, $sdate, $edate, $ended) {
		
		$individual = $this->site->cleanOutput($individual);
		$relationship = $this->site->cleanOutput($relationship);
		$sdate  =  $this->site->cleanOutput($sdate);
        $edate  =  $this->site->cleanOutput($edate);
		$ended = $this->site->cleanOutput($ended);
		
		$q = "UPDATE ".TBL_RELATIONSHIPS." 
				SET start_date = '$sdate', end_date = '$edate', ended = '$ended'
				WHERE individual = '$individual'
				AND relationship_individual = '$relationship'
				AND role = '1'";

        $result = $this->database->query($q);
				
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
    }
};
$familytree = new FamilyTree($database, $form, $site);
?>