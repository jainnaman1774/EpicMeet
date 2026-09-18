const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        const mailOptions = {
            from: `"EpicMeet" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `🎉 Booking Confirmed: ${eventTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
                    <h2 style="color: #4f46e5; text-align: center; margin-top: 0;">EpicMeet</h2>
                    <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 16px 0;" />
                    <h3 style="color: #111827;">Booking Confirmed!</h3>
                    <p style="color: #374151; font-size: 15px; line-height: 1.5;">Hello <strong>${userName}</strong>,</p>
                    <p style="color: #374151; font-size: 15px; line-height: 1.5;">
                        Your registration for <strong style="color: #4f46e5;">${eventTitle}</strong> has been successfully processed.
                    </p>
                    <div style="margin: 20px 0; padding: 16px; background-color: #f9fafb; border-left: 4px solid #4f46e5; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #111827;"><strong>Event:</strong> ${eventTitle}</p>
                        <p style="margin: 6px 0 0 0; font-size: 14px; color: #059669;"><strong>Status:</strong> Confirmed</p>
                    </div>
                    <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 30px;">
                        Need help? Contact support directly from your EpicMeet dashboard.<br/>
                        &copy; ${new Date().getFullYear()} EpicMeet. All rights reserved.
                    </p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Booking email sent to ${userEmail}`);
    } catch (error) {
        console.error(`Error sending booking email to ${userEmail}:`, error);
    }
};

const sendOtpEmail = async (email, otp, type) => {
    try {
        const isVerification = type === 'account_verification';
        const title = isVerification ? 'Account Verification' : 'Event Booking Verification';
        const subject = isVerification 
            ? '🔐 Verify Your EpicMeet Account' 
            : '🔐 Verify Your Booking OTP - EpicMeet';

        const mailOptions = {
            from: `"EpicMeet" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
                    <h2 style="color: #4f46e5; text-align: center; margin-top: 0;">EpicMeet</h2>
                    <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 16px 0;" />
                    <h3 style="color: #111827; text-align: center;">${title}</h3>
                    <p style="color: #374151; font-size: 15px; text-align: center;">
                        Use the verification code below to complete your ${isVerification ? 'account setup' : 'event booking'}:
                    </p>
                    <div style="text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; background-color: #eef2ff; padding: 12px 28px; border-radius: 6px; display: inline-block;">
                            ${otp}
                        </span>
                    </div>
                    <p style="color: #6b7280; font-size: 13px; text-align: center;">
                        This code will expire in 10 minutes. Please do not share this OTP with anyone.
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
                        &copy; ${new Date().getFullYear()} EpicMeet. All rights reserved.
                    </p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email} for ${type}`);
    } catch (error) {
        console.error(`Error sending OTP email to ${email} for ${type}:`, error);
    }
};

module.exports = { sendBookingEmail, sendOtpEmail };