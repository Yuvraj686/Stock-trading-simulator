import { useState, useRef, useEffect } from "react";
import { X, DollarSign, ArrowDownToLine, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "@/context/PortfolioContext";
import { fmtUSD } from "@/lib/marketData";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

const PRESETS = [1000, 5000, 10000, 25000, 50000];

export function DepositModal({ open, onClose }: DepositModalProps) {
  const { cash, deposit } = usePortfolio();
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setAmount("");
      setSuccess(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const numericAmount = parseFloat(amount.replace(/,/g, ""));
  const isValid = !isNaN(numericAmount) && numericAmount > 0;

  const handleDeposit = () => {
    if (!isValid) return;
    deposit(numericAmount);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handlePreset = (value: number) => {
    setAmount(value.toLocaleString("en-US"));
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 glass-card p-0 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <ArrowDownToLine className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Deposit Funds</h2>
              <p className="text-xs text-muted-foreground">Add virtual cash to your portfolio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          /* Success state */
          <div className="p-8 flex flex-col items-center gap-4 animate-fade-up">
            <div className="h-16 w-16 rounded-full bg-bull/15 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-bull animate-scale-in" />
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold text-foreground">Deposit Successful!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {fmtUSD(numericAmount)} has been added to your account
              </p>
            </div>
          </div>
        ) : (
          /* Form */
          <div className="p-6 space-y-5">
            {/* Current Balance */}
            <div className="rounded-xl bg-surface p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Current Cash Balance</div>
              <div className="font-display text-2xl font-bold tabular-nums text-foreground mt-1">
                {fmtUSD(cash)}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">
                Deposit Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.,]/g, "");
                    setAmount(val);
                  }}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-3 pl-9 text-lg font-mono tabular-nums text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Preset Amounts */}
            <div>
              <div className="text-xs text-muted-foreground mb-2">Quick select</div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePreset(preset)}
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-mono font-semibold text-foreground hover:bg-surface-elevated hover:border-primary/30 transition-all active:scale-95"
                  >
                    {fmtUSD(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* New balance preview */}
            {isValid && (
              <div className="rounded-xl bg-bull/8 border border-bull/20 p-3 animate-fade-up">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">New Balance</span>
                  <span className="font-display font-bold tabular-nums text-bull">
                    {fmtUSD(cash + numericAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleDeposit}
              disabled={!isValid}
              className="w-full gradient-primary text-primary-foreground hover:opacity-90 shadow-glow py-3 text-base font-semibold disabled:opacity-40 disabled:shadow-none transition-all"
            >
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              {isValid ? `Deposit ${fmtUSD(numericAmount)}` : "Enter an amount"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
