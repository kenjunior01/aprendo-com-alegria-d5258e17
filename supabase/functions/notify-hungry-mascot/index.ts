import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY') ?? ''

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // 1. Find hungry mascots with push tokens
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, push_token, mascot, hunger, region')
    .lt('hunger', 25)
    .not('push_token', 'is', null)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  const notifications = []

  for (const profile of profiles) {
    const isMZ = profile.region === 'MZ'
    const title = isMZ ? 'O teu amigo tem fome! 🇲🇿' : 'A tua mascote tem fome! 🍎'
    const body = isMZ
      ? `Olá ${profile.name}! O teu amigo está a precisar de um matabicho. Vem brincar!`
      : `Olá ${profile.name}! Anda dar um lanchinho à tua mascote.`

    // Send to FCM
    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FCM_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: profile.push_token,
        notification: {
          title,
          body,
          sound: 'default',
          icon: `ic_mascot_${profile.mascot}_sad`, // This refers to android/app/src/main/res/drawable
          color: '#f43f5e', // Reddish color for urgency
        },
        data: {
          type: 'mascot_hungry',
          mascot: profile.mascot,
        },
      }),
    })

    notifications.push({ id: profile.id, status: res.status })
  }

  return new Response(
    JSON.stringify({ message: `Sent ${notifications.length} notifications`, details: notifications }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
