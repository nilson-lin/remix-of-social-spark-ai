import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(false);

  const sessionId = searchParams.get("session_id") || "";

  useEffect(() => {
    const verifyAndAddCredits = async () => {
      if (!sessionId) {
        setError(true);
        setIsProcessing(false);
        return;
      }

      try {
        const { error } = await supabase.functions.invoke("add-credits", {
          body: { session_id: sessionId },
        });

        if (error) throw error;

        await refreshProfile();

        toast({
          title: "Pagamento confirmado!",
          description: "Seus créditos foram adicionados à sua conta.",
        });
      } catch (err) {
        console.error("Error adding credits:", err);
        setError(true);
        toast({
          title: "Erro ao processar",
          description: "Entre em contato com o suporte.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    verifyAndAddCredits();
  }, [sessionId, refreshProfile, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 rounded-2xl text-center max-w-md w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Processando pagamento...</h1>
            <p className="text-muted-foreground">Aguarde enquanto verificamos seu pagamento.</p>
          </>
        ) : error ? (
          <>
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Erro no processamento</h1>
            <p className="text-muted-foreground mb-6">
              Não foi possível verificar seu pagamento. Entre em contato com o suporte.
            </p>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Voltar ao Dashboard
            </Button>
          </>
        ) : (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Pagamento realizado com sucesso!</h1>
            <p className="text-muted-foreground mb-6">
              Seus créditos foram adicionados à sua conta.
            </p>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Ir para o Dashboard
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
