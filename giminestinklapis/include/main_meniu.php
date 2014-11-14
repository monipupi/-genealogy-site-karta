     <?php
	 $home = 'class="selected"';
	 $tree = '';
	 $gallery = '';
	 $events = '';
	
	 if ($template['pagetitle'] == 'Medis ir profiliai') {
		$tree = 'class="selected"';
		$home = '';
	 }
	 else if ($template['pagetitle'] == 'Galerija') {
		$gallery = 'class="selected"';
		 $home = '';
	 }
	 else if ($template['pagetitle'] == 'Kalendorius') {
		$events = 'class="selected"';
		 $home = '';
	 }
	 ?>
	 <div id="menu" class="menu">
        <ul>   
			<li <?php echo $home; ?>><a href="<?php echo $template['path'].'index.php#menu';?>">PAGRINDINIS</a></li>
            <li <?php echo $tree; ?>><a href="<?php echo $template['path'].'familytree.php#menu';?>">MEDIS</a></li>
			<li <?php echo $gallery; ?>><a href="<?php echo $template['path'].'photogallery.php#menu';?>">GALERIJA</a></li>
			<li <?php echo $events; ?>><a href="<?php echo $template['path'].'events.php#menu';?>">KALENDORIUS</a></li>
        </ul>
       </div>
