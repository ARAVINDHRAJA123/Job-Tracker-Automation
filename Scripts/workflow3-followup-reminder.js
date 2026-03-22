const rows = $input.all().map(r => r.json);
const today = new Date().toISOString().split("T")[0];

const due = rows.filter(r =>
  r.followUpDate <= today &&
  r.status === "Applied"
);

if (due.length === 0) return [];

const lines = due.map(r => `• ${r.company} - ${r.role} (applied ${r.dateApplied})`).join("\n");

const message = `⏰ Follow-up Reminder

${due.length} application(s) need attention:

${lines}

Log in and follow up today!`;

return [{ json: { message } }];
