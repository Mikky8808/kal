<?php
// rides.php - Update only date and time for Ride appointment
header('Content-Type: application/json');

// Allow CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit(0);
}
header('Access-Control-Allow-Origin: *');

// Parse JSON input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['id']) || !isset($input['pickupDate']) || !isset($input['pickupTime']) || !isset($input['apptDate']) || !isset($input['apptTime'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields', 'debug' => $input]);
    exit;
}

$id = $input['id'];
$pickupDate = $input['pickupDate'];
$pickupTime = $input['pickupTime'];
$apptDate = $input['apptDate'];
$apptTime = $input['apptTime'];

// Format DATETIME values
if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $pickupDate)) {
    $pickupDateTime = $pickupDate . ' ' . (preg_match('/^\d{2}:\d{2}:\d{2}$/', $pickupTime) ? $pickupTime : ($pickupTime . ':00'));
} else {
    $pickupDateTime = $pickupDate;
}
if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $apptDate)) {
    $apptDateTime = $apptDate . ' ' . (preg_match('/^\d{2}:\d{2}:\d{2}$/', $apptTime) ? $apptTime : ($apptTime . ':00'));
} else {
    $apptDateTime = $apptDate;
}

if (!strtotime($pickupDateTime) || !strtotime($apptDateTime)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid date or time format', 'debug' => ['pickupDateTime' => $pickupDateTime, 'apptDateTime' => $apptDateTime]]);
    exit;
}

// Database credentials
$host = 'localhost';
$user = 'kalani';
$pass = 'JoshMed911';
$dbname = 'jimg_kalan_db';

// Connect to MySQL
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

// Prepare and execute update query
$stmt = $conn->prepare("UPDATE trips SET pickupDate = ?, apptDate = ?, updated_at = NOW() WHERE id = ?");
$stmt->bind_param("ssi", $pickupDateTime, $apptDateTime, $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Ride not found or no changes made']);
    }
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
