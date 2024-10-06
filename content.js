function getCurrentTime() {
	const video = document.querySelector("video");
	if (video) {
		return Math.floor(video.currentTime);
	}
	return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getTime") {
		const currentTime = getCurrentTime();
		sendResponse({ time: currentTime });
	}
});
