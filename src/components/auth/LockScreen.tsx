'use client'

import { useState } from 'react'
import { Lock, Shield, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { safeStorage, SESSION_KEY } from '@/lib/storage'

interface LockScreenProps {
  onUnlock: () => void
  storedPin: string
  onForgotPin?: () => void
}

export function LockScreen({ onUnlock, storedPin, onForgotPin }: LockScreenProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simple client-side verification
    if (pin === storedPin) {
      // Save session using safe storage
      const success = safeStorage.setItem(SESSION_KEY, Date.now().toString())
      
      if (success) {
        // Small delay to ensure state is saved
        setTimeout(() => {
          onUnlock()
        }, 100)
      } else {
        setError('Gagal menyimpan sesi. Silakan coba lagi.')
        setLoading(false)
      }
    } else {
      setError('PIN salah. Silakan coba lagi.')
      setPin('')
      setLoading(false)
    }
  }

  const handlePinChange = (value: string) => {
    // Only allow numbers and max 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setPin(numericValue)
    setError('')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 dark:bg-gradient-to-br dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border border-primary/30 shadow-2xl shadow-primary/20 dark:from-slate-900/95 dark:to-slate-800/95 dark:border-cyan-500/30 dark:shadow-cyan-500/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-primary/50 dark:from-cyan-500/20 dark:to-purple-500/20 dark:border-cyan-500/50">
            <Lock className="w-10 h-10 text-primary dark:text-cyan-400" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400">
              FinanceHub
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-sm">Masukkan PIN untuk membuka</p>
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
                      pin.length >= i
                        ? 'border-primary bg-primary/10 text-primary dark:border-cyan-400 dark:bg-cyan-500/10 dark:text-cyan-400'
                        : 'border-border bg-muted'
                    }`}
                  >
                    {pin.length >= i ? '•' : ''}
                  </div>
                ))}
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                className="sr-only"
                autoFocus
              />
              <Input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Masukkan 6 digit PIN"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                className="bg-muted border-primary/30 text-foreground text-center text-2xl tracking-[0.5em] placeholder:text-muted-foreground focus:border-primary dark:bg-slate-800/50 dark:border-cyan-500/30 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                maxLength={6}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={pin.length < 4 || loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-primary/25 border-0 h-12 text-lg dark:shadow-cyan-500/25"
            >
              {loading ? 'Memverifikasi...' : 'Buka'}
            </Button>

            {onForgotPin && (
              <button
                type="button"
                onClick={onForgotPin}
                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors dark:hover:text-cyan-400"
              >
                Lupa PIN?
              </button>
            )}

            <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-xs text-muted-foreground">Aplikasi ini dilindungi dengan PIN</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
