document.addEventListener("DOMContentLoaded", loadExpenses);
document.getElementById("expenseForm").addEventListener("submit", function(e) {
  e.preventDefault();
  let title = document.getElementById("title").value;
  let amount = parseFloat(document.getElementById("amount").value);
  fetch('add_expense.php', {
    method: 'POST',
    body: JSON.stringify({ title, amount })
  }).then(() => {
    document.getElementById("expenseForm").reset();
    loadExpenses();
  });
});
function loadExpenses() {
  fetch('fetch_expenses.php')
    .then(res => res.json())
    .then(data => {
      let list = document.getElementById("expenseList");
      list.innerHTML = "";
      let total = 0;
      data.forEach(exp => {
        total += parseFloat(exp.amount);
        let li = document.createElement("li");
        let dateObj = new Date(exp.created_at);
        let formattedDate = dateObj.toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
        li.innerHTML = `
          <div>
            <strong>${exp.title}</strong><br>
            <small>${formattedDate}</small>
          </div>
          <div>
            ₹${parseFloat(exp.amount).toFixed(2)}
            <button onclick="deleteExpense(${exp.id})">🗑</button>
          </div>
        `;
        list.appendChild(li);
      });
      document.getElementById("totalAmount").textContent = total.toFixed(2);
    });
}
function deleteExpense(id) {
  fetch('delete_expense.php', {
    method: 'POST',
    body: JSON.stringify({ id })
  }).then(loadExpenses);
}
function clearExpenses() {
  fetch('clear_expenses.php').then(loadExpenses);
}