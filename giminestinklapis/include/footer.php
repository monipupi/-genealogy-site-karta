	
    <?php
	if ($template['userlevel'] != GUEST_LEVEL || strlen($template['userlevel']) <= 0) {
	?>
		</div> 
		<div id="footer">
			<p>
			<!-- Just a little page footer, tells how many registered members
				there are, how many users currently logged in and viewing site,
				and how many guests viewing site -->
				<b>Šeimos medžių kiekis: </b> <?php echo $template['numTrees']; ?>
				<b>Registruotų vartotojų kiekis: </b> <?php echo $template['numMembers']; ?>
				<b>Dabar prisijungę: </b> <?php echo $template['numActive']; ?>
				<b>Svečiai: </b> <?php echo $template['numGuests']; ?>
			</p>
			<p id="cp">© <?php echo $template['year']; ?> <a href="mailto:monika.pupiute@stud.ktu.lt"><?php echo $template['sitename']; ?></a> Visos teisės saugomos.</p>
		</div>
	</div>
	<?php
	}
	?>
<!-- end of main_container -->
</body>
</html>
