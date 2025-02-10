# Fartbox - Email-to-sheet with Google Apps Script

A **Google Apps Script** project that automates collecting input data from a dedicated Gmail inbox, storing them in a Google Sheet, and extracting images to Google Drive.

(It's a GAS Collector)

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [Local Development](#local-development)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [CI/CD with GitHub Actions](#cicd-with-github-actions)
9. [Optional Infrastructure (Terraform)](#optional-infrastructure-terraform)
10. [License](#license)

---

## Overview

This project / script provides a quick, low-maintenance solution for collecting data from email submissions and storing them in a Google Sheet. This is useful for lightweight data collection across clients without the need for additional apps or dependencies - users can simply email or text new rows to the email address associated with the project for later processing.

Gmail makes for a suitable MVP in this scenario since spam management can be handled within mail filters rather than bespoke allowlists and blocklists within the application.

---

## Features

- **Email to Sheet**: Pull unread emails, parse attachments & links, append to a "RawData" tab.
- **Image Handling**: Save image attachments to a designated Google Drive folder.
- **Acknowledgment**: Automatically reply to each sender.
- **Scheduled Trigger**: Runs every X minutes via time-based triggers in Apps Script.

---

## Architecture

1. **Gmail**: Receives incoming event submissions (with text, links, images).
2. **Apps Script** (Triggered every 5 min):
  - Retrieves unread messages
  - Extracts data
  - Writes to **Google Sheet**: `RawData` tab
  - Saves attachments to a **Google Drive** folder
  - Acknowledges sender
  - Marks email as read and archives it
3. **External Parser/Processor** (Optional): Could read from `RawData` and write structured data to a separate Sheet or tab.

---

## Getting Started

Follow these steps to set up your environment and deploy the solution.

1. **Create a new Google Apps Script project**  
  - Go to [script.google.com](https://script.google.com) and click **New Project**.  
2. **Create a Google Sheet**  
  - Name it something like `Mailed Submissions`.
  - Add a worksheet/tab named `RawData` with headers (e.g., Date, Sender, Subject, Body, Links, Images).
3. **Create a Drive folder**  
  - For storing event images (`EventImages`). Copy the folder ID from the URL.
4. **Clone This Repository**  
  ```bash
  git clone https://github.com/sayhiben/fartbox.git
  cd fartbox
  ```
5. **Define Script Properties**
  - Follow [Google's instructions for manually defining script properties](https://developers.google.com/apps-script/guides/properties#manage_script_properties_manually) for the following variables:
    - `SPREADSHEET_ID` - **Required**, the ID of the spreadsheet, found in the spreadsheet's URL
    - `DRIVE_FOLDER_ID` - **Required**, the ID of the drive folder in which to store images, found in the properties of the drive folder
    - `TRIGGER_INTERVAL` - _Optional_, the number of minutes between checking for new mail. Defaults to 5 minutes.
6. 	**Set up trigger**
  - Go to your script in the browser
  -	Under Triggers → Add Trigger, choose processEmails(), set a time-based trigger (e.g., every 5 minutes).
  - Save.