import React, { useState } from 'react';
import { Button, Input, Card } from '@/components/ui-elements';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useLang } from '@/i18n';
import { useAuth } from '@/lib/auth-context';

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);

  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const { t } = useLang();
  const { login, user } = useAuth();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/';
      }
    }
  }, [user]);

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) return;

    (window as any).recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
      }
    );
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) return;

    setLoadingPhone(true);

    try {
      setupRecaptcha();

      const appVerifier = (window as any).recaptchaVerifier;

      const formattedPhone = phone.startsWith('+')
        ? phone
        : `+972${phone.substring(1)}`;

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      setConfirmationResult(result);

      setStep('otp');

      toast({
        title: t.login.codeSent,
        description: 'تم إرسال رمز التحقق إلى هاتفك',
      });
    } catch (err: any) {
      toast({
        title: t.error,
        description: err.message || t.login.sendError,
        variant: 'destructive',
      });
    } finally {
      setLoadingPhone(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !confirmationResult) return;

    setLoadingOtp(true);

    try {
      await confirmationResult.confirm(otp);

      const adminNumbers = [
        '05XXXXXXXX',
      ];

      const isAdmin = adminNumbers.includes(phone);

login({
  uid: phone,
  phone,
  role: isAdmin ? 'admin' : 'customer',
} as any);

      if (isAdmin) {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/';
      }
    } catch {
      toast({
        title: t.error,
        description: t.login.invalidCode,
        variant: 'destructive',
      });
    } finally {
      setLoadingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Background"
          className="w-full h-full object-cover opacity-20 blur-sm"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-md"
      >
        <Card className="p-8 sm:p-10 backdrop-blur-xl bg-card/80 border-primary/20 shadow-2xl shadow-primary/10">
          <div className="text-center mb-8">
            <img
              src={`${import.meta.env.BASE_URL}images/lecker-logo.png`}
              alt="Lecker"
              className="h-20 w-20 mx-auto mb-4 drop-shadow-md"
            />

            <h1 className="text-2xl font-bold text-gold-gradient">
              {t.login.welcome}
            </h1>

            <p className="text-muted-foreground mt-2">
              {t.login.subtitle}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <Input
                label={t.login.phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                dir="ltr"
                className="text-center text-lg tracking-widest font-mono"
                required
              />

              <Button
                type="submit"
                className="w-full text-lg py-4"
                isLoading={loadingPhone}
              >
                {t.login.continue}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center mb-4 text-sm text-muted-foreground">
                {t.login.enterCode}

                <span
                  className="font-bold text-foreground"
                  dir="ltr"
                >
                  {phone}
                </span>

                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="block mx-auto mt-2 text-primary hover:underline"
                >
                  {t.login.editNumber}
                </button>
              </div>

              <Input
                label={t.login.otpLabel}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="------"
                dir="ltr"
                maxLength={6}
                className="text-center text-2xl tracking-[1em] font-mono font-bold"
                required
              />

              <Button
                type="submit"
                className="w-full text-lg py-4"
                isLoading={loadingOtp}
              >
                {t.login.confirmLogin}
              </Button>
            </form>
          )}

          <div id="recaptcha-container"></div>
        </Card>
      </motion.div>
    </div>
  );
}