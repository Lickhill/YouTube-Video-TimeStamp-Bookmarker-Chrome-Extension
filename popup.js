// Global list to store links and titles
const linkList = [];

function loadLinks() {
	chrome.storage.local.get("linkList", (data) => {
		if (data.linkList) {
			linkList.push(...data.linkList);
			updateLinkListDisplay();
		}
	});
}

function saveLinks() {
	chrome.storage.local.set({ linkList }, () => {
		if (chrome.runtime.lastError) {
			console.error("Error saving to storage:", chrome.runtime.lastError);
		} else {
			console.log("Links saved to storage");
		}
	});
}

document.getElementById("bookmark").addEventListener("click", () => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{ action: "getTime" },
			(response) => {
				if (chrome.runtime.lastError) {
					console.error(chrome.runtime.lastError);
					alert(
						"An error occurred. Please make sure you're on a YouTube video page."
					);
					return;
				}
				if (response && response.time !== null) {
					const url = new URL(tabs[0].url);
					url.searchParams.set("t", response.time);
					const shareableLink = url.toString();
					const customTitle =
						document.getElementById("customTitle").value.trim() ||
						`Link ${linkList.length + 1}`;

					// Append the link and title to the global list
					linkList.push({ link: shareableLink, title: customTitle });
					saveLinks();

					navigator.clipboard
						.writeText(shareableLink)
						.then(() => {
							console.log("Link copied to clipboard");
						})
						.catch((err) => {
							console.error("Failed to copy to clipboard:", err);
						});

					document.getElementById("link").value = shareableLink;
					document.getElementById("customTitle").value = ""; // Clear the textarea
					updateLinkListDisplay();
				} else {
					alert("Could not retrieve video time.");
				}
			}
		);
	});
});

function updateLinkListDisplay() {
	const linkListDisplay = document.getElementById("linkListDisplay");
	linkListDisplay.innerHTML = "";

	linkList.forEach((item, index) => {
		const listItem = document.createElement("li");

		const linkButton = document.createElement("button");
		linkButton.textContent = item.title;
		linkButton.style.width = "70%";
		linkButton.onclick = () => window.open(item.link, "_blank");

		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.style.width = "25%";
		deleteButton.style.marginLeft = "5%";
		deleteButton.onclick = () => deleteLink(index);

		listItem.appendChild(linkButton);
		listItem.appendChild(deleteButton);
		linkListDisplay.appendChild(listItem);
	});
}

function deleteLink(index) {
	linkList.splice(index, 1);
	saveLinks();
	updateLinkListDisplay();
}

loadLinks();
