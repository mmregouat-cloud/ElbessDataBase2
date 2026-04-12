// templates/email-verification.js

const getAlreadyVerifiedPage = (email) => `
<!DOCTYPE html>
<html>
<head>
    <title>Email Already Verified</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 32px 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
            margin: 0 auto;
        }
        .message { 
            color: #2563eb; 
            font-size: 24px; 
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
        }
        .email {
            background: #f3f4f6;
            padding: 12px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 16px;
            text-align: center;
            color: #1f2937;
            margin-bottom: 16px;
            word-break: break-all;
        }
        .info { 
            color: #4b5563; 
            font-size: 16px;
            line-height: 1.5;
            text-align: center;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="message">✓ Email Already Verified</div>
        ${email ? `<div class="email">${email}</div>` : ''}
        <div class="info">Your email has already been verified. You can sign in now.</div>
    </div>
</body>
</html>
`;

const getSuccessPage = (email) => `
<!DOCTYPE html>
<html>
<head>
    <title>Email Verified</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 32px 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
            margin: 0 auto;
        }
        .success { 
            color: #16a34a; 
            font-size: 24px; 
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
        }
        .email { 
            background: #f3f4f6;
            padding: 12px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 16px;
            text-align: center;
            color: #1f2937;
            margin-bottom: 16px;
            word-break: break-all;
        }
        .info {
            color: #4b5563;
            font-size: 16px;
            line-height: 1.5;
            text-align: center;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="success">✓ Email Verified Successfully!</div>
        <div class="email">${email}</div>
        <div class="info">Your email has been verified. You can now sign in to your account.</div>
    </div>
</body>
</html>
`;

const getErrorPage = (message) => `
<!DOCTYPE html>
<html>
<head>
    <title>Verification Error</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 32px 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
            margin: 0 auto;
        }
        .error { 
            color: #dc2626; 
            font-size: 24px; 
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
        }
        .message {
            color: #4b5563;
            font-size: 16px;
            line-height: 1.5;
            text-align: center;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="error">✗ Verification Failed</div>
        <div class="message">${message || 'Something went wrong'}</div>
    </div>
</body>
</html>
`;

module.exports = {
    getAlreadyVerifiedPage,
    getSuccessPage,
    getErrorPage
};