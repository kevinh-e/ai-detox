(() => {
  // --- DOM Elements ---
  const overlay = document.getElementById('blocker-overlay');
  const title = document.getElementById('blocker-title');
  const instruction = document.getElementById('blocker-instruction');
  const instructionCode = document.getElementById('proceed-code');
  const instructionCode2 = document.getElementById('confirm-code');
  const proceedContainer = document.getElementById('proceed-container');
  const input1 = document.getElementById('proceed-input');
  const input2 = document.getElementById('confirmation-input');
  const button = document.getElementById('proceed-button');
  const errorMessage = document.getElementById('error-message');

  // --- Read configuration from data attributes ---
  const { proceedMode, proceedText, confirmText } = overlay.dataset;

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
    instructionCode2.textContent = confirmText;
    button.addEventListener('click', handleProceed);

    input1.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        handleProceed();
      }
    });
    input2.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        handleProceed();
      }
    });

    // Focus the input1 on load
    setTimeout(() => input1.focus(), 100);
  }

  function setupBlockMode() {
    title.textContent = "AI is a tool, not a replacement.";
    title.style.margin = 0;
    proceedContainer.style.display = 'none';
  }

  function handleProceed() {
    if (input1.value.trim() === proceedText && input2.value.trim() === confirmText) {
      removeOverlay();
    } else {
      errorMessage.style.display = 'block';
      input1.value = '';
      input2.value = '';
      input1.focus();
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
