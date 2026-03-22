const rows = $input.all().map(r => r.json);

const today = new Date();
const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
const recent = rows.filter(r => r.lastUpdated >= weekAgo);

const counts = {
  "Applied": 0,
  "Interview Scheduled": 0,
  "Offer Received": 0,
  "Rejected": 0,
  "Recruiter Outreach": 0
};

recent.forEach(r => {
  if (counts[r.status] !== undefined) counts[r.status]++;
});

const total = rows.length;
const totalInterviews = rows.filter(r => r.status === "Interview Scheduled").length;
const totalOffers = rows.filter(r => r.status === "Offer Received").length;
const totalApplied = rows.filter(r => r.status === "Applied").length;
const convRate = totalApplied > 0 ? ((totalInterviews / totalApplied) * 100).toFixed(1) : "0";

const message = `📊 Weekly Job Tracker Summary

This week:
📨 Applied: ${counts["Applied"]}
📅 Interviews: ${counts["Interview Scheduled"]}
🎉 Offers: ${counts["Offer Received"]}
❌ Rejections: ${counts["Rejected"]}
🔔 Outreach: ${counts["Recruiter Outreach"]}

All time:
Total tracked: ${total}
Conversion rate (apply to interview): ${convRate}%
Total offers received: ${totalOffers}`;

return [{ json: { message } }];
