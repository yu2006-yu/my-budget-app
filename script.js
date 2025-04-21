const apiUrl = "https://script.google.com/macros/s/AKfycbygQgIE1UjlXPC0oT_4KF649hY15koH8De2cWkD2ArpI_C3haBF1an7fDhRqBMVQusKUw/exec";
const form = document.getElementById("recordForm");
const recordsContainer = document.getElementById("records");
const totalDisplay = document.getElementById("total");
const monthFilter = document.getElementById("monthFilter");
let allRecords = [];

async function loadRecords() {
  const response = await fetch(apiUrl);
  const data = await response.json();
  allRecords = data.slice(1).map((row, index) => ({
    id: index,
    date: row[0],
    category: row[1],
    amount: parseFloat(row[2]),
    note: row[3]
  }));
  renderRecords();
  renderReport();
}

function renderRecords() {
  const month = monthFilter.value;
  const filtered = month
    ? allRecords.filter(r => r.date.startsWith(month))
    : allRecords;

  recordsContainer.innerHTML = "";
  let total = 0;

  filtered.forEach((record, index) => {
    const div = document.createElement("div");
    div.className = "record";
    div.innerHTML = `
      <p><strong>日期：</strong>${record.date}</p>
      <p><strong>類別：</strong>${record.category}</p>
      <p><strong>金額：</strong>${record.amount}</p>
      <p><strong>備註：</strong>${record.note}</p>
      <button class="delete-btn" onclick="deleteRecord(${record.id})">刪除</button>
    `;
    recordsContainer.appendChild(div);
    total += record.amount;
  });

  totalDisplay.textContent = `總支出：${total} 元`;
}

function renderReport() {
  const categorySum = {};

  allRecords.forEach(r => {
    categorySum[r.category] = (categorySum[r.category] || 0) + r.amount;
  });

  const ctx = document.getElementById('reportChart').getContext('2d');
  if (window.pieChart) window.pieChart.destroy();
  window.pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categorySum),
      datasets: [{
        label: '支出比例',
        data: Object.values(categorySum),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8AFFC1']
      }]
    }
  });
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

  await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({ date, category, amount, note }),
    headers: { "Content-Type": "application/json" },
    mode: "no-cors"
  });

  alert("新增成功");
  setTimeout(loadRecords, 2000);
  form.reset();
});

async function deleteRecord(id) {
  const record = allRecords[id];
  if (!confirm(`確定要刪除 ${record.date} 的 ${record.category} 嗎？`)) return;

  await fetch(apiUrl + `?action=delete&date=${record.date}&amount=${record.amount}&note=${record.note}`, {
    method: "GET"
  });

  setTimeout(loadRecords, 2000);
}

monthFilter.addEventListener("change", renderRecords);

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  document.getElementById(sectionId).style.display = "block";
}

window.addEventListener("load", loadRecords);
