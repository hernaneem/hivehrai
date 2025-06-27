import type { TestType, TestStats } from '../types';
import type { CandidateWithTestInfo } from '../../../contexts/CleaverContext';
import type { CandidateWithMossInfo } from '../../../contexts/MossContext';
import type { CandidateWithZavicInfo } from '../../../contexts/ZavicContext';
import type { CandidateWithTermanInfo, CandidateWithRavenInfo } from '../types';
import { getTestStatus } from './statusHelpers';

type AnyCandidate = CandidateWithTestInfo | CandidateWithMossInfo | CandidateWithTermanInfo | CandidateWithRavenInfo | CandidateWithZavicInfo;

export const generateTestLink = (
  candidateId: string, 
  testType: TestType,
  selectedCandidate: AnyCandidate | null,
  candidates: Record<TestType, AnyCandidate[]>
): string => {
  // Primero buscar en selectedCandidate si coincide el ID
  if (selectedCandidate?.id === candidateId && selectedCandidate?.test_token) {
    return `${window.location.origin}/${testType}-test/${selectedCandidate.test_token}`;
  }
  
  // Luego buscar en la lista de candidatos
  const token = candidates[testType]?.find(c => c.id === candidateId)?.test_token;
  
  return token ? `${window.location.origin}/${testType}-test/${token}` : '';
};

export const calculateStats = (candidates: AnyCandidate[], testType: TestType): TestStats => {
  return {
    totalCandidates: candidates.length,
    cvsApproved: candidates.filter((c) => c.cv_status === 'approved').length,
    testsCompleted: candidates.filter((c) => getTestStatus(c, testType) === 'completed').length,
    testsPending: candidates.filter((c) => {
      const status = getTestStatus(c, testType);
      return status === 'pending' || status === 'in-progress' || status === 'not-started';
    }).length,
    testsInProgress: candidates.filter((c) => getTestStatus(c, testType) === 'in-progress').length
  };
};

export const getTestInstructions = (testType: TestType) => {
  const instructions = {
    cleaver: [
      '• El test tiene una duración aproximada de 15-20 minutos',
      '• Debe completarse en una sola sesión',
      '• El enlace expira en 7 días',
      '• No hay respuestas correctas o incorrectas'
    ],
    moss: [
      '• El test tiene una duración aproximada de 20-25 minutos',
      '• Consta de 30 preguntas sobre situaciones interpersonales',
      '• Debe completarse en una sola sesión',
      '• El enlace expira en 7 días',
      '• Responde de forma espontánea y honesta'
    ],
    terman: [
      '• El test tiene una duración aproximada de 40 minutos',
      '• Consta de 10 series con diferentes tipos de ejercicios',
      '• Cada serie tiene un tiempo límite de 4 minutos',
      '• El enlace expira en 7 días',
      '• Responde con la mayor precisión posible'
    ],
    raven: [
      '• El test tiene una duración aproximada de 45 minutos',
      '• Consta de 60 matrices progresivas',
      '• Debe completarse en una sola sesión',
      '• El enlace expira en 7 días',
      '• Trata de completar cada ítem sin adivinar'
    ],
    zavic: [
      '• El test tiene una duración aproximada de 25-30 minutos',
      '• Consta de 20 preguntas sobre situaciones éticas y de valores',
      '• Debe asignar valores del 1 al 4 a cada opción',
      '• El enlace expira en 7 días',
      '• Responde según tu verdadera escala de valores'
    ]
  };
  
  return instructions[testType] || [];
};

export const getTestTitle = (testType: TestType): string => {
  const titles = {
    cleaver: '🧠 Enlace de Test Cleaver',
    moss: '🎯 Enlace de Test MOSS',
    terman: '🧠 Enlace de Test Terman-Merrill',
    raven: '🧠 Enlace de Test Raven (RPM)',
    zavic: '❤️ Enlace de Test ZAVIC'
  };
  
  return titles[testType] || 'Enlace de Test';
};

export const getTestDescription = (testType: TestType): string => {
  const descriptions = {
    cleaver: 'psicométrico',
    moss: 'de habilidades interpersonales',
    terman: 'de inteligencia',
    raven: 'de matrices progresivas',
    zavic: 'de valores e intereses'
  };
  
  return descriptions[testType] || 'psicométrico';
}; 