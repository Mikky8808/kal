<?php
header('Content-Type: application/json');

// Allow CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit(0);
}
header('Access-Control-Allow-Origin: *');

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
if (
    !$input || 
    !isset($input['id']) || !isset($input['apptDate']) || !isset($input['apptTime'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields', 'debug' => $input]);
    exit;
}

$id = $input['id'];
$apptDate = $input['apptDate'];
$apptTime = $input['apptTime'];

// Accept apptDate as either full datetime or just date
if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $apptDate)) {
    $apptDateTime = $apptDate;
} else {
    $apptDateTime = $apptDate . ' ' . (preg_match('/^\d{2}:\d{2}:\d{2}$/', $apptTime) ? $apptTime : ($apptTime . ':00'));
}

// Validate date and time
if (!strtotime($apptDateTime)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid date/time combination', 'debug' => $apptDateTime]);
    exit;
}

// DB credentials
$host = 'localhost';
$user = 'kalani';
$pass = 'JoshMed911';
$dbname = 'jimg_kalan_db';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

// Update ptappts table
$stmt = $conn->prepare("UPDATE ptappts SET apptDateTime = ?, apptTime = ?, updated_at = NOW() WHERE id = ?");
$stmt->bind_param("ssi", $apptDateTime, $apptTime, $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Appointment not found or no changes made']);
    }
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Update query failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
