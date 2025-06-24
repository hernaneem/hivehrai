import React from 'react';

const ZavicTestCompleted: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8 max-w-md text-center text-white space-y-4">
        <h1 className="text-2xl font-bold">¡Gracias por completar el Test Zavic!</h1>
        <p className="text-white/80">Tus respuestas han sido registradas correctamente. El reclutador revisará tus resultados.</p>
      </div>
    </div>
  );
};

export default ZavicTestCompleted;
