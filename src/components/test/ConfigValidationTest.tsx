/**
 * Componente de Teste - Validação do Sistema de Configuração Centralizada
 * 
 * Este componente testa se o sistema de configuração centralizada está funcionando
 * corretamente e se todos os hooks estão retornando os valores esperados.
 */

import React from 'react';
import { useAppConfig, useAppInfo, useContactInfo, usePWAConfig, useMarketingConfig } from '@/hooks/useAppConfig';

export const ConfigValidationTest = () => {
  // Testando todos os hooks
  const fullConfig = useAppConfig();
  const appInfo = useAppInfo();
  const contactInfo = useContactInfo();
  const pwaConfig = usePWAConfig();
  const marketingConfig = useMarketingConfig();

  // Validações
  const validations = [
    {
      test: 'App Name',
      expected: 'OneDrip',
      actual: appInfo.name,
      passed: appInfo.name === 'OneDrip'
    },
    {
      test: 'Full Name',
      expected: 'OneDrip - Sistema de Orçamentos',
      actual: appInfo.fullName,
      passed: appInfo.fullName === 'OneDrip - Sistema de Orçamentos'
    },
    {
      test: 'Contact Email',
      expected: 'contato@onedrip.com',
      actual: contactInfo.email,
      passed: contactInfo.email === 'contato@onedrip.com'
    },
    {
      test: 'Support Email',
      expected: 'suporte@onedrip.com',
      actual: contactInfo.support,
      passed: contactInfo.support === 'suporte@onedrip.com'
    },
    {
      test: 'PWA Install Title',
      expected: 'Instalar OneDrip como App',
      actual: pwaConfig.installTitle,
      passed: pwaConfig.installTitle === 'Instalar OneDrip como App'
    },
    {
      test: 'PWA Share Title',
      expected: 'OneDrip - Sistema de Orçamentos',
      actual: pwaConfig.shareTitle,
      passed: pwaConfig.shareTitle === 'OneDrip - Sistema de Orçamentos'
    },
    {
      test: 'Marketing Benefits Title',
      expected: 'Vantagens do OneDrip',
      actual: marketingConfig.benefitsTitle,
      passed: marketingConfig.benefitsTitle === 'Vantagens do OneDrip'
    },
    {
      test: 'Marketing Hero Subtitle',
      expected: 'Junte-se a centenas de profissionais que já utilizam o OneDrip para gerenciar seus negócios de forma mais eficiente.',
      actual: marketingConfig.heroSubtitle,
      passed: marketingConfig.heroSubtitle.includes('OneDrip')
    }
  ];

  const allPassed = validations.every(v => v.passed);
  const passedCount = validations.filter(v => v.passed).length;

  return (
    <div className="p-6 space-y-6 bg-card rounded-lg border max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          Validação do Sistema de Configuração Centralizada
        </h2>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          allPassed 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          {allPassed ? '✅' : '❌'} 
          {passedCount}/{validations.length} testes passaram
        </div>
      </div>

      <div className="grid gap-4">
        {validations.map((validation, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${
              validation.passed 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{validation.test}</h3>
              <span className={`text-sm font-medium ${
                validation.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {validation.passed ? 'PASSOU' : 'FALHOU'}
              </span>
            </div>
            <div className="text-sm space-y-1">
              <div>
                <strong>Esperado:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{validation.expected}</code>
              </div>
              <div>
                <strong>Atual:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{validation.actual}</code>
              </div>
            </div>
          </div>
        ))}
      </div>

      {allPassed && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            🎉 Sistema de Configuração Centralizada Funcionando!
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Todos os hooks estão retornando os valores corretos. Para alterar o nome da aplicação no futuro, 
            basta modificar o arquivo <code>src/config/app.ts</code> e todas as referências serão atualizadas automaticamente.
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border">
        <h3 className="font-semibold mb-2">Configuração Atual:</h3>
        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
          {JSON.stringify(fullConfig, null, 2)}
        </pre>
      </div>
    </div>
  );
};