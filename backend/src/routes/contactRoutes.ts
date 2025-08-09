import express from "express";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();
const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/", async (req, res) => {
   const { name, email, message, phone } = req.body;

    try {
        const data = await resend.emails.send({
            from: "Sport Store <onboarding@resend.dev>",
            to: process.env.EMAIL_RECEIVER!,
            subject: `📬 LIÊN HỆ từ ${name}`,
            text: `Tên: ${name}\nEmail: ${email}\nSĐT: ${phone}\n\nNội dung:\n${message}`,
        });

        res.status(200).json({ message: "Gửi email thành công!" });
    } catch (error: any) {
        console.error("Lỗi gửi email:", error);
        res.status(500).json({ message: "Lỗi gửi email", error: error.message });
    }
});

export default router;
