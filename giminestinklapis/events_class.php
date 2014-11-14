<?php 
include_once('include/form.php');
include_once('site.php');

class Events {

	var $database;
	var $form;
	var $site;
    
    function Events($database, $form, $site) {
	
		$this->database = $database;
		$this->formError = $form;
		$this->site = $site;
    }
	/**
     * displayCalendar 
     * 
     * Displays the calendar based on the current year, month, day.
     */
    function displayCalendar($username, $year = 0, $month = 0, $day = 0) {
		
		if ($month == 0) {
            $year  = $this->formatDate('Y', gmdate('Y-m-d H:i:s'));
            $month = $this->formatDate('m', gmdate('Y-m-d H:i:s'));
            $day   = $this->formatDate('d', gmdate('Y-m-d H:i:s'));
        }
		
        $month = str_pad($month, 2, 0, STR_PAD_LEFT);
        $day   = str_pad($day, 2, 0, STR_PAD_LEFT);
		
		// 0 - Sunday, 6 - Saturday
		$weekStartDay = 1; // Monday
		        
        // First day of the month
        $firstDay = mktime(0,0,0,$month,1,$year);
        $offset = date('w', $firstDay);

        // Day of week changed
        if ($weekStartDay > 0) {
            $offset = $offset + (7 - $weekStartDay);
            if ($offset >= 7) {
                $offset = $offset - 7;
            }
        }

        $daysInMonth = date('t', $firstDay);
		// Days that have events
		$eventDays = $this->getEventDays($username, $year, $month);
		$categories = $this->getCategories($username);
        
        // Previous links
        $previousLinks = strtotime("$year-$month-01 -1 month");
        // Check if previous day is less than the count of days in previous month
        $previousDay = ($day > date('t', $previousLinks)) ? date('t', $previousLinks) : $day;
        list($previousYear, $previousMonth) = explode('-', date('Y-m', $previousLinks));

        // Current links
        $currentYear = $this->formatDate('Y', gmdate('Y-m-d H:i:s'));
        $currentMonth = $this->formatDate('m', gmdate('Y-m-d H:i:s'));
        $currentDay = $this->formatDate('d', gmdate('Y-m-d H:i:s'));

        // Next links
        $nextLinks = strtotime("$year-$month-01 +1 month");
        // Make sure next day is less than the total num of days in next month
        $nextDay = ($day > date('t', $nextLinks)) ? date('t', $nextLinks) : $day;
        list($nextYear, $nextMonth) = explode('-', date('Y-m', $nextLinks));

        // Display the month view
        ?>
		<div class="calendar_panel">
			<table class="calendar" cellpadding="0" cellspacing="0">
				<tr>
					<th colspan="2">
						<a class="prev" href="?year=<?php echo $previousYear; ?>&amp;month=<?php echo $previousMonth; ?>&amp;day=<?php echo $previousDay; ?>#menu">Ankstesnis mėnuo</a> 
						<a class="today" href="?year=<?php echo $currentYear; ?>&amp;month=<?php echo $currentMonth; ?>&amp;day=<?php echo $currentDay; ?>#menu">Einamasis mėnuo</a> 
						<a class="next" href="?year=<?php echo $nextYear; ?>&amp;month=<?php echo $nextMonth; ?>&amp;day=<?php echo $nextDay; ?>#menu">Sekantis mėnuo</a>
					</th>
					<th colspan="3"><h1><?php echo $this->formatDate('F Y', "$year-$month-$day"); ?></h1></th>
					<th class="view" colspan="2">
					</th>
				</tr>
				<tr>
		<?php
        
		// Display weekday names
        for ($i = 0; $i <= 6; $i++) {
            ?>
			<td class="weekDays"><h1><?php echo $this->getDayName($i); ?></h1></td>
			<?php
        }
		?>
			</tr>
		<?php
        $row = 0;
		// Display days and events if exists
        for ($days = (1 - $offset); $days <= $daysInMonth; $days++) {
            if ($row % 7 == 0) {
				?>
                <tr>
				<?php
            }
            // display days that don't belong to the current month
            if ($days < 1) {
				?>
                <td class="nonMonthDay">&nbsp;</td>
				<?php
            }
            // display the current day (today)
            else {
                if ($days == $day) {
					?>
                    <td class="monthToday">
					<?php
                }
                // display days that belong to the current month
                else {
					?>
                    <td class="monthDay">
					<?php
                }
                // display add new event link
				$path = $_SERVER['REQUEST_URI'];
			
				if (strpos($path,'year') == true) {
					$path = $path.'&add-event=';
				}
				else {
					$path = $path.'?add-event=';
				}
				?>
				<a class="add" href="<?php echo $path.$year.'-'.$month.'-'.$days; ?>#menu">Pridėti įvykį</a>
				<p><?php echo $days; ?></p>
				<?php
                // display the events for each day
				if (in_array($days, $eventDays)) {
					$this->displayEvents($year, $month, $days);
				}
				?>
                </td>
				<?php
            }
			
            $row++;
            
            if ($row % 7 == 0) {
                ?>
                </tr>
				<?php
            }
        }
        // display days that don't belong to the current month
        if ($row % 7 != 0) {
            for ($i = 0; $i < (7 - ($row % 7)); $i++) {
                ?>
                <td class="nonMonthDay">&nbsp;</td>
				<?php
            }
            ?>
			</tr>
			<?php
        }
		if (strpos($path,'add-event') == true) {
			$path = substr($path, 0, strpos($path, 'add-event')).'add-category=0';
		}
		else if (strpos($path,'year') == true) {
			$path = $path.'&add-category=0';
		}
		else {
			$path = $path.'?add-category=0';
		}
		?>
			<tr class="actions">
				<td style="text-align:left;" colspan="3">
					<b>Kategorijos</b><br/>
					<div id="category_menu">
						<ul class="category_menu"><?php echo $this->displayCategories($categories); ?>
							<li><a class='add-new-icon' href="<?php echo $path; ?>#menu">Nauja kategorija</a></li>
						</ul>
					</div>
				</td>
				<td colspan="4">
				</td>
			</tr>
		</table>
	</div>
	<?php
    }
	/**
     * getFamilyEventsIds
     * 
     * Used to get ids array of all the events of user's family. 
     */
	function getFamilyEventsIds($username) {
		 
		$username = $this->site->cleanOutput($username);
		$familyEvents = array();

		$q = "SELECT e.event_id
				FROM ".TBL_EVENTS." AS e 
				INNER JOIN ".TBL_MANAGERS." AS m 
				ON m.manager_family = (
					SELECT individual_family 
					FROM ".TBL_INDIVIDUALS." 
					WHERE individual_username = '$username'
				) 
				AND e.event_user = m.manager_username";
		
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$familyEvents[] = $row['event_id'];
			}
		}
		
		$q = "SELECT individual_id
				FROM ".TBL_INDIVIDUALS." 
				WHERE individual_family = (
					SELECT individual_family
					FROM ".TBL_INDIVIDUALS." 
					WHERE individual_username = '$username'
				)";
		
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$familyEvents[] = $row['individual_id'];
			}
		}
		
		$q = "SELECT relationship_id
				FROM ".TBL_RELATIONSHIPS." 
				WHERE individual IN (
					SELECT individual_id
					FROM ".TBL_INDIVIDUALS." 
					WHERE individual_family = (
						SELECT individual_family
						FROM ".TBL_INDIVIDUALS." 
						WHERE individual_username = '$username'
					)
				)";
		
		$result = $this->database->query($q);
		
		if ($result == false) {
            $result .= die(mysql_error());
            return;
        }
		
		$num_rows = mysql_num_rows($result);
		
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$familyEvents[] = $row['relationship_id'];
			}
		}
		return $familyEvents;
	}
	/**
     * getFamilyCategoriesIds
     * 
     * Used to get ids array of all the categories of user's family. 
     */
	function getFamilyCategoriesIds($username) {
		 
		 $username = $this->site->cleanOutput($username);
		 
		$q = "SELECT c.category_id
				FROM ".TBL_EVENTS_CATEGORY." AS c 
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
     * getEventDays 
     * 
     * Gets an array of days that have events for a given month.
     */
    function getEventDays ($username, $year, $month) {
        
		$username = $this->site->cleanOutput($username);
		$year  = $this->site->cleanOutput($year);
        $month = $this->site->cleanOutput($month);
        $month = str_pad($month, 2, 0, STR_PAD_LEFT);
		$days = array();

        // Get days that have events
        $q = "SELECT DAY(`event_date`) AS day
                FROM ".TBL_EVENTS." 
                 WHERE `event_user` IN (
					SELECT `manager_username`
					FROM ".TBL_MANAGERS."
					WHERE `manager_family` = (
						SELECT `individual_family`
						FROM ".TBL_INDIVIDUALS."
						WHERE `individual_username` = '$username'
					)
				)
				AND (
					(`event_date` LIKE '$year-$month-%%') 
					OR (`event_date` LIKE '%%%%-$month-%%' AND `repeat` = '1')
				)
				ORDER BY day";

        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);
		
        if (count($num_rows) > 0) {
            while ($row = mysql_fetch_assoc($result)) {
				$days[] = $row['day'];
			}
        }
        // Get birthdays
        $q = "SELECT DAY(`birth_date`) AS day
                FROM ".TBL_INDIVIDUALS."
                WHERE `individual_family` = (
					SELECT `individual_family`
					FROM ".TBL_INDIVIDUALS."
					WHERE `individual_username` = '$username'
				)
				AND (`birth_date` LIKE '%%%%-$month-%%')
				AND `death_date` = '0000-00-00'
				ORDER BY day";

       $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);
		
        if (count($num_rows) > 0) {
            while ($row = mysql_fetch_assoc($result)) {
				$days[] = $row['day'];
			}
        }
		// Get anniversaries
         $q = "SELECT DAY(`start_date`) AS day
				FROM ".TBL_RELATIONSHIPS.",".TBL_INDIVIDUALS."
				WHERE `individual_family` = (
					SELECT `individual_family`
					FROM ".TBL_INDIVIDUALS."
					WHERE `individual_username` = '$username'
				)
				AND `individual` = `individual_id`
				AND (`start_date` LIKE '%%%%-$month-%%')
				AND `end_date` = '0000-00-00'
				ORDER BY day";

       $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);
		
        if (count($num_rows) > 0) {
            while ($row = mysql_fetch_assoc($result)) {
				$days[] = $row['day'];
			}
        }		
        return $days;
    }
	/**
     * getEventInfo
     * 
     * Gets the info of all the events for every day of the given month.
     */
    function getEventInfo($month, $day) {

        $month = $this->site->cleanOutput($month);
        $month   = str_pad($month, 2, 0, STR_PAD_LEFT);
		$day = $this->site->cleanOutput($day);
        $day   = str_pad($day, 2, 0, STR_PAD_LEFT);

        // Get days from calendar events
        $q = "SELECT `event_id`, `title`, `description`, `event_date`, `event_user`, `category_color` 
                FROM ".TBL_EVENTS.",".TBL_EVENTS_CATEGORY."
                WHERE (`event_date` LIKE '%%%%-$month-$day')
				AND `event_category` = `category_id`";

        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);
		$events = array();
		
        if (count($num_rows) > 0) {
            while ($row = mysql_fetch_assoc($result)) {
				$events[] = $row;
			}
        }
        return $events;
    }
	/**
     * getBirthdaysInfo 
     * 
     * Gets the info of all the birthdays for every day of the given month.
     */
    function getBirthdayInfo($month, $day) {
	
		$month = $this->site->cleanOutput($month);
        $month   = str_pad($month, 2, 0, STR_PAD_LEFT);
		$day = $this->site->cleanOutput($day);
        $day   = str_pad($day, 2, 0, STR_PAD_LEFT);

		// Get birthdays
        $q = "SELECT `individual_id`, `fname`, `lname`, `mname`, `birth_date`, `category_color`
                FROM ".TBL_INDIVIDUALS.", ".TBL_EVENTS_CATEGORY." 
				WHERE (`birth_date` LIKE '%%%%-$month-$day')
				AND `death_date` = '0000-00-00'
				AND `category_name` = 'Gimtadieniai'";

        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);
		$birthdays = array();
		
        if (count($num_rows) > 0) {
            while ($row = mysql_fetch_assoc($result)) {
				$birthdays[] = $row;
			}
        }
        return $birthdays;
    }
	/**
     * getAnniversariesInfo
     * 
     * Gets the info of all the anniversaries for every day of the given month.
     */
    function getAnniversaryInfo($month, $day) {
		
		$month = $this->site->cleanOutput($month);
        $month   = str_pad($month, 2, 0, STR_PAD_LEFT);
		$day = $this->site->cleanOutput($day);
        $day   = str_pad($day, 2, 0, STR_PAD_LEFT);
		
		// Get anniversaries
        $q = "SELECT `relationship_id`, `individual`, `relationship_individual`, `start_date`, `category_color`, ( 
					SELECT `fname` 
					FROM  ".TBL_INDIVIDUALS."
					WHERE `individual_id` = `individual`
				) AS fname, ( 
					SELECT `lname` 
					FROM  ".TBL_INDIVIDUALS."
					WHERE `individual_id` = `individual`
				) AS lname, (
					SELECT `fname` 
					FROM  ".TBL_INDIVIDUALS."
					WHERE `individual_id` = `relationship_individual`
				) AS spouse_fname, (
					SELECT `lname` 
					FROM  ".TBL_INDIVIDUALS."
					WHERE `individual_id` = `relationship_individual`
				) AS spouse_lname
				FROM ".TBL_RELATIONSHIPS.",".TBL_INDIVIDUALS.",".TBL_EVENTS_CATEGORY."
				WHERE `individual` = `individual_id`
				AND (`start_date` LIKE '%%%%-$month-$day')
				AND `end_date` = '0000-00-00'
				AND `category_name` = 'Sukaktuvės'";

        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);
		$anniversaries = array();
		
        if (count($num_rows) > 0) {
            while ($row = mysql_fetch_assoc($result)) {
				$anniversaries[] = $row;
			}
        }
        return $anniversaries;
    }
	/**
     * getCategories
     * 
     * Gets the information of all the categories of the existing events
     */
    function getCategories($username) {

        $q = "SELECT * FROM ".TBL_EVENTS_CATEGORY." 
		 WHERE `category_user` IN (
			SELECT `manager_username`
			FROM ".TBL_MANAGERS."
			WHERE `manager_family` = (
				SELECT `individual_family`
				FROM ".TBL_INDIVIDUALS."
				WHERE `individual_username` = '$username'
			)
		)
		OR `category_user` = '".ADMIN_NAME."'
		ORDER BY `category_id`";
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
		}
        return $categories;
    }
	/**
	 * getDateDifference 
	 * 
	 * Used to calculate the age on birthday or years lived together on wedding anniversary.
	 */
	function getDateDifference($year, $dateToCompare = false) {

		$dateDiff = 0;

		if ($dateToCompare == false) {
			$yearDiff  = gmdate("Y") - $year;
		}
		else {
			$yearDiff  = gmdate("Y", strtotime($dateToCompare)) - $year;
		}

		$dateDiff = $yearDiff;

		return $dateDiff;
	}
	/**
	 * getMonthName 
	 * Returns the name of the given month.
	 */
	function getMonthName($month) {
		
		$monthName[1]  = 'Sausis';
		$monthName[2]  = 'Vasaris';
		$monthName[3]  = 'Kovas';
		$monthName[4]  = 'Balandis';
		$monthName[5]  = 'Gegužė';
		$monthName[6]  = 'Birželis';
		$monthName[7]  = 'Liepa';
		$monthName[8]  = 'Rugpjūtis';
		$monthName[9]  = 'Rugsėjis';
		$monthName[10] = 'Spalis';
		$monthName[11] = 'Lapkritis';
		$monthName[12] = 'Gruodis';

		return $monthName[$month];
	}
	/**
	 * getDayName
	 * Returns the name of the given week day.
	 */
	function getDayName($day) {
		$dayName[0] = 'Pirmadienis';
		$dayName[1] = 'Antradienis';
		$dayName[2] = 'Trečiadienis';
		$dayName[3] = 'Ketvirtadienis';
		$dayName[4] = 'Penktadienis';
		$dayName[5] = 'Šeštadienis';
		$dayName[6] = 'Sekmadienis';

		return $dayName[$day];
	}
	/**
     * displayEvents
     * Display all the events, birthdays and anniversaries for a given day in the calendar.
     */
    function displayEvents ($year, $month, $day) {

		$events = $this->getEventInfo($month, $day);
		$birthdays = $this->getBirthdayInfo($month, $day);
		$anniversaries = $this->getAnniversaryInfo($month, $day);
		
        if (!empty($events)) {
            foreach ($events as $event) {
				$event_id = $event['event_id'];
				$title = $event['title'];
				$description = $event['description'];
				$color = $event['category_color'];
				
				$path = $_SERVER['REQUEST_URI'];
			
				if (strpos($path,'year') == true) {
					$path = $path.'&event=';
				}
				else {
					$path = $path.'?event=';
				}
				echo '
					<div class="event">
						<a class="'.$color.'" title="'.$title.' '.$description.'" href="'.$path.$event_id.'#menu">'.$title.'</a>
					</div>';                
            }
        }
		if (!empty($birthdays)) {
            foreach ($birthdays as $birthday) {
				list($byear, $bmonth, $bday) = explode('-', $birthday['birth_date']);
				$age = $this->getDateDifference($byear, "$year-$month-$day");
				
				if (!empty($birthday['mname'])) {
					$title = $birthday['fname'].' '.$birthday['lname'].' ('.$birthday['mname'].')';
				}
				else {
					$title = $birthday['fname'].' '.$birthday['lname'];
				}
			
				$birthday_id = $birthday['individual_id'];
				$description = sprintf('švenčia %s - ąjį gimtadienį.', $age);
				$color = $birthday['category_color'];
				
				$path = $_SERVER['REQUEST_URI'];
			
				if (strpos($path,'year') == true) {
					$path = $path.'&birthday=';
				}
				else {
					$path = $path.'?birthday=';
				}
				
				echo '
					<div class="event">
						<a class="'.$color.'" title="'.$title.' '.$description.'" href="'.$path.$birthday_id.'#menu" 
							>'.$title.'</a>
					</div>';                
			}
        }
		if (!empty($anniversaries)) {
			
			$tmp_anniversary = "";
			
            foreach ($anniversaries as $anniversary) {
				if ($anniversary['individual'] != $tmp_anniversary) {
					$tmp_anniversary = $anniversary['relationship_individual'];
					list($ayear, $amonth, $aday) = explode('-', $anniversary['start_date']);
					$yearsTogether = $this->getDateDifference($ayear, "$year-$month-$day");
					$name = $anniversary['fname'].' '.$anniversary['lname'];
					$spouseName = $anniversary['spouse_fname'].' '.$anniversary['spouse_lname'];
					$anniversary_id = $anniversary['relationship_id'];
					$color = $anniversary['category_color'];
					$title = sprintf('%s ir %s', $name, $spouseName);
					$description = sprintf('švenčia %s - ąsias vestuvių metines.', $yearsTogether);
					
					$path = $_SERVER['REQUEST_URI'];
				
					if (strpos($path,'year') == true) {
						$path = $path.'&anniversary=';
					}
					else {
						$path = $path.'?anniversary=';
					}
					
					echo '
						<div class="event">
							<a class="'.$color.'" title="'.$title.' '.$description.'" href="'.$path.$anniversary_id.'#menu" 
								>'.$title.'</a>
						</div>';           
				}
			}
        }	
    }
	/**
     * displayTodaysEvents
     * Display the events of today, including birthdays and anniversaries.
     */
    function displayTodaysEvents ($username, $year, $month, $day) {
	
		$username = $this->site->cleanOutput($username);
		$year  = $this->site->cleanOutput($year);
        $month = $this->site->cleanOutput($month);
        $month = str_pad($month, 2, 0, STR_PAD_LEFT);
		$day = $this->site->cleanOutput($day);
        $day = str_pad($day, 2, 0, STR_PAD_LEFT);
		$counter = 0;
				
        // Get events info
        $q = "SELECT `event_id`, `title`, `description`, `event_date`, `event_user`, `category_color`
                FROM ".TBL_EVENTS.",".TBL_EVENTS_CATEGORY."
                 WHERE `event_user` IN (
					SELECT `manager_username`
					FROM ".TBL_MANAGERS."
					WHERE `manager_family` = (
						SELECT `individual_family`
						FROM ".TBL_INDIVIDUALS."
						WHERE `individual_username` = '$username'
					)
				)
				AND (
					(`event_date` LIKE '$year-$month-$day') 
					OR (`event_date` LIKE '%%%%-$month-$day' AND `repeat` = '1')
				)
				AND `event_category` = `category_id`";

        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);
		$eventsInfo = array();
		
        if (count($num_rows) > 0) {
            while ($row = mysql_fetch_assoc($result)) {
				$eventsInfo[] = $row;
			}
        }
		
        // Get birthdays info
        $q = "SELECT `individual_id`, `fname`, `lname`, `mname`, `birth_date`, `category_color`
                FROM ".TBL_INDIVIDUALS.", ".TBL_EVENTS_CATEGORY." 
                WHERE `individual_family` = (
					SELECT `individual_family`
					FROM ".TBL_INDIVIDUALS."
					WHERE `individual_username` = '$username'
				)
				AND (`birth_date` LIKE '%%%%-$month-$day')
				AND `death_date` = '0000-00-00'
				AND `category_name` = 'Gimtadieniai'";

       $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);
		$birthdaysInfo = array();
		
        if (count($num_rows) > 0) {
            while ($row = mysql_fetch_assoc($result)) {
				$birthdaysInfo[] = $row;
			}
        }
		
		// Get anniversaries info
         $q = "SELECT `relationship_id`, `start_date`, `category_color`, ( 
					SELECT `fname` 
					FROM  ".TBL_INDIVIDUALS."
					WHERE `individual_id` = `individual`
				) AS fname, ( 
					SELECT `lname` 
					FROM  ".TBL_INDIVIDUALS."
					WHERE `individual_id` = `individual`
				) AS lname, (
					SELECT `fname` 
					FROM  ".TBL_INDIVIDUALS."
					WHERE `individual_id` = `relationship_individual`
				) AS spouse_fname, (
					SELECT `lname` 
					FROM  ".TBL_INDIVIDUALS."
					WHERE `individual_id` = `relationship_individual`
				) AS spouse_lname
				FROM ".TBL_RELATIONSHIPS.",".TBL_INDIVIDUALS.",".TBL_EVENTS_CATEGORY."
				WHERE `individual_family` = (
					SELECT `individual_family`
					FROM ".TBL_INDIVIDUALS."
					WHERE `individual_username` = '$username'
				)
				AND `individual` = `individual_id`
				AND (`start_date` LIKE '%%%%-$month-$day')
				AND `end_date` = '0000-00-00'
				AND `category_name` = 'Sukaktuvės'";

       $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}

		$num_rows = mysql_num_rows($result);
		$anniversariesInfo = array();
		
        if (count($num_rows) > 0) {
            while ($row = mysql_fetch_assoc($result)) {
				$anniversariesInfo[] = $row;
			}
        }
		
        if (!empty($eventsInfo)) {
		
			echo '<ul>';
			
            foreach ($eventsInfo as $eventInfo) {
				$counter++;
				$event_id = $eventInfo['event_id'];
				$title = $eventInfo['title'];
				$description = $eventInfo['description'];
				
				echo '
					<li>
						<p>
							<a href="events.php?event='.$event_id.'#menu">'.$title.'</a> '.$description.'
						</p>
					</li>';
            }
			
			echo '</ul>';
        }
		if (!empty($birthdaysInfo)) {
		
			echo '<ul>';
			
            foreach ($birthdaysInfo as $birthdayInfo) {
				$counter++;
				list($byear, $bmonth, $bday) = explode('-', $birthdayInfo['birth_date']);
				$age = $this->getDateDifference($byear, "$year-$month-$day");
				
				if (!empty($birthdayInfo['mname'])) {
					$title = $birthdayInfo['fname'].' '.$birthdayInfo['lname'].' ('.$birthdayInfo['mname'].')';
				}
				else {
					$title = $birthdayInfo['fname'].' '.$birthdayInfo['lname'];
				}

				$birthday_id = $birthdayInfo['individual_id'];
				$description = sprintf('švenčia %s - ąjį gimtadienį.', $age);
						
				echo '
					<li>
						<p>
							<a href="familytree.php?profile='.$birthday_id.'#menu">'.$title.'</a> '.$description.'
						</p>
					</li>'; 
			}
			
			echo '</ul>';
        }
		if (!empty($anniversariesInfo)) {
		
			echo '<ul>';
		
            foreach ($anniversariesInfo as $anniversaryInfo) {
				$counter++;
				list($ayear, $amonth, $aday) = explode('-', $anniversaryInfo['start_date']);
				$yearsTogether = $this->getDateDifference($ayear, "$year-$month-$day");
				$name = $anniversaryInfo['fname'].' '.$anniversaryInfo['lname'];
				$spouseName = $anniversaryInfo['spouse_fname'].' '.$anniversaryInfo['spouse_lname'];
				$anniversary_id = $anniversaryInfo['individual'];
				$title = sprintf('%s ir %s', $name, $spouseName);
				$description = sprintf('švenčia %s - ąsias vestuvių metines.', $yearsTogether);

				echo '
					<li>
						<p>
							<a href="familytree.php?profile='.$anniversary_id.'#menu">'.$title.'</a> '.$description.'
						</p>
					</li>';
			}
			
			echo '<ul>';
        }
		if ($counter > 4){
			return;
		}
    }
	/**
     * displayCategories
     * 
     * Displays the list of the existing categories
     */
    function displayCategories($categories) {
		
		$path = $_SERVER['REQUEST_URI'];
		if (strpos($path,'year') == true) {
			$path = $path.'&edit-category=';
		}
		else {
			$path = $path.'?edit-category=';
		}
		
		$result_final = '';
		
        if (!empty($categories)) {
			foreach ($categories as $category) {
				$result_final .= '
					<li class="cat '.$category['category_color'].'">
						<a title="'.'Redaguoti kategoriją'.'" href="'.$path.$category['category_id'].'#menu">'.$category['category_name'].'</a>
					</li>';
			}
		}
		return $result_final;
    }
	/**
     * displayAddEventForm
     */
    function displayAddEventForm($username, $date) {
        
		$username = $this->site->cleanOutput($username);
		
		$q = "SELECT manager_id 
				FROM ".TBL_MANAGERS." 
				WHERE manager_family = (
					SELECT individual_family 
					FROM ".TBL_INDIVIDUALS." 
					WHERE individual_username = '$username')";
		$result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
		
		$num_rows = mysql_num_rows($result);
		
		if ($num_rows <= 0) {
			echo 'error';
			return;
		}

        if (!preg_match('/[0-9]{4}-[0-9]|[0-9]{2}-[0-9]|[0-9]{2}/', $date)) {
            echo 'Neteisingai nurodyta data';
        }
		
        $title = $this->formatDate(('F j, Y'), $date);
        $categories = $this->getCategories($username);
		$path = $_SERVER['REQUEST_URI'];
			
		if (strpos($path,'?add-event') == true) {
			$path = substr($path, 0, strpos($path, '?add-event'));
		}
		else if (strpos($path,'&add-event') == true){
			$path = substr($path, 0, strpos($path, '&add-event'));
		}	

        // Display the form
        ?>
		<div class="form_container_2">
			<div class="form">
				<h1><?php echo $title; ?></h1>
				<form method="post" action="events.php">
					<div class="form_section event_title">
						<h3>Įvykis</h3>
						<input type="text" id="title" name="title" value="<?php echo $this->formError->value("title"); ?>"  placeholder="Rašykite pavadinimą čia">
						<?php echo $this->formError->error("title"); ?>
						<input type="text" id="description" name="description" value="<?php echo $this->formError->value("description"); ?>"  placeholder="Rašykite aprašymą čia">
						<?php echo $this->formError->error("description"); ?>
					</div>
					<div class="form_section event_category">
						<h3>Kategorija</h3>
						<select id="category" name="category">
							<?php
							if (count($categories) > 0) {
								foreach ($categories as $category) {
									?>
									<option value="<?php echo $category['category_id']; ?>"><?php echo $category['category_name']; ?></option>
									<?php
								}
							}
							?>	
						</select>
					</div>
					<p class="event_repeat">
						<input type="checkbox" name="repeat" id="repeat"/>
						<label for="repeat"><b>Kartoti kiekvienais metais</b></label>
					</p>
					<p>
						<input type="hidden" id="date" name="date" value="<?php echo $date; ?>"/> 
					</p>
					<p class="submit">
						<input class="first-btn" type="submit" id="add-event" name="add-event" value="Pridėti"/>&nbsp; 
						<label>arba</label>&nbsp;
						<a href="<?php echo $path; ?>#menu">Atšaukti</a>
					</p>
				</form>
			</div>
		</div>
		<?php
    }

    /**
     * displayEditEventForm
     */
    function displayEditEventForm ($username, $eventid) {
        
		$eventid = $this->site->cleanOutput($eventid);

        $q = "SELECT `event_id`, `title`, `description`, 
				`event_date`, `event_category`, `repeat`
                FROM ".TBL_EVENTS."
                WHERE event_id = '$eventid'";

         $result = $this->database->query($q);
				
		if ($result === false) {
			$result .= die(mysql_error());
			return;
		}
			
		$num_rows = mysql_num_rows($result);
		$eventInfo = array();
			
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$eventInfo = $row;
			}
		}

		$categories = $this->getCategories($username);
		$repeat = '';
		
		// Repeat or not
        if ($eventInfo['repeat'] == '1') {
            $repeat  = 'checked';
        }
		
		$path = $_SERVER['REQUEST_URI'];
			
		if (strpos($path,'?edit-event') == true) {
			$path = substr($path, 0, strpos($path, '?edit-event'));
		}
		else if (strpos($path,'&edit-event') == true){
			$path = substr($path, 0, strpos($path, '&edit-event'));
		}

        // Display the form
		?>
		<div class="form_container_2">
			<div class="form">
				<h1>Redaguoti Įvykį</h1>
				<form method="post" action="events.php">
					<div class="form_section event_title">
						<h3>Įvykis</h3>
						<input type="text" id="title" name="title" value="<?php echo $eventInfo['title']; ?>" placeholder="Rašykite pavadinimą čia">
						<?php echo $this->formError->error("title"); ?>
					</div>
					<div class="form_section event_description">
						<h3>Aprašymas</h3>
						<input type="text" id="description" name="description" value="<?php echo $eventInfo['description']; ?>" placeholder="Rašykite aprašymą čia">
						<?php echo $this->formError->error("description"); ?>
					</div>
					<div class="form_section event_date">
						<h3>Data</h3>
						<input type="text" id="event-date" name="event-date" value="<?php echo $eventInfo['event_date']; ?>" placeholder="Rašykite datą čia">
						<?php echo $this->formError->error("event-date"); ?>
					</div>
					<div class="form_section event_category">
						<h3>Kategorija</h3>
						<select id="category" name="category">
							<?php
							if (count($categories) > 0) {
								foreach ($categories as $category) {
									?>
									<option selected="<?php echo $eventInfo['event_category']; ?>" value="<?php echo $category['category_id']; ?>">
									<?php echo $category['category_name']; ?></option>
									<?php
								}
							}
							?>	
						</select>
					</div>
					<p class="event_repeat">
						<input type="checkbox" name="repeat" id="repeat"  <?php echo $repeat; ?>/>
						<label for="repeat"><b>Kartoti kiekvienais metais</b></label>
					</p>
					<p>
						<input type="hidden" name="event-id" value="<?php echo $eventid; ?>"/>
					</p>
					<p class="submit"> 
						<input class="first-btn" type="submit" id="edit-event" name="edit-event" value="Redaguoti"/> 
						<input class="second-btn" type="submit" id="delete-event" name="delete-event" value="Trinti"/>&nbsp;
						<label>arba</label>&nbsp;
						<a href="<?php echo $path; ?>#menu">Atšaukti</a>
					</p>
				</form>
			</div>
		</div>

		<script type="text/javascript">
		jQuery( "#event-date" ).datepicker({
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
		</script>
		<?php
    }
	/**
     * displayEventForm
     */
    function displayEventForm($username, $eventid) {
		
		$eventid = $this->site->cleanOutput($eventid);

        $q = "SELECT `event_id`, `title`, `description`, `event_date`, 
				`event_user`, `repeat`, `category_name`, `category_color`
                FROM ".TBL_EVENTS.",".TBL_EVENTS_CATEGORY."
                WHERE `event_id` = '$eventid'
				AND `event_category` = `category_id`";

        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
	
		$num_rows = mysql_num_rows($result);
		$eventInfo = array();
		
        if (count($num_rows) > 0) {
            while ($row = mysql_fetch_assoc($result)) {
				$eventInfo = $row;
			}
        }
		else {
			echo '<div class="notice"><p>Įvykio nepavyko rasti</p></div>';
		}

        $title = $eventInfo['title'];
		$created = $eventInfo['event_user'];
		$description = '';
        $category  = '';

        if ($eventInfo['repeat'] == '1') {
            $date = $this->formatDate(('m.d'), $eventInfo['event_date']);
            $date = sprintf(('Kiekvienais metais %s'), $date);
        }
		else {
			$date  = $this->formatDate(('F j, Y'), $eventInfo['event_date']);
		}

        if (!empty($eventInfo['category_name'])) {
            $category = $eventInfo['category_name'];
        }

        if (!empty($eventInfo['description'])) {
            $description = $eventInfo['description'];
        }
		
		$path = $_SERVER['REQUEST_URI'];
			
		if (strpos($path,'?event') == true) {
			$path = substr($path, 0, strpos($path, '?event'));
		}
		else if (strpos($path,'&event') == true){
			$path = substr($path, 0, strpos($path, '&event'));
		}
		
		// Display the form
       ?>
		<div class="form_container_2">
			<div class="form">
				<h1><?php echo $title; ?></h1>
				<div class="event_menu">
					<a class="left back-icon" href="<?php echo $path; ?>#menu">Grįžti atgal</a>
					<a class="right edit-icon" href="?edit-event=<?php echo $eventid; ?>#menu" class="edit_event">Redaguoti įvykį</a>
				</div>
				<div class="event_details">
					<div class="left">
						<h2><?php echo $title; ?></h2>
						<h3><?php echo $category; ?></h3>
						<p><?php echo $description; ?></p>
					</div>
					<div class="right">
						<h3>Kada</h3>
						<p><?php echo $date; ?></p>
						<h3>Įvykį sukūrė</h3>
						<p><?php echo $created; ?></p>
					</div>
				</div>
			</div>
		</div>
		<?php
    }

    /**
     * displayBirthdayForm
     */
    function displayBirthdayForm($username, $birthdayid) {
        
		$birthdayid = $this->site->cleanOutput($birthdayid);

        $q = "SELECT `individual_id`, `fname`, `lname`, `mname`, `birth_date`
                FROM ".TBL_INDIVIDUALS."
                WHERE `individual_id` = '$birthdayid'";

        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
	
		$num_rows = mysql_num_rows($result);
		$birthdayInfo = array();
		
        if (count($num_rows) > 0) {
            while ($row = mysql_fetch_assoc($result)) {
				$birthdayInfo = $row;
			}
        }
		else {
			echo '<div class="notice"><p>Įvykio nepavyko rasti</p></div>';
		}
		 
		if (!empty($birthdayInfo['mname'])) {
			$title = $birthdayInfo['fname'].' '.$birthdayInfo['lname'].' ('.$birthdayInfo['mname'].')';
		}
		else {
			$title = $birthdayInfo['fname'].' '.$birthdayInfo['lname'];
		}
		$individualid = $birthdayInfo['individual_id'];
		$date = $this->formatDate(('m.d'), $birthdayInfo['birth_date']);
        $date = sprintf(('Kiekvienais metais %s'), $date);
		list($byear, $bmonth, $bday) = explode('-', $birthdayInfo['birth_date']);
        $age = $this->getDateDifference($byear, date('Y').'-'.date('n').'-'.date('j'));
		$description = sprintf('%s švenčia %s - ąjį gimtadienį.', $title, $age);
		$category = 'Gimtadieniai';	
		$path = $_SERVER['REQUEST_URI'];
			
		if (strpos($path,'?birthday') == true) {
			$path = substr($path, 0, strpos($path, '?birthday'));
		}
		else if (strpos($path,'&birthday') == true){
			$path = substr($path, 0, strpos($path, '&birthday'));
		}
        // Display the form
        ?>
		<div class="form_container_2">
			<div class="form">
				<h1><?php echo $title; ?></h1>
				<div class="event_menu">
					<a class="left back-icon" href="<?php echo $path; ?>#menu">Grįžti atgal</a>
					<a class="right edit-icon" href="familytree.php?tree=<?php echo $individualid; ?>&option=edit#menu" class="edit_event">Redaguoti įvykį</a>
				</div>
				<div class="event_details">
					<div class="left">
						<h2><?php echo $title; ?></h2>
						<h3><?php echo $category; ?></h3>
						<p><?php echo $description; ?></p>
					</div>
					<div class="right">
						<h3>Kada</h3>
						<p><?php echo $date; ?></p>
					</div>
				</div>
			</div>
		</div>
		<?php
    }
	/**
     * displayAnniversaryForm
     * 
     * Displays the event details for an anniversary.
     */
    function displayAnniversaryForm($username, $anniversaryid) {
        
		$anniversaryid = $this->site->cleanOutput($anniversaryid);

        $q = "SELECT `individual`, `relationship_individual`, `start_date`, ( 
					SELECT `fname` 
					FROM  ".TBL_INDIVIDUALS."
					WHERE `individual_id` = `individual`
				) AS fname, ( 
					SELECT `lname` 
					FROM  ".TBL_INDIVIDUALS."
					WHERE `individual_id` = `individual`
				) AS lname, (
					SELECT `fname` 
					FROM  ".TBL_INDIVIDUALS."
					WHERE `individual_id` = `relationship_individual`
				) AS spouse_fname, (
					SELECT `lname` 
					FROM  ".TBL_INDIVIDUALS."
					WHERE `individual_id` = `relationship_individual`
				) AS spouse_lname
                FROM ".TBL_RELATIONSHIPS." 
                WHERE `relationship_id` = '$anniversaryid'";

        $result = $this->database->query($q);
			
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
	
		$num_rows = mysql_num_rows($result);
		$anniversaryInfo = array();
		
        if (count($num_rows) > 0) {
            while ($row = mysql_fetch_assoc($result)) {
				$anniversaryInfo = $row;
			}
        }
		else {
			echo '<div class="notice"><p>Įvykio nepavyko rasti</p></div>';
		}
		
		$individualid = $anniversaryInfo['individual'];
		$relationship = $anniversaryInfo['relationship_individual'];
		$date = $this->formatDate(('m.d'), $anniversaryInfo['start_date']);
        $date = sprintf(('Kiekvienais metais %s'), $date);
		list($ayear, $amonth, $aday) = explode('-', $anniversaryInfo['start_date']);
        $yearsTogether = $this->getDateDifference($ayear, date('Y').'-'.date('n').'-'.date('j'));
		$name = $anniversaryInfo['fname'].' '.$anniversaryInfo['lname'];
		$spouseName = $anniversaryInfo['spouse_fname'].' '.$anniversaryInfo['spouse_lname'];
		$title = sprintf('%s ir %s', $name, $spouseName);
		$description = sprintf('švenčia %s - ąsias vestuvių metines.', $yearsTogether);
		$category = 'Sukaktuvės';		
		$path = $_SERVER['REQUEST_URI'];
			
		if (strpos($path,'?anniversary') == true) {
			$path = substr($path, 0, strpos($path, '?anniversary'));
		}
		else if (strpos($path,'&anniversary') == true){
			$path = substr($path, 0, strpos($path, '&anniversary'));
		}

        // Display the form
         ?>
		<div class="form_container_2">
			<div class="form">
				<h1><?php echo $title; ?></h1>
				<div class="event_menu">
					<a class="left back-icon" href="<?php echo $path; ?>#menu">Grįžti atgal</a>
					<a class="right edit-icon" href="familytree.php?tree=<?php echo $individualid; ?>&edit-rel=<?php echo $relationship; ?>#menu" class="edit_event">Redaguoti įvykį</a>
				</div>
				<div class="event_details">
					<div class="left">
						<h2><?php echo $title; ?></h2>
						<h3><?php echo $category; ?></h3>
						<p><?php echo $description; ?></p>
					</div>
					<div class="right">
						<h3>Kada</h3>
						<p><?php echo $date; ?></p>
					</div>
				</div>
			</div>
		</div>
		<?php
    }
	/**
     * displayAddCategoryForm 
     */
    function displayAddCategoryForm ($username) {

		$path = $_SERVER['REQUEST_URI'];
			
		if (strpos($path,'?add-category') == true) {
			$path = substr($path, 0, strpos($path, '?add-category'));
		}
		else if (strpos($path,'&add-category') == true){
			$path = substr($path, 0, strpos($path, '&add-category'));
		}
		?>
		<div class="form_container_2">
			<div class="form">
				<h1>Nauja kategoriją</h1>
				<form method="post" action="events.php">
				<div class="form_section category_name">
					<h3>Pavadinimas</h3>
					<input type="text" id="name" name="name" value="<?php echo $this->formError->value("name"); ?>"  placeholder="Rašykite pavadinimą čia">
					<?php echo $this->formError->error("name"); ?>
				</div>
				<div class="form_section category_color">
					<h3>Spalva</h3>
					<label for="grey" class="colors grey"><input type="radio" name="color" id="grey" value="Grey" checked />Pilka</label>
					<label for="violet" class="colors violet"><input type="radio" name="color" id="violet" value="Violet" />Violetinė</label>
					<label for="indigo" class="colors indigo"><input type="radio" name="color" id="indigo" value="Indigo" />Tamsiai mėlyna</label>
					<label for="blue" class="colors blue"><input type="radio" name="color" id="blue" value="Blue" />Mėlyna</label></br>
					<label for="green" class="colors green"><input type="radio" name="color" id="green" value="Green" />Žalia</label>
					<label for="yellow" class="colors yellow"><input type="radio" name="color" id="yellow" value="Yellow" />Geltona</label>
					<label for="orange" class="colors orange"><input type="radio" name="color" id="orange" value="Orange" />Oranžinė</label>
					<label for="red" class="colors red"><input type="radio" name="color" id="red" value="Red" />Raudona</label>
				</div>
					<p class="submit">
						<input class="first-btn" type="submit" id="add-category" name="add-category" value="Pridėti"/>&nbsp; 
						<label>arba</label>&nbsp;
						<a href="<?php echo $path; ?>#menu">Atšaukti</a>
					</p>
				</form>
			</div>
		</div>
	<?php
    }
	/**
     * displayEditCategoryForm 
     */
    function displayEditCategoryForm ($username, $categoryid) {
        
		$username = $this->site->cleanOutput($username);
		$categoryid = $this->site->cleanOutput($categoryid);

		$q = "SELECT category_name, category_color 
				FROM ".TBL_EVENTS_CATEGORY." 
				WHERE category_id = '$categoryid'";

		$result = $this->database->query($q);
				
		if ($result == false) {
			$result .= die(mysql_error());
			return;
		}
			
		$num_rows = mysql_num_rows($result);
		$categories = array();
			
		if ($num_rows > 0) {
			while ($row = mysql_fetch_assoc($result)) {
				$categories = $row;
			}
		}
		
        $grey = '';
        $violet = '';
		$indigo = '';
		$blue   = '';
		$green  = '';
		$yellow = '';
		$orange = '';
		$red    = '';

		$name  = $categories['category_name'];
		$color = $categories['category_color'];
		
		switch ($color) {
			case 'Grey':
				$grey = 'checked';
				break;
			case 'Violet':
				$violet = 'checked';
				break;
			case 'Indigo':
				$indigo = 'checked';
				break;
			case 'Blue':
				$blue   = 'checked';
				break;
			case 'Green':
				 $green  = 'checked';
				break;
			case 'Yellow':
				$yellow = 'checked';
				break;
			case 'Orange':
				$orange = 'checked';
				break;
			case 'Red':
				$red    = 'checked';
				break;
			
			default:
                echo 'Tokios spalvos pridėti negalima';
                return;
		}
		
		$path = $_SERVER['REQUEST_URI'];
			
		if (strpos($path,'?edit-category') == true) {
			$path = substr($path, 0, strpos($path, '?edit-category'));
		}
		else if (strpos($path,'&edit-category') == true){
			$path = substr($path, 0, strpos($path, '&edit-category'));
		}
		?>
		<div class="form_container_2">
			<div class="form">
				<h1>Redaguoti kategoriją</h1>
				<form method="post" action="events.php">
				<div class="form_section category_name">
					<h3>Pavadinimas</h3>
					<input type="text" id="name" name="name" value="<?php echo $name; ?>"  placeholder="Rašykite naują pavadinimą čia">
					<?php echo $this->formError->error("name"); ?>
				</div>
				<div class="form_section category_color">
					<h3>Spalva</h3>
					<label for="grey" class="colors grey"><input type="radio" name="color" id="grey" value="Grey" <?php echo $grey; ?>/>Pilka</label>
					<label for="violet" class="colors violet"><input type="radio" name="color" id="violet" value="Violet" <?php echo $violet; ?>/>Violetinė</label>
					<label for="indigo" class="colors indigo"><input type="radio" name="color" id="indigo" value="Indigo" <?php echo $indigo; ?>/>Tamsiai mėlyna</label>
					<label for="blue" class="colors blue"><input type="radio" name="color" id="blue" value="Blue" <?php echo $blue; ?>/>Mėlyna</label></br>
					<label for="green" class="colors green"><input type="radio" name="color" id="green" value="Green" <?php echo $green; ?>/>Žalia</label>
					<label for="yellow" class="colors yellow"><input type="radio" name="color" id="yellow" value="Yellow" <?php echo $yellow; ?>/>Geltona</label>
					<label for="orange" class="colors orange"><input type="radio" name="color" id="orange" value="Orange" <?php echo $orange; ?>/>Oranžinė</label>
					<label for="red" class="colors red"><input type="radio" name="color" id="red" value="Red" <?php echo $red; ?>/>Raudona</label>
				</div>
					<p>
						<input type="hidden" id="category-id" name="category-id" value="<?php echo $categoryid; ?>"/>
					</p>
					<p class="submit"> 
						<input class="first-btn" type="submit" id="edit-category" name="edit-category" value="Redaguoti"/> 
						<input class="second-btn" type="submit" id="delete-category" name="delete-category" value="Trinti"/>&nbsp;
						<label>arba</label>&nbsp;
						<a href="<?php echo $path; ?>#menu">Atšaukti</a>
					</p>
				</form>
			</div>
		</div>
		<?php
    }
	/**
	 * formatDate 
	 * 
	 * Formats a date with translation.
	 */
	function formatDate ($dateFormat, $date) {
		
		// Get translatable parts of the date
		$m = date('n', strtotime($date)); // month 1-12
		$d = date('w', strtotime($date)); // weekday 0-6
		
		// Get translated forms
		$month = $this->getMonthName($m);
		$day = $this->getDayName($d);

		// Replace translatable parts of date with the translated versions
		$dateFormat = preg_replace( "/(?<!\\\)F/", $this->addBackSlashes($month), $dateFormat);      
		$dateFormat = preg_replace( "/(?<!\\\)l/", $this->addBackSlashes($day), $dateFormat);

		// Format date with translated data
		$fixedDate = date($dateFormat, strtotime($date));

		return $fixedDate;
	}
	/**
	 * addBackSlashes
	 * 
	 * Adds backslashes before letters and before a number at the start of a string.
	 */
	function addBackSlashes ($string) {
		$string = preg_replace('/^([0-9])/', '\\\\\\\\\1', $string);
		$string = preg_replace('/([a-z])/i', '\\\\\1', $string);

		return $string;
	}	
};
$events = new Events($database, $form, $site);
?>