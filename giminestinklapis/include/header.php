<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title><?php echo $template['sitename']; ?></title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name="author" content="Monika Pupiūtė" />
<link rel="shortcut icon" href="<?php echo $template['path']; ?>ui/css/images/site-icon.ico"/>
<link rel="stylesheet" type="text/css" href="<?php echo $template['path']; ?>ui/css/styles.css"/>
<link href='http://fonts.googleapis.com/css?family=Terminal+Dosis' rel='stylesheet' type='text/css' />

<!-- Enabling HTML5 support for Internet Explorer -->
<!--[if lt IE 9]>
  <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
<link rel="stylesheet" href="<?php echo $template['path']; ?>ui/js/jquery/ui-lightness/jquery-ui-1.10.4.custom.css" type="text/css"/>
<link media="screen" rel="stylesheet" href="<?php echo $template['path']; ?>ui/css/primitives.latest.css" type="text/css"/>
<script type="text/javascript" src="<?php echo $template['path']; ?>ui/js/jquery/jquery-1.10.2.js"></script>
<script type="text/javascript" src="<?php echo $template['path']; ?>ui/js/jquery/jquery-ui-1.10.4.custom.js"></script>
<script type="text/javascript" src="<?php echo $template['path']; ?>ui/js/primitives.min.js"></script>	
<script type="text/javascript" src="<?php echo $template['path']; ?>ui/js/jquery.opacityrollover.js"></script>
<script type="text/javascript" src="<?php echo $template['path']; ?>ui/js/animate-background.js"></script>	
<script type="text/javascript" src="<?php echo $template['path']; ?>ui/js/jquery.easing.1.3.js"></script>
<script type="text/javascript" src="<?php echo $template['path']; ?>ui/js/jquery.cookie.js"></script>
</head>
<body>
<?php
if ($template['userlevel'] != GUEST_LEVEL || strlen($template['userlevel']) <= 0) {
	include_once('top_meniu.php'); 
?>
<div id="main_container">
	<div id="header">
    	<div class="logo">
			<a href="<?php echo $template['path']; ?>index.php">
				<img src="<?php echo $template['path']; ?>ui/css/images/logo.png" alt="<?php echo $template['sitename'];?>" title="" />
			</a>
		</div>       
    </div>
<?php
	include_once('main_meniu.php'); 
?>
	 <div class="content">
		<div id="pagetitle"><?php echo $template['pagetitle']; ?></div>
<?php
}
else {
?>
	<div id="loading"></div>
	<div class="reg_logo">
		<img src="<?php echo $template['path']; ?>ui/css/images/logo.png" alt="<?php echo $template['sitename'];?>" title="" />
	</div>   	
	<div id="bg"></div>
	<div id="bg-next"></div>
<?php
}
?>