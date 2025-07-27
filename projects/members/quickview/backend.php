<?php
header('Content-Type: application/json');
include '../auth/db.php';

session_start();

if (!isset($_SESSION['id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$memberId = intval($_SESSION['id']);

// --- Handle avatar upload ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'upload_avatar') {
    if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error.']);
        exit;
    }
    $file = $_FILES['avatar'];
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) {
        echo json_encode(['success' => false, 'error' => 'Invalid file type.']);
        exit;
    }
    if ($file['size'] > 2 * 1024 * 1024) { // 2MB max
        echo json_encode(['success' => false, 'error' => 'File too large.']);
        exit;
    }
    $profileDir = "../../profileimgs/$memberId";
    if (!is_dir($profileDir)) {
        mkdir($profileDir, 0777, true);
    }
    // Remove old avatars (optional, keeps only one)
    foreach (glob("$profileDir/sm-*") as $old) { @unlink($old); }
    $newName = 'sm-' . uniqid() . '.' . $ext;
    $target = "$profileDir/$newName";
    if (!move_uploaded_file($file['tmp_name'], $target)) {
        echo json_encode(['success' => false, 'error' => 'Failed to save file.']);
        exit;
    }
    // Update DB
    $stmt = $mysqli->prepare("UPDATE members SET avatar=? WHERE id=?");
    $stmt->bind_param('si', $newName, $memberId);
    $stmt->execute();

    $avatarUrl = "../../profileimgs/$memberId/$newName";
    echo json_encode(['success' => true, 'avatarUrl' => $avatarUrl]);
    exit;
}

// Handle password update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_password') {
    $newPassword = $mysqli->real_escape_string($_POST['password'] ?? '');
    if (!$newPassword) {
        echo json_encode(['success' => false, 'error' => 'Password required.']);
        exit;
    }
    $updateSql = "UPDATE members SET password='$newPassword' WHERE id=$memberId";
    if ($mysqli->query($updateSql)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Database error.']);
    }
    exit;
}

// Handle JSON POST (for everything else)
$data = json_decode(file_get_contents("php://input"));
$showAll = isset($data->showAll) ? intval($data->showAll) : 0;

// Fetch Member Info
$memberQuery = "SELECT m.*, 
    CONCAT('../../profileimgs/', m.id, '/barcode128.png') as barcode,
    mt.icon as membTypeIcon,
    mst.icon as membershiptypesIcon,
    CONCAT(TRIM(m.lastName), ', ', TRIM(m.firstName)) as fullName,
    CASE WHEN avatar != '' THEN CONCAT('../../profileimgs/', m.id, '/sm-', avatar) ELSE '../../profileimgs/person.png' END as avatar,
    CASE WHEN mbrshpEndDate IS NULL OR mbrshpEndDate < CURDATE() THEN 1 ELSE 0 END as expired
    FROM members m
    LEFT JOIN membershiptypes mst ON mst.type = m.membershiptype
    LEFT JOIN membertypes mt ON mt.type = m.membertype
    WHERE m.id = ?";

$stmt = $mysqli->prepare($memberQuery);
$stmt->bind_param('i', $memberId);
$stmt->execute();
$memberResult = $stmt->get_result();
$member = $memberResult->fetch_assoc();

if (!$member) {
    echo json_encode(['error' => 'Member not found']);
    exit;
}

// Add/alias fields for clarity in frontend
$member['insurance'] = $member['insurancetype'];
$member['emr_id'] = $member['emrID'];
$member['dob'] = $member['DOB'];

// Lunch Reservations (DESC order)
$lunchSql = "SELECT l.id, l.status, guests, guestNames, 'Lunch' AS title, l.memberId, l.date AS start,
    ls.statusIcon,
    'white' AS color
    FROM lunchreservations l
    JOIN lunchstatus ls ON ls.status = l.status
    WHERE l.memberId = ?" . ($showAll ? "" : " AND l.date >= CURDATE()") . "
    ORDER BY l.date DESC";

$lunchStmt = $mysqli->prepare($lunchSql);
$lunchStmt->bind_param('i', $memberId);
$lunchStmt->execute();
$lunch = $lunchStmt->get_result()->fetch_all(MYSQLI_ASSOC);

// PT Appointments (DESC order)
$ptSql = "SELECT p.id AS ptapptsID, p.status, PTStaff, p.memberId,
    CONCAT(m.firstName, ' ', m.lastName) AS title, initialVisit,
    apptDateTime AS start, apptDuration,
    u.ptColor AS color, p.wheelChair,
    DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE) AS end,
    ps.statusIcon, reserveRide
    FROM ptappts p
    LEFT JOIN members m ON m.id = p.memberId
    LEFT JOIN users u ON u.username = p.PTStaff
    LEFT JOIN ptstatus ps ON ps.status = p.status
    WHERE p.memberId = ?" . ($showAll ? "" : " AND apptDateTime >= CURDATE()") . "
    ORDER BY apptDateTime DESC";

$ptStmt = $mysqli->prepare($ptSql);
$ptStmt->bind_param('i', $memberId);
$ptStmt->execute();
$ptappts = $ptStmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Accu/Massage (DESC order)
$accuSql = "SELECT a.id, a.status,
    CONCAT(TRIM(m.lastName), ', ', TRIM(m.firstName)) AS title,
    DATE_FORMAT(apptDateTime, '%m/%d/%Y %h:%i %p') AS start,
    DAYOFWEEK(apptDateTime) AS day,
    CASE
        WHEN a.status = 20 THEN '#4caf50'
        WHEN a.status = 30 THEN '#f44336'
        ELSE '#a160c7'
    END AS color
    FROM accumassageappts a
    JOIN members m ON m.id = a.memberId
    WHERE a.memberId = ?" . ($showAll ? "" : " AND apptDateTime >= CURDATE()") . "
    ORDER BY apptDateTime DESC";

$accuStmt = $mysqli->prepare($accuSql);
$accuStmt->bind_param('i', $memberId);
$accuStmt->execute();
$accu = $accuStmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Points Transactions
function getTransactions($mysqli, $type, $memberId) {
    $sql = "SELECT pt.*, pm.description
        FROM points_transactions pt
        LEFT JOIN point_methods pm ON pm.method = pt.method AND pm.tran_type = pt.tran_type
        WHERE pt.tran_type = ? AND pt.memberId = ?
        ORDER BY transactiondate DESC";

    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param('si', $type, $memberId);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

$renewal = getTransactions($mysqli, 'MEMBERSHIP', $memberId);
$earn = getTransactions($mysqli, 'EARN', $memberId);
$purchases = getTransactions($mysqli, 'PURCHASE', $memberId);
$redeem = getTransactions($mysqli, 'REDEEM', $memberId);

// Sum points
$sumSql = "SELECT memberId, tran_type,
    CAST(SUM(CASE WHEN mbrshpStartDate > CURDATE() THEN 0 WHEN tran_type = 'REDEEM' THEN (points * -1) ELSE points END) AS SIGNED) AS totPoints,
    CAST(SUM(CASE WHEN mbrshpStartDate > CURDATE() THEN points ELSE 0 END) AS SIGNED) AS totPendPoints,
    CAST(SUM(CASE WHEN mbrshpStartDate > CURDATE() THEN 0 WHEN tran_type = 'REDEEM' THEN (daypass * -1) ELSE daypass END) AS SIGNED) AS totdaypass,
    CAST(SUM(CASE WHEN mbrshpStartDate > CURDATE() THEN daypass ELSE 0 END) AS SIGNED) AS totPenddaypass
    FROM points_transactions
    WHERE memberId = ?
    GROUP BY memberId, tran_type";

$sumStmt = $mysqli->prepare($sumSql);
$sumStmt->bind_param('i', $memberId);
$sumStmt->execute();
$sumPoints = $sumStmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Trips (DESC order)
$tripsSql = "SELECT id, driver, ptapptsID, phone, seStatus, rtnTrip, wheelChair, pickupDate
    FROM trips
    WHERE rider_id = ? AND rtnTrip <> 1" . ($showAll ? "" : " AND DATE_FORMAT(pickupDate,'%Y-%m-%d') >= CURDATE()") . "
    ORDER BY pickupDate DESC";

$tripStmt = $mysqli->prepare($tripsSql);
$tripStmt->bind_param('i', $memberId);
$tripStmt->execute();
$trips = $tripStmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Final response
$response = [
    'member' => $member,
    'lunch' => $lunch,
    'Ptappts' => $ptappts,
    'accuMassages' => $accu,
    'renewal' => $renewal,
    'earn' => $earn,
    'purchases' => $purchases,
    'redeem' => $redeem,
    'sumPoints' => $sumPoints,
    'trips' => $trips
];

echo json_encode($response);