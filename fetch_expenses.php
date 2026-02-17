<?php
session_start();
include 'db.php';
$user_id = $_SESSION['user_id'];
$sql = "SELECT id, title, amount, created_at FROM expenses WHERE user_id = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$expenses = [];
while ($row = $result->fetch_assoc()) {
    $expenses[] = $row;
}
echo json_encode($expenses);
?>