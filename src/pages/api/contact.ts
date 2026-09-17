import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Todos los campos son obligatorios" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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
      return new Response(
        JSON.stringify({ error: "Error al enviar el mensaje" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Error al procesar la solicitud" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
