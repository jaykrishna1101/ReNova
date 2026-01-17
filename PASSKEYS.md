# Valid Buyer Passkeys

The following 5 passkeys are valid for buyer registration. These are 10-digit numbers that must be entered exactly as shown.

## Valid Passkeys

1. **1234567890**
2. **9876543210**
3. **5555555555**
4. **1111111111**
5. **9999999999**

## Usage

- **Sellers**: Do NOT need a passkey to sign up
- **Buyers**: MUST provide one of the above passkeys during signup and login

## Security Note

These passkeys are hardcoded in the application. For production, consider:
- Moving passkeys to environment variables
- Storing them in a database
- Implementing a more secure authentication system for buyers
- Adding passkey rotation capabilities

## Location in Code

Passkeys are defined in: `lib/passkeys.ts`
