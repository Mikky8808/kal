<?php
include '../../config.php';

// Visibility flag for categories
$isvisible = true;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

  // Set JSON response header
  header('Content-Type: application/json');

  // Prepare and execute the query
  $stmt = $db->prepare("
    SELECT 
      c.cat_id, 
      c.c_nm AS profession, 
      c.c_status AS profession_status,
      COUNT(DISTINCT sc.sc_id) AS sub_category_count,
      sc.sc_id, 
      sc.sc_nm AS sub_category, 
      sc.sc_status, 
      sc.sc_image, 
      sc.terms_and_conditions,
      sc.rate_charts,
      COUNT(DISTINCT ssc.id) AS sub_sub_category_count,

      (
        SELECT COUNT(*) 
        FROM usr_s1 
        INNER JOIN usr_s2 ON usr_s1.u_id = usr_s2.us_uid 
        WHERE usr_s1.u_pfn = sc.sc_id AND usr_s2.us_typ = 1
      ) AS usr_s1_count,

      ssc.id AS sub_sub_id, 
      ssc.name AS sub_sub_category, 
      ssc.status AS sub_sub_status

    FROM category c
    LEFT JOIN sub_category sc 
      ON sc.sc_cid = c.cat_id AND sc.sc_status = 1
    LEFT JOIN sub_sub_category ssc 
      ON ssc.subcategory_id = sc.sc_id AND ssc.status = 1

    GROUP BY c.cat_id, sc.sc_id, ssc.id
  ");

  if (!$stmt) {
    echo json_encode([
      'statusCode' => 500,
      'error' => 'Failed to prepare the SQL statement.'
    ]);
    exit;
  }

  $stmt->execute();

  // Get the result
  $result = $stmt->get_result();
  $data = [];

  while ($row = $result->fetch_assoc()) {
    $cat_id = $row['cat_id'];
    $profession = $row['profession'];
    $profession_status = $row['profession_status'];
    $sub_category_id = $row['sc_id'];
    $sub_category = [
      'sc_id' => $sub_category_id,
      'sub_category' => $row['sub_category'],
      'sc_status' => $row['sc_status'],
      'sc_image' => $row['sc_image'],
      'terms_and_conditions' => $row['terms_and_conditions'],
      'rate_charts' => $row['rate_charts'],
      'sub_sub_category_count' => (int) $row['sub_sub_category_count'],
      'usr_s1_count' => (int) $row['usr_s1_count'],
      'sub_sub_categories' => []
    ];

    $sub_sub_category = [
      'ssc_id' => $row['sub_sub_id'],
      'sub_sub_category' => $row['sub_sub_category'],
      'ssc_status' => $row['sub_sub_status']
    ];

    // Add profession if not already added and isvisible is true
    if ($isvisible && !isset($data[$cat_id])) {
      $data[$cat_id] = [
        'cat_id' => $cat_id,
        'profession' => $profession,
        'profession_status' => $profession_status,
        'sub_category_count' => (int) $row['sub_category_count'],
        'sub_categories' => []
      ];
    }

    // Add sub-category if not already added
    if ($sub_category_id && !isset($data[$cat_id]['sub_categories'][$sub_category_id])) {
      $data[$cat_id]['sub_categories'][$sub_category_id] = $sub_category;
    }

    // Add sub-sub-category if exists
    if (!is_null($row['sub_sub_id'])) {
      $data[$cat_id]['sub_categories'][$sub_category_id]['sub_sub_categories'][] = $sub_sub_category;
    }
  }

  // Convert associative arrays to indexed arrays
  foreach ($data as $cat_id => $cat_data) {
    $data[$cat_id]['sub_categories'] = array_values($cat_data['sub_categories']);
  }
  $data = array_values($data);

  // Return result
  if (empty($data)) {
    echo json_encode(['statusCode' => 204, 'message' => 'No data found.']);
    exit;
  }

  echo json_encode($data);
}
?>
