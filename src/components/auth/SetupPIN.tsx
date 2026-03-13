'use client'

import { useState } from 'react'
import { Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { safeStorage, PIN_KEY, SESSION_KEY } from '@/lib/storage'

interface SetupPINProps {
  onComplete: (pin: string) => void
  onCancel?: () => void
}

export function SetupPIN({ onComplete, onCancel }: SetupPINProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (step === 1) {
      if (pin.length < 4) {
        setError('PIN minimal 4 digit')
        setLoading(false)
        return
      }
      setStep(2)
      setLoading(false)
    } else {
      if (pin !== confirmPin) {
        setError('PIN tidak cocok. Silakan coba lagi.')
        setLoading(false)
        return
      }

      // Save PIN and session using safe storage
      const pinSaved = safeStorage.setItem(PIN_KEY, pin)
      const sessionSaved = safeStorage.setItem(SESSION_KEY, Date.now().toString())
      
      if (pinSaved && sessionSaved) {
        // Small delay to ensure state is saved
        setTimeout(() => {
          onComplete(pin)
        }, 100)
      } else {
        setError('Gagal menyimpan PIN. Silakan coba lagi.')
        setLoading(false)
      }
    }
  }

  const handlePinChange = (value: string, isConfirm = false) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    if (isConfirm) {
      setConfirmPin(numericValue)
    } else {
      setPin(numericValue)
    }
    setError('')
  }

  const handleBack = () => {
    setStep(1)
    setConfirmPin('')
    setError('')
  }

  const getStrength = (value: string) => {
    if (value.length < 4) return { level: 'weak', color: 'text-red-400', text: 'Lemah' }
    if (value.length < 6) return { level: 'medium', color: 'text-yellow-400', text: 'Sedang' }
    return { level: 'strong', color: 'text-green-400', text: 'Kuat' }
  }

  const currentPin = step === 1 ? pin : confirmPin
  const strength = step === 1 ? getStrength(pin) : null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 dark:bg-gradient-to-br dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border border-primary/30 shadow-2xl shadow-primary/20 dark:from-slate-900/95 dark:to-slate-800/95 dark:border-cyan-500/30 dark:shadow-cyan-500/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-primary/50 dark:from-cyan-500/20 dark:to-purple-500/20 dark:border-cyan-500/50">
            {step === 1 ? (
              <Lock className="w-10 h-10 text-primary dark:text-cyan-400" />
            ) : (
              <Shield className="w-10 h-10 text-primary dark:text-cyan-400" />
            )}
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400">
              Setup PIN
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-sm">
              {step === 1
                ? 'Buat PIN baru untuk melindungi aplikasi'
                : 'Konfirmasi PIN yang baru dibuat'}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                      currentPin.length >= i
                        ? 'border-primary bg-primary/10 text-primary dark:border-cyan-400 dark:bg-cyan-500/10 dark:text-cyan-400'
                        : 'border-border bg-muted'
                    }`}
                  >
                    {currentPin.length >= i ? '•' : ''}
                  </div>
                ))}
              </div>
              <Input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={step === 1 ? 'Buat PIN (4-6 digit)' : 'Konfirmasi PIN'}
                value={currentPin}
                onChange={(e) => handlePinChange(e.target.value, step === 2)}
                className="bg-muted border-primary/30 text-foreground text-center text-2xl tracking-[0.5em] placeholder:text-muted-foreground focus:border-primary dark:bg-slate-800/50 dark:border-cyan-500/30 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                maxLength={6}
                autoFocus
              />
            </div>

            {step === 1 && strength && pin.length > 0 && (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className={`w-4 h-4 ${strength.color}`} />
                <p className={`text-sm ${strength.color}`}>Kekuatan PIN: {strength.text}</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-muted dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  disabled={loading}
                >
                  Kembali
                </Button>
              )}
              <Button
                type="submit"
                disabled={currentPin.length < 4 || loading}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-primary/25 border-0 h-12 text-lg dark:shadow-cyan-500/25"
              >
                {loading ? 'Memproses...' : step === 1 ? 'Lanjut' : 'Selesai'}
              </Button>
            </div>

            {onCancel && step === 1 && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors dark:hover:text-cyan-400"
              >
                Batalkan
              </button>
            )}

            <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-xs text-muted-foreground">
                PIN akan disimpan secara aman di perangkat ini
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
