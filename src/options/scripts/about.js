export function init() {
  updateVersion();
}

const updateVersion = () => {
  const manifestData = chrome.runtime.getManifest();
  document.getElementById('version').textContent = manifestData.version;
  console.log(manifestData.version);
}


export function cleanup() {
}
