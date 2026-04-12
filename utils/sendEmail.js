const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
    
    const configs = [{
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
            
            lookup: (hostname, options, cb) => {
                require('dns').lookup(hostname, { family: 4 }, cb);
            }
        },
        {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        },
        {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        }
    ];
    
    for (const config of configs) {
        try {
            const transporter = nodemailer.createTransport(config);
            transporter.verify((error) => {
                if (!error) {
                    console.log(' Using email configuration:', config.host || config.service);
                }
            });
            return transporter;
        } catch (e) {
            console.log(' Config failed, trying next...');
        }
    }
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

const transporter = createTransporter();

const sendVerificationEmail = async (email, token) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
    
    const mailOptions = {
        from: `"Coffee Shop" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: 'Verify Your Email Address - Coffee Shop',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Welcome to Coffee Shop!</h2>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>Or copy and paste this link: ${verificationUrl}</p>
            </div>
        `
    };

    try {
        console.log(` Sending email to: ${email}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(' Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error(' Error sending email:', error);
        
        // Provide helpful troubleshooting
        if (error.code === 'ESOCKET' || error.code === 'ECONNREFUSED') {
            console.log('\n🔧 Troubleshooting steps:');
            console.log('1. Check your internet connection');
            console.log('2. Temporarily disable firewall/antivirus');
            console.log('3. Try using a VPN (some networks block SMTP)');
            console.log('4. Check if your ISP blocks port 587/465');
            console.log('5. Try using Ethereal for testing instead:\n');
            console.log('   npm install nodemailer --save');
            console.log('   Then use this test code:');
            console.log(`
   const testAccount = await nodemailer.createTestAccount();
   const transporter = nodemailer.createTransport({
       host: 'smtp.ethereal.email',
       port: 587,
       auth: {
           user: testAccount.user,
           pass: testAccount.pass
       }
   });`);
        }
        
        return false;
    }
};

module.exports = { sendVerificationEmail };