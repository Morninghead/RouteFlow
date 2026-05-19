import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
  type ApplicationVerifier,
} from 'firebase/auth';
import { auth } from './firebase-client';

let recaptchaVerifier: RecaptchaVerifier | null = null;

export function initRecaptcha(containerId: string): ApplicationVerifier {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    },
  });

  return recaptchaVerifier;
}

export async function sendOTP(
  phoneNumber: string,
  appVerifier: ApplicationVerifier
): Promise<ConfirmationResult> {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    throw new Error(error.message || 'Failed to send OTP');
  }
}

export async function verifyOTP(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<any> {
  try {
    const result = await confirmationResult.confirm(code);
    return result.user;
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    throw new Error('Invalid OTP code');
  }
}

export function clearRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}
