<?php 

/**
 * Constants.php
 *
 * This file is intended to group all constants 
 */
 define('TIMEZONE', 'Europe/Vilnius');
 
/**
 * Database Constants - these constants are required
 * in order for there to be a successful connection
 * to the MySQL database. 
 */
define("DB_SERVER", "localhost");
define("DB_USER", "root");
define("DB_PASS", "root");
define("DB_NAME", "relativespage");

/** 
 * Database Table Constants - these constants
 * hold the names of all the database tables used
 * in the script.
 */
define("TBL_USERS", "users");
define("TBL_ACTIVE_USERS",  "active_users");
define("TBL_ACTIVE_GUESTS", "active_guests");
define("TBL_BANNED_USERS",  "banned_users");
define("TBL_INDIVIDUALS",  "individuals");
define("TBL_FAMILY", "family");
define("TBL_MANAGERS",  "managers");
define("TBL_RELATIONSHIPS",  "relationships");
define("TBL_ROLES",  "roles");
define("TBL_GALLERY_CATEGORY", "gallery_category");
define("TBL_GALLERY_PHOTOS",  "gallery_photos");
define("TBL_GALLERY_COMMENTS",  "gallery_comments");
define("TBL_GALLERY_VOTES",  "gallery_votes");
define("TBL_INVITATIONS",  "invitations");
define("TBL_EVENTS",  "events");
define("TBL_EVENTS_CATEGORY",  "events_category");
define("TBL_MESSAGES",  "private_messages");

/**
 * Special Names and Level Constants 
 */
define("ADMIN_NAME", "Administratorius");
define("USER_NAME", "Vartotojas");
define("GUEST_NAME", "Svečias");
define("ADMIN_LEVEL", 2);
define("USER_LEVEL",  1);
define("GUEST_LEVEL", 0);

/**
 * This boolean constant controls whether or
 * not the script keeps track of active users
 * and active guests who are visiting the site.
 */
define("TRACK_VISITORS", true);

/**
 * Timeout Constants - these constants refer to
 * the maximum amount of time (in minutes) after
 * their last page fresh that a user and guest
 * are still considered active visitors.
 */
define("USER_TIMEOUT", 10);
define("GUEST_TIMEOUT", 5);

/**
 * Cookie Constants - these are the parameters
 * to the set cookie function call
 */
define("COOKIE_EXPIRE", 60*60*24*100);  //100 days by default
define("COOKIE_PATH", "/");             //Avaible in whole domain

/**
 * Email Constants - these specify what goes in
 * the from field in the emails that the script
 * sends to users, and whether to send a
 * welcome email to newly registered users.
 */
define("EMAIL_FROM_NAME", "Giminės tinklapis Karta");
define("EMAIL_FROM_ADDR", "noreply@karta.lt");

/**
 * This constant forces all users to have
 * lowercase usernames, capital letters are
 * converted automatically.
 */
define("ALL_LOWERCASE", false);

/**
 * Maximum size of the uploaded images
 */
 define ("MAX_SIZE","1000"); 
?>
