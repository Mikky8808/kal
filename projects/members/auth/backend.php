<?php
header('Content-Type: application/json');
include '../auth/db.php';

session_start();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->username, $data->password)) {
    echo json_encode(['success' => false, 'message' => 'Missing credentials']);
    exit;
}

$dob = trim($data->username); // Now using DOB as username
$password = trim($data->password);

// Prepare statement to find member with matching DOB
$sql = "SELECT id, firstName, lastName, password FROM members WHERE DOB = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param('s', $dob);
$stmt->execute();
$result = $stmt->get_result();

$found = false;

while ($member = $result->fetch_assoc()) {
    $dbPassword = $member['password'];
    // If password is null or empty, allow '1234' as password
    if (($dbPassword === null || $dbPassword === '') && $password === '1234') {
        $found = true;
    } elseif ($dbPassword !== null && $dbPassword !== '' && $password === $dbPassword) {
        $found = true;
    }
    if ($found) {
        $_SESSION['id'] = $member['id'];
        $_SESSION['member_name'] = $member['firstName'] . ' ' . $member['lastName'];
        echo json_encode([
            'success' => true,
            'memberId' => $member['id'],
            'name' => $_SESSION['member_name']
        ]);
        break;
    }
}

if (!$found) {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}
