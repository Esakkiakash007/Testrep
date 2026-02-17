<?php
session_start();
include 'db.php';
$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("DELETE FROM expenses WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
echo "All cleared";
?>