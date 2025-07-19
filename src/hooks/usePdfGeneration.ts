
import { useState } from 'react';
import { generateBudgetPDF, generatePDFImage } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/useToast';
import { useShopProfile } from '@/hooks/useShopProfile';
import { sharePDFViaWhatsApp, generateWhatsAppMessage } from '@/utils/whatsappUtils';

interface BudgetData {
  id: string;
  device_model: string;
  device_type: string;
  part_quality?: string;
  cash_price: number;
  installment_price?: number;
  installments?: number;
  warranty_months: number;
  created_at: string;
  valid_until: string;
  client_name?: string;
  client_phone?: string;
}

export const usePdfGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showSuccess, showError, showWarning } = useToast();
  const { shopProfile } = useShopProfile();

  const generateAndSharePDF = async (budget: BudgetData) => {
    if (!shopProfile) {
      showWarning({
        title: 'Perfil da empresa não configurado',
        description: 'Configure o perfil da sua empresa nas configurações antes de gerar PDFs.',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const pdfData = {
        // Dados do orçamento
        device_model: budget.device_model,
        device_type: budget.device_type,
        part_quality: budget.part_quality,
        cash_price: budget.cash_price,
        installment_price: budget.installment_price,
        installments: budget.installments,
        warranty_months: budget.warranty_months,
        created_at: budget.created_at,
        valid_until: budget.valid_until,
        client_name: budget.client_name,
        client_phone: budget.client_phone,
        
        // Dados da loja
        shop_name: shopProfile.shop_name,
        shop_address: shopProfile.address,
        shop_phone: shopProfile.contact_phone,
        shop_cnpj: shopProfile.cnpj,
        shop_logo_url: shopProfile.logo_url,
      };

      // Gerar PDF usando o template
      const pdfBlob = await generateBudgetPDF(pdfData);
      
      // Criar mensagem para WhatsApp
      const whatsappMessage = generateWhatsAppMessage({
        id: budget.id,
        device_model: budget.device_model,
        device_type: budget.device_type,
        
        part_type: budget.device_type,
        part_quality: budget.part_quality,
        cash_price: budget.cash_price,
        installment_price: budget.installment_price,
        installments: budget.installments || 1,
        total_price: budget.cash_price,
        warranty_months: budget.warranty_months,
        payment_condition: 'À vista',
        includes_delivery: false,
        includes_screen_protector: false,
        status: 'pending',
        workflow_status: 'pending',
        created_at: budget.created_at,
        valid_until: budget.valid_until
      });

      // Compartilhar PDF via WhatsApp usando a nova API
      await sharePDFViaWhatsApp(pdfBlob, whatsappMessage);
      
      showSuccess({
        title: 'PDF compartilhado com sucesso!',
        description: 'O PDF foi gerado e está sendo compartilhado via WhatsApp.',
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showError({
        title: 'Erro ao gerar PDF',
        description: 'Ocorreu um erro ao gerar o PDF do orçamento. Tente novamente.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDFOnly = async (budget: BudgetData): Promise<Blob | null> => {
    if (!shopProfile) {
      showWarning({
        title: 'Perfil da empresa não configurado',
        description: 'Configure o perfil da sua empresa nas configurações antes de gerar PDFs.',
      });
      return null;
    }

    setIsGenerating(true);

    try {
      const pdfData = {
        // Dados do orçamento
        device_model: budget.device_model,
        device_type: budget.device_type,
        part_quality: budget.part_quality,
        cash_price: budget.cash_price,
        installment_price: budget.installment_price,
        installments: budget.installments,
        warranty_months: budget.warranty_months,
        created_at: budget.created_at,
        valid_until: budget.valid_until,
        client_name: budget.client_name,
        client_phone: budget.client_phone,
        
        // Dados da loja
        shop_name: shopProfile.shop_name,
        shop_address: shopProfile.address,
        shop_phone: shopProfile.contact_phone,
        shop_cnpj: shopProfile.cnpj,
        shop_logo_url: shopProfile.logo_url,
      };

      const pdfBlob = await generateBudgetPDF(pdfData);
      
      showSuccess({
        title: 'PDF gerado com sucesso!',
        description: 'O arquivo PDF foi criado com os dados do orçamento.',
      });
      
      return pdfBlob;
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showError({
        title: 'Erro ao gerar PDF',
        description: 'Ocorreu um erro ao gerar o PDF do orçamento. Tente novamente.',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAndSharePDF,
    generatePDFOnly,
    isGenerating,
  };
};
