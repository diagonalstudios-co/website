import type { APIRoute } from "astro";
import { Resend } from "resend";

// process.env instead of import.meta.env: Astro 6+ inlines import.meta.env at
// build time, which would bake the key into the bundle (or freeze it as
// undefined on builds without .env). Runtime read keeps deploy-time config.
const resend = new Resend(process.env.RESEND_API_KEY);

export const prerender = false;

const json = (body: string, status: number) =>
  new Response(body, { status, headers: { "Content-Type": "application/json" } });

const html = (body: string, status: number) =>
  new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Contacto — Diagonal Studios</title></head><body style="font-family: sans-serif; max-width: 640px; margin: 64px auto; padding: 0 24px;"><p>${body}</p><p><a href="/#contacto">Volver al formulario</a></p></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );

// Fake success so bots can't tell they were dropped (no email is sent).
const fakeSuccess = (isJson: boolean, reason: string) => {
  console.warn(`contact: spam dropped (${reason})`);
  return isJson
    ? json(JSON.stringify({ success: true }), 200)
    : html("Mensaje enviado — te escribimos pronto.", 200);
};

// formTime = page-load timestamp (ms) filled in by ContactForm's script.
// Must be between 7 days old and 1 day in the future (clock-skew tolerance)
// and submitted at least 3s after load; a slightly future value (client clock
// ahead) is accepted.
const formTimeOk = (value: string): boolean => {
  const t = Number(value);
  const now = Date.now();
  if (!Number.isFinite(t) || t <= 0) return false;
  const elapsed = now - t;
  return (
    t > now - 604_800_000 &&
    t < now + 86_400_000 &&
    (elapsed >= 3000 || elapsed < 0)
  );
};

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  let name: string;
  let email: string;
  let message: string;
  let website = "";
  let formTime = "";

  try {
    if (isJson) {
      const body = await request.json();
      ({ name, email, message, website = "", formTime = "" } = body);
    } else {
      const form = await request.formData();
      name = String(form.get("name") ?? "");
      email = String(form.get("email") ?? "");
      message = String(form.get("message") ?? "");
      website = String(form.get("website") ?? "");
      formTime = String(form.get("formTime") ?? "");
    }
    website = String(website);
    formTime = String(formTime);
  } catch {
    return isJson
      ? json(JSON.stringify({ error: "Error al procesar la solicitud" }), 400)
      : html("Error al procesar la solicitud. Intentá de nuevo.", 400);
  }

  // Anti-spam: honeypot must stay empty; JSON requires a valid formTime,
  // the no-JS urlencoded path may omit it (no script runs to fill it).
  if (website.trim() !== "" || (isJson ? !formTimeOk(formTime) : formTime !== "" && !formTimeOk(formTime))) {
    return fakeSuccess(isJson, website.trim() !== "" ? "honeypot" : "formTime");
  }

  if (!name || !email || !message) {
    const error = "Todos los campos son obligatorios";
    return isJson
      ? json(JSON.stringify({ error }), 400)
      : html("Faltan campos obligatorios. Completá nombre, email y mensaje.", 400);
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Diagonal Studios <onboarding@resend.dev>",
      to: ["diagonalstudios.co@gmail.com"],
      subject: `Nuevo mensaje de ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000; border-bottom: 1px solid #e6e6e6; padding-bottom: 12px;">
            Nuevo mensaje de contacto
          </h2>
          <p style="color: #666; font-size: 14px;"><strong>Nombre:</strong> ${name}</p>
          <p style="color: #666; font-size: 14px;"><strong>Email:</strong> ${email}</p>
          <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 16px 0;" />
          <p style="color: #333; font-size: 16px; line-height: 1.6;">${message}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return isJson
        ? json(JSON.stringify({ error: "Error al enviar el mensaje" }), 400)
        : html("No pudimos enviar el mensaje. Probá de nuevo en unos minutos.", 400);
    }

    return isJson
      ? json(JSON.stringify({ success: true, id: data?.id }), 200)
      : html("Mensaje enviado — te escribimos pronto.", 200);
  } catch {
    return isJson
      ? json(JSON.stringify({ error: "Error al procesar la solicitud" }), 500)
      : html("Error al procesar la solicitud. Intentá de nuevo.", 500);
  }
};
