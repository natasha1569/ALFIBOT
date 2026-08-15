import 'dotenv/config';
import { analyzeWithAI } from '../../services/openai.service.js';

console.log('Modelo principal:', process.env.OPENAI_MODEL || 'gpt-5-mini');
console.log('Modelo fallback:', process.env.OPENAI_FALLBACK_MODEL || 'sin fallback');
console.log('Key detectada:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.slice(0, 10)}...` : 'NO SE ENCONTRÓ NINGUNA KEY');

try {
  const result = await analyzeWithAI({
    type: 'text',
    content:
      'Invierte 100 dólares hoy y gana el doble en 7 días. Cupos limitados. Para entrar debes pagar una inscripción y traer 3 referidos.',
  });

  console.log('✅ ÉXITO: el mismo servicio que usa la app respondió correctamente');
  console.dir(result, { depth: null });
} catch (error) {
  console.log('❌ ERROR');
  console.log('mensaje:', error.message);
}
