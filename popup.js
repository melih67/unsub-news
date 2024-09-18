document.addEventListener("DOMContentLoaded", function () {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    if (token) {
      fetchNewsletters(token);
    }
  });

  function fetchNewsletters(token) {
    fetch(
      "https://www.googleapis.com/gmail/v1/users/me/messages?q=newsletter",
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    )
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
    fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    )
      .then((response) => response.json())
      .then((message) => {
        let headers = message.payload.headers;
        let unsubscribeHeader = headers.find(
          (header) => header.name === "List-Unsubscribe"
        );

        if (unsubscribeHeader) {
          addNewsletterToUI(message);
        }
      });
  }

  function addNewsletterToUI(message) {
    const newsletterList = document.getElementById("newsletter-list");

    // Creating a card element for each newsletter
    const div = document.createElement("div");
    div.classList.add("newsletter-card");

    div.innerHTML = `
      <p>${message.snippet}</p>
      <div class="flex">
        <button class="button ignore-btn">Ignore</button>
        <button class="button unsubscribe-btn">Unsubscribe</button>
      </div>
    `;

    // Add event listeners for buttons
    div.querySelector(".ignore-btn").addEventListener("click", () => {
      div.remove();
    });

    div.querySelector(".unsubscribe-btn").addEventListener("click", () => {
      handleUnsubscribe(message);
    });

    newsletterList.appendChild(div);
  }

  function handleUnsubscribe(message) {
    let headers = message.payload.headers;
    let unsubscribeHeader = headers.find(
      (header) => header.name === "List-Unsubscribe"
    );

    if (unsubscribeHeader) {
      let unsubscribeLink = unsubscribeHeader.value.match(/<(.*)>/)[1];

      // Open the unsubscribe link in a new tab
      chrome.tabs.create({ url: unsubscribeLink });
    }
  }
});
