<?php
session_start();
include 'db.php';
$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);
$title = $data['title'];
$amount = $data['amount'];
$stmt = $conn->prepare("INSERT INTO expenses (user_id, title, amount) VALUES (?, ?, ?)");
$stmt->bind_param("isd", $user_id, $title, $amount);
$stmt->execute();
echo "Expense Added";
?>