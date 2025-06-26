import React, { useState } from 'react';
import { X, User, Briefcase, Clock, TrendingUp, Target, Heart, Shield, DollarSign } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface ZavicResultsProps {
  results: {
    id: number;
    candidate: {
      name: string;
      email: string;
    };
    job: {
      title: string;
      company?: string;
    };
    status: string;
    completed_at: string;
    time_spent_minutes?: number;
    scores: {
      moral: number;
      legalidad: number;
      indiferencia: number;
      corrupcion: number;
      economico: number;
      politico?: number;
      social?: number;
      religioso?: number;
    };
    total_score: number;
  };
  onClose: () => void;
}

const ZavicResultsDashboard: React.FC<ZavicResultsProps> = ({ results, onClose }) => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'detalles' | 'interpretacion'>('resumen');

  // Datos para gráfico de valores
  const valoresData = [
    { name: 'Moral', value: results.scores.moral, color: '#8B5CF6' },
    { name: 'Legalidad', value: results.scores.legalidad, color: '#10B981' },
    { name: 'Indiferencia', value: results.scores.indiferencia, color: '#F59E0B' },
    { name: 'Corrupción', value: results.scores.corrupcion, color: '#EF4444' }
  ];

  // Datos para gráfico de intereses
  const interesesData = [
    { name: 'Económico', value: results.scores.economico, color: '#059669' },
    { name: 'Político', value: results.scores.politico || 0, color: '#DC2626' },
    { name: 'Social', value: results.scores.social || 0, color: '#2563EB' },
    { name: 'Religioso', value: results.scores.religioso || 0, color: '#7C3AED' }
  ];

  // Datos para radar chart
  const radarData = [
    { subject: 'Moral', A: results.scores.moral, fullMark: 20 },
    { subject: 'Legal', A: results.scores.legalidad, fullMark: 20 },
    { subject: 'Indiferencia', A: results.scores.indiferencia, fullMark: 20 },
    { subject: 'Corrupción', A: results.scores.corrupcion, fullMark: 20 },
    { subject: 'Económico', A: results.scores.economico, fullMark: 20 }
  ];

  // Función para interpretar puntajes
  const interpretarPuntaje = (puntaje: number, maxPuntaje: number = 20) => {
    const porcentaje = (puntaje / maxPuntaje) * 100;
    if (porcentaje >= 80) return { nivel: 'Muy Alto', color: 'text-green-400' };
    if (porcentaje >= 60) return { nivel: 'Alto', color: 'text-blue-400' };
    if (porcentaje >= 40) return { nivel: 'Medio', color: 'text-yellow-400' };
    if (porcentaje >= 20) return { nivel: 'Bajo', color: 'text-orange-400' };
    return { nivel: 'Muy Bajo', color: 'text-red-400' };
  };

  // Interpretaciones específicas por categoría
  const getInterpretacion = () => {
    const interpretaciones = [];

    // Valores Morales
    const moralInterpretacion = interpretarPuntaje(results.scores.moral);
    interpretaciones.push({
      categoria: 'Valores Morales',
      icon: <Heart className="h-5 w-5" />,
      puntaje: results.scores.moral,
      nivel: moralInterpretacion.nivel,
      color: moralInterpretacion.color,
      descripcion: moralInterpretacion.nivel === 'Muy Alto' || moralInterpretacion.nivel === 'Alto'
        ? 'Persona con sólidos principios éticos, honesta e íntegra. Valora la rectitud moral y la justicia.'
        : moralInterpretacion.nivel === 'Medio'
        ? 'Equilibrio en valores morales. Considera principios éticos pero puede ser flexible según el contexto.'
        : 'Valores morales flexibles. Puede priorizar resultados sobre principios éticos estrictos.'
    });

    // Valores de Legalidad
    const legalInterpretacion = interpretarPuntaje(results.scores.legalidad);
    interpretaciones.push({
      categoria: 'Valores de Legalidad',
      icon: <Shield className="h-5 w-5" />,
      puntaje: results.scores.legalidad,
      nivel: legalInterpretacion.nivel,
      color: legalInterpretacion.color,
      descripcion: legalInterpretacion.nivel === 'Muy Alto' || legalInterpretacion.nivel === 'Alto'
        ? 'Respeto estricto por las normas y leyes. Cumple meticulosamente con reglamentos y procedimientos.'
        : legalInterpretacion.nivel === 'Medio'
        ? 'Respeta las normas pero puede ser pragmático en su aplicación según las circunstancias.'
        : 'Enfoque flexible hacia las normas. Puede priorizar eficiencia sobre cumplimiento estricto.'
    });

    // Valores de Indiferencia
    const indiferenciaInterpretacion = interpretarPuntaje(results.scores.indiferencia);
    interpretaciones.push({
      categoria: 'Indiferencia',
      icon: <Target className="h-5 w-5" />,
      puntaje: results.scores.indiferencia,
      nivel: indiferenciaInterpretacion.nivel,
      color: indiferenciaInterpretacion.color,
      descripcion: indiferenciaInterpretacion.nivel === 'Muy Alto' || indiferenciaInterpretacion.nivel === 'Alto'
        ? 'Tendencia a la neutralidad emocional. Puede mantener objetividad pero podría parecer desapegado.'
        : indiferenciaInterpretacion.nivel === 'Medio'
        ? 'Equilibrio entre objetividad y compromiso emocional según la situación.'
        : 'Alto compromiso emocional. Se involucra activamente y muestra interés genuino.'
    });

    // Valores de Corrupción
    const corrupcionInterpretacion = interpretarPuntaje(results.scores.corrupcion);
    interpretaciones.push({
      categoria: 'Susceptibilidad a Corrupción',
      icon: <TrendingUp className="h-5 w-5" />,
      puntaje: results.scores.corrupcion,
      nivel: corrupcionInterpretacion.nivel,
      color: corrupcionInterpretacion.nivel === 'Muy Alto' || corrupcionInterpretacion.nivel === 'Alto' 
        ? 'text-red-400' : 'text-green-400',
      descripcion: corrupcionInterpretacion.nivel === 'Muy Alto' || corrupcionInterpretacion.nivel === 'Alto'
        ? '⚠️ ALERTA: Alta susceptibilidad a comportamientos no éticos. Requiere supervisión y controles estrictos.'
        : corrupcionInterpretacion.nivel === 'Medio'
        ? 'Susceptibilidad moderada. Importante establecer controles y reforzar valores organizacionales.'
        : '✅ Baja susceptibilidad a corrupción. Persona confiable y con principios sólidos.'
    });

    // Intereses Económicos
    const economicoInterpretacion = interpretarPuntaje(results.scores.economico);
    interpretaciones.push({
      categoria: 'Intereses Económicos',
      icon: <DollarSign className="h-5 w-5" />,
      puntaje: results.scores.economico,
      nivel: economicoInterpretacion.nivel,
      color: economicoInterpretacion.color,
      descripcion: economicoInterpretacion.nivel === 'Muy Alto' || economicoInterpretacion.nivel === 'Alto'
        ? 'Fuerte motivación económica. Orientado a resultados financieros y crecimiento material.'
        : economicoInterpretacion.nivel === 'Medio'
        ? 'Interés equilibrado en aspectos económicos. Valora estabilidad financiera sin ser el único motivador.'
        : 'Motivación económica secundaria. Prioriza otros valores sobre beneficios materiales.'
    });

    return interpretaciones;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Resultados Test ZAVIC</h2>
                <p className="text-white/60">Valores e Intereses Vocacionales</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white/70" />
            </button>
          </div>
        </div>

        {/* Información del candidato */}
        <div className="p-6 bg-white/5 border-b border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-white/60">Candidato</p>
                <p className="text-white font-semibold">{results.candidate.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Briefcase className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-white/60">Puesto</p>
                <p className="text-white font-semibold">{results.job.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-white/60">Duración</p>
                <p className="text-white font-semibold">
                  {results.time_spent_minutes ? `${results.time_spent_minutes} min` : 'No registrado'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm text-white/60">Puntaje Total</p>
                <p className="text-white font-semibold">{results.total_score} pts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex space-x-4">
            {[
              { id: 'resumen', label: 'Resumen', icon: <TrendingUp className="h-4 w-4" /> },
              { id: 'detalles', label: 'Detalles', icon: <Target className="h-4 w-4" /> },
              { id: 'interpretacion', label: 'Interpretación', icon: <Heart className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'resumen' | 'detalles' | 'interpretacion')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'resumen' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Valores */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-purple-400" />
                  <span>Valores</span>
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={valoresData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Intereses */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  <span>Intereses</span>
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={interesesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Radar Chart */}
              <div className="lg:col-span-2 bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span>Perfil Completo</span>
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                    <PolarRadiusAxis tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                    <Radar 
                      name="Puntajes" 
                      dataKey="A" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.3} 
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'detalles' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Valores */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-purple-400" />
                    <span>Moral</span>
                  </h4>
                  <div className="text-3xl font-bold text-purple-400 mb-2">{results.scores.moral}</div>
                  <div className={`text-sm font-medium ${interpretarPuntaje(results.scores.moral).color}`}>
                    {interpretarPuntaje(results.scores.moral).nivel}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span>Legalidad</span>
                  </h4>
                  <div className="text-3xl font-bold text-green-400 mb-2">{results.scores.legalidad}</div>
                  <div className={`text-sm font-medium ${interpretarPuntaje(results.scores.legalidad).color}`}>
                    {interpretarPuntaje(results.scores.legalidad).nivel}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                    <Target className="h-5 w-5 text-yellow-400" />
                    <span>Indiferencia</span>
                  </h4>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{results.scores.indiferencia}</div>
                  <div className={`text-sm font-medium ${interpretarPuntaje(results.scores.indiferencia).color}`}>
                    {interpretarPuntaje(results.scores.indiferencia).nivel}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-red-400" />
                    <span>Corrupción</span>
                  </h4>
                  <div className="text-3xl font-bold text-red-400 mb-2">{results.scores.corrupcion}</div>
                  <div className={`text-sm font-medium ${interpretarPuntaje(results.scores.corrupcion).nivel === 'Muy Alto' || interpretarPuntaje(results.scores.corrupcion).nivel === 'Alto' ? 'text-red-400' : 'text-green-400'}`}>
                    {interpretarPuntaje(results.scores.corrupcion).nivel}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-blue-400" />
                    <span>Económico</span>
                  </h4>
                  <div className="text-3xl font-bold text-blue-400 mb-2">{results.scores.economico}</div>
                  <div className={`text-sm font-medium ${interpretarPuntaje(results.scores.economico).color}`}>
                    {interpretarPuntaje(results.scores.economico).nivel}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                    <span>Total</span>
                  </h4>
                  <div className="text-3xl font-bold text-orange-400 mb-2">{results.total_score}</div>
                  <div className="text-sm font-medium text-white/60">de 100 puntos</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interpretacion' && (
            <div className="space-y-6">
              {getInterpretacion().map((item, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{item.categoria}</h3>
                        <span className="text-2xl font-bold text-white/80">{item.puntaje}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.color} bg-white/10`}>
                          {item.nivel}
                        </span>
                      </div>
                      <p className="text-white/70 leading-relaxed">{item.descripcion}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Recomendaciones generales */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  <span>Recomendaciones para Reclutamiento</span>
                </h3>
                <div className="space-y-3 text-white/80">
                  <p>• <strong>Puesto ideal:</strong> Evalúe la compatibilidad del perfil de valores con la cultura organizacional.</p>
                  <p>• <strong>Supervisión:</strong> {results.scores.corrupcion > 12 ? 'Requiere supervisión cercana y controles estrictos.' : 'Candidato confiable con supervisión estándar.'}</p>
                  <p>• <strong>Motivación:</strong> {results.scores.economico > 12 ? 'Motivado principalmente por incentivos económicos.' : 'Considere motivadores no monetarios.'}</p>
                  <p>• <strong>Integración:</strong> {results.scores.moral > 12 && results.scores.legalidad > 12 ? 'Excelente ajuste para roles que requieren alta integridad.' : 'Evalúe compatibilidad con valores organizacionales.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZavicResultsDashboard; 