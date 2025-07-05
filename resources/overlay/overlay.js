(() => {
  // --- DOM Elements ---
  const overlay = document.getElementById('blocker-overlay');
  const title = document.getElementById('blocker-title');
  const instruction = document.getElementById('blocker-instruction');
  const instructionCode = instruction.querySelector('code');
  const proceedContainer = document.getElementById('proceed-container');
  const input = document.getElementById('confirmation-input');
  const button = document.getElementById('proceed-button');
  const errorMessage = document.getElementById('error-message');

  // --- Read configuration from data attributes ---
  const { proceedMode, proceedText } = overlay.dataset;
  console.log(proceedText);

  // --- Functions ---
  function init() {
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    if (proceedMode === 'true') {
      setupProceedMode();
    } else {
      setupBlockMode();
    }
  }

  function setupProceedMode() {
    instructionCode.textContent = proceedText;
    button.addEventListener('click', handleProceed);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        handleProceed();
      }
    });
    // Focus the input on load
    setTimeout(() => input.focus(), 100);
  }

  function setupBlockMode() {
    title.textContent = "Access to this website is blocked.";
    proceedContainer.style.display = 'none';
  }

  function handleProceed() {
    if (input.value.trim() === proceedText) {
      removeOverlay();
    } else {
      errorMessage.style.display = 'block';
      input.value = '';
      input.focus();
    }
  }

  function removeOverlay() {
    overlay.remove();
    // Restore background scrolling
    document.body.style.overflow = 'auto';
    // The script has done its job, so we can remove it.
    document.getElementById('blocker-script')?.remove();
  }

  init();
})();
