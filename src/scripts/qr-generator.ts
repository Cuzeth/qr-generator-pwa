// QR Code generation functionality
import QRCode from 'qrcode';

export interface QRGeneratorElements {
  generateBtn: HTMLButtonElement;
  downloadBtn: HTMLButtonElement;
  qrCanvas: HTMLCanvasElement;
  errorMsg: HTMLDivElement;
  successMsg: HTMLDivElement;
  qrOutput: HTMLDivElement;
  typeTabs: NodeListOf<Element>;
  formSections: NodeListOf<HTMLElement>;
}

export interface FormElements {
  qrText: HTMLTextAreaElement;
  wifiSSID: HTMLInputElement;
  wifiSecurity: HTMLSelectElement;
  wifiPassword: HTMLInputElement;
  wifiHidden: HTMLInputElement;
  emailTo: HTMLInputElement;
  emailSubject: HTMLInputElement;
  emailBody: HTMLTextAreaElement;
  phoneNumber: HTMLInputElement;
  phoneMessage: HTMLTextAreaElement;
}

let currentQRData = '';
let currentType = 'text';

export function showMessage(element: HTMLElement, message: string, duration = 5000): void {
  element.textContent = message;
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, duration);
}

export function showError(errorMsg: HTMLElement, message: string): void {
  showMessage(errorMsg, message);
}

export function showSuccess(successMsg: HTMLElement, message: string): void {
  showMessage(successMsg, message, 3000);
}

export function switchTab(type: string, elements: QRGeneratorElements): void {
  currentType = type;

  // Update tab states with animation
  elements.typeTabs.forEach(tab => {
    const tabElement = tab as HTMLElement;
    if (tabElement.dataset.type === type) {
      tabElement.classList.add('active');
    } else {
      tabElement.classList.remove('active');
    }
  });

  // Hide all forms and show the selected one
  elements.formSections.forEach(section => {
    if (section.id === `${type}Form`) {
      section.style.display = 'block';
      // Trigger reflow for animation
      section.offsetHeight;
    } else {
      section.style.display = 'none';
    }
  });
}

export function generateQRData(formElements: FormElements, errorMsg: HTMLElement): string | null {
  switch (currentType) {
    case 'text':
      const text = formElements.qrText.value.trim();
      if (!text) {
        showError(errorMsg, 'Please enter some text or a URL');
        return null;
      }
      return text;

    case 'wifi':
      const ssid = formElements.wifiSSID.value.trim();
      const security = formElements.wifiSecurity.value;
      const password = formElements.wifiPassword.value;
      const hidden = formElements.wifiHidden.checked;

      if (!ssid) {
        showError(errorMsg, 'Please enter a network name (SSID)');
        return null;
      }

      if (security !== 'nopass' && !password) {
        showError(errorMsg, 'Please enter a password for the secured network');
        return null;
      }

      return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;

    case 'email':
      const email = formElements.emailTo.value.trim();
      const subject = formElements.emailSubject.value.trim();
      const body = formElements.emailBody.value.trim();

      if (!email) {
        showError(errorMsg, 'Please enter an email address');
        return null;
      }

      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (body) params.append('body', body);

      return `mailto:${email}${params.toString() ? '?' + params.toString() : ''}`;

    case 'phone':
      const phone = formElements.phoneNumber.value.trim();
      const message = formElements.phoneMessage.value.trim();

      if (!phone) {
        showError(errorMsg, 'Please enter a phone number');
        return null;
      }

      if (message) {
        return `smsto:${phone}:${message}`;
      } else {
        return `tel:${phone}`;
      }

    default:
      return null;
  }
}

export async function generateQR(
  elements: QRGeneratorElements,
  formElements: FormElements
): Promise<void> {
  const qrData = generateQRData(formElements, elements.errorMsg);
  if (!qrData) return;

  try {
    elements.generateBtn.disabled = true;
    elements.generateBtn.textContent = 'Generating...';

    await QRCode.toCanvas(elements.qrCanvas, qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#2d3748',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });

    currentQRData = qrData;
    elements.qrOutput.classList.add('visible');
    elements.downloadBtn.style.display = 'flex';
    showSuccess(elements.successMsg, 'QR code generated successfully!');

  } catch (error) {
    showError(elements.errorMsg, 'Error generating QR code');
    console.error('QR generation error:', error);
  } finally {
    elements.generateBtn.disabled = false;
    elements.generateBtn.textContent = 'Generate QR Code';
  }
}

export function downloadQR(
  qrCanvas: HTMLCanvasElement,
  successMsg: HTMLElement
): void {
  if (!currentQRData) return;

  const link = document.createElement('a');
  const typeNames: { [key: string]: string } = {
    text: 'text',
    wifi: 'wifi',
    email: 'email',
    phone: 'phone'
  };
  link.download = `qrcode-${typeNames[currentType] || 'generated'}.png`;
  link.href = qrCanvas.toDataURL();
  link.click();
  showSuccess(successMsg, 'QR code downloaded!');
}

export function setupWifiPasswordToggle(formElements: FormElements): void {
  formElements.wifiSecurity.addEventListener('change', () => {
    const passwordField = formElements.wifiPassword.parentElement as HTMLElement;
    if (formElements.wifiSecurity.value === 'nopass') {
      passwordField.style.opacity = '0.5';
      formElements.wifiPassword.disabled = true;
      formElements.wifiPassword.value = '';
    } else {
      passwordField.style.opacity = '1';
      formElements.wifiPassword.disabled = false;
    }
  });
}