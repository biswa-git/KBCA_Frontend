# Email OTP Verification for Registration

This plan outlines the steps to implement a Gmail-based OTP verification flow during new user registration.

## User Review Required

> [!IMPORTANT]
> **Gmail Credentials Required**: To send emails via your Gmail account, you will need to provide an **App Password** (not your regular Gmail password). 
> 
> You can generate one by going to your Google Account -> Security -> 2-Step Verification -> App Passwords. We will store this securely in an `.env` file and not commit it to version control.

## Open Questions

1. Do you want to automatically log the user in after they successfully enter the OTP, or should we redirect them to the standard login screen to enter their email and password again?
2. Should I create a `/resend-otp` feature as well in case the user doesn't receive the email on the first try?

## Proposed Changes

### Backend (`KBCA_Backend`)

#### [MODIFY] [models.py](file:///d:/Projects/Apps/KBCA/KBCA_Backend/models.py)
- Add `is_verified` (Boolean, default `False`) column to the `User` model.
- Add `otp_code` (String, nullable) column to temporarily store the generated OTP.
- Add `otp_expires_at` (DateTime, nullable) to validate the OTP's expiration.

#### [NEW] `utils.py` (or added to `auth.py`)
- Add a utility function `send_otp_email(receiver_email, otp)` using Python's built-in `smtplib`. It will read `GMAIL_USER` and `GMAIL_APP_PASSWORD` from environment variables.

#### [MODIFY] [main.py](file:///d:/Projects/Apps/KBCA/KBCA_Backend/main.py)
- Update `/register` endpoint to:
  1. Generate a random 6-digit OTP.
  2. Set the new user's `is_verified` status to `False`.
  3. Store the hashed OTP and expiry time in the database.
  4. Call the email utility to send the OTP to the user's email.
- Create a new endpoint `/verify-otp`:
  - Accepts `email` and `otp`.
  - Checks if the OTP is correct and hasn't expired.
  - If valid, sets `is_verified = True` and clears the OTP.
- Update `/login` endpoint to reject login if `is_verified` is `False`.

---

### Frontend (`KBCA3/src`)

#### [MODIFY] [LoginModal.tsx](file:///d:/Projects/Apps/KBCA/KBCA3/src/components/LoginModal.tsx)
- Add a new `isOtpMode` state variable.
- Update the registration `handleSubmit` to switch to `isOtpMode` upon a successful `/register` response.
- Render an OTP input form when `isOtpMode` is true.
- Add an `handleOtpSubmit` function that calls the `/verify-otp` backend endpoint.
- Handle successful verification by either auto-logging them in or showing a success message and switching to the Login tab.

## Verification Plan

### Manual Verification
1. Register a new account with a valid email address.
2. Verify that the UI switches to the OTP input screen.
3. Check the inbox of the provided email address to confirm receipt of the 6-digit OTP.
4. Input the OTP in the frontend to verify the account activates successfully.
5. Attempt to login with an unverified account to ensure it is blocked.
