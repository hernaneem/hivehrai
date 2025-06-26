import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, User, Briefcase, CheckCircle } from 'lucide-react';
import ZavicTest from './ZavicTest';

interface ZavicTestRecord {
  id: number;
  candidate_id: string;
  job_id: string;
  recruiter_id: string;
  test_token: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'expired';
  expires_at: string;
  started_at?: string;
  completed_at?: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
  };
  job?: {
    id: string;
    title: string;
    company: string;
  };
}

const ZavicTestPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<ZavicTestRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inProgress, setInProgress] = useState(false);

  // cargar registro
  useEffect(() => {
    const load = async () => {
      if (!token) {
        setError('Token inválido');
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('zavic_tests')
          .select(`*, candidate:candidates(id,name,email), job:jobs(id,title,company)`) // joins
          .eq('test_token', token)
          .single();
        if (error || !data) {
          setError('El test no existe o ha sido eliminado');
        } else if (new Date(data.expires_at) < new Date()) {
          setError('Este test ha expirado');
        } else {
          setTest(data as ZavicTestRecord);
          setInProgress(data.status === 'in-progress');
        }
      } catch (e) {
        setError('Error cargando el test');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const startTest = async () => {
    if (!test) return;
    try {
      await supabase
        .from('zavic_tests')
        .update({ status: 'in-progress', started_at: new Date().toISOString() })
        .eq('id', test.id);
      setInProgress(true);
    } catch (e) {
      alert('No se pudo iniciar el test');
    }
  };

  const handleFinish = async (resultId: number) => {
    if (!test) return;
    try {
      // Los resultados ya se guardaron en zavic_tests desde el componente ZavicTest
      // Solo mostramos el mensaje de éxito y redirigimos
      alert('✅ ¡Test completado! Gracias por tu participación.');
      navigate(`/zavic-test/${token}/completed`);
    } catch (e) {
      console.error('Error al finalizar el test:', e);
      alert('Error al finalizar el test. Por favor, contacta al administrador.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div className="text-white">Cargando…</div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 max-w-md text-center">
          <h1 className="text-white text-xl mb-4">Error</h1>
          <p className="text-red-300 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (inProgress) {
    // render componente del test
    return <ZavicTest candidateId={test.candidate_id} testToken={token!} onComplete={handleFinish} />;
  }

  // pantalla de inicio / instrucciones
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8 max-w-lg w-full text-white space-y-6">
        <h1 className="text-2xl font-bold">Test Zavic</h1>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-purple-400" />
            <span>{test.candidate?.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-purple-400" />
            <span>{test.job?.title} - {test.job?.company}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-yellow-400" />
            <span>El enlace expira el {new Date(test.expires_at).toLocaleDateString()}</span>
          </div>
        </div>
        <ul className="text-white/70 text-sm list-disc list-inside space-y-1">
          <li>Duración aproximada: 15 minutos</li>
          <li>Responde cada ítem con sinceridad</li>
          <li>No hay respuestas correctas o incorrectas</li>
        </ul>
        <button onClick={startTest} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:to-purple-700 py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Comenzar Test</span>
        </button>
      </div>
    </div>
  );
};

export default ZavicTestPage;
