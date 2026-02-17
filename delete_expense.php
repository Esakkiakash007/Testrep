<?php
session_start();
include 'db.php';
$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];
$stmt = $conn->prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $id, $user_id);
$stmt->execute();
echo "Deleted";
?>