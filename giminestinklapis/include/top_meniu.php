<?php 
	$messages = 'top_menu_pm_icon';
	
	if ($template['numMessages'] == true){ 
		$messages = 'top_menu_new_icon';
	}
	?>
<div class="top_menu">
	<ul>
		<li>
			<a class="<?php echo $messages; ?>" href="<?php echo $template['path'].'privatemsg.php';?>">Žinutės</a>
		</li>
		<li class="drop">
			<a class="top_menu_profile_icon" href="#"><?php echo $template['username']; ?></a>
			
			<div class="dropdownContain">
				<div class="dropOut">
					<div class="triangle"></div>
					<ul>
						<li><a href="<?php echo $template['path'].'familytree.php?profile=0';?>">Profilis</a></li>
						<li><a href="<?php echo $template['path'].'usermanagement.php?edit=0'?>">Nustatymai</a></li>
						<li><a href="<?php echo $template['path'].'usermanagement.php?logout=0';?>">Atsijungti</a></li>
					</ul>
				</div>
			</div>
			
		</li>
	<?php 
	if ($template['userlevel'] == ADMIN_LEVEL || $template['username'] == ADMIN_NAME){ 
	?>
		<li class="drop">
			<a class="top_menu_admin_icon" href="#">Administracija</a>
			
			<div class="dropdownContain">
				<div class="dropOut">
					<div class="triangle"></div>
					<ul>
						<li><a href="<?php echo $template['path'].'admin/users.php?users-list';?>">Vartotojai</a></li>
						<li><a href="<?php echo $template['path'].'admin/users.php?banned-list';?>">Blokuoti</a></li>
						<li><a href="<?php echo $template['path'].'admin/families.php';?>">Medžiai</a></li>
						<li><a href="<?php echo $template['path'].'admin/photogallery.php';?>">Galerija</a></li>
					</ul>
				</div>
			</div>
			
		</li>
	<?php } ?>
	</ul>
</div>