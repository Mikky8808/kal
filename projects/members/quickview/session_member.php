<?php
session_start();
header('Content-Type: application/json');

echo json_encode([
    'id' => isset($_SESSION['id']) ? $_SESSION['id'] : null
]);
