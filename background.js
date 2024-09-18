chrome.runtime.onInstalled.addListener(() => {
  console.log("Newsletter Unsubscriber installed");
});

chrome.action.onClicked.addListener(() => {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    if (token) {
      // Use the token to interact with the Gmail API
      fetchNewsletters(token);
    }
  });
});

function fetchNewsletters(token) {
  fetch("https://www.googleapis.com/gmail/v1/users/me/messages?q=newsletter", {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.messages) {
        data.messages.forEach((message) => {
          fetchMessageDetails(message.id, token);
        });
      }
    });
}

function fetchMessageDetails(messageId, token) {
  fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => response.json())
    .then((message) => {
      // Process the message to detect if it's a newsletter
      let headers = message.payload.headers;
      let unsubscribeHeader = headers.find(
        (header) => header.name === "List-Unsubscribe"
      );
      if (unsubscribeHeader) {
        // Handle newsletter
        console.log("Newsletter detected", message.snippet);
      }
    });
}
