<?php session_start(); if (!isset($_SESSION['user_id'])) header("Location: index.html"); ?>
<!DOCTYPE html>
<html>
<head>
  <title>Expense Tracker</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <form id="expenseForm">
    <h2>Welcome to Expense Tracker</h2>
    <input type="text" id="title" placeholder="Expense Title" required>
    <input type="number" id="amount" placeholder="Amount" required>
    <button type="submit">Add Expense</button>
  </form>

  <h3>Expense History</h3>
  <div class="history-box">
    <ul id="expenseList"></ul>
  </div>
  <h3>Total: ₹<span id="totalAmount">0.00</span></h3>
  <button onclick="clearExpenses()">Clear All</button>

  <script src="script.js"></script>
</body>
</html>