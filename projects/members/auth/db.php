<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'jimg_kalan_db';

// Create connection
$mysqli = new mysqli($host, $user, $pass, $dbname);

// Check connection
if ($mysqli->connect_error) {
    die('Connection failed: ' . $mysqli->connect_error);
}

// Optional: set charset
$mysqli->set_charset("utf8");
?>
