import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, birthDate } = req.body;

  // Validação de idade
  const birthDateObj = new Date(birthDate);
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 13);
  
  if (birthDateObj > minDate) {
    return res.status(400).json({ error: 'age_restriction' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        email,
        birth_date: birthDate,
        verification_token: crypto.randomUUID()
      }])
      .single();

    if (error) throw error;

    // Implementar envio de email aqui
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}