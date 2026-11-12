
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as webpush from "jsr:@negrel/webpush@0.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =====================================================
// 1. CONFIGURACIÓN
// =====================================================
const publicVapidKey = Deno.env.get("VAPID_PUBLIC_KEY")?.trim();
const privateVapidKey = Deno.env.get("VAPID_PRIVATE_KEY")?.trim();

const supabaseUrl = Deno.env.get("URL");
const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

if (!publicVapidKey || !privateVapidKey) {
    throw new Error("Faltan las claves VAPID.");
}

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan las credenciales de Supabase.");
}

const supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey
);

// =====================================================
// 2. CONVERSIÓN DE CLAVES VAPID A JWK
// =====================================================
function base64UrlToBytes(value: string): Uint8Array {
    const padding = "=".repeat(
        (4 - (value.length % 4)) % 4
    );

    const base64 = (value + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function convertirVapidAJsonWebKey(
    publicKey: string,
    privateKey: string
) {
    const publicBytes = base64UrlToBytes(publicKey);
    const privateBytes = base64UrlToBytes(privateKey);

    if (
        publicBytes.length !== 65 ||
        publicBytes[0] !== 0x04
    ) {
        throw new Error(
            "La clave pública VAPID no tiene un formato P-256 válido."
        );
    }

    if (privateBytes.length !== 32) {
        throw new Error(
            "La clave privada VAPID debe tener 32 bytes."
        );
    }

    const x = bytesToBase64Url(publicBytes.slice(1, 33));
    const y = bytesToBase64Url(publicBytes.slice(33, 65));
    const d = bytesToBase64Url(privateBytes);

    return {
        publicKey: {
            kty: "EC",
            crv: "P-256",
            alg: "ES256",
            x,
            y,
            key_ops: ["verify"],
            ext: true
        },
        privateKey: {
            kty: "EC",
            crv: "P-256",
            alg: "ES256",
            x,
            y,
            d,
            key_ops: ["sign"],
            ext: true
        }
    };
}

// =====================================================
// 3. CREAR SERVIDOR WEB PUSH
// =====================================================
async function crearServidorPush() {
    const exportedKeys = convertirVapidAJsonWebKey(
        publicVapidKey!,
        privateVapidKey!
    );

    const vapidKeys = await webpush.importVapidKeys(
        exportedKeys
    );

    return await webpush.ApplicationServer.new({
        contactInformation: "mailto:dejr.1998@gmail.com",
        vapidKeys
    });
}

// =====================================================
// 4. FECHA LOCAL DE CHILE
// =====================================================
function obtenerFechaChile(fecha: Date): string {
    const partes = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Santiago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(fecha);

    const obtener = (tipo: string) =>
        partes.find(p => p.type === tipo)?.value ?? "";

    return `${obtener("year")}-${obtener("month")}-${obtener("day")}`;
}

// =====================================================
// 5. EJECUCIÓN EDGE FUNCTION
// =====================================================
serve(async (_req) => {
    try {
        // -------------------------------------------------
        // A. Inicializar Web Push
        // -------------------------------------------------
        const appServer = await crearServidorPush();

        console.log(
            "Servidor Web Push inicializado correctamente."
        );

        // -------------------------------------------------
        // B. Calcular fechas
        // -------------------------------------------------
        const ahora = new Date();
        const formatoHoy = obtenerFechaChile(ahora);

        const fechaLimite = new Date(ahora);
        fechaLimite.setDate(fechaLimite.getDate() + 3);

        const formatoLimite = obtenerFechaChile(fechaLimite);

        // -------------------------------------------------
        // C. Consultar pedidos
        // -------------------------------------------------
        const { data: pedidos, error: errorPedidos } =
            await supabaseAdmin
                .from("pedido")
                .select(`
          ped_id,
          cli_id,
          ped_fecha_entrega,
          ped_nombre
        `)
                .gte(
                    "ped_fecha_entrega",
                    `${formatoHoy}T00:00:00`
                )
                .lte(
                    "ped_fecha_entrega",
                    `${formatoLimite}T23:59:59`
                )
                .eq("is_deleted", false);

        if (errorPedidos) {
            throw new Error(
                `Error consultando pedidos: ${errorPedidos.message}`
            );
        }

        if (!pedidos || pedidos.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    pedidosProcesados: 0,
                    dispositivosEncontrados: 0,
                    notificacionesEnviadas: 0,
                    message: "No existen pedidos próximos a entregar."
                }),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // -------------------------------------------------
        // D. Consultar dispositivos registrados
        // -------------------------------------------------
        const { data: dispositivos, error: errorDispositivos } =
            await supabaseAdmin
                .from("device_tokens")
                .select("token_id, user_id, token");

        if (errorDispositivos) {
            throw new Error(
                `Error consultando dispositivos: ${errorDispositivos.message}`
            );
        }

        if (!dispositivos || dispositivos.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    pedidosProcesados: pedidos.length,
                    dispositivosEncontrados: 0,
                    notificacionesEnviadas: 0,
                    message: "No existen dispositivos registrados."
                }),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // -------------------------------------------------
        // E. Contadores
        // -------------------------------------------------
        let notificacionesEnviadas = 0;
        let erroresEnvio = 0;

        const errores: Array<{
            pedido: string;
            dispositivo: string;
            mensaje: string;
        }> = [];

        // -------------------------------------------------
        // F. Procesar pedidos
        // -------------------------------------------------
        for (const pedido of pedidos) {
            const fechaFormateada = new Date(
                pedido.ped_fecha_entrega
            ).toLocaleString("es-CL", {
                timeZone: "America/Santiago",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

            const payload = JSON.stringify({
                title: "🍰 Recordatorio de pedido - BakeryCore",
                body: `Tu pedido "${pedido.ped_nombre || "Pastelería"}" tiene programada su entrega para el ${fechaFormateada}.`,
                icon: "/assets/icon/icon.png",
                badge: "/assets/icon/icon.png",
                url: "/"
            });

            // -------------------------------------------------
            // G. Enviar a cada dispositivo
            // -------------------------------------------------
            for (const dispositivo of dispositivos) {
                try {
                    const subscriptionData = JSON.parse(
                        dispositivo.token
                    );

                    if (
                        !subscriptionData.endpoint ||
                        !subscriptionData.keys?.p256dh ||
                        !subscriptionData.keys?.auth
                    ) {
                        throw new Error(
                            "Suscripción Push inválida."
                        );
                    }

                    // Normalizar las claves de la suscripción
                    const subscription = {
                        endpoint: subscriptionData.endpoint,
                        keys: {
                            p256dh: subscriptionData.keys.p256dh
                                .replace(/\+/g, "-")
                                .replace(/\//g, "_")
                                .replace(/=+$/, ""),

                            auth: subscriptionData.keys.auth
                                .replace(/\+/g, "-")
                                .replace(/\//g, "_")
                                .replace(/=+$/, "")
                        }
                    };

                    // Crear suscriptor
                    const subscriber = appServer.subscribe(
                        subscription
                    );

                    // Enviar notificación
                    await subscriber.pushTextMessage(
                        payload,
                        {
                            ttl: 3600
                        }
                    );

                    notificacionesEnviadas++;

                    console.log(
                        `Push enviado correctamente. Pedido: ${pedido.ped_id}, Dispositivo: ${dispositivo.token_id}`
                    );

                } catch (error: any) {
                    // Capturar detalle HTTP del error
                    let mensajeError = error.message || String(error);

                    if (
                        error.response &&
                        typeof error.response.text === "function"
                    ) {
                        try {
                            const bodyText = await error.response.text();

                            mensajeError = `HTTP ${error.response.status} - ${bodyText}`;

                        } catch {
                            mensajeError = `HTTP Status: ${error.response.status}`;
                        }
                    }

                    console.error(
                        "Error detallado al enviar Web Push:",
                        mensajeError
                    );

                    erroresEnvio++;

                    errores.push({
                        pedido: pedido.ped_id,
                        dispositivo: dispositivo.token_id,
                        mensaje: mensajeError
                    });
                }
            }
        }

        // -------------------------------------------------
        // H. RESPUESTA FINAL
        // -------------------------------------------------
        return new Response(
            JSON.stringify({
                success: erroresEnvio === 0,
                pedidosProcesados: pedidos.length,
                dispositivosEncontrados: dispositivos.length,
                notificacionesEnviadas,
                erroresEnvio,
                errores
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error: unknown) {
        const mensaje = error instanceof Error
            ? error.message
            : String(error);

        console.error(
            "Error en Edge Function:",
            mensaje
        );

        return new Response(
            JSON.stringify({
                success: false,
                error: mensaje
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
});
