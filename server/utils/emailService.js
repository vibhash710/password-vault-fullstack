const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// Verify SMTP connection
transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP connection error:", error);
    } else {
        console.log("SMTP server ready to send emails");
    }
});

// Send verification OTP email
const sendVerificationOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Password Vault" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - Password Vault',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background: white;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 40px 20px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .otp-box {
                            background: #f8f9fa;
                            border: 2px dashed #667eea;
                            border-radius: 8px;
                            padding: 30px;
                            text-align: center;
                            margin: 30px 0;
                        }
                        .otp-code {
                            font-size: 36px;
                            font-weight: bold;
                            color: #667eea;
                            letter-spacing: 8px;
                            font-family: 'Courier New', monospace;
                        }
                        .warning {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .footer {
                            background: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #6c757d;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Verify Your Email</h1>
                        </div>
                        <div class="content">
                            <p>Thank you for signing up for Password Vault. To complete your registration, please verify your email address using the code below:</p>
                            
                            <div class="otp-box">
                                <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">Your Verification Code</p>
                                <div class="otp-code">${otp}</div>
                            </div>

                            <p><strong>Important:</strong></p>
                            <ul>
                                <li>This code will expire in <strong>10 minutes</strong></li>
                                <li>Enter this code on the verification page</li>
                                <li>Do not share this code with anyone</li>
                            </ul>

                            <div class="warning">
                                ⚠️ <strong>Security Note:</strong> If you didn't create an account with Password Vault, please ignore this email.
                            </div>

                            <p>Need help? Visit our Contact page inside the app.</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Password Vault. All rights reserved.</p>
                            <p>This is an automated email, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return info;

    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send verification email');
    }
};

// Send password reset OTP
const sendPasswordResetOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Password Vault" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset Your Password - Password Vault',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background: white;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 40px 20px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .otp-box {
                            background: #f8f9fa;
                            border: 2px dashed #667eea;
                            border-radius: 8px;
                            padding: 30px;
                            text-align: center;
                            margin: 30px 0;
                        }
                        .otp-code {
                            font-size: 36px;
                            font-weight: bold;
                            color: #667eea;
                            letter-spacing: 8px;
                            font-family: 'Courier New', monospace;
                        }
                        .warning {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .footer {
                            background: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #6c757d;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔑 Reset Your Password</h1>
                        </div>
                        <div class="content">
                            <p>We received a request to reset your password. Use the code below to proceed:</p>
                            
                            <div class="otp-box">
                                <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">Your Reset Code</p>
                                <div class="otp-code">${otp}</div>
                            </div>

                            <p><strong>Important:</strong></p>
                            <ul>
                                <li>This code will expire in <strong>10 minutes</strong></li>
                                <li>If you didn't request this, ignore this email</li>
                                <li>Your password won't change until you complete the reset</li>
                            </ul>

                            <div class="warning">
                                ⚠️ <strong>Security Note:</strong> Never share this code with anyone, including our support team.
                            </div>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Password Vault. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        return info;

    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    sendVerificationOTP,
    sendPasswordResetOTP
};