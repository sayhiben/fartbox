/**
 * Main Google Apps Script code for collecting event submissions
 * from a Gmail inbox and storing them in a Google Sheet.
 *
 * This script:
 *  1. Searches Gmail for unread messages in the inbox
 *  2. Extracts message content, attachments (images), links
 *  3. Appends data to the 'RawData' sheet
 *  4. Sends acknowledgment to the sender
 *  5. Marks the email as read
 */

const scriptProperties = PropertiesService.getScriptProperties();
const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
const DRIVE_FOLDER_ID = scriptProperties.getProperty('DRIVE_FOLDER_ID');
const TRIGGER_INTERVAL = scriptProperties.getProperty('TRIGGER_INTERVAL') || 5;

/**
 * Main entry function to process new emails.
 */
function processEmails() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('RawData');
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);

  // Example search: only unread messages in the inbox
  const threads = GmailApp.search('in:inbox is:unread');
  if (!threads.length) return;

  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(message => {
      if (message.isUnread()) {
        const date = message.getDate();
        const sender = message.getFrom();
        const subject = message.getSubject();
        const bodyText = message.getPlainBody();

        // Extract links from body
        const linkRegex = /https?:\/\/\S+/g;
        const links = bodyText.match(linkRegex) || [];
        
        // Handle attachments
        const attachments = message.getAttachments({includeInlineImages: false});
        const imageUrls = [];
        attachments.forEach(att => {
          if (att.getContentType().match(/^image\//)) {
            const file = folder.createFile(att.copyBlob());
            const imageUrl = file.getUrl();
            imageUrls.push(imageUrl);
          }
        });

        // Append row
        sheet.appendRow([
          date,
          sender,
          subject,
          bodyText,
          links.join(', '),
          imageUrls.join(', '),
          'false' // Processed flag
        ]);

        // Send acknowledgment
        let senderEmail = sender;
        const match = sender.match(/<(.*)>/);
        if (match) senderEmail = match[1];

        GmailApp.sendEmail(
          senderEmail,
          "Re: " + subject,
          "Thank you for your event submission. We have received your information."
        );

        message.markRead();
      }
    });
    thread.moveToArchive();
  });
}

/**
 * Example function that can be triggered on a schedule (time-based).
 */
function createTimeTrigger() {
  // Delete existing trigger for processEmails
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'processEmails') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Install the trigger
  ScriptApp.newTrigger('processEmails')
    .timeBased()
    .everyMinutes(TRIGGER_INTERVAL)
    .create();
}