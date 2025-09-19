/// <reference path="./deno.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateMinutaRequest {
  tasacionData: {
    id: string
    nombreCliente: string
    numeroProcedimiento: string
    nombreJuzgado: string
    entidadDemandada: string
    municipio: string
    instancia: 'PRIMERA INSTANCIA' | 'SEGUNDA INSTANCIA'
    costas: number
    iva: number
    total: number
    fecha: string
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tasacionData }: GenerateMinutaRequest = await req.json()

    // Load HTML template from database using REST API with anon key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    
    const instanciaKey = tasacionData.instancia === 'PRIMERA INSTANCIA' ? 'primera' : 'segunda'
    
    // Try with Authorization header if provided, otherwise use anon key
    const authHeader = req.headers.get('Authorization') || `Bearer ${supabaseKey}`
    
    const templateResponse = await fetch(`${supabaseUrl}/rest/v1/html_templates?instancia=eq.${instanciaKey}&select=html_content&order=updated_at.desc&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': authHeader
      }
    })
    
    if (!templateResponse.ok) {
      const errorText = await templateResponse.text()
      console.error('Template fetch error:', templateResponse.status, errorText)
      throw new Error(`Error cargando plantilla: ${templateResponse.status} - ${errorText}`)
    }
    
    const templateData = await templateResponse.json()
    console.log('Template data received:', templateData)
    
    if (!templateData || templateData.length === 0) {
      throw new Error('No se encontró plantilla HTML para la instancia especificada')
    }

    let htmlContent = templateData[0].html_content

    // Replace markers with actual data
    const replacements = {
      CLIENTA: tasacionData.nombreCliente,
      NUMEROPROCEDIMIENTO: tasacionData.numeroProcedimiento,
      NOMBREJUZGADO: tasacionData.nombreJuzgado,
      ENTIDADDEMANDADA: tasacionData.entidadDemandada,
      MUNICIPIO: tasacionData.municipio,
      INSTANCIA: tasacionData.instancia,
      COSTASSINIVA: tasacionData.costas.toFixed(2),
      IVA: tasacionData.iva.toFixed(2),
      TOTAL: tasacionData.total.toFixed(2),
      FECHA: tasacionData.fecha
    }

    // Replace all markers
    for (const [key, value] of Object.entries(replacements)) {
      htmlContent = htmlContent.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
    }

    console.log('HTML content after replacement:', htmlContent.substring(0, 200) + '...')

    // Convert HTML to DOCX using html-docx-js
    const { HTMLtoDOCX } = await import('https://esm.sh/html-docx-js@0.6.0')
    
    const docxBuffer = HTMLtoDOCX(htmlContent, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    })

    console.log('DOCX buffer created, size:', docxBuffer instanceof ArrayBuffer ? docxBuffer.byteLength : docxBuffer.length)

    // Convert to proper type for Response
    let responseBuffer: ArrayBuffer
    if (docxBuffer instanceof ArrayBuffer) {
      responseBuffer = docxBuffer
    } else {
      // Create new ArrayBuffer from Uint8Array
      responseBuffer = new ArrayBuffer(docxBuffer.byteLength)
      const view = new Uint8Array(responseBuffer)
      view.set(docxBuffer)
    }

    // Return the processed document
    return new Response(responseBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=\"minuta_${tasacionData.numeroProcedimiento}.docx\"`
      }
    })

  } catch (error: unknown) {
    console.error('Error generating minuta:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
    return new Response(
      JSON.stringify({
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})