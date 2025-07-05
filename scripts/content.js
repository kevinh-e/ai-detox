(async () => {
  // Message the background script to get block settings
  const response = await chrome.runtime.sendMessage({ type: "getBlockSettings" });
  const { isBlocked, proceedMode, proceedText } = response;

  if (isBlocked) {
    console.log(response);
    if (proceedMode == true) {
      // Option 1: Confirmation prompt with shadcn/ui styling
      const overlay = document.createElement('div');
      overlay.id = 'llm-blocker-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        color: hsl(0 0% 3.9%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 99998;
        font-family: "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-feature-settings: "rlig" 1, "calt" 1;
      `;

      const contentDiv = document.createElement('div');
      contentDiv.style.cssText = `
        background-color: hsl(0 0% 100%);
        border: 1px solid hsl(0 0% 89.8%);
        padding: 24px;
        border-radius: 8px;
        text-align: center;
        max-width: 420px;
        width: 90%;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        z-index: 99999;
      `;

      const message = document.createElement('h2');
      message.textContent = "Access to this website is restricted";
      message.style.cssText = `
        font-size: 1.5rem;
        font-weight: 600;
        line-height: 1.2;
        margin: 0 0 8px 0;
        color: hsl(0 0% 3.9%);
        letter-spacing: -0.025em;
      `;

      const instruction = document.createElement('p');
      instruction.innerHTML = `To proceed, type <code style="background-color: hsl(0 0% 96.1%); padding: 2px 4px; border-radius: 4px; font-size: 0.875rem; font-family: 'Geist Mono', ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;">${proceedText}</code> below:`;
      instruction.style.cssText = `
        font-size: 0.875rem;
        line-height: 1.5;
        margin: 0 0 16px 0;
        color: hsl(0 0% 45.1%);
      `;

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter confirmation text';
      input.style.cssText = `
        background-color: hsl(0 0% 100%);
        padding: 8px 12px;
        width: calc(100% - 24px);
        height: 40px;
        border: 1px solid hsl(0 0% 89.8%);
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 0.875rem;
        font-family: inherit;
        color: hsl(0 0% 3.9%);
        transition: border-color 0.2s;
        outline: none;
      `;

      // Add focus styles
      input.addEventListener('focus', () => {
        input.style.borderColor = 'hsl(0 0% 3.9%)';
        input.style.boxShadow = '0 0 0 2px hsl(0 0% 3.9% / 0.2)';
      });

      input.addEventListener('blur', () => {
        input.style.borderColor = 'hsl(0 0% 89.8%)';
        input.style.boxShadow = 'none';
      });

      const errorMessage = document.createElement('p');
      errorMessage.id = 'llm-blocker-error';
      errorMessage.style.cssText = `
        color: hsl(0 84.2% 60.2%);
        font-size: 0.875rem;
        line-height: 1.5;
        margin: 0 0 16px 0;
        display: none;
      `;
      errorMessage.textContent = 'Incorrect confirmation text.';

      const bypassButton = document.createElement('button');
      bypassButton.textContent = 'Proceed';
      bypassButton.style.cssText = `
        background-color: hsl(0 0% 9%);
        color: hsl(0 0% 98%);
        border: none;
        padding: 8px 16px;
        height: 40px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
        font-family: inherit;
        transition: background-color 0.2s;
        outline: none;
      `;

      // Add hover and focus states
      bypassButton.addEventListener('mouseenter', () => {
        bypassButton.style.backgroundColor = 'hsl(0 0% 9% / 0.9)';
      });

      bypassButton.addEventListener('mouseleave', () => {
        bypassButton.style.backgroundColor = 'hsl(0 0% 9%)';
      });

      bypassButton.addEventListener('focus', () => {
        bypassButton.style.boxShadow = '0 0 0 2px hsl(0 0% 3.9% / 0.2)';
      });

      bypassButton.addEventListener('blur', () => {
        bypassButton.style.boxShadow = 'none';
      });

      contentDiv.appendChild(message);
      contentDiv.appendChild(instruction);
      contentDiv.appendChild(input);
      contentDiv.appendChild(errorMessage);
      contentDiv.appendChild(bypassButton);
      overlay.appendChild(contentDiv);
      document.documentElement.appendChild(overlay);

      // Prevent scrolling on the page underneath
      if (document.body) {
        document.body.style.overflow = 'hidden';
      }

      bypassButton.addEventListener('click', () => {
        if (input.value.trim() === proceedText) {
          overlay.remove();
          document.body.style.overflow = 'auto';
        } else {
          errorMessage.style.display = 'block';
          input.value = '';
          input.focus();
        }
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          bypassButton.click();
        }
      });

      // Focus the input on load
      setTimeout(() => input.focus(), 100);

    } else {
      // Option 2: 100% block with shadcn/ui styling
      document.body.innerHTML = '';
      document.head.innerHTML = '';

      const blockPage = document.createElement('html');
      blockPage.innerHTML = `
        <head>
          <title>Access Denied</title>
          <style>
            body {
              font-family: "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-feature-settings: "rlig" 1, "calt" 1;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: hsl(0 0% 98%);
              color: hsl(0 0% 3.9%);
              margin: 0;
              text-align: center;
            }
            .container {
              background-color: hsl(0 0% 100%);
              padding: 32px;
              border-radius: 8px;
              border: 1px solid hsl(0 0% 89.8%);
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
              max-width: 420px;
              width: 90%;
            }
            h1 {
              color: hsl(0 0% 3.9%);
              font-size: 1.875rem;
              font-weight: 600;
              line-height: 1.2;
              margin: 0 0 16px 0;
              letter-spacing: -0.025em;
            }
            p {
              margin: 0 0 12px 0;
              font-size: 0.875rem;
              line-height: 1.5;
              color: hsl(0 0% 45.1%);
            }
            p:last-child {
              margin-bottom: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Access Denied</h1>
            <p>This website is blocked by your LLM Blocker extension.</p>
            <p>You can change settings in the extension options.</p>
          </div>
        </body>
      `;
      document.replaceChild(blockPage, document.documentElement);
    }
  }
})();
