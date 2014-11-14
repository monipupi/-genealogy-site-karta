<?php  

class Mailer
{
   /**
    * sendWelcome - Sends a welcome message to the newly
    * registered user, also supplying the username and
    * password.
    */
   function sendWelcome($user, $email, $pass, $sitename, $url){
      $headers = "From: ".EMAIL_FROM_NAME." <".EMAIL_FROM_ADDR.">\r\n";
	  $headers  .= 'MIME-Version: 1.0' . "\r\n";
	  $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";	
      $subject = "Registracija";
      $body = "Sveiki, ".$user."!<br>"
			 ."Jūs užsiregistravote giminės tinklapyje ".$sitename." su sekančiais duomenimis:<br>"
             ."Vartotojo vardas: ".$user."<br>"
             ."Slaptažodis: ".$pass."<br>"
			 ."Nepamirškite šios informacijos ir neištrinkite šio laiško!<br>"
			 ."Linkime naujų bei įdomių atradimų ir malonaus bendravimo!<br>"
			 ."<a href='".$url."'>".$sitename."</a>";
      return mail($email,$subject,$body,$headers);
   }
   /**
     * sendNewPass - Sends the newly generated password
     * to the user's email address that was specified at
     * sign-up.
     */
    function sendNewPass($user, $email, $pass, $sitename, $url) {
        $headers = "From: " . EMAIL_FROM_NAME . " <" . EMAIL_FROM_ADDR . ">\r\n";
        $headers  .= 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";	
        $subject = "Naujas slaptažodis";
        $body = "Sveiki, ".$user."!<br>"
				."Gavome Jūsų prašymą naujam slaptažodžiui gauti.<br>"
                ."Jūsų nauji duomenys:<br>"
                ."Vartotojo vardas: " . $user . "<br>"
                ."Naujas slaptažodis: " . $pass . "<br>"
				."Geros dienos!<br>"
				."<a href='".$url."'>".$sitename."</a>";
        return mail($email, $subject, $body, $headers);
    }
	/**
     * sendInvitation - Sends the invitation to join the site.
     */
    function sendInvitation($user, $email, $code, $sitename, $url) {
        $headers = "From: " . EMAIL_FROM_NAME . " <" . EMAIL_FROM_ADDR . ">\r\n";
		$headers  .= 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";	
        $subject = "Jūs esate įtrauktas į šeimos medį giminės tinklapyje ".$sitename."";
        $body = "Sveiki,<br>"
                . $user." įtraukė Jus į šeimos medį giminės tinklapyje ".$sitename.".<br>"
                . "Jei norite prisijungti, registruokitės <a href='".$url."usermanagement.php?register&code=".$code."'>čia</a>.<br>"
				."Geros dienos!<br>"
				."<a href='".$url."'>".$sitename."</a>";		
        return mail($email, $subject, $body, $headers);
    }
	/**
     * sendPrivateMessage - Informs of the received private messages.
     */
    function sendPrivateMessage($user, $email, $pm_subject, $pm_message, $sitename, $url) {
        $headers = "From: " . EMAIL_FROM_NAME . " <" . EMAIL_FROM_ADDR . ">\r\n";
        $headers  .= 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";	
        $subject = "Gavote naują žinutę";
        $body = "Sveiki,<br>"
                . $user." parašė jums naują žinutę giminės tinklapyje ".$sitename."<br>"
                . "Jei norite atsakyti, apsilankykite <a href='".$url."privatemsg.php'>čia</a>.<br>"
				. "-----<br>"
				. "Tema „".$pm_subject."“<br>"
				. "Žinutė „".$pm_message."“<br>"
				."Geros dienos!<br>"
				."<a href='".$url."'>".$sitename."</a>";		
        return mail($email, $subject, $body, $headers);
    }
};

/* Initialize mailer object */
$mailer = new Mailer;
?>
