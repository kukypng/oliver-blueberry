
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface BudgetPDFData {
  // Dados do orçamento
  device_model: string;
  device_type: string;
  
  part_quality?: string;
  cash_price: number;
  installment_price?: number;
  installments?: number;
  payment_condition?: string;
  warranty_months: number;
  includes_delivery?: boolean;
  includes_screen_protector?: boolean;
  created_at: string;
  valid_until: string;
  notes?: string;
  client_name?: string;
  client_phone?: string;
  
  // Dados da loja
  shop_name: string;
  shop_address: string;
  shop_phone: string;
  shop_cnpj?: string;
  shop_logo_url?: string;
}

interface PdfGenerationOptions {
  format?: 'pdf' | 'image';
  quality?: number;
  scale?: number;
}

export const generateBudgetPDF = async (
  data: BudgetPDFData, 
  options: PdfGenerationOptions = {}
): Promise<Blob> => {
  const { format = 'pdf' } = options;
  
  try {
    if (format === 'image') {
      const imageDataUrl = await generatePDFImage(data);
      const response = await fetch(imageDataUrl);
      return await response.blob();
    }
    
    return await generateSimplePDF(data);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Falha ao gerar PDF: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
};

const generateSimplePDF = async (data: BudgetPDFData): Promise<Blob> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Usar cores neutras
  const colors = {
    black: [0, 0, 0],
    darkGray: [64, 64, 64],
    lightGray: [128, 128, 128],
    veryLightGray: [240, 240, 240],
    white: [255, 255, 255]
  };

  // Função auxiliar para placeholder da logo
  const renderLogoPlaceholder = (doc: any, colors: any) => {
    // Container com gradiente sutil
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(13, 5, 24, 24, 3, 3, 'F');
    
    // Borda
    doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(13, 5, 24, 24, 3, 3, 'S');
    
    // Ícone de imagem estilizado
    doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.setLineWidth(1);
    
    // Desenhar ícone de imagem
    doc.rect(19, 11, 12, 8, 'S');
    doc.circle(22, 14, 1.5, 'S');
    doc.line(20, 17, 23, 14);
    doc.line(23, 14, 26, 17);
    doc.line(26, 17, 30, 17);
    
    // Texto "LOGO"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.text('LOGO', 25, 24, { align: 'center' });
  };

  // HEADER PRINCIPAL - Design simples
  doc.setFillColor(colors.veryLightGray[0], colors.veryLightGray[1], colors.veryLightGray[2]);
  doc.rect(0, 0, 210, 35, 'F');
  
  // Logo com design profissional
  if (data.shop_logo_url) {
    try {
      // Carregar a logo com tratamento para CORS
      const logoResponse = await fetch(data.shop_logo_url, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!logoResponse.ok) {
        throw new Error('Failed to fetch logo');
      }
      
      const logoBlob = await logoResponse.blob();
      const logoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(logoBlob);
      });
      
      // Container elegante para a logo
      doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.roundedRect(13, 5, 24, 24, 3, 3, 'F');
      
      // Borda sutil
      doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(13, 5, 24, 24, 3, 3, 'S');
      
      // Logo centralizada com padding
      doc.addImage(logoBase64, 'JPEG', 15, 7, 20, 20, undefined, 'MEDIUM');
      
    } catch (error) {
      console.warn('Erro ao carregar logo:', error);
      // Fallback elegante
      renderLogoPlaceholder(doc, colors);
    }
  } else {
    renderLogoPlaceholder(doc, colors);
  }
  
  // Nome da empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text(data.shop_name || 'Nome da Empresa', 45, 15);
  
  // Subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.text('Assistência Técnica Especializada', 45, 22);
  
  // Informações de contato no header
  doc.setFontSize(8);
  let contactY = 25;
  if (data.shop_cnpj) {
    doc.text(`CNPJ: ${data.shop_cnpj}`, 45, contactY);
    contactY += 3;
  }
  if (data.shop_phone) {
    doc.text(`Telefone: ${data.shop_phone}`, 45, contactY);
    contactY += 3;
  }
  if (data.shop_address) {
    doc.text(data.shop_address, 45, contactY);
  }

  // TÍTULO DO DOCUMENTO
  let yPos = 50;
  doc.setFillColor(colors.veryLightGray[0], colors.veryLightGray[1], colors.veryLightGray[2]);
  doc.rect(15, yPos - 5, 180, 15, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text('ORÇAMENTO DE SERVIÇO', 105, yPos + 5, { align: 'center' });

  // SEÇÃO DE INFORMAÇÕES BÁSICAS
  yPos += 25;
  
  // Container das datas
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.rect(15, yPos, 180, 15, 'FD');
  
  const createdDate = new Date(data.created_at).toLocaleDateString('pt-BR');
  const validDate = new Date(data.valid_until).toLocaleDateString('pt-BR');
  
  // Data de emissão
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.text('DATA DE EMISSÃO', 20, yPos + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text(createdDate, 20, yPos + 12);
  
  // Válido até
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.text('VÁLIDO ATÉ', 120, yPos + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.text(validDate, 120, yPos + 12);

  // SEÇÃO CLIENTE (se houver)
  yPos += 25;
  if (data.client_name || data.client_phone) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.text('DADOS DO CLIENTE', 15, yPos);
    
    yPos += 8;
    doc.setFillColor(colors.veryLightGray[0], colors.veryLightGray[1], colors.veryLightGray[2]);
    doc.rect(15, yPos, 180, 15, 'F');
    
    let clientText = '';
    if (data.client_name) {
      clientText = data.client_name;
    }
    if (data.client_phone) {
      clientText += data.client_name ? ` • ${data.client_phone}` : data.client_phone;
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.text(clientText, 20, yPos + 8);
    yPos += 20;
  }

  // SEÇÃO DETALHES DO SERVIÇO
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text('DETALHES DO SERVIÇO', 15, yPos);
  
  yPos += 10;
  
  // Tabela de detalhes completa
  const tableData = [
    ['Modelo', data.device_model]
  ];
  
  // Adicionar qualidade da peça se houver
  if (data.part_quality && data.part_quality.trim()) {
    tableData.push(['Qualidade da peça', data.part_quality]);
  }
  
  // Adicionar observações se houver
  if (data.notes && data.notes.trim()) {
    tableData.push(['Obs', data.notes]);
  }
  
  // Header da tabela
  doc.setFillColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.rect(15, yPos, 180, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text('ITEM', 20, yPos + 6);
  doc.text('DESCRIÇÃO', 80, yPos + 6);
  
  yPos += 10;
  
  // Linhas da tabela
  tableData.forEach((row, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(
      isEven ? colors.white[0] : colors.veryLightGray[0],
      isEven ? colors.white[1] : colors.veryLightGray[1],
      isEven ? colors.white[2] : colors.veryLightGray[2]
    );
    doc.rect(15, yPos, 180, 8, 'F');
    
    // Bordas
    doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.setLineWidth(0.1);
    doc.rect(15, yPos, 180, 8, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.text(row[0], 20, yPos + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.text(row[1], 80, yPos + 5);
    
    yPos += 8;
  });

  // SEÇÃO VALORES
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text('VALORES DO SERVIÇO', 15, yPos);
  
  yPos += 10;
  
  // Container dos valores - altura dinâmica baseada no conteúdo
  const hasInstallment = data.installment_price && data.installments && data.installments > 1;
  const hasPaymentCondition = data.payment_condition && data.payment_condition !== 'À vista';
  let containerHeight = 15;
  if (hasInstallment) containerHeight += 12;
  if (hasPaymentCondition) containerHeight += 8;
  
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setDrawColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos, 180, containerHeight, 'FD');
  
  // Valor à vista
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.text('VALOR À VISTA', 20, yPos + 8);
  
  const cashPrice = (data.cash_price / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text(cashPrice, 70, yPos + 8);
  
  let currentY = yPos + 8;
  
  // Valor parcelado (se houver)
  if (hasInstallment) {
    currentY += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.text('VALOR PARCELADO', 20, currentY);
    
    const installmentPrice = (data.installment_price / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.text(`${installmentPrice} em ${data.installments}x`, 70, currentY);
  }
  
  // Metodo de pagamento (se diferente de à vista)
  if (hasPaymentCondition) {
    currentY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
    doc.text(`Método: ${data.payment_condition}`, 20, currentY);
  }

  // SEÇÃO GARANTIA
  yPos += containerHeight + 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text('GARANTIA', 15, yPos);
  
  yPos += 8;
  doc.setFillColor(colors.veryLightGray[0], colors.veryLightGray[1], colors.veryLightGray[2]);
  doc.rect(15, yPos, 180, 12, 'F');
  
  const warrantyText = data.warranty_months === 1 
    ? `${data.warranty_months} mês` 
    : `${data.warranty_months} meses`;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text(`Prazo: ${warrantyText}`, 20, yPos + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.text('* Garantia não cobre danos por queda, impacto ou líquidos', 20, yPos + 9);

  // SEÇÃO SERVIÇOS INCLUSOS - apenas se houver serviços inclusos
  const includedServices = [];
  if (data.includes_delivery) includedServices.push('Busca e entrega do aparelho');
  if (data.includes_screen_protector) includedServices.push('Película de proteção de brinde');
  
  if (includedServices.length > 0) {
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.text('SERVIÇOS INCLUSOS', 15, yPos);
    
    yPos += 8;
    const includesHeight = includedServices.length * 8 + 4;
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setDrawColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
    doc.setLineWidth(0.3);
    doc.rect(15, yPos, 180, includesHeight, 'FD');
    
    // Renderizar cada serviço incluso
    includedServices.forEach((service, index) => {
      const itemY = yPos + 6 + (index * 8);
      
      // Checkmark
      doc.setFillColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      doc.circle(22, itemY, 1.5, 'F');
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('✓', 22, itemY + 1, { align: 'center' });
      
      // Texto do serviço
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
      doc.text(service, 28, itemY + 1);
    });
    
    yPos += includesHeight;
  }

  // RODAPÉ SIMPLES
  yPos += 35;
  
  // Linha decorativa
  doc.setDrawColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.setLineWidth(0.5);
  doc.line(15, yPos, 195, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text('Agradecemos pela preferência!', 105, yPos, { align: 'center' });
  
  // Converter para blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

export const generatePDFImage = async (data: BudgetPDFData): Promise<string> => {
  try {
    // Criar um elemento HTML temporário para capturar como imagem
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 794px;
      height: 1123px;
      background: white;
      padding: 40px;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      box-sizing: border-box;
      color: #111827;
    `;
    
    const cashPrice = (data.cash_price / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    let installmentSection = '';
    if (data.installment_price && data.installments && data.installments > 1) {
      const installmentPrice = (data.installment_price / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
      installmentSection = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding: 15px; background: #f0f0f0; border-radius: 8px; border: 1px solid #ccc;">
          <div>
            <p style="margin: 0; font-size: 12px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">VALOR PARCELADO</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #000;">${installmentPrice}</p>
          </div>
          <div style="background: #666; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;">
            ${data.installments}x
          </div>
        </div>
      `;
    }
    
    const warrantyText = data.warranty_months === 1 
      ? `${data.warranty_months} mês` 
      : `${data.warranty_months} meses`;
    
    const createdDate = new Date(data.created_at).toLocaleDateString('pt-BR');
    const validDate = new Date(data.valid_until).toLocaleDateString('pt-BR');
    
    // Logo section com design profissional
    const logoSection = data.shop_logo_url ? 
      `<div style="width: 60px; height: 60px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 20px; padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e5e5e5;">
        <img src="${data.shop_logo_url}" alt="Logo da empresa" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px;" />
      </div>` :
      `<div style="width: 60px; height: 60px; background: #f8f8f8; border: 2px dashed #ccc; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-right: 20px; font-weight: bold; color: #666; font-size: 8px; gap: 4px;">
        <div style="width: 20px; height: 16px; border: 1px solid #ccc; border-radius: 2px; position: relative;">
          <div style="width: 6px; height: 6px; border: 1px solid #ccc; border-radius: 50%; position: absolute; top: 2px; left: 2px;"></div>
          <div style="width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent; border-bottom: 4px solid #ccc; position: absolute; bottom: 2px; right: 2px;"></div>
        </div>
        <span>LOGO</span>
      </div>`;
    
    tempDiv.innerHTML = `
      <!-- Header Principal -->
      <div style="background: #f0f0f0; padding: 25px; border-radius: 8px; margin-bottom: 30px; color: #000;">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          ${logoSection}
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #000;">${data.shop_name}</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Assistência Técnica Especializada</p>
          </div>
        </div>
        <div style="font-size: 12px; color: #666; line-height: 1.4;">
          ${data.shop_cnpj ? `<div>CNPJ: ${data.shop_cnpj}</div>` : ''}
          <div>${data.shop_address} | ${data.shop_phone}</div>
        </div>
      </div>
      
      <!-- Título do Documento -->
      <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #f0f0f0; border-radius: 8px;">
        <h2 style="margin: 0; font-size: 20px; color: #000; font-weight: bold;">ORÇAMENTO DE SERVIÇO</h2>
      </div>
      
      <!-- Informações Básicas -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase;">Data de Emissão</p>
          <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: bold; color: #000;">${createdDate}</p>
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #666; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase;">Válido Até</p>
          <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: bold; color: #666;">${validDate}</p>
        </div>
      </div>
      
      ${data.client_name || data.client_phone ? `
        <div style="margin-bottom: 30px; background: #f8f8f8; padding: 20px; border-radius: 8px; border-left: 4px solid #666;">
          <h3 style="color: #000; margin: 0 0 15px 0; font-size: 16px; font-weight: bold; text-transform: uppercase;">Dados do Cliente</h3>
          <div style="font-size: 14px; color: #000; line-height: 1.6;">
            ${data.client_name ? `<div style="margin-bottom: 5px;"><strong>Nome:</strong> ${data.client_name}</div>` : ''}
            ${data.client_phone ? `<div><strong>Telefone:</strong> ${data.client_phone}</div>` : ''}
          </div>
        </div>
      ` : ''}
      
      <!-- Detalhes do Serviço -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #000; margin-bottom: 20px; font-size: 18px; font-weight: bold; text-transform: uppercase;">Detalhes do Serviço</h3>
        <div style="background: white; border-radius: 8px; overflow: hidden; border: 1px solid #ddd;">
          <!-- Header da Tabela -->
          <div style="background: #666; padding: 15px; color: white;">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; font-weight: bold; font-size: 12px; text-transform: uppercase;">
              <div>ITEM</div>
              <div>DESCRIÇÃO</div>
            </div>
          </div>
          
          <!-- Linhas da Tabela -->
          <div style="padding: 0;">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; padding: 15px; border-bottom: 1px solid #f0f0f0; background: #fafafa;">
              <div style="font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase;">Modelo</div>
              <div style="font-weight: bold; color: #000; font-size: 14px;">${data.device_model}</div>
            </div>
            ${data.part_quality ? `
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; padding: 15px; border-bottom: 1px solid #f0f0f0; background: white;">
              <div style="font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase;">Qualidade</div>
              <div style="font-weight: bold; color: #000; font-size: 14px;">${data.part_quality}</div>
            </div>
            ` : ''}
            ${data.notes ? `
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; padding: 15px; background: #fafafa;">
              <div style="font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase;">Obs</div>
              <div style="font-weight: bold; color: #000; font-size: 14px;">${data.notes}</div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
      
      <!-- Valores -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #000; margin-bottom: 20px; font-size: 18px; font-weight: bold; text-transform: uppercase;">Valores do Serviço</h3>
        <div style="background: white; padding: 25px; border-radius: 8px; border: 2px solid #666;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="margin: 0; font-size: 12px; color: #666; font-weight: 600; text-transform: uppercase;">VALOR À VISTA</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #000;">${cashPrice}</p>
            </div>
            <div style="background: #666; color: white; padding: 15px 25px; border-radius: 8px; text-align: center; min-width: 120px;">
              <div style="font-size: 12px; margin-bottom: 5px;">ECONOMIA</div>
              <div style="font-size: 16px; font-weight: bold;">À VISTA</div>
            </div>
          </div>
          ${installmentSection}
        </div>
      </div>
      
      <!-- Garantia -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #000; margin-bottom: 15px; font-size: 18px; font-weight: bold; text-transform: uppercase;">Garantia</h3>
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; border-left: 4px solid #666;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">Prazo: ${warrantyText}</p>
              <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">* Garantia não cobre danos por queda, impacto ou líquidos</p>
            </div>
            <div style="background: #666; color: white; padding: 10px 15px; border-radius: 8px; font-weight: bold;">
              ⚡ GARANTIA
            </div>
          </div>
        </div>
      </div>
      
      <!-- O que está incluso -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #000; margin-bottom: 15px; font-size: 18px; font-weight: bold; text-transform: uppercase;">O que está incluso</h3>
        <div style="background: white; border: 2px solid #666; border-radius: 8px; padding: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="display: flex; align-items: center;">
              <div style="width: 30px; height: 30px; background: #666; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold;">✓</div>
              <span style="color: #000; font-weight: 500;">Busca e entrega do aparelho</span>
            </div>
            <div style="display: flex; align-items: center;">
              <div style="width: 30px; height: 30px; background: #666; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold;">✓</div>
              <span style="color: #000; font-weight: 500;">Película de proteção de brinde</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Rodapé -->
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #666;">
        <h4 style="color: #000; font-size: 18px; margin: 0; font-weight: bold;">Agradecemos pela preferência!</h4>
      </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: false
    });
    
    document.body.removeChild(tempDiv);
    
    return canvas.toDataURL('image/png', 0.9);
    
  } catch (error) {
    console.error('Erro ao gerar imagem do PDF:', error);
    throw new Error('Falha ao gerar a imagem do orçamento');
  }
};
