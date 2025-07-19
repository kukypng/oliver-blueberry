interface BudgetData {
  id: string;
  device_model: string;
  device_type: string;
  
  part_type?: string;
  part_quality?: string;
  cash_price: number;
  installment_price?: number;
  installments?: number;
  total_price: number;
  warranty_months: number;
  payment_condition?: string;
  includes_delivery: boolean;
  includes_screen_protector: boolean;
  delivery_date?: string;
  notes?: string;
  status: string;
  workflow_status: string;
  created_at: string;
  valid_until: string;
  expires_at?: string;
}

export const generateWhatsAppMessage = (budget: BudgetData): string => {
  const createdDate = new Date(budget.created_at).toLocaleDateString('pt-BR');
  const validUntil = budget.valid_until ? new Date(budget.valid_until).toLocaleDateString('pt-BR') : 'Não definido';
  
  // Formatação de preços
  const totalPrice = (budget.total_price / 100).toLocaleString('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  });
  
  const cashPrice = budget.cash_price ? (budget.cash_price / 100).toLocaleString('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }) : totalPrice;
  
  // Garantia
  const warrantyText = budget.warranty_months === 1 
    ? `${budget.warranty_months} mês` 
    : `${budget.warranty_months} meses`;

  // Seção de valores
  let valuesSection = `• *Total:* R$ ${totalPrice}`;
  if (budget.cash_price && budget.cash_price !== budget.total_price) {
    valuesSection += `\n• *À vista:* R$ ${cashPrice}`;
  }
  
  if (budget.installment_price && budget.installments && budget.installments > 1) {
    const installmentPrice = (budget.installment_price / 100).toLocaleString('pt-BR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
    valuesSection += `\n• *Parcelado:* R$ ${installmentPrice} em até ${budget.installments}x no cartão`;
  }

  // Qualidade da peça e observações
  let qualityInfo = budget.part_quality ? `*Qualidade da peça:* ${budget.part_quality}` : '';
  let obsInfo = budget.notes ? `\n*Obs:* ${budget.notes}` : '';

  // Serviços inclusos
  let includedServices = '';
  const services = [];
  if (budget.includes_delivery) {
    services.push('▪︎ Busca e entrega');
  }
  if (budget.includes_screen_protector) {
    services.push('▪︎ Película 3D de brinde');
  }
  
  if (services.length > 0) {
    includedServices = `\n\n📦 *Serviços inclusos:*\n${services.join('\n')}`;
  }

  const message = `● *Criado em:* ${createdDate}
● *Válido até:* ${validUntil}

*Aparelho:* ${budget.device_model}
${qualityInfo}${obsInfo}

💰 *VALORES*
${valuesSection}

✅️ *Garantia:* ${warrantyText}
🚫 *Não cobre danos por água ou quedas*${includedServices}`;

  return message;
};

export const shareViaWhatsApp = (message: string) => {
  const encodedMessage = encodeURIComponent(message);
  
  // Detectar se é mobile para usar o app nativo ou web
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  let whatsappUrl: string;
  
  if (isMobile) {
    // Para mobile, usar scheme do app nativo que permite seleção de contato
    whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    
    // Tentar abrir o app nativo primeiro
    window.location.href = whatsappUrl;
    
    // Fallback para WhatsApp Web após um delay se o app não abrir
    setTimeout(() => {
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    }, 1500);
  } else {
    // Para desktop, usar WhatsApp Web que permite seleção de contato
    whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
};

export const sharePDFViaWhatsApp = async (pdfBlob: Blob, message: string) => {
  try {
    // Verificar se a Web Share API está disponível
    if (navigator.share && navigator.canShare) {
      const file = new File([pdfBlob], 'orcamento.pdf', { type: 'application/pdf' });
      
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Orçamento',
          text: message,
          files: [file]
        });
        return;
      }
    }

    // Fallback: criar URL temporária para download e abrir WhatsApp
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.download = `orcamento-${new Date().toISOString().split('T')[0]}.pdf`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Aguardar um pouco e abrir WhatsApp
    setTimeout(() => {
      const encodedMessage = encodeURIComponent(`${message}\n\n `);
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      URL.revokeObjectURL(pdfUrl);
    }, 1000);
    
  } catch (error) {
    console.error('Erro ao compartilhar PDF:', error);
    // Fallback para o método tradicional
    shareViaWhatsApp(message);
  }
};
