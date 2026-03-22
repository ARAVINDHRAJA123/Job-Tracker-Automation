# 🎯 Job-Tracker-Automation

Automatically tracks job applications from Gmail — extracts company, role and status across all major platforms, logs to Google Sheets, and sends Telegram notifications using n8n.

## ✨ Features

- Parses job emails automatically from Gmail (every 5 minutes)
- Extracts company, role, status and platform from email content
- Handles forwarded emails and multiple ATS platforms
- Detects all major job statuses (Applied, Interview, Offer, Rejected, Recruiter Outreach)
- Logs to Google Sheets with duplicate detection via jobKey
- Instant Telegram notification on every status update
- Weekly summary every Monday (applied, interviews, offers, conversion rate)
- Daily follow-up reminder for applications with no response after 7 days

## 🌐 Platforms Supported

| Platform | Detection Method |
|---|---|
| Workday | myworkday.com in sender |
| iCIMS | icims in sender display name |
| LinkedIn | linkedin.com in sender |
| Naukri | naukri.com in sender |
| Greenhouse | greenhouse.io in sender |
| Lever | lever.co in sender |
| Direct | Company own domain |

## 📊 Status Detection

| Status | Keywords |
|---|---|
| Applied | received your application, thank you for applying |
| Interview Scheduled | move forward, invite you to an interview |
| Offer Received | aced it, love you to join, pleased to offer |
| Rejected | regret, not moving forward, pursued other candidates |
| Recruiter Outreach | came across your profile, open to opportunities |

## ⚙️ Workflows

### 📨 1. Email → Google Sheets (always running)
- Polls Gmail every 5 minutes
- Extracts all fields from email
- Appends or updates row in Google Sheets
- Sends Telegram notification

### 📊 2. Weekly Summary (every Monday 9 AM)
- Reads all rows from Google Sheets
- Calculates conversion rate (applied → interview)
- Sends summary to Telegram

### ⏰ 3. Daily Follow-up Reminder (every day 10 AM)
- Checks for Applied rows where follow-up date has passed
- Sends Telegram reminder only when overdue applications exist

## 🗂️ Google Sheet Columns

| Column | Description |
|---|---|
| dateApplied | Date email was received |
| company | Extracted company name |
| role | Extracted job role |
| platform | ATS platform detected |
| status | Current application status |
| lastUpdated | Date row was last updated |
| followUpDate | 7 days after dateApplied |
| priority | Normal / High / Dream |
| jobKey | company\|role (used for duplicate detection) |

## 🛠️ Stack

- n8n (workflow automation)
- Gmail IMAP
- Google Sheets API
- Telegram Bot API

## 🚀 Setup

1. Import the 3 workflow JSON files from the `Workflows/` folder into n8n
2. Set up credentials in n8n — Gmail IMAP, Google Sheets service account, Telegram bot
3. Create Google Sheet with columns listed above
4. Activate all 3 workflows
