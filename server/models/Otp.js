import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, 'Hashed OTP code is required'],
    },
    purpose: {
      type: String,
      enum: ['REGISTER', 'FORGOT_PASSWORD'],
      required: [true, 'OTP purpose is required'],
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // MongoDB TTL index: automatically deletes document once expiresAt time is reached
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Method to verify candidate plain 6-digit OTP against bcrypt hashed OTP in DB
otpSchema.methods.matchOtp = async function (candidateOtp) {
  if (!candidateOtp || !this.otp) return false;
  return await bcrypt.compare(candidateOtp, this.otp);
};

// Static helper method to hash plain 6-digit OTP
otpSchema.statics.hashOtp = async function (plainOtp) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainOtp, salt);
};

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
