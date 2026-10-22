/**
 * Google Apps Script for Automated Google Drive Member Folder & Image Storage
 * Account: mariamtelecom7011@gmail.com
 * Parent Folder ID: 1NnSLLkd-plY13jynoj2O2Z-J7itnoE1V
 */

// Run this function ONCE in script.google.com by clicking "Run ▶" to authorize DriveApp permissions!
function testAuth() {
  var PARENT_FOLDER_ID = "1NnSLLkd-plY13jynoj2O2Z-J7itnoE1V";
  var rootFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
  Logger.log("DriveApp Permission Granted! Target Folder: " + rootFolder.getName());
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Empty post body"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var memberNo = data.member_no || 'Unknown';
    var name = data.name || 'Member';
    var files = data.files || [];

    // Target Google Drive Parent Folder ID
    var PARENT_FOLDER_ID = "1NnSLLkd-plY13jynoj2O2Z-J7itnoE1V";
    var rootFolder;
    try {
      rootFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
    } catch (err) {
      var rootFolders = DriveApp.getFoldersByName("Loan Management System Members");
      rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder("Loan Management System Members");
    }

    // Clean folder name for member
    var cleanName = String(name).replace(/[^\w\s\u0980-\u09FF-]/gi, '').trim();
    var folderName = "Member_" + memberNo + "_" + (cleanName || 'Member');
    
    // Find or create member folder
    var subFolders = rootFolder.getFoldersByName(folderName);
    var memberFolder;
    if (subFolders.hasNext()) {
      memberFolder = subFolders.next();
    } else {
      memberFolder = rootFolder.createFolder(folderName);
    }

    try {
      memberFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {}

    var folderUrl = memberFolder.getUrl();
    var uploadedUrls = {};

    for (var i = 0; i < files.length; i++) {
      var fileItem = files[i];
      if (!fileItem || !fileItem.base64 || !fileItem.key) continue;

      try {
        var rawBase64 = String(fileItem.base64);
        var commaIndex = rawBase64.indexOf(',');
        if (commaIndex !== -1) {
          rawBase64 = rawBase64.substring(commaIndex + 1);
        }
        // Remove spaces & newlines
        rawBase64 = rawBase64.replace(/\s/g, '');

        var decoded = Utilities.base64Decode(rawBase64);
        var mimeType = fileItem.mimeType || 'image/png';
        var fileName = fileItem.fileName || (fileItem.key + '.png');
        var blob = Utilities.newBlob(decoded, mimeType, fileName);

        // Remove old file with same name if exists
        var existingFiles = memberFolder.getFilesByName(fileName);
        while (existingFiles.hasNext()) {
          try {
            existingFiles.next().setTrashed(true);
          } catch (tErr) {}
        }

        var createdFile = memberFolder.createFile(blob);
        try {
          createdFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (fShareErr) {}
        
        var fileId = createdFile.getId();
        var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
        uploadedUrls[fileItem.key] = directUrl;
      } catch (fileErr) {
        uploadedUrls[fileItem.key + '_error'] = fileErr.toString();
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      folder_url: folderUrl,
      urls: uploadedUrls
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Google Drive Upload API is active and ready."
  })).setMimeType(ContentService.MimeType.JSON);
}
