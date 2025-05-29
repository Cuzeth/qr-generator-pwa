// Main application entry point
import { initTheme, toggleTheme } from './theme';
import {
  generateQR,
  downloadQR,
  switchTab,
  setupWifiPasswordToggle,
  type QRGeneratorElements,
  type FormElements
} from './qr-generator';

// Initialize application
function initApp(): void {
  // Initialize theme
  initTheme();

  // Get DOM elements
  const elements: QRGeneratorElements = {
    generateBtn: document.getElementById('generateBtn') as HTMLButtonElement,
    downloadBtn: document.getElementById('downloadBtn') as HTMLButtonElement,
    qrCanvas: document.getElementById('qrCanvas') as HTMLCanvasElement,
    errorMsg: document.getElementById('errorMsg') as HTMLDivElement,
    successMsg: document.getElementById('successMsg') as HTMLDivElement,
    qrOutput: document.getElementById('qrOutput') as HTMLDivElement,
    typeTabs: document.querySelectorAll('.type-tab'),
    formSections: document.querySelectorAll('.form-section') as NodeListOf<HTMLElement>
  };

  const formElements: FormElements = {
    qrText: document.getElementById('qrText') as HTMLTextAreaElement,
    wifiSSID: document.getElementById('wifiSSID') as HTMLInputElement,
    wifiSecurity: document.getElementById('wifiSecurity') as HTMLSelectElement,
    wifiPassword: document.getElementById('wifiPassword') as HTMLInputElement,
    wifiHidden: document.getElementById('wifiHidden') as HTMLInputElement,
    emailTo: document.getElementById('emailTo') as HTMLInputElement,
    emailSubject: document.getElementById('emailSubject') as HTMLInputElement,
    emailBody: document.getElementById('emailBody') as HTMLTextAreaElement,
    phoneNumber: document.getElementById('phoneNumber') as HTMLInputElement,
    phoneMessage: document.getElementById('phoneMessage') as HTMLTextAreaElement
  };

  const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;

  // Setup event listeners
  elements.generateBtn.addEventListener('click', () => generateQR(elements, formElements));
  elements.downloadBtn.addEventListener('click', () => downloadQR(elements.qrCanvas, elements.successMsg));
  themeToggle.addEventListener('click', toggleTheme);

  elements.typeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const type = (tab as HTMLElement).dataset.type;
      if (type) switchTab(type, elements);
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      generateQR(elements, formElements);
    }
  });

  // Setup WiFi password field toggle
  setupWifiPasswordToggle(formElements);

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}