import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

// Tipos de datos
interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface Answer {
  [key: string]: number;
}

interface ZavicResults {
  moral: number;
  legalidad: number;
  indiferencia: number;
  corrupcion: number;
  economico: number;
  politico: number;
  social: number;
  religioso: number;
}

// Mapeo de respuestas a categorías
const answerMapping: { [key: number]: { [key: string]: string } } = {
  // Preguntas de valores
  3: { A: 'MORAL', B: 'LEGALIDAD', C: 'INDIFERENCIA', D: 'CORRUPCION' },
  4: { D: 'MORAL', C: 'LEGALIDAD', A: 'INDIFERENCIA', B: 'CORRUPCION' },
  6: { A: 'MORAL', B: 'LEGALIDAD', D: 'INDIFERENCIA', C: 'CORRUPCION' },
  8: { B: 'MORAL', A: 'LEGALIDAD', C: 'INDIFERENCIA', D: 'CORRUPCION' },
  9: { B: 'MORAL', A: 'LEGALIDAD', D: 'INDIFERENCIA', C: 'CORRUPCION' },
  12: { B: 'MORAL', D: 'LEGALIDAD', A: 'INDIFERENCIA', C: 'CORRUPCION' },
  13: { A: 'MORAL', B: 'LEGALIDAD', C: 'INDIFERENCIA', D: 'CORRUPCION' },
  15: { D: 'MORAL', C: 'LEGALIDAD', B: 'INDIFERENCIA', A: 'CORRUPCION' },
  17: { D: 'MORAL', B: 'LEGALIDAD', A: 'INDIFERENCIA', C: 'CORRUPCION' },
  19: { A: 'MORAL', D: 'LEGALIDAD', B: 'INDIFERENCIA', C: 'CORRUPCION' },
  
  // Preguntas de intereses
  1: { C: 'ECONOMICO', B: 'POLITICO', A: 'SOCIAL', D: 'RELIGIOSO' },
  2: { C: 'ECONOMICO', D: 'POLITICO', B: 'SOCIAL', A: 'RELIGIOSO' },
  5: { D: 'ECONOMICO', B: 'POLITICO', A: 'SOCIAL', C: 'RELIGIOSO' },
  7: { B: 'ECONOMICO', C: 'POLITICO', A: 'SOCIAL', D: 'RELIGIOSO' },
  10: { A: 'ECONOMICO', B: 'POLITICO', D: 'SOCIAL', C: 'RELIGIOSO' },
  11: { A: 'ECONOMICO', D: 'POLITICO', B: 'SOCIAL', C: 'RELIGIOSO' },
  14: { A: 'ECONOMICO', D: 'POLITICO', C: 'SOCIAL', B: 'RELIGIOSO' },
  16: { A: 'ECONOMICO', B: 'POLITICO', D: 'SOCIAL', C: 'RELIGIOSO' },
  18: { B: 'ECONOMICO', D: 'POLITICO', C: 'SOCIAL', A: 'RELIGIOSO' },
  20: { A: 'ECONOMICO', B: 'POLITICO', D: 'SOCIAL', C: 'RELIGIOSO' }
};

// Preguntas del test
const questions: Question[] = [
  {
    id: 1,
    question_text: "Si usted tuviera la habilidad y condiciones adecuadas, a qué se dedicaría:",
    option_a: "A modificar todos los jardines de la ciudad.",
    option_b: "A obtener logros por medio de la política.",
    option_c: "A prestar dinero a altos intereses.",
    option_d: "A cumplir con las obligaciones que su religión le impone."
  },
  {
    id: 2,
    question_text: "Cuándo ve un accidente usted:",
    option_a: "Se pone a orar con la persona accidentada.",
    option_b: "Pide una ambulancia.",
    option_c: "Cuida las pertenencias del accidentado.",
    option_d: "Trata de detener al culpable."
  },
  {
    id: 3,
    question_text: "Es usted maestro de primaria y uno de sus alumnos le ofrece un costoso obsequio con el fin de obtener una mayor calificación, usted:",
    option_a: "Le dedicara tiempo extra para nivelarlo.",
    option_b: "Lo rechazaría amablemente y lo invitaría a estudiar.",
    option_c: "Aceptaría el presente y le daría la calificación deseada por su alumno, porque usted sabe que es inteligente.",
    option_d: "Llamaría a sus padres para que paguen las clases particulares."
  },
  {
    id: 4,
    question_text: "Al conducir su automóvil por descuido usted pasa un alto, el agente de tránsito lo detiene, y para permitirle circular nuevamente le solicita cierta suma de dinero, usted:",
    option_a: "Arranca su automóvil y deja al agente de tránsito.",
    option_b: "Trata de llegar a un acuerdo encaminado a disminuir la cantidad de dinero.",
    option_c: "Pide le sea levantada la infracción pertinente.",
    option_d: "Amenaza al agente con reportarlo con sus superiores."
  },
  {
    id: 5,
    question_text: "Prefiere una amistad que:",
    option_a: "Sea activo y le guste reparar desperfectos en su hogar.",
    option_b: "Se interese por ser líder en el sindicato del cual forma parte.",
    option_c: "Asistir con frecuencia a eventos religiosos.",
    option_d: "Le interese emprender negocios."
  },
  {
    id: 6,
    question_text: "Si al llegar a su trabajo encuentra en el baño un reloj en el lavabo usted:",
    option_a: "Trata de encontrar a su dueño",
    option_b: "Lo reporta a sus superiores y lo entrega.",
    option_c: "No hace ningún comentario y espera a que lo busquen.",
    option_d: "Lo deja donde lo encontró."
  },
  {
    id: 7,
    question_text: "Un buen gobierno, debería:",
    option_a: "Ayudar a las clases necesitadas.",
    option_b: "Ampliar las zonas turísticas de cinco estrellas.",
    option_c: "Buscar a los mejores líderes de su partido.",
    option_d: "Permitir que la religión sea oficial."
  },
  {
    id: 8,
    question_text: "Un amigo suyo desea obtener un ascenso dentro de su trabajo, usted le aconseja:",
    option_a: "Que sea cumplido y eficiente.",
    option_b: "Que busque cuales son los errores del jefe para que demuestre que el no es perfecto.",
    option_c: "Que prometa una manda a su santo de preferencia.",
    option_d: "Que ofrezca una excelente comida a los dirigentes de la empresa."
  },
  {
    id: 9,
    question_text: "Si Luis al llegar a su casa observa que están robando al vecino las llantas de su automóvil él debería:",
    option_a: "Llamar a la policía.",
    option_b: "Llamar al vecino.",
    option_c: "Pide a los asaltantes parte del beneficio que obtendrán en el robo, por guardar silencio.",
    option_d: "Mejor no hacer nada y se mete a su casa."
  },
  {
    id: 10,
    question_text: "Un empleado de 60 años que le ha sido leal a la empresa durante 28 años se queja del exceso de trabajo, lo mejor sería.",
    option_a: "Pedir un aumento de sueldo.",
    option_b: "Recurrir al sindicato para que se le ayude.",
    option_c: "Que recurra a su guía espiritual para que le diga como se le debe ayudar y su trabajo no se le haga pesado",
    option_d: "Que solicite una persona más para que lo ayude."
  },
  {
    id: 11,
    question_text: "Usted visita a un amigo enfermo y lo mejor sería:",
    option_a: "Que convenza de acudir al Seguro Social para que su atención médica no le sea costosa.",
    option_b: "Proponerle su ayuda cuando el tenga que acudir a sus citas médicas.",
    option_c: "Que como todo le ha salido mal últimamente vea a una persona para que le realice una limpia.",
    option_d: "Decirle lo importante que fueron las juntas de vecinos ahora que él estuvo en el hospital."
  },
  {
    id: 12,
    question_text: "Al salir de viaje sus vecinos le piden cuidar su casa durante su ausencia, usted:",
    option_a: "Les dice que no puede debido a que se encuentra muy ocupado en esos días.",
    option_b: "Atiende con gusto la petición de sus vecinos.",
    option_c: "A cambio de sus servicios les solicita prestado el automóvil que no utilizarán en su viaje.",
    option_d: "Asiste al módulo de vigilancia local, para que le brinden mayor seguridad."
  },
  {
    id: 13,
    question_text: "Si encuentra a un niño llorando sólo en una tienda comercial, usted:",
    option_a: "Le ayudaría a buscar a su familia en la tienda.",
    option_b: "Lo llevaría al área de servicios generales para que ahí espere a que lo ayuden.",
    option_c: "Pasaría de largo porque usted tiene prisa.",
    option_d: "Lo llevaría a su casa pero le cobra a su mamá por el tiempo que usted perdió por andarla buscando."
  },
  {
    id: 14,
    question_text: "Si usted viviera en provincia y tuviera más entradas de las que necesita, que preferiría hacer con el dinero:",
    option_a: "Hacerlo producir para ayudar al desarrollo industrial",
    option_b: "Donar dinero para la contratación de una iglesia.",
    option_c: "Darlo a una sociedad para el beneficio de las familias humildes del poblado.",
    option_d: "Aportar ayuda al partido político con la cual usted simpatiza."
  },
  {
    id: 15,
    question_text: "Su hijo ha dejado sus estudios por un tiempo, usted:",
    option_a: "Le sugiere que vea a los maestros para que les proponga que le ayuden.",
    option_b: "Que haga lo que quiera pues ya esta grande.",
    option_c: "Que curse nuevamente el año",
    option_d: "Darle el apoyo económico y moral para que supere este tropiezo en sus estudios."
  },
  {
    id: 16,
    question_text: "A que actividad prefiere dedicarse durante sus vacaciones:",
    option_a: "Obtener experiencia en otro negocio que no sea el propio.",
    option_b: "Participar en la campaña política de diputados, que se va a efectuar en su localidad.",
    option_c: "Asistir a un retiro organizado por la iglesia.",
    option_d: "Visitar un lugar que no conoce, en compañía de su familia"
  },
  {
    id: 17,
    question_text: "La familia de Pedro tiene un hijo drogadicto y es amigo de su hijo desde pequeño, al saberlo usted:",
    option_a: "Le pide a su hijo que no lo vuelva a ver.",
    option_b: "Le sugiere a su familia lo lleven a Centros de Integración Juvenil para que lo ayuden.",
    option_c: "Si el muchacho ya es drogadicto le pide le obsequie el reloj que tanto le gusta a su hijo para no decírselo a sus padres.",
    option_d: "Lo lleva a usted a un Centro de Rehabilitación junto con su hijo para que sienta que lo apoya y no es rechazado."
  },
  {
    id: 18,
    question_text: "Su esposa le comenta que al terminar sus actividades cotidianas le queda mucho tiempo libre, usted le sugiere:",
    option_a: "Que emplee el tiempo como catequista en la iglesia.",
    option_b: "Que venda artículos femeninos.",
    option_c: "Que promueva juntas entre los vecinos encaminadas a resolver los problemas de la comunidad.",
    option_d: "Que asista con sus hijos a Centros Recreativos si fuera posible."
  },
  {
    id: 19,
    question_text: "Quiere pedir un favor a un conocido, que beneficiaria a la empresa en la cual trabaja, usted:",
    option_a: "Le explica los motivos y necesidades pro los cuales requiere ese favor.",
    option_b: "Le pide el favor sin mayor explicación.",
    option_c: "Le hace creer que él será el más beneficiado al ofrecerle una retribución.",
    option_d: "Le sugiere a su jefe inmediato que sea él quien pida el favor y explique la necesidad."
  },
  {
    id: 20,
    question_text: "Cuál de las siguientes ocupaciones escogería:",
    option_a: "Trabajar en forma independiente.",
    option_b: "Como encargado del departamento en el cual usted labora.",
    option_c: "Dedicarse a estudios eclesiásticos.",
    option_d: "Trabajador social."
  }
];

interface ZavicTestProps {
  candidateId?: string;
  testToken?: string;
  onComplete?: (resultId: number) => void;
}

export default function ZavicTest({ candidateId, testToken, onComplete }: ZavicTestProps) {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: Answer }>({});
  const [currentAnswer, setCurrentAnswer] = useState<Answer>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ZavicResults | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  // Cargar respuestas existentes del test al iniciar
  useEffect(() => {
    const loadExistingAnswers = async () => {
      if (!testToken) return;
      
      try {
        const { data, error } = await supabase
          .from('zavic_tests')
          .select('answers')
          .eq('test_token', testToken)
          .single();
          
        if (error) {
          console.error('Error cargando respuestas existentes:', error);
          return;
        }
        
        if (data?.answers) {
          setAnswers(data.answers);
          // Si hay respuestas, ir a la primera pregunta sin responder
          const answeredQuestions = Object.keys(data.answers);
          if (answeredQuestions.length > 0) {
            const nextQuestion = answeredQuestions.length;
            if (nextQuestion < questions.length) {
              setCurrentQuestion(nextQuestion);
              setCurrentAnswer(data.answers[nextQuestion + 1] || {});
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar respuestas:', error);
      }
    };
    
    loadExistingAnswers();
  }, [testToken]);

  // Validar que todas las opciones tengan valores diferentes del 1 al 4
  const validateCurrentAnswer = (): boolean => {
    const values = Object.values(currentAnswer);
    if (values.length !== 4) return false;
    
    const sortedValues = [...values].sort();
    return JSON.stringify(sortedValues) === JSON.stringify([1, 2, 3, 4]);
  };

  const handleOptionChange = (option: string, value: string) => {
    const numValue = parseInt(value);
    const newAnswer = { ...currentAnswer };
    
    // Si ya existe este valor en otra opción, intercambiar
    const existingOption = Object.keys(newAnswer).find(key => newAnswer[key] === numValue);
    if (existingOption && existingOption !== option) {
      newAnswer[existingOption] = newAnswer[option] || 0;
    }
    
    newAnswer[option] = numValue;
    setCurrentAnswer(newAnswer);
    setError('');
  };

  // Función para guardar respuestas progresivamente en zavic_tests
  const saveAnswersToZavicTests = async (allAnswers: { [key: number]: Answer }) => {
    if (!testToken) return;
    
    try {
      await supabase
        .from('zavic_tests')
        .update({ 
          answers: allAnswers,
          updated_at: new Date().toISOString()
        })
        .eq('test_token', testToken);
    } catch (error) {
      console.error('Error guardando respuestas en zavic_tests:', error);
    }
  };

  const handleNext = async () => {
    if (!validateCurrentAnswer()) {
      setError('Debe asignar valores del 1 al 4 a cada opción, sin repetir números.');
      return;
    }

    const newAnswers = { ...answers };
    newAnswers[currentQuestion + 1] = currentAnswer;
    setAnswers(newAnswers);

    // Guardar respuestas progresivamente en zavic_tests
    await saveAnswersToZavicTests(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer(answers[currentQuestion + 2] || {});
    } else {
      calculateResults(newAnswers);
    }
  };

  const handlePrevious = async () => {
    if (currentQuestion > 0) {
      // Guardar la respuesta actual antes de ir a la anterior
      if (validateCurrentAnswer()) {
        const newAnswers = { ...answers };
        newAnswers[currentQuestion + 1] = currentAnswer;
        setAnswers(newAnswers);
        await saveAnswersToZavicTests(newAnswers);
      }
      
      setCurrentQuestion(currentQuestion - 1);
      setCurrentAnswer(answers[currentQuestion] || {});
      setError('');
    }
  };



  // Función para guardar los scores finales en zavic_tests
  const saveScoresToZavicTests = async (scores: ZavicResults) => {
    if (!testToken) return;
    
    try {
      setLoading(true);
      setError(''); // Limpiar errores previos
      
      const totalScore = scores.moral + scores.legalidad + scores.indiferencia + 
                        scores.corrupcion + scores.economico + scores.politico + 
                        scores.social + scores.religioso;
      
      // Obtener started_at para calcular tiempo transcurrido
      const { data: testData } = await supabase
        .from('zavic_tests')
        .select('started_at')
        .eq('test_token', testToken)
        .single();
      
      let timeSpentMinutes = null;
      if (testData?.started_at) {
        const startTime = new Date(testData.started_at);
        const endTime = new Date();
        timeSpentMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      }
      
      const { error } = await supabase
        .from('zavic_tests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          moral_score: scores.moral,
          legalidad_score: scores.legalidad,
          indiferencia_score: scores.indiferencia,
          corrupcion_score: scores.corrupcion,
          economico_score: scores.economico,
          politico_score: scores.politico,
          social_score: scores.social,
          religioso_score: scores.religioso,
          total_score: totalScore,
          test_date: new Date().toISOString(),
          time_spent_minutes: timeSpentMinutes,
          updated_at: new Date().toISOString()
        })
        .eq('test_token', testToken);
        
      if (error) throw error;
      
      console.log('Scores guardados en zavic_tests:', scores);
      setSavedSuccessfully(true);
      
      // Llamar al callback onComplete si existe
      if (onComplete) {
        // Para mantener compatibilidad, creamos un ID temporal
        const tempId = Date.now();
        onComplete(tempId);
      }
      
    } catch (error) {
      console.error('Error guardando scores en zavic_tests:', error);
      setError('Error al guardar los resultados finales');
    } finally {
      setLoading(false);
    }
  };

  const calculateResults = async (allAnswers: { [key: number]: Answer }) => {
    const scores: ZavicResults = {
      moral: 0,
      legalidad: 0,
      indiferencia: 0,
      corrupcion: 0,
      economico: 0,
      politico: 0,
      social: 0,
      religioso: 0
    };

    Object.entries(allAnswers).forEach(([questionNum, answer]) => {
      const qNum = parseInt(questionNum);
      const mapping = answerMapping[qNum];
      
      if (mapping) {
        Object.entries(answer).forEach(([option, value]) => {
          const category = mapping[option.toUpperCase()];
          if (category) {
            switch (category) {
              case 'MORAL': scores.moral += value; break;
              case 'LEGALIDAD': scores.legalidad += value; break;
              case 'INDIFERENCIA': scores.indiferencia += value; break;
              case 'CORRUPCION': scores.corrupcion += value; break;
              case 'ECONOMICO': scores.economico += value; break;
              case 'POLITICO': scores.politico += value; break;
              case 'SOCIAL': scores.social += value; break;
              case 'RELIGIOSO': scores.religioso += value; break;
            }
          }
        });
      }
    });

    setResults(scores);
    setShowResults(true);
  };

  const getInterpretation = (category: string, score: number): { level: string; description: string } => {
    const isHigh = score >= 30;
    
    const interpretations: { [key: string]: { high: string; low: string } } = {
      moral: {
        high: "Persona que se somete a las reglas establecidas por la familia, sociedad o algún organismo, para realizar el bien y no el mal.",
        low: "Persona que no seguirá los lineamientos o normas establecidas, siguiendo sus propias convicciones sin saber si está actuando bien o mal."
      },
      legalidad: {
        high: "Persona honesta y honrada, acoplándose a las políticas de la empresa, será un empleado fiel a las órdenes del jefe inmediato.",
        low: "Persona que se mostrará con doble intención, sacando provecho de las situaciones para sus propios fines, no será tan recta ni se acoplará a las reglas."
      },
      indiferencia: {
        high: "Persona que denotará un bajo rendimiento productivo, tal vez por desmotivación o estado de ánimo, no tomará las cosas muy en serio.",
        low: "Persona con bastante entusiasmo en hacer las cosas, siempre buscará la motivación del logro y los retos, tendrá una producción alta."
      },
      corrupcion: {
        high: "Persona que le agradará seducir, incomodar, fastidiar, alterar un escrito. Buscará el cohecho y corromper las reglas establecidas.",
        low: "Persona que buscará el éxito a través de sus propios logros sin corromper a terceros, acoplándose a los lineamientos establecidos."
      },
      economico: {
        high: "Persona interesada en ser juzgada por su habilidad para lograr utilidades, técnicas de reducción de costos o resolver problemas prácticos.",
        low: "Individuo que prefiere servir por encima de cualquier utilidad y prefiere no hacer caso de las consideraciones materiales."
      },
      politico: {
        high: "Persona ambiciosa que quiere llegar lejos en una organización. Importante buscar la promoción en este tipo de posiciones.",
        low: "Persona que valora el trabajo de equipo y cooperación. Ideal para roles de asistente o coordinador en organizaciones democráticas."
      },
      social: {
        high: "Persona con genuino interés por las personas, con preocupación real por ayudar, lo cual significa que será un buen miembro para equipos de trabajo.",
        low: "Persona con enfoques poco sentimentales en tareas difíciles. Las decisiones se toman sin considerar el impacto en las personas."
      },
      religioso: {
        high: "Persona que demanda disciplina, estructura y orden, con amplio sentido de reglas y consideraciones morales. Estricto en cumplimiento de principios.",
        low: "Persona que demanda un alto grado de libertad para operar de manera indisciplinada. Permite acciones que no requieren de disciplina para lograr el éxito."
      }
    };

    return {
      level: isHigh ? "Alto" : "Bajo",
      description: isHigh ? interpretations[category].high : interpretations[category].low
    };
  };

  const ResultsChart = ({ data }: { data: ZavicResults }) => {
    const maxScore = 40;
    const categories = [
      { name: 'Moral', value: data.moral, color: 'bg-blue-500' },
      { name: 'Legalidad', value: data.legalidad, color: 'bg-green-500' },
      { name: 'Indiferencia', value: data.indiferencia, color: 'bg-yellow-500' },
      { name: 'Corrupción', value: data.corrupcion, color: 'bg-red-500' },
      { name: 'Económico', value: data.economico, color: 'bg-purple-500' },
      { name: 'Político', value: data.politico, color: 'bg-indigo-500' },
      { name: 'Social', value: data.social, color: 'bg-pink-500' },
      { name: 'Religioso', value: data.religioso, color: 'bg-teal-500' }
    ];

    return (
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{cat.name}</span>
              <span className="text-gray-600">{cat.value}/{maxScore}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${cat.color} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${(cat.value / maxScore) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (showResults && results) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Resultados del Test ZAVIC</h2>
          <p className="text-gray-600">Análisis de valores e intereses</p>
        </div>
        
        <div className="space-y-6">
          <ResultsChart data={results} />
          
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold">Interpretación de Resultados</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Valores</h4>
                {['moral', 'legalidad', 'indiferencia', 'corrupcion'].map((cat) => {
                  const interpretation = getInterpretation(cat, results[cat as keyof ZavicResults]);
                  return (
                    <div key={cat} className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium capitalize">{cat} - {interpretation.level}</h5>
                      <p className="text-sm text-gray-600 mt-1">{interpretation.description}</p>
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Intereses</h4>
                {['economico', 'politico', 'social', 'religioso'].map((cat) => {
                  const interpretation = getInterpretation(cat, results[cat as keyof ZavicResults]);
                  return (
                    <div key={cat} className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium capitalize">{cat} - {interpretation.level}</h5>
                      <p className="text-sm text-gray-600 mt-1">{interpretation.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {!user && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Inicia sesión para guardar tus resultados y ver tu historial
              </p>
            </div>
          )}

          {savedSuccessfully && !loading && (
            <div className="mt-4 text-center text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ✓ Resultados enviados y guardados exitosamente
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4 mt-6">
            {!savedSuccessfully && (
              <button
                onClick={() => saveScoresToZavicTests(results)}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </div>
                ) : (
                  'Enviar Resultados'
                )}
              </button>
            )}
            
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers({});
                setCurrentAnswer({});
                setResults(null);
                setSavedSuccessfully(false);
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Realizar el test nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Test ZAVIC</h2>
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Test de Valores e Intereses - Pregunta {currentQuestion + 1} de {questions.length}
          </p>
          {Object.keys(answers).length > 0 && (
            <span className="text-xs text-green-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Guardado automáticamente
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">
            {questions[currentQuestion].question_text}
          </h3>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Instrucciones:</p>
                  <p>Asigne un valor del 1 al 4 a cada opción según su importancia:</p>
                  <ul className="mt-1 space-y-0.5">
                    <li>• 4 = Más importante</li>
                    <li>• 3 = Importante</li>
                    <li>• 2 = Menos importante</li>
                    <li>• 1 = Menor importancia</li>
                  </ul>
                </div>
              </div>
            </div>

            {['a', 'b', 'c', 'd'].map((option) => (
              <div key={option} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="font-semibold text-lg uppercase">{option})</span>
                  <div className="flex-1">
                    <p className="mb-2">{questions[currentQuestion][`option_${option}` as keyof Question]}</p>
                    <div className="flex space-x-4">
                      {[1, 2, 3, 4].map((value) => (
                        <label
                          key={value}
                          className={`flex items-center space-x-1 cursor-pointer ${
                            Object.entries(currentAnswer).some(
                              ([key, val]) => key !== option && val === value
                            ) ? 'opacity-50' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name={`option-${option}`}
                            value={value}
                            checked={currentAnswer[option] === value}
                            onChange={(e) => handleOptionChange(option, e.target.value)}
                            disabled={
                              Object.entries(currentAnswer).some(
                                ([key, val]) => key !== option && val === value
                              )
                            }
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">{value}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentQuestion === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            
            <button
              onClick={handleNext}
              disabled={!validateCurrentAnswer()}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                !validateCurrentAnswer()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {currentQuestion === questions.length - 1 ? (
                <>
                  Ver Resultados
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              ) : (
                <>
                  Siguiente
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}